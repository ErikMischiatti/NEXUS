# NEXUS Plugin System Guide

## 1. Purpose of This Document

This document explains the NEXUS plugin system in depth.

The goal is to understand:

- what a plugin is in NEXUS
- why NEXUS is plugin-first
- how plugin metadata works
- how discovery, validation, loading, registration, and lifecycle are separated
- what the registry, loader, and manager each do
- how plugins use the Event Bus and runtime context
- how the telemetry demo plugin works
- how to explain the plugin system in an interview

This is a learning guide, not a roadmap promise.

## 2. What Is a Plugin?

### 2.1 Simple Definition

A plugin is a self-contained extension module that adds behavior to a platform through a public contract.

### 2.2 Generic Example

In a generic application:

- one plugin adds telemetry visualization
- another plugin adds export tools
- another plugin adds custom workflow logic

The host application does not need to hard-code every feature up front.

### 2.3 Runtime Plugin in NEXUS

In NEXUS, a runtime plugin is a module that participates in the headless core runtime lifecycle.

It can:

- receive a `PluginContext`
- subscribe to the Event Bus
- publish events
- run `onLoad`, `onStart`, and `onStop`

The telemetry demo plugin in `examples/plugins/telemetry-demo/` is the current example.

Important distinction:

- a runtime plugin is not the same thing as a UI plugin view
- runtime plugins are managed by the core plugin manager
- UI plugin views are React components mounted by the browser shell

## 3. Why NEXUS Is Plugin-First

Plugin-first means major operator-facing or domain-specific capabilities should live in plugins instead of being hard-coded into the core.

In NEXUS, plugin-first means:

- the core should provide stable platform services
- the core should avoid absorbing robot-specific or mission-specific behavior
- plugins should communicate through public contracts
- plugins should not depend on private runtime internals
- future capabilities can be added without rewriting the core

Plugin-first does not mean:

- every function is a plugin
- plugins can do anything without boundaries
- plugins are sandboxed today
- plugins currently run in the browser
- marketplace or dependency resolution already exists

The idea is to keep the platform extensible while keeping the core small and stable.

## 4. Plugin System Responsibilities

The current plugin system owns:

- plugin contracts
- plugin manifests
- manifest validation
- descriptor discovery
- local loading
- registration
- lifecycle execution
- lifecycle state tracking
- plugin context creation and use
- plugin Event Bus access

Why this matters:

- it gives NEXUS a clean extension model
- it keeps runtime behavior explicit
- it lets the platform grow without hard-coding all future features in the core

## 5. Plugin System Non-Responsibilities

The plugin system must not own:

- UI shell layout
- browser routing
- React component rendering
- robot middleware protocols
- adapter implementation
- plugin sandboxing
- marketplace behavior
- dependency resolution
- security guarantees

The plugin system defines how runtime plugins are managed. It does not solve every deployment or safety concern.

## 6. Main Plugin System Files and Folders

### 6.1 core/src/plugins/index.ts

This is the public re-export surface for the plugin system.

Why it exists:

- to provide one public import path for plugin APIs

What it exports:

- `BasicPluginManager`
- `createPluginContext`
- `BasicPluginRegistry`
- `LocalPluginDescriptorDiscovery`
- `registerDiscoveredDescriptors`
- `LocalPluginLoader`
- `PluginManifestValidationError`
- `validatePluginManifest`
- plugin types and interfaces

### 6.2 core/src/plugins/types.ts

This file defines the plugin SDK types.

It contains:

- `NexusPluginCompatibility`
- `NexusPluginManifest`
- `PluginServices`
- `PluginContext`
- `NexusPlugin`
- `PluginManager`

### 6.3 core/src/plugins/basic-plugin-manager.ts

This file implements the runtime plugin lifecycle manager.

It owns:

- plugin registration
- plugin load execution
- plugin start execution
- plugin stop execution
- execution order tracking

### 6.4 core/src/plugins/manifest-validation.ts

This file validates and normalizes plugin manifest data.

It rejects malformed manifests before the loader or manager uses them.

### 6.5 core/src/plugins/registry/

This folder contains the plugin registry.

It stores validated plugin metadata and lifecycle state.

### 6.6 core/src/plugins/discovery/

This folder contains local descriptor discovery.

It finds `nexus.plugin.json` files and turns them into descriptors.

### 6.7 core/src/plugins/loader/

This folder contains local plugin loading.

It imports the plugin module from the descriptor entrypoint and normalizes the loaded plugin object.

### 6.8 examples/plugins/telemetry-demo/

This folder contains the current example runtime plugin package.

It demonstrates:

- descriptor
- manifest
- CommonJS entrypoint
- Event Bus use
- lifecycle hooks
- middleware-independent event normalization

## 7. Public Plugin API Surface

### 7.1 Exports from core/src/index.ts

The core package re-exports plugin APIs from `core/src/index.ts`.

That means consumers can import plugin functionality from one package entrypoint.

### 7.2 Exports from core/src/plugins/index.ts

The plugin index re-exports:

- the manager
- the registry
- discovery
- loading
- validation
- public types

### 7.3 NexusPlugin

```ts
export type NexusPlugin = {
  manifest: NexusPluginManifest;
  onLoad?(context: PluginContext): Promise<void> | void;
  onStart?(context: PluginContext): Promise<void> | void;
  onStop?(context: PluginContext): Promise<void> | void;
};
```

This is the plugin contract.

### 7.4 NexusPluginManifest

The manifest describes the plugin.

### 7.5 NexusPluginCompatibility

The compatibility object records version assumptions about the core and plugin API.

### 7.6 PluginContext

The plugin context is the public runtime object passed into plugin lifecycle hooks.

### 7.7 PluginServices

`PluginServices` is the limited service facade exposed to plugins.

### 7.8 PluginManager

The plugin manager interface defines lifecycle control operations and registry access.

### 7.9 PluginRegistry

The plugin registry interface defines metadata and lifecycle state storage.

## 8. Plugin Manifest

### 8.1 What a Manifest Is

A plugin manifest is the metadata object that describes the plugin to discovery, validation, loading, and registration.

### 8.2 Required Fields

Required fields are:

- `id`
- `name`
- `version`

### 8.3 Optional Fields

Optional fields are:

- `description`
- `author`
- `entrypoint`
- `requiredServices`
- `requiredCapabilities`
- `compatibility`

### 8.4 Compatibility Fields

The compatibility field is descriptive today.

It can record expectations about:

- `nexusCore`
- `pluginApi`

Semver enforcement is not implemented yet.

### 8.5 Required Services

`requiredServices` lists public service keys the plugin expects.

### 8.6 Required Capabilities

`requiredCapabilities` lists capabilities the plugin expects to exist at runtime.

Today this is descriptive metadata, not a fully enforced capability contract.

### 8.7 Manifest Normalization

Validation trims strings, normalizes arrays, and returns a clean manifest object.

### 8.8 Manifest Validation Errors

Invalid manifests throw `PluginManifestValidationError`.

This happens before a plugin can be registered or loaded.

## 9. Plugin Descriptor

### 9.1 What a Descriptor Is

A plugin descriptor is the discoverable wrapper around plugin metadata and location information.

### 9.2 nexus.plugin.json

The current descriptor file name is `nexus.plugin.json`.

### 9.3 Descriptor vs Manifest

Descriptor:

- discoverable file or record
- includes manifest and path/source information

Manifest:

- plugin metadata object
- used by validation and registration

### 9.4 Why Discovery Reads Descriptors Before Loading Code

Discovery should inspect metadata before executing plugin code.

That lets NEXUS find candidate plugins without importing them yet.

## 10. Plugin Discovery

### 10.1 What Discovery Does

Discovery scans local directories for `nexus.plugin.json` files and converts them into descriptors.

### 10.2 Why Discovery Must Not Execute Plugin Code

Discovery is metadata-only.

Why:

- discovery should be safe and predictable
- plugin code should not run until loading
- metadata scanning should not depend on plugin side effects

### 10.3 LocalPluginDescriptorDiscovery

`LocalPluginDescriptorDiscovery` is the current discovery implementation.

It:

- normalizes base directories
- finds descriptor paths
- reads JSON
- validates the manifest
- returns descriptors and errors

### 10.4 Discovery Result

The discovery result contains:

- `descriptors`
- `errors`

### 10.5 Discovery Errors

Current discovery errors include:

- base directory missing
- unreadable descriptor
- invalid JSON
- missing manifest
- invalid manifest

## 11. Plugin Validation

### 11.1 What Validation Does

Validation checks that manifest data is well-formed and normalized.

### 11.2 Why Validation Happens Before Loading

Validation before loading is useful because:

- invalid metadata fails early
- code does not need to load just to discover a bad manifest
- errors are easier to diagnose

### 11.3 Normalized Manifest Shape

The validator returns a normalized manifest with:

- required strings trimmed
- optional strings trimmed if present
- string arrays normalized
- compatibility object normalized

### 11.4 Unknown Fields

Unknown fields are not the focus of the current validator.

The validator keeps the manifest contract small and predictable.

### 11.5 Compatibility Today vs Future Semver Enforcement

Today compatibility is descriptive.

Future semver enforcement is possible later, but not implemented yet.

## 12. Plugin Loading

### 12.1 What Loading Does

Loading imports the plugin module referenced by the descriptor entrypoint and normalizes the exported plugin object.

### 12.2 Why Loading Is Separate from Discovery

Discovery finds metadata.

Loading imports code.

Those are different phases because code execution is more expensive and more risky than metadata reading.

### 12.3 LocalPluginLoader

`LocalPluginLoader` is the current loader implementation.

### 12.4 Entrypoint Resolution

The loader resolves the entrypoint path relative to the descriptor path.

It supports both:

- `.cjs` entrypoints via `createRequire`
- ESM entrypoints via dynamic `import()`

### 12.5 Default Export vs createPlugin()

The loader accepts either:

- a default plugin export
- a `createPlugin()` function
- or a plugin object with a manifest

### 12.6 Loader Error Cases

Current loader error cases include:

- missing descriptor path
- failed descriptor read
- invalid descriptor JSON
- missing manifest
- invalid manifest
- missing entrypoint
- entrypoint import failure
- invalid export
- manifest mismatch

## 13. Plugin Registration

### 13.1 What Registration Does

Registration adds a validated plugin into the registry and stores it in manager state.

### 13.2 BasicPluginRegistry

The registry is the metadata and lifecycle state authority.

### 13.3 PluginRegistryEntry

Each registry entry stores:

- manifest
- state
- registration time
- last lifecycle error, if any

### 13.4 Registry State Model

The registry states are:

- `REGISTERED`
- `LOADED`
- `STARTED`
- `STOPPED`
- `FAILED`

### 13.5 Duplicate Plugin IDs

Duplicate ids are rejected.

This keeps plugin identity stable and prevents collisions.

### 13.6 Deterministic Registration Order

The registry preserves registration order so lifecycle execution and iteration stay predictable.

## 14. Plugin Manager

### 14.1 What PluginManager Does

The plugin manager owns lifecycle execution.

### 14.2 BasicPluginManager

`BasicPluginManager` is the current implementation.

It uses:

- a registry
- a plugin record map
- registration order tracking
- started order tracking

### 14.3 register()

`register()` validates the manifest through the registry and stores the plugin object.

### 14.4 loadAll()

`loadAll()` runs `onLoad()` for registered plugins.

### 14.5 startAll()

`startAll()` runs `onStart()` for loaded plugins.

### 14.6 stopAll()

`stopAll()` runs `onStop()` in reverse startup order.

### 14.7 get()

`get()` returns a registered plugin by id.

### 14.8 list()

`list()` returns plugins in registration order.

### 14.9 Manager vs Registry

The manager executes lifecycle.

The registry stores metadata and state.

That separation keeps data authority and execution authority apart.

## 15. Plugin Lifecycle

### 15.1 Lifecycle Overview

The lifecycle is:

1. `discover`
2. `validate`
3. `load`
4. `register`
5. `start`
6. `stop`

### 15.2 onLoad()

`onLoad()` is for initialization work before activation.

### 15.3 onStart()

`onStart()` is for active plugin behavior such as subscriptions or timers.

### 15.4 onStop()

`onStop()` is for cleanup and unsubscription.

### 15.5 Lifecycle State Transitions

```text
REGISTERED
    ↓ loadAll()
LOADED
    ↓ startAll()
STARTED
    ↓ stopAll()
STOPPED

Any lifecycle failure:
    ↓
FAILED
```

### 15.6 Startup Ordering

Plugins start in registration order.

### 15.7 Shutdown Ordering

Plugins stop in reverse startup order.

### 15.8 Failure Behavior

Lifecycle failures are fail-fast and update registry state to `FAILED`.

## 16. Plugin Context

### 16.1 What PluginContext Is

`PluginContext` is the public runtime object passed to plugin lifecycle hooks.

### 16.2 Why Plugins Receive Context Instead of the Runtime

Plugins receive context instead of the full runtime because:

- runtime internals stay private
- the public contract stays explicit
- testability improves
- future compatibility policies can be enforced more cleanly

### 16.3 Event Bus Access

`PluginContext.eventBus` gives plugins publish/subscribe access.

### 16.4 Logger Access

`PluginContext.logger` provides optional logging access.

### 16.5 Service Facade Access

`PluginContext.services` exposes a limited read-only facade over the service container.

### 16.6 Why the Context Is Intentionally Small

The context only gives plugins what they need for public integration.

It does not expose the whole runtime.

## 17. Plugin Services Facade

### 17.1 What a Facade Is

A facade is a small interface that hides a larger subsystem.

### 17.2 get()

`get()` retrieves a required service.

### 17.3 optional()

`optional()` retrieves a service if present.

### 17.4 has()

`has()` checks whether a service exists.

### 17.5 Why Plugins Do Not Receive the Full Service Container

Plugins do not receive full container access because the runtime boundary should stay controlled and public-SDK-only.

## 18. Telemetry Demo Runtime Plugin

### 18.1 Package Location

The runtime plugin example lives in:

- `examples/plugins/telemetry-demo/`

### 18.2 nexus.plugin.json

The descriptor declares:

- plugin id
- name
- version
- description
- author
- entrypoint
- required services
- required capabilities

### 18.3 Plugin Entrypoint

The entrypoint is `src/index.cjs`.

It exports a default plugin object via CommonJS.

### 18.4 Manifest

The manifest uses the id `example.telemetry.demo`.

### 18.5 onStart()

`onStart()` subscribes to raw telemetry events.

### 18.6 Subscribing to telemetry.raw.received

The plugin listens for `telemetry.raw.received`.

### 18.7 Normalizing Payloads

`normalizeNumber()` turns incoming values into numeric values or zero.

`normalizeTelemetryPayload()` creates a normalized telemetry object with:

- source
- temperatureC
- humidityPercent

### 18.8 Publishing telemetry.normalized.updated

The plugin publishes `telemetry.normalized.updated` after normalization.

### 18.9 onStop()

`onStop()` performs cleanup.

### 18.10 Unsubscribing Cleanly

The plugin stores the subscription token in `telemetrySubscription` and unsubscribes during stop.

This shows proper lifecycle cleanup.

```text
Runtime starts plugin
        ↓
Telemetry plugin onStart()
        ↓
subscribe("telemetry.raw.received")
        ↓
raw telemetry event arrives
        ↓
handler normalizes payload
        ↓
publish("telemetry.normalized.updated")
        ↓
Runtime stops plugin
        ↓
onStop()
        ↓
unsubscribe(subscription)
```

Important distinction:

- this is a runtime plugin example
- it is not the React UI view

## 19. End-to-End Plugin Flow

The current plugin flow is:

```text
nexus.plugin.json
        ↓
Discovery
        ↓
Validation
        ↓
Loading
        ↓
Registration
        ↓
Lifecycle execution
        ↓
onLoad → onStart → onStop
```

Why the separation matters:

- discovery reads metadata only
- validation rejects invalid descriptors before code execution
- loading imports code but does not start plugin behavior
- registration records plugin metadata and state
- lifecycle executes plugin hooks
- each phase can fail clearly and be tested independently

## 20. Plugin System and Runtime Startup

`BasicRuntime` uses the plugin system like this:

```text
BasicRuntime
    ↓
creates PluginContext
    ↓
creates BasicPluginManager
    ↓
registerPlugin(plugin)
    ↓
start()
    ↓
pluginManager.loadAll()
    ↓
pluginManager.startAll()
    ↓
stop()
    ↓
pluginManager.stopAll()
```

Why plugins can only be registered before runtime start:

- startup must be deterministic
- plugin ordering must remain stable
- the runtime should not mutate its plugin set while booting or running

## 21. Plugin System and Event Bus

The plugin system and the Event Bus work together.

Plugins:

- subscribe to events during `onStart()`
- publish normalized or domain events when work happens
- unsubscribe during `onStop()`

The Event Bus gives plugins a decoupled communication channel without direct imports between plugins.

## 22. Runtime Plugin vs UI Plugin View

Runtime plugin:

```text
examples/plugins/telemetry-demo/
core Plugin Manager
Event Bus
onLoad / onStart / onStop
```

UI plugin view:

```text
ui/src/plugins/telemetry-demo/
UI Plugin View Registry
Workspace
React component
RuntimeSnapshot
```

They may share a conceptual `pluginId`, but they are not the same mechanism.

The runtime plugin lives in the core execution world.

The UI plugin view lives in the React shell world.

## 23. TypeScript Syntax Explained

### 23.1 Type Aliases

`NexusPlugin`, `NexusPluginManifest`, and `PluginContext` are type aliases.

### 23.2 Interfaces

`PluginManager` and `PluginRegistry` are interfaces.

### 23.3 Optional Properties

Fields like `description?` and `author?` are optional properties.

### 23.4 Optional Methods

Methods like `onLoad?` are optional methods.

### 23.5 Promise<void> | void

Lifecycle hooks may return `void` or `Promise<void>`.

That means hooks can be sync or async.

### 23.6 Pick<>

`PluginServices` uses `Pick<>` to select only `get`, `optional`, and `has` from the full service container type.

This is a facade in type form.

### 23.7 Generic Service Keys

`ServiceKey<T>` uses generics so services stay typed.

### 23.8 Maps

`BasicPluginRegistry` and `BasicPluginManager` use `Map` for deterministic lookup by id.

### 23.9 Array Ordering

The manager stores `registrationOrder` and `startedOrder` arrays so execution order is predictable.

### 23.10 CommonJS Plugin Entrypoint

The telemetry demo plugin uses:

```js
module.exports = telemetryDemoPlugin;
```

Why:

- the example plugin is plain CommonJS JavaScript
- the loader can import `.cjs` directly
- this keeps the example simple and build-step free

The core package itself is TypeScript ESM, so the example demonstrates that the loader can bridge the two styles.

## 24. Design Patterns Used

### Plugin Architecture

Simple definition:

- behavior is delivered as pluggable modules

Where it appears in NEXUS:

- the runtime plugin system

Why it helps:

- extensibility

Tradeoff:

- more architectural discipline is needed

### Lifecycle Manager

Simple definition:

- a component that controls start/stop stages

Where it appears in NEXUS:

- `BasicPluginManager`

Why it helps:

- makes plugin behavior explicit

Tradeoff:

- lifecycle orchestration adds state and ordering concerns

### Registry Pattern

Simple definition:

- a central place to store known items and their state

Where it appears in NEXUS:

- `BasicPluginRegistry`

Why it helps:

- centralized metadata and state lookup

Tradeoff:

- registry becomes a shared authority that must stay correct

### Manifest / Metadata Pattern

Simple definition:

- a declarative description of a component

Where it appears in NEXUS:

- plugin manifests and descriptors

Why it helps:

- discovery and validation can happen before code execution

Tradeoff:

- metadata has to stay in sync with implementation

### Descriptor Discovery

Simple definition:

- scan files to find plugin candidates

Where it appears in NEXUS:

- `LocalPluginDescriptorDiscovery`

Why it helps:

- supports local plugin development

Tradeoff:

- only local file-system discovery is implemented now

### Facade Pattern

Simple definition:

- a small front-facing interface over a larger subsystem

Where it appears in NEXUS:

- `PluginServices`

Why it helps:

- keeps plugin access limited and explicit

Tradeoff:

- plugins get less power directly

### Dependency Injection

Simple definition:

- provide dependencies from the outside

Where it appears in NEXUS:

- `PluginContext`
- service container

Why it helps:

- testability and boundary clarity

Tradeoff:

- more setup code

### Publish/Subscribe

Simple definition:

- events are published and subscribed to through a shared channel

Where it appears in NEXUS:

- Event Bus usage in runtime plugins

Why it helps:

- decoupled communication

Tradeoff:

- control flow becomes less direct

### Fail-Fast Execution

Simple definition:

- stop immediately on error

Where it appears in NEXUS:

- manifest validation
- loader failures
- plugin lifecycle failures

Why it helps:

- errors are visible quickly

Tradeoff:

- less best-effort recovery

### Composition Root

Simple definition:

- the place where major objects are created and connected

Where it appears in NEXUS:

- `BasicRuntime`

Why it helps:

- keeps wiring centralized

Tradeoff:

- the composition root becomes an important boundary to maintain

### Separation of Metadata and Execution

Simple definition:

- store descriptive data separately from runtime behavior

Where it appears in NEXUS:

- manifest vs loader vs manager

Why it helps:

- validation can happen before execution

Tradeoff:

- more moving parts

### Boundary Through Public SDK

Simple definition:

- expose only the intended public plugin API

Where it appears in NEXUS:

- `core/src/index.ts`
- `core/src/plugins/index.ts`

Why it helps:

- plugins do not depend on internals

Tradeoff:

- SDK evolution must be managed carefully

### In-Process Extension Model

Simple definition:

- plugins run in the same process as the host runtime

Where it appears in NEXUS:

- current core runtime

Why it helps:

- simpler early-stage architecture

Tradeoff:

- no sandboxing or distributed isolation

## 25. Design Tradeoffs

### In-process plugins vs sandboxed plugins

Current choice:

- in-process plugins

Why:

- simple
- fast
- deterministic

Tradeoff:

- no sandbox isolation today

### Local descriptor discovery vs remote marketplace

Current choice:

- local descriptor discovery

Why:

- better for early development and tests

Tradeoff:

- no marketplace workflow yet

### Sequential lifecycle vs parallel lifecycle

Current choice:

- sequential lifecycle execution

Why:

- predictable order

Tradeoff:

- slower than parallel orchestration

### Fail-fast plugin startup vs best-effort plugin startup

Current choice:

- fail-fast

Why:

- errors are obvious
- behavior is easier to test

Tradeoff:

- one failure can stop later plugins

### Small plugin context vs full runtime access

Current choice:

- small `PluginContext`

Why:

- keeps boundaries clean

Tradeoff:

- plugin authors have less direct access

### Registry in memory vs persistent registry

Current choice:

- in-memory registry

Why:

- simpler and sufficient for current phase

Tradeoff:

- state does not survive process restart

### Descriptive compatibility vs enforced semver

Current choice:

- descriptive compatibility fields

Why:

- keeps the first version flexible

Tradeoff:

- compatibility is not enforced yet

### Explicit lifecycle hooks vs implicit initialization

Current choice:

- explicit hooks

Why:

- easier to understand and order

Tradeoff:

- plugin authors must follow the lifecycle contract

### CommonJS local plugin entrypoint vs ESM-only plugins

Current choice:

- the example plugin uses `.cjs`

Why:

- simple loader demonstration

Tradeoff:

- example style differs from the core TypeScript ESM package

### No dependency resolution yet vs future package management

Current choice:

- no dependency resolution

Why:

- keeps the plugin system focused on lifecycle and contracts

Tradeoff:

- more advanced package workflows are future work

## 26. What Is Implemented Today

Today the plugin system includes:

- public plugin SDK contracts
- plugin manifest type
- manifest validation
- plugin registry
- local descriptor discovery
- local plugin loader
- plugin manager
- lifecycle hooks
- in-process lifecycle execution
- telemetry demo runtime plugin
- integration tests

## 27. What Is Not Implemented Yet

Today the plugin system does not include:

- browser plugin execution
- plugin sandboxing
- plugin marketplace
- remote package registry
- automatic dependency resolution
- semver enforcement
- distributed plugin execution
- permission system
- production security guarantees
- persistent plugin registry
- hot plugin reload
- plugin UI bundling system

## 28. Common Confusions

1. Plugin Registry is not Plugin Manager.
   - Registry stores state.
   - Manager executes lifecycle.

2. Discovery is not Loading.
   - Discovery reads descriptors.
   - Loading imports code.

3. Loading is not Starting.
   - Loading prepares the plugin object.
   - Starting runs lifecycle hooks.

4. Registering a plugin does not start it.
   - Registration only adds it to the system.

5. Runtime plugin is not UI plugin view.
   - One lives in the core runtime.
   - The other lives in the browser shell.

6. Manifest is not the same as descriptor.
   - The descriptor points to the plugin.
   - The manifest describes the plugin.

7. `entrypoint` is not executed during discovery.
   - Discovery is metadata-only.

8. `requiredCapabilities` are descriptive today, not fully enforced capability contracts.
   - The field exists, but enforcement is limited.

9. Compatibility fields exist, but semver enforcement is not implemented yet.
   - They are documentation and future-policy inputs.

10. Plugins receive `PluginContext`, not the full runtime.
    - This keeps the public boundary small.

11. The plugin system is in-process today.
    - It does not run distributed plugins yet.

12. Plugins are not sandboxed today.
    - Security isolation is future work.

13. The telemetry demo runtime plugin is not a real robot adapter.
    - It only demonstrates normalized event flow.

14. The UI Telemetry Demo view is not loaded by the core Plugin Loader.
    - It is mounted by the UI registry.

15. A plugin publishing an event is not directly commanding a robot.
    - It is only participating in event-driven communication.

## 29. Generic Plugin System Example

Here is a generic plugin flow:

```text
descriptor file
    ↓
validate metadata
    ↓
load plugin code
    ↓
register plugin
    ↓
start plugin
    ↓
subscribe to events
    ↓
publish domain events
    ↓
stop plugin
```

That is the same overall shape NEXUS uses.

## 30. NEXUS Plugin System Walkthrough

This is the current NEXUS flow in plain English:

1. Discovery finds `nexus.plugin.json`.
2. Validation normalizes the manifest.
3. Loading imports the plugin module.
4. Registration stores the plugin in the registry and manager.
5. `BasicRuntime` starts the plugin manager.
6. `onLoad()` runs.
7. `onStart()` runs.
8. The plugin subscribes to the Event Bus and may publish events.
9. Later, runtime shutdown triggers `onStop()`.
10. The plugin unsubscribes and cleans up.

This is the current plugin model to remember.

## 31. Interview Explanation

If asked, “How does the NEXUS plugin system work?”, a concise technical answer is:

NEXUS is plugin-first, so major operator-facing behavior is intended to live in plugins rather than inside the core. The public plugin SDK defines `NexusPlugin`, `NexusPluginManifest`, `PluginContext`, and `PluginManager` boundaries. Discovery reads `nexus.plugin.json` descriptors without executing plugin code. Validation checks and normalizes the manifest before loading. Loading imports the plugin module and normalizes the exported plugin object. The registry stores validated plugin metadata and lifecycle state, while the manager owns execution of `onLoad`, `onStart`, and `onStop`. Plugins receive a limited context with the Event Bus, logger, and service facade so they can communicate through public contracts instead of private runtime internals. The telemetry demo plugin shows the pattern end to end. Today the system is in-process and not sandboxed, and future work may add stronger compatibility enforcement, sandboxing, marketplace behavior, and dependency management.

## 32. Self-Check Questions

- What problem does the plugin system solve?
- What does plugin-first mean?
- What is a `NexusPlugin`?
- What is a plugin manifest?
- What is a plugin descriptor?
- Why are discovery and loading separate?
- Why must discovery not execute plugin code?
- What does validation check?
- What does the loader do?
- What does the registry store?
- What states can a plugin registry entry have?
- What does the Plugin Manager execute?
- What is the difference between Plugin Manager and Plugin Registry?
- What does `onLoad()` do?
- What does `onStart()` do?
- What does `onStop()` do?
- Why does shutdown happen in reverse startup order?
- What is `PluginContext`?
- Why do plugins receive a service facade?
- How does a plugin use the Event Bus?
- What event does the telemetry demo plugin subscribe to?
- What event does the telemetry demo plugin publish?
- What is the difference between runtime plugin and UI plugin view?
- What is not implemented yet in the plugin system?
- How would you explain the plugin system in a technical interview?
- Why is `entrypoint` descriptive but not executed during discovery?
- Why does the registry keep registration order?
- Why does the manager track started order separately?
- Why is `PluginServices` intentionally limited?
- What is the role of `compatibility` today?

## 33. Next Study Step

The next learning document should be:

```text
docs/learning/ui-shell-guide.md
```

That document should deeply analyze:

- React UI startup
- `main.tsx`
- `App.tsx`
- routing
- `AppProviders`
- shell layout
- `ShellFrame`
- `TopBar`
- `ActivityBar`
- `Sidebar`
- `Workspace`
- `BottomEventPanel`
- UI composition
- React component and props syntax

