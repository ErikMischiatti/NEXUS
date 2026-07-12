# NEXUS Core Runtime Guide

## 1. Purpose of This Document

This document explains the NEXUS Core Runtime in depth.

The goal is to understand:

- what a runtime is
- why NEXUS needs a headless runtime
- how `BasicRuntime` boots and shuts down
- how config, logging, DI, the Event Bus, and the Plugin Manager fit together
- how the TypeScript code is structured
- how to explain the runtime clearly in an interview

This is a learning guide, not a spec for future behavior.

## 2. What Is a Runtime?

### 2.1 Simple Definition

A runtime is the part of a system that is actually executing.

It is the live engine of the application. It starts things, connects things, moves messages around, and coordinates shutdown.

### 2.2 Generic Example

In a simple web app:

- the React component tree renders the UI
- the runtime might be the application shell that loads config, sets up services, and wires plugins or modules together

In a robot control system:

- the runtime may load robot state
- connect to messaging infrastructure
- start feature modules
- stop them cleanly when the process exits

### 2.3 Runtime in NEXUS

In NEXUS, the Core Runtime is the headless execution foundation in `core/`.

It is responsible for:

- bootstrapping the platform
- creating runtime services
- managing the Event Bus
- managing plugin lifecycle
- publishing runtime lifecycle events

It is headless, which means it runs without React and without browser rendering.

The core runtime is the "engine room" of NEXUS. The UI shell is separate.

## 3. Why NEXUS Needs a Core Runtime

NEXUS needs a runtime because the platform is more than a UI.

The runtime solves a few specific problems:

- it gives plugins a shared execution environment
- it creates a single place for config, logging, and shared services
- it provides a predictable startup and shutdown sequence
- it keeps platform behavior separate from UI rendering
- it makes the architecture easier to test in-process

Without a core runtime, the system would drift toward:

- ad hoc service initialization
- unclear plugin lifecycle
- UI code owning platform behavior
- hidden dependencies between modules

The runtime is the composition root of the platform. It is the place where the important things are created and connected.

## 4. Core Runtime Responsibilities

The current core runtime owns:

- runtime bootstrap
- runtime lifecycle
- configuration loading
- logger creation
- service container setup
- Event Bus creation
- Plugin Manager creation
- core service registration
- plugin registration before startup
- plugin load/start during runtime startup
- plugin stop during runtime shutdown
- lifecycle events such as `core.runtime.started` and `core.runtime.stopped`

These responsibilities are narrow on purpose. The runtime coordinates the system, but it should not absorb feature logic that belongs in plugins, adapters, or the UI.

## 5. Core Runtime Non-Responsibilities

The core runtime must not own:

- UI rendering
- React components
- robot-specific behavior
- ROS, MQTT, or MAVLink protocols
- adapter implementation
- mission semantics
- autopilot behavior
- safety-critical control

This boundary matters because NEXUS is supposed to stay robot-agnostic and middleware-independent.

If a concern depends on a robot, a transport protocol, or a browser interface, it does not belong in `BasicRuntime`.

## 6. Main Files and Folders

### 6.1 core/package.json

`core/package.json` defines the `@nexus/core` package.

It shows that the core package:

- is private to the repository
- is written in TypeScript
- targets Node.js
- has build, test, and typecheck scripts

Why it exists:

- to make the runtime its own package boundary

What it owns:

- package metadata
- scripts
- package-local dependencies

What it must not own:

- application runtime behavior
- UI concerns

### 6.2 core/src/index.ts

`core/src/index.ts` is the public export surface of the core package.

Why it exists:

- to give consumers one stable entrypoint
- to hide internal file structure behind a curated API

What it exports today:

- the Event Bus implementation and types
- plugin runtime APIs and utilities
- configuration APIs
- logging APIs
- DI helpers
- runtime creation helpers and runtime types

What it must not do:

- leak every internal helper just because it exists
- become a dumping ground for unrelated exports

### 6.3 core/src/runtime/

This folder contains the runtime implementation.

Relevant files:

- `core/src/runtime/basic-runtime.ts`
- `core/src/runtime/types.ts`
- `core/src/runtime/index.ts`

Why it exists:

- to isolate the runtime bootstrap and lifecycle logic

What it owns:

- `BasicRuntime`
- `createRuntime()`
- runtime state types
- runtime-facing type definitions

### 6.4 core/src/config/

This folder contains configuration loading and normalization.

Relevant files:

- `core/src/config/basic-config-loader.ts`
- `core/src/config/types.ts`
- `core/src/config/index.ts`

Why it exists:

- to keep config loading separate from runtime startup

What it owns:

- config shape
- default config
- validation of runtime and plugin config

### 6.5 core/src/logging/

This folder contains structured logging helpers.

Relevant files:

- `core/src/logging/basic-logger.ts`
- `core/src/logging/types.ts`
- `core/src/logging/index.ts`

Why it exists:

- to give the runtime a consistent logger creation model

What it owns:

- log levels
- logger interface
- logger factory
- structured log records

### 6.6 core/src/di/

This folder contains the service container and typed service keys.

Relevant files:

- `core/src/di/basic-service-container.ts`
- `core/src/di/types.ts`
- `core/src/di/keys.ts`
- `core/src/di/index.ts`

Why it exists:

- to provide explicit dependency injection and service lookup

What it owns:

- service registration
- service lookup
- typed keys for core services

### 6.7 core/src/bus/

This folder contains the Event Bus abstraction and in-memory implementation.

Relevant files:

- `core/src/bus/types.ts`
- `core/src/bus/in-memory-event-bus.ts`
- `core/src/bus/index.ts`

Why it exists:

- to support event-driven communication inside the runtime

What it owns:

- event envelope types
- publish/subscribe/unsubscribe API
- in-memory sequential dispatch

### 6.8 core/src/plugins/

This folder contains the plugin platform.

Relevant files:

- `core/src/plugins/types.ts`
- `core/src/plugins/basic-plugin-manager.ts`
- `core/src/plugins/registry/index.ts`
- `core/src/plugins/discovery/index.ts`
- `core/src/plugins/loader/index.ts`
- `core/src/plugins/manifest-validation.ts`
- `core/src/plugins/index.ts`

Why it exists:

- to make plugin behavior explicit and lifecycle-managed

What it owns:

- plugin manifests
- plugin context
- plugin manager
- plugin registry
- discovery
- loading
- lifecycle execution

## 7. Public Runtime API Surface

### 7.1 Exports from core/src/index.ts

The public runtime surface is built from exports in `core/src/index.ts`.

Most important exports for the runtime discussion:

- `BasicRuntime`
- `createRuntime`
- `RuntimeHandle`
- `RuntimeOptions`
- `RuntimeState`
- `RuntimeSnapshot`

The public API is small on purpose. The runtime does not expose all private fields directly.

### 7.2 RuntimeHandle

`RuntimeHandle` is the interface that describes the runtime object you can interact with.

It includes:

- `eventBus`
- `config`
- `loggerFactory`
- `logger`
- `services`
- `pluginManager`
- `state`
- `registerPlugin()`
- `start()`
- `stop()`

Why it exists:

- to define a stable runtime contract independent of the implementation class

### 7.3 RuntimeOptions

`RuntimeOptions` describes what can be passed into the runtime constructor or `createRuntime()`.

It currently supports:

- `config`
- `configLoader`
- `loggerFactory`

Why it exists:

- to make runtime setup configurable without hard-coding source of config or logger creation

### 7.4 RuntimeState

`RuntimeState` is the runtime state union:

- `stopped`
- `starting`
- `running`
- `stopping`

Why it exists:

- to make lifecycle state explicit
- to keep startup and shutdown transitions readable and testable

### 7.5 RuntimeSnapshot in the Core Package

The core package also defines a `RuntimeSnapshot` type in `core/src/runtime/types.ts`.

Important: this is not the same thing as the UI mock `RuntimeSnapshot` in `ui/src/types/runtime-snapshot.ts`.

In `core/src/runtime/types.ts`, `RuntimeSnapshot` is an internal runtime shape that holds references like:

- config
- logger factory
- logger
- services
- plugin manager
- state

In the UI package, `RuntimeSnapshot` is a browser-facing state model for rendering shell data.

These are related by name only. They serve different layers.

## 8. BasicRuntime Overview

### 8.1 What BasicRuntime Is

`BasicRuntime` is the current concrete runtime implementation.

It is the class that wires the runtime pieces together and controls startup and shutdown.

### 8.2 Why It Is Called BasicRuntime

It is called "Basic" because it is intentionally minimal.

It does not try to be a distributed runtime, a recovery system, or a production orchestration platform.

It is the first headless runtime shell.

### 8.3 Constructor

The constructor is:

```ts
constructor(private readonly options: RuntimeOptions = {}) {
  this.configLoader =
    options.configLoader ?? new BasicConfigLoader(options.config);
}
```

What it does:

- stores runtime options
- creates the config loader immediately
- does not load config yet

Why config is not loaded during construction:

- construction should stay cheap and predictable
- startup is the phase that is allowed to fail on config
- the runtime may be created first and started later

### 8.4 Internal Fields

The main private fields are:

- `eventBusImpl`
- `servicesContainer`
- `pluginContext`
- `pluginManagerImpl`
- `configLoader`
- `loggerFactoryImpl`
- `loggerImpl`
- `configImpl`
- `stateImpl`
- `startedSuccessfully`
- `stoppedSuccessfully`
- `startAttempted`

Why these are private:

- the runtime should own its own lifecycle state
- outside code should interact through the public API, not mutate internals

Why several fields are `readonly`:

- references like the event bus and service container should not be replaced after construction

### 8.5 Public Getters

`BasicRuntime` exposes getters instead of allowing free mutation.

Examples:

- `get eventBus()`
- `get config()`
- `get loggerFactory()`
- `get logger()`
- `get services()`
- `get pluginManager()`
- `get state()`

Why this is useful:

- it makes runtime state easier to reason about
- it prevents accidental replacement of core components
- it keeps ownership centralized

### 8.6 registerPlugin()

`registerPlugin(plugin)` adds a plugin before startup.

Important behavior:

- plugins can only be registered while the runtime is still stopped
- registration is blocked after startup has been attempted

Why:

- startup should be deterministic
- the runtime should not change its plugin set while booting or running
- plugin registration should happen before lifecycle execution begins

### 8.7 start()

`start()` is the main bootstrap method.

It is asynchronous:

- it returns `Promise<void>`
- it awaits config loading and plugin lifecycle hooks

Why startup is asynchronous:

- config loading may be async
- plugin hooks may be async
- the runtime must wait for the full boot sequence to finish before it becomes running

### 8.8 stop()

`stop()` shuts the runtime down.

It is also asynchronous because plugin stop hooks may be async.

### 8.9 createLifecycleEvent()

`createLifecycleEvent(type)` creates a runtime lifecycle event payload.

It returns a `NexusEvent<{ runtime: string }>` with:

- an id from `randomUUID()`
- the event type
- `source: "core.runtime"`
- an ISO timestamp
- a payload containing the runtime name

Why include runtime name:

- it makes lifecycle events self-describing
- it helps logs and event consumers know which runtime emitted the event

### 8.10 createRuntime()

`createRuntime()` is the convenience factory.

It accepts either:

- a `RuntimeOptions` object
- or a string runtime name

If given a string, it creates a default config object with:

- `runtime.name` set to the string
- `runtime.logLevel` set to `"info"`
- empty plugin lists

Why this helper exists:

- it makes tests and simple bootstraps shorter
- it provides a friendly entrypoint for common cases

## 9. Runtime Startup Flow

The current startup flow in `BasicRuntime.start()` is:

```text
createRuntime()
        ↓
new BasicRuntime()
        ↓
registerPlugin(plugin)      optional, before start
        ↓
start()
        ↓
load config
        ↓
create logger factory
        ↓
create runtime logger
        ↓
register core services
        ↓
attach logger/services to PluginContext
        ↓
pluginManager.loadAll()
        ↓
pluginManager.startAll()
        ↓
publish core.runtime.started
        ↓
state = running
```

Why this order matters:

1. config must exist before logger setup and event payload creation
2. core services must exist before plugins access them
3. plugins must be loaded before they are started
4. the runtime started event should represent a successfully started runtime, not a partially booted one

The runtime becomes running only after the whole sequence succeeds.

## 10. Runtime Shutdown Flow

The current shutdown flow in `BasicRuntime.stop()` is:

```text
stop()
        ↓
check runtime was started
        ↓
state = stopping
        ↓
pluginManager.stopAll()
        ↓
publish core.runtime.stopped
        ↓
state = stopped
```

Why this order matters:

- plugins should stop before the runtime declares itself stopped
- the stopped event should mean the runtime has completed controlled shutdown
- the shutdown sequence should release plugin resources first

Why `stop()` returns early if the runtime was never successfully started:

- there is nothing to shut down if startup never completed
- shutdown should not pretend success for a runtime that never became active

Why shutdown restores state to `running` if it fails:

- a failed shutdown means the runtime is still active in some form
- reverting to `running` prevents the state from lying about the actual status

## 11. Runtime State Machine

The runtime states are:

- `stopped`
- `starting`
- `running`
- `stopping`

State diagram:

```text
stopped
   │ start()
   ▼
starting
   │ success
   ▼
running
   │ stop()
   ▼
stopping
   │ success
   ▼
stopped
```

Failure paths:

```text
starting -- failure --> stopped
stopping -- failure --> running
```

Why this matters:

- it makes lifecycle transitions explicit
- it helps tests assert valid behavior
- it prevents vague "maybe running" states

The runtime is designed as a small explicit state machine, not as a loose collection of flags.

## 12. Configuration Loading

Configuration is handled by `BasicConfigLoader` in `core/src/config/basic-config-loader.ts`.

Current behavior:

- load defaults
- merge partial config
- validate required fields
- return a normalized config object

Why config loading is separate from `BasicRuntime` construction:

- the runtime should not fail just because it was created
- startup is the point where configuration validity matters
- config loading is a platform concern, not a constructor concern

The runtime reads config during `start()`, not during construction, so the startup step becomes the single point where configuration failure is handled.

## 13. Logging Setup

Logging is handled by `BasicLoggerFactory` and `BasicLogger` in `core/src/logging/`.

How it works:

- the runtime creates or receives a logger factory
- it creates a runtime logger with component name `core.runtime`
- the logger factory can create child loggers later

Why logging is set up during startup:

- the log level depends on runtime config
- logging should reflect the configured runtime state

The logger is structured, not just string-based.

Benefits:

- log level filtering
- component-scoped loggers
- structured records with context

Tradeoff:

- it is more deliberate than `console.log`
- but the structured shape makes the runtime easier to debug and test

## 14. Service Container and Dependency Injection

The service container is `BasicServiceContainer` in `core/src/di/basic-service-container.ts`.

It stores services by typed keys:

- `eventBus`
- `config`
- `loggerFactory`

The runtime registers these services during startup.

Why the runtime creates a service container:

- to centralize shared platform services
- to make service lookup explicit
- to avoid hard-wiring every dependency into every plugin

Dependency injection in NEXUS means:

- the runtime creates the services
- plugins receive access through `PluginContext`
- plugins do not create their own hidden copies of core services

The container is a service locator style container, but in this codebase it is used as a small explicit platform boundary rather than as a general-purpose framework.

### TypeScript syntax example

```ts
private readonly eventBusImpl = new InMemoryEventBus();
```

This means:

- `private` only allows access from inside the class
- `readonly` means the field reference cannot be reassigned
- `eventBusImpl` is a class field
- `new InMemoryEventBus()` constructs a new instance

### Another TypeScript syntax example

```ts
constructor(private readonly options: RuntimeOptions = {}) {}
```

This means:

- this is the constructor
- `options` is a typed parameter
- `RuntimeOptions` is the type
- `= {}` gives the parameter a default value
- `private readonly` also creates and stores a class field automatically

### Optional chaining and nullish coalescing

```ts
this.options.config?.runtime?.name ?? "nexus-runtime"
```

This means:

- `?.` checks whether the previous value exists before reading the next property
- `??` means "use the fallback only when the left side is `null` or `undefined`"
- `"nexus-runtime"` is the fallback name

Why this is useful:

- the runtime can safely read partial config
- the code avoids noisy null checks

### Async runtime methods

```ts
async start(): Promise<void>
```

This means:

- `async` declares an asynchronous function
- `Promise<void>` means the caller waits for completion, but the method does not return a value

Why startup is asynchronous:

- config loading can be async
- plugin hooks can be async
- the runtime needs to wait for startup work to finish

### Service facade example

```ts
createPluginServices = (services: BasicServiceContainer): PluginServices => ({
  get: <T>(key: ServiceKey<T>) => services.get(key),
  optional: <T>(key: ServiceKey<T>) => services.optional(key),
  has: <T>(key: ServiceKey<T>) => services.has(key),
});
```

This means:

- `createPluginServices` is an arrow function
- it returns an object literal
- `<T>` is a generic type parameter
- `PluginServices` is a limited facade around the full service container

Why this facade exists:

- plugins should get only the public surface they need
- the runtime should not expose the mutable internal container directly

This is a facade pattern as well as a dependency injection boundary.

## 15. Event Bus Role in the Runtime

The runtime creates an `InMemoryEventBus` immediately and reuses it for the runtime lifetime.

Why:

- plugins need a shared event channel
- runtime lifecycle events need a place to go
- in-process event delivery is simple and deterministic

The Event Bus is not the same thing as React Context.

- Event Bus is for runtime events and plugin communication
- React Context is for passing values through a React tree

In NEXUS, the Event Bus is a core runtime mechanism, not a UI mechanism.

## 16. Plugin Manager Role in the Runtime

The runtime creates a `BasicPluginManager` and gives it a `PluginContext`.

Why:

- the runtime owns plugin lifecycle orchestration
- the manager handles `register`, `loadAll`, `startAll`, and `stopAll`

The runtime and the plugin manager have different responsibilities:

- the runtime composes the system
- the manager executes plugin lifecycle steps

The Plugin Manager is not the same thing as the Plugin Registry.

- the manager owns execution
- the registry owns metadata and lifecycle state

## 17. Plugin Context and Service Facade

`createPluginContext(eventBus)` creates a minimal plugin context.

Then `BasicRuntime.start()` enriches that context with:

- `logger`
- `services`

Why this is useful:

- plugins can access public runtime capabilities
- plugins do not receive the entire runtime object
- the plugin boundary stays explicit

The service facade is intentionally small:

- `get`
- `optional`
- `has`

It does not expose registration or full container internals.

This is a good example of boundary design: give plugins what they need, not everything the runtime knows.

## 18. Error Handling and Fail-Fast Behavior

The runtime is designed to fail fast during startup.

Examples of current behavior:

- invalid config throws during `start()`
- invalid plugin manifests throw during registration or load
- plugin lifecycle errors are surfaced immediately
- startup rejects as soon as a failure occurs

Why fail-fast startup is useful:

- it prevents a half-working runtime from pretending to be healthy
- it makes bugs easier to find
- it keeps startup deterministic

Why controlled shutdown is useful:

- plugins can release resources in reverse order
- the runtime can attempt a clean stop
- failures are visible instead of ignored

The current runtime does not implement:

- recovery supervisors
- sandboxing
- distributed retry strategies
- externalized crash orchestration

Those are future concerns, not current runtime behavior.

## 19. Determinism and Testability

The core runtime is intentionally test-friendly.

Evidence from the code and tests:

- runtime state is explicit
- the event bus is in-memory
- plugin lifecycle runs sequentially
- service registration is deterministic
- tests can observe state changes directly

Why this matters:

- deterministic code is easier to reason about
- tests can assert exact order and exact failure behavior

The tests in `core/test/` cover:

- runtime startup and shutdown
- lifecycle events
- plugin registration and lifecycle
- event bus dispatch and failure behavior
- registry state changes
- loader and discovery behavior
- config validation
- DI behavior

## 20. TypeScript Syntax Explained

### 20.1 Classes

A class groups data and behavior together.

In NEXUS:

- `BasicRuntime` is a class
- `BasicLogger` is a class
- `BasicServiceContainer` is a class

### 20.2 private readonly

`private` means only the class itself can access the field.

`readonly` means the reference cannot be reassigned after initialization.

This is used to keep runtime internals stable.

### 20.3 Type Imports

The runtime code often uses `import type`.

That means:

- the import is for TypeScript types only
- it does not become a runtime JavaScript dependency

This helps keep the code clear about what exists at runtime and what exists only for typing.

### 20.4 Optional Values

Fields like `loggerFactoryImpl: LoggerFactory | undefined` can either hold a value or be absent.

This is how the runtime tracks values that are created later during startup.

### 20.5 Union Types

`RuntimeState = "stopped" | "starting" | "running" | "stopping"`

This means the variable can only be one of those strings.

Why this is useful:

- it prevents invalid state values
- it makes state transitions explicit

### 20.6 Generics

Generics appear in places like:

- `NexusEvent<TPayload>`
- `ServiceKey<T>`
- `PluginServices`

Why generics help:

- they let the runtime stay reusable
- they preserve type safety without duplicating code

### 20.7 Promise<void>

`Promise<void>` means the function is asynchronous but does not return a useful value.

This is a common shape for lifecycle methods like `start()` and `stop()`.

### 20.8 Async/Await

`async` and `await` make asynchronous code read like step-by-step code.

In NEXUS:

- `start()` awaits config loading and plugin lifecycle
- `stop()` awaits plugin shutdown

### 20.9 Nullish Coalescing

`??` chooses a fallback only if the left side is `null` or `undefined`.

This is important in runtime code because an empty string is not the same thing as missing data.

### 20.10 Object Facades

The runtime creates a small object facade for plugins:

- `get`
- `optional`
- `has`

This is a safe public surface over the full service container.

## 21. Generic Runtime Example

Here is a generic version of what `BasicRuntime` is doing:

```text
1. Create core runtime objects.
2. Register public services.
3. Prepare a plugin context.
4. Load plugin modules.
5. Start plugin hooks.
6. Publish startup event.
7. Run until shutdown.
8. Stop plugins in reverse order.
9. Publish shutdown event.
```

This is a common runtime pattern in plugin-based systems.

The NEXUS version is deliberately simple and in-process.

## 22. NEXUS Runtime Walkthrough

This is the current runtime flow in plain English:

1. A caller creates the runtime with `createRuntime()`.
2. `BasicRuntime` creates an in-memory event bus and service container.
3. Optional plugins are registered before startup.
4. `start()` loads config.
5. The runtime creates a logger factory and runtime logger.
6. Core services are registered into the container.
7. The plugin context is updated with logger and service facade.
8. The plugin manager loads all registered plugins.
9. The plugin manager starts all loaded plugins.
10. The runtime publishes `core.runtime.started`.
11. The runtime enters the `running` state.
12. Later, `stop()` stops plugins in reverse order.
13. The runtime publishes `core.runtime.stopped`.
14. The runtime enters the `stopped` state.

This is the execution model to remember.

## 23. What Is Implemented Today

Today the core runtime implements:

- headless in-process runtime startup and shutdown
- in-memory Event Bus
- configuration loading and validation
- structured logging
- service container
- typed service keys
- plugin manifest validation
- local plugin discovery
- local plugin loading
- plugin registry
- plugin lifecycle manager
- runtime and plugin tests

## 24. What Is Not Implemented Yet

The runtime does not currently implement:

- browser UI rendering
- React integration
- ROS integration
- MQTT integration
- MAVLink integration
- WebSocket or IPC bridging to the UI
- distributed plugin execution
- sandboxing
- production-grade recovery supervision
- safety-certified control behavior

These are future concerns and should stay out of the runtime guide as current behavior.

## 25. Design Tradeoffs

### Simple in-memory runtime vs distributed runtime

NEXUS currently uses a simple in-memory runtime.

Why:

- easier to test
- easier to understand
- easier to reason about during early phases

Tradeoff:

- it is not yet suitable for distributed execution

### Fail-fast startup vs best-effort startup

NEXUS prefers fail-fast startup.

Why:

- startup problems should be visible immediately
- partial boot can hide real problems

Tradeoff:

- fewer things continue after error, but the error signal is clearer

### Sequential plugin lifecycle vs parallel lifecycle

The plugin manager currently runs lifecycle steps sequentially.

Why:

- deterministic order
- easier debugging
- simpler failure handling

Tradeoff:

- slower than parallel orchestration

### Explicit plugin registration vs automatic global discovery

The runtime requires explicit registration before startup.

Why:

- startup remains predictable
- plugin boundaries stay clear

Tradeoff:

- less automatic convenience

### Small service facade vs exposing the full service container

Plugins receive only `get`, `optional`, and `has`.

Why:

- preserves runtime ownership
- prevents plugins from mutating the container directly

Tradeoff:

- plugins have less power, but the boundary is safer

### Config loaded at startup vs config loaded in constructor

NEXUS loads config during startup.

Why:

- construction stays cheap
- startup becomes the explicit failure point

Tradeoff:

- a few runtime values are not available until `start()`

### Mock/simple lifecycle vs production-grade supervision

The current runtime is intentionally simple.

Why:

- the architecture is still early-stage
- the team needs clear boundaries before adding complexity

Tradeoff:

- no recovery trees, no sandboxing, no distributed supervision yet

## 26. Possible Future Improvements

Future improvements could include:

- adapter-based ingestion of external robot data
- more advanced runtime supervision
- richer service typing
- stronger compatibility checks for plugins
- improved lifecycle diagnostics
- better runtime-to-UI binding

These are possible future steps, not current commitments.

## 27. Common Confusions

1. `BasicRuntime` is not the UI.
   - It is the headless runtime engine.

2. `BasicRuntime` is not a robot controller.
   - It coordinates platform behavior, not vehicle motion.

3. `BasicRuntime` is not ROS, MQTT, or MAVLink.
   - Those belong behind future adapters.

4. `RuntimeSnapshot` in core types is not the same as the UI mock `RuntimeSnapshot`.
   - They live in different packages and serve different layers.

5. Event Bus is not the same as React Context.
   - One is for runtime message flow; the other is for React tree data passing.

6. Plugin Manager is not the same as Plugin Registry.
   - The manager executes lifecycle; the registry stores plugin metadata and state.

7. Plugin lifecycle is not the same as UI rendering.
   - Lifecycle is about startup and shutdown hooks.

8. Starting the runtime does not start a robot.
   - The current runtime is in-process and platform-level.

9. Registering a plugin does not start it.
   - Registration only adds it to the runtime’s known set.

10. Loading a plugin is not the same as starting it.
    - Loading imports the module; starting runs lifecycle hooks.

11. The current runtime is in-process, not distributed.
    - Everything runs in the same process memory space.

12. The current runtime does not provide sandboxing.
    - Plugins are not isolated by a runtime sandbox yet.

## 28. Interview Explanation

If asked, “How does the NEXUS Core Runtime work?”, a concise technical answer is:

NEXUS Core Runtime is a headless TypeScript runtime that acts as the composition root for the platform. `BasicRuntime` creates the in-memory Event Bus, service container, plugin context, and plugin manager. During `start()`, it loads and validates config, creates logging, registers core services, attaches a limited service facade to plugin context, loads plugins, starts plugins, and then publishes `core.runtime.started`. During `stop()`, it stops plugins in reverse order and publishes `core.runtime.stopped`. The runtime uses a small explicit state machine, fails fast on invalid startup conditions, and stays separate from UI rendering and adapter implementations.

That is the shortest accurate answer.

## 29. Self-Check Questions

- What problem does `BasicRuntime` solve?
- Why is the runtime headless?
- Why is config loaded during `start()`?
- Why are plugins registered before startup?
- What happens during `start()`?
- What happens during `stop()`?
- What are the runtime states?
- What happens if startup fails?
- What happens if shutdown fails?
- Why does the runtime create a service container?
- Why does the runtime expose a plugin service facade?
- What is the difference between Plugin Manager and Plugin Registry?
- What is the role of the Event Bus during runtime startup?
- Why are lifecycle events published?
- Why is startup fail-fast?
- Why does shutdown try to be controlled?
- What is dependency injection?
- What is a composition root?
- What is an in-process runtime?
- What future work is intentionally out of scope?
- Why is `RuntimeSnapshot` in the core package not the same as the UI snapshot model?
- Why does `BasicRuntime` publish lifecycle events after plugin startup and shutdown work?
- Why are `private readonly` fields used for the event bus and service container?
- Why is the plugin context intentionally smaller than the full runtime?
- Why is the runtime state machine explicit?

## 30. Next Study Step

The next learning document should be:

```text
docs/learning/event-bus-guide.md
```

That document should deeply analyze:

- `NexusEvent`
- `EventBus`
- `publish`
- `subscribe`
- `unsubscribe`
- async sequential dispatch
- event-driven architecture
- tradeoffs of the current in-memory implementation

