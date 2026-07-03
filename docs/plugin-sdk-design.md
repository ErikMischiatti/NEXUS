# Plugin SDK Design

## 1. Purpose

Phase 2 defines the public plugin SDK for NEXUS Core. The goal is to make plugin integration explicit, testable, and robot-agnostic without introducing UI, adapter, or runtime-distribution concerns.

This document is a design contract for the SDK boundary. It is not a plugin implementation guide for any particular robot, middleware, or domain workflow.

## 2. Phase 2 Scope

Phase 2 covers the extensibility layer around the headless core runtime:

- public plugin contracts
- manifest validation
- local descriptor discovery
- plugin loader
- plugin registry
- lifecycle execution
- example plugin package
- integration tests

Phase 2 is intentionally headless and in-process. It validates how plugins are discovered, validated, loaded, registered, started, and stopped. It does not add a UI shell or adapter integrations.

## 3. Non-Goals

Phase 2 does not include:

- UI features
- ROS, MQTT, MAVLink, PX4, ArduPilot, or simulator-specific adapter logic
- distributed plugin execution
- sandboxing
- plugin marketplace mechanics
- remote package registry integration
- automatic dependency resolution
- production safety guarantees
- mission semantics

Phase 2 also does not define robot-specific workflows. The SDK should remain usable for heterogeneous robotics operations and other structured automation domains.

## 4. Plugin SDK Responsibilities

The plugin SDK owns the public surface area that plugin authors use to build against NEXUS.

Minimum responsibilities:

- define the manifest contract
- define the plugin lifecycle contract
- define the plugin context contract
- validate compatibility before execution
- expose explicit registration and lifecycle semantics
- keep plugin-facing APIs small and version-aware

The SDK should not expose internal core runtime objects directly. Any runtime capability that plugins need should be surfaced through the public SDK contract only.

## 5. Plugin Context Contract

The plugin context is the only runtime object plugins receive during lifecycle calls. It must stay small, explicit, and public-SDK-only.

The initial context exposes `eventBus` and may also include an optional `logger` and a read-only `services` facade. Those optional fields are populated only with public, safe APIs, so plugins never receive direct access to internal runtime objects or mutable containers.

## 6. Plugin Manifest Contract

The manifest is the stable metadata object used by validation, discovery, and registration.

Proposed manifest shape:

```ts
type NexusPluginCompatibility = {
  nexusCore?: string;
  pluginApi?: string;
};

type NexusPluginManifest = {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  entrypoint?: string;
  requiredServices?: string[];
  requiredCapabilities?: string[];
  compatibility?: NexusPluginCompatibility;
};
```

Contract notes:

- `id` must be unique and stable across versions of the same plugin line.
- `name` is human-readable and may change without affecting compatibility.
- `version` is the plugin package version and should follow semver.
- `description` and `author` are optional descriptive metadata for humans and tooling.
- `entrypoint` is optional for now and identifies the module that exports the plugin implementation when present.
- `requiredServices` lists public service keys the plugin expects from the SDK context.
- `requiredCapabilities` lists capability identifiers the plugin expects to be available at runtime.
- `compatibility` is descriptive for now and records plugin assumptions about `nexusCore` and `pluginApi` versions without enforcing semver validation yet.

The manifest is intentionally metadata-only. Discovery and validation use the manifest before any plugin module is executed.

## 7. Compatibility And Versioning

Compatibility is stored on the manifest as a descriptive object rather than a hard requirement in this milestone.

- Plugin packages version themselves independently via `version`.
- `compatibility.nexusCore` and `compatibility.pluginApi` document version assumptions for later validation and loader policy.
- Semver interpretation is intentionally deferred until the loader is introduced.
- The contract should remain conservative: plugins should not be started unless the runtime can establish a supported path through the public SDK.

## 8. Discovery, Loading, Registration, Lifecycle

These are separate concepts and must remain separate in the SDK. Discovery will populate the registry in a future phase; the registry is metadata only, while the manager owns execution.

### Discovery

Discovery scans `nexus.plugin.json` descriptors in configured base directories and one level below, and identifies candidate plugins.

- Discovery must not execute plugin code.
- Discovery may only read static descriptor files and filesystem metadata.
- Discovery produces candidate descriptors, not live plugin instances.

### Validation

Validation checks manifest shape, required fields, and SDK compatibility.

- Validation happens before loading.
- Invalid descriptors are rejected with clear, structured errors.
- Validation trims required and optional string fields, defaults `requiredServices` and `requiredCapabilities` to empty arrays, and drops unknown manifest fields.
- Validation does not import the plugin module.

### Loading

Loading resolves and imports the plugin module referenced by the descriptor.

- Loading may execute module code because it imports the plugin entrypoint.
- Loading should fail clearly on module resolution errors, export-shape errors, or module initialization failures.
- Loading returns a plugin implementation or factory result, not a registered plugin.

### Registration

Registration validates and normalizes the manifest, then adds the plugin to the registry under its normalized unique `id`.

- Registration must reject duplicate IDs after normalization.
- Registration does not imply start.
- Registration should be deterministic and order-aware.

### Lifecycle

Lifecycle execution is the runtime phase that calls plugin hooks.

Preferred lifecycle:

1. `discover`
2. `validate`
3. `load`
4. `register`
5. `start`
6. `stop`

Lifecycle hooks:

- `onLoad(context)` runs after loading and before activation.
- `onStart(context)` runs when the runtime is ready to activate plugin behavior.
- `onStop(context)` runs during controlled shutdown.

Lifecycle failures should be surfaced clearly and should not be silently swallowed.

## 9. Plugin Registry Concept

The plugin registry is the in-memory authority for validated plugin entries. Its state model is intentionally small: `REGISTERED`, `LOADED`, `STARTED`, `STOPPED`, and `FAILED`.

Responsibilities:

- store validated plugin metadata
- track the current lifecycle state
- record registration timestamps
- retain the last lifecycle error when present
- prevent duplicate IDs
- preserve deterministic iteration order
- expose lookup by plugin ID
- filter entries by state

The registry is not a marketplace, package cache, or dependency graph manager. It is a small runtime data structure that tracks which plugins are known and what state they are in.

## 10. Local Descriptor Discovery

Phase 2 uses local descriptor discovery for headless development and test environments. Phase 2.4 uses JSON descriptors named `nexus.plugin.json`.

Recommended model:

- each plugin package contains a static descriptor file such as `nexus.plugin.json`
- the descriptor is colocated with the plugin package root
- discovery scans configured local paths and reads only `nexus.plugin.json` descriptor files in the base directory or one level below
- the descriptor points to the plugin entrypoint module

Discovery should never imply code execution. It is a metadata scan only. Discovery does not import or instantiate plugin entrypoints.

Example descriptor fields:

```json
{
  "id": "example.counter",
  "name": "Example Counter",
  "version": "1.0.0",
  "entrypoint": "./dist/index.js",
  "requiredServices": ["eventBus"],
  "requiredCapabilities": [],
  "compatibility": {
    "nexusCore": "^2.1.0",
    "pluginApi": "^1.0.0"
  }
}
```

## 11. Loader Error Model

The loader should return clear, typed errors that explain what failed and where.

Error categories:

- discovery error: path missing, unreadable descriptor, malformed descriptor file
- validation error: missing required fields, malformed manifest, incompatible SDK range
- load error: entrypoint missing, module resolution failure, import failure, invalid module export
- registration error: duplicate plugin ID or conflicting plugin state
- lifecycle error: hook throws or rejects during `onLoad`, `onStart`, or `onStop`

Loader errors should include enough context to debug quickly:

- plugin ID when known
- descriptor path when known
- entrypoint when known
- original cause

The loader should fail clearly. It should not silently skip malformed plugins unless the caller explicitly opts into best-effort discovery semantics in a later phase.

## 12. Example Plugin Package Structure

The example package should be small, test-focused, and SDK-only.

Suggested structure:

```text
plugins/example-counter/
├─ nexus.plugin.json
├─ package.json
├─ src/
│  ├─ index.ts
│  └─ plugin.ts
├─ test/
│  └─ plugin.test.ts
└─ README.md
```

Expected characteristics:

- the descriptor is local and static
- the package exports a plugin object or factory
- the plugin uses only public SDK contracts
- tests exercise the plugin through the SDK boundary

## 13. Testing Strategy

Phase 2 should be driven by deterministic tests around public contracts.

Unit tests:

- manifest validation
- compatibility checks
- registry uniqueness
- descriptor parsing
- loader error cases
- lifecycle ordering

Integration tests:

- discover a local descriptor
- validate the manifest
- load the plugin module
- register the plugin
- start the plugin
- stop the plugin
- verify an example plugin can exchange events through the public bus

Test rules:

- avoid sleeps, timers, and external services
- test success and failure paths
- test the public SDK contract, not internal implementation details

## 14. Open Questions

The following items remain open and should be resolved during implementation:

- whether the descriptor file name should be fixed or configurable
- whether the plugin module exports an object or a factory by default
- whether `compatibility.nexusCore` and `compatibility.pluginApi` should later be validated as semver ranges or a major-only contract
- whether capability names need their own registry in Phase 2
- whether plugin descriptors should live beside `package.json` or in a dedicated folder
- whether the loader should support multiple descriptors in one local path
- whether the registry should persist beyond process lifetime in a later phase

These questions are intentionally left open because the first implementation should stay small and composable.
