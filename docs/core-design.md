# Core Design

## 1. Purpose

This document defines the Phase 1 runtime contract for NEXUS Core.

It is an implementation-oriented design for the first headless runtime, not a vision statement. The purpose is to establish the minimum contracts needed to build, test, and evolve the core without baking in UI, adapter, or middleware assumptions too early.

## 2. Phase 1 Scope

Phase 1 covers a minimal in-process core runtime with the following pieces:

- headless in-process core runtime
- Event Bus
- Plugin Manager
- Configuration
- Logging
- simple DI/service container
- lifecycle management
- mock/demo plugin
- smoke tests

Phase 1 explicitly excludes:

- UI
- ROS/MQTT/MAVLink adapters
- distributed messaging
- plugin sandboxing
- production safety guarantees
- full capability schema

## 3. Core Responsibilities

The core owns the runtime foundations that other modules depend on:

- runtime bootstrap
- lifecycle orchestration
- event routing
- plugin registration/activation
- config loading
- shared logging
- service registration and lookup

These responsibilities are intentionally narrow. The core should provide predictable platform services and a stable contract for plugins, but it should not absorb domain behavior that belongs in plugins or adapters.

## 4. Core Non-Responsibilities

The core should not own:

- vehicle-specific logic
- middleware-specific protocols
- UI rendering
- mission semantics
- autopilot behavior
- safety-critical control

If a concern depends on a specific robot, protocol, mission model, or operator interface, it belongs outside NEXUS Core.

## 5. Proposed Runtime Bootstrap Flow

The intended boot sequence for Phase 1 is:

1. load configuration
2. initialize logger
3. create service container
4. create event bus
5. create plugin manager
6. register built-in services
7. load plugins
8. start plugins
9. run until shutdown
10. stop plugins cleanly

The boot sequence should remain deterministic and testable. Startup loads config, creates the logger factory, registers core services, starts registered plugins, and publishes `core.runtime.started` after startup completes. Shutdown stops plugins in reverse activation order when possible, then publishes `core.runtime.stopped` after a clean stop. Runtime start is one-shot in Phase 1. Startup should fail fast on invalid configuration or missing required services, while shutdown should attempt to stop already-started plugins in a controlled order.

## 6. Event Model

Phase 1 uses a minimal event envelope:

```ts
type NexusEvent<TPayload = unknown> = {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payload: TPayload;
  correlationId?: string;
};
```

Minimum Event Bus API:

- `publish(event)`
- `subscribe(type, handler)`
- `unsubscribe(subscription)`

Request/reply can be considered later, but it is out of scope for Phase 1.

The Phase 1 implementation uses async `publish(event)` so handlers may return either `void` or `Promise<void>`. Handlers are invoked sequentially in subscription order. If a handler throws or rejects, `publish()` rejects immediately and later handlers for that event are not invoked.

Event type strings should be namespaced and stable. Examples:

- `core.runtime.started`
- `core.runtime.stopped`
- `plugin.loaded`
- `telemetry.updated`

The event bus should not impose domain-specific structure beyond the envelope. Payloads may be typed by the caller, but the bus itself should treat them as opaque values.

## 7. Plugin Model

Phase 1 uses a minimal plugin manifest and lifecycle contract:

```ts
type NexusPluginManifest = {
  id: string;
  name: string;
  version: string;
  requiredServices?: string[];
  requiredCapabilities?: string[];
};

type PluginContext = {
  eventBus: EventBus;
};

type NexusPlugin = {
  manifest: NexusPluginManifest;
  onLoad?(context: PluginContext): Promise<void> | void;
  onStart?(context: PluginContext): Promise<void> | void;
  onStop?(context: PluginContext): Promise<void> | void;
};
```

Plugin lifecycle expectations:

- `onLoad` is for initialization work before activation.
- `onStart` is for subscribing to events, starting timers, or publishing startup state.
- `onStop` is for cleanup, unsubscription, and release of resources.

The plugin manager is intentionally in-process only. It validates duplicate plugin IDs, runs lifecycle hooks sequentially in registration order, and stops started plugins in reverse startup order when possible. Failures are surfaced immediately; the manager does not attempt retries, recovery, or parallel orchestration.

## 8. Configuration Model

Phase 1 uses a small in-memory configuration model. The initial loader does not parse files or read environment variables.

Minimal Phase 1 config fields:

- `runtime.name`
- `runtime.logLevel`
- `plugins.enabled`
- `plugins.paths`

Defaults are: `runtime.name = "nexus-runtime"`, `runtime.logLevel = "info"`, `plugins.enabled = []`, and `plugins.paths = []`.

The loader merges partial config objects with defaults, validates the result, and returns a normalized copy containing only the supported fields. Unknown fields are intentionally ignored for Phase 1.3.

Validation is strict and should reject missing `runtime.name`, invalid `runtime.logLevel`, and non-array `plugins.enabled` or `plugins.paths` values.

## 9. Logging Model

Phase 1 uses structured logging with a console sink. The logger filters by minimum level, emits structured records, and supports component-scoped child loggers.

Logging expectations:

- logs should be structured, not free-form strings only
- log levels should be supported
- each core component and plugin should receive its own logger instance or logger scope
- correlationId support should exist in log records for later use, but it does not need full end-to-end enforcement in Phase 1

The initial sink is console output. Additional sinks, formatting strategies, and persistence concerns can be added later without changing the basic logger contract.

## 10. Dependency Injection / Service Container

Phase 1 uses a simple service container rather than a full framework.

Minimum service container behavior:

- register service
- get service
- optional service namespaces

The container uses explicit typed service keys rather than string lookup. The initial core keys are `eventBus`, `config`, and `loggerFactory`. Duplicate registration should fail, missing services should fail clearly, and key listing should remain deterministic.

Plugins should receive only `PluginContext`, not direct access to the full internal core runtime. If a plugin needs a service, it should resolve that service through the context-provided container.

This keeps the core boundary explicit and makes tests easier to reason about.

## 11. Lifecycle And Error Handling

Phase 1 should define clear behavior for load, start, and stop failures.

Expected failure categories:

- load errors
- start errors
- stop errors

Phase 1 plugin failure policy:

- invalid plugin manifests fail during load
- plugin load failures stop that plugin from activating
- plugin start failures should be surfaced clearly and should not silently disappear
- plugin stop failures should be reported, but shutdown should continue for remaining plugins when possible

Graceful shutdown expectations:

- stop plugins in reverse activation order when practical
- release subscriptions and resources deterministically
- emit runtime stop state if the runtime reaches shutdown cleanly

The Phase 1 runtime should favor fail-fast behavior on boot and controlled shutdown behavior on exit. It does not need production-grade recovery, supervision trees, or sandbox isolation yet.

## 12. Testing Strategy

Phase 1 should be covered by focused tests around the core contracts:

- Event Bus unit tests
- config loader unit tests
- plugin lifecycle tests
- smoke test booting runtime with mock plugin

No UI tests are needed in Phase 1.

Tests should verify contract behavior rather than implementation details. In particular, they should assert event delivery, config precedence, plugin lifecycle ordering, and clean runtime shutdown.

## 13. Proposed TypeScript Package Structure

```text
core/
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ index.ts
│  ├─ runtime/
│  ├─ bus/
│  ├─ plugins/
│  ├─ config/
│  ├─ logging/
│  ├─ di/
│  └─ lifecycle/
└─ test/
```

This structure keeps the first implementation focused on the runtime boundary and avoids prematurely splitting the platform into too many packages.

## 14. Phase 1 Success Criteria

Phase 1 is complete when:

- core package builds
- tests pass
- runtime boots headlessly
- mock plugin loads
- plugin subscribes and publishes an event
- runtime shuts down cleanly

## 15. Open Questions

The following items remain open and should be resolved before or during implementation:

- package manager
- test runner
- final config file format
- plugin packaging format
- whether plugin SDK becomes separate package in Phase 2
- future adapter boundaries

These are intentionally left open because they depend on the first implementation choices and the level of separation that proves useful in practice.
