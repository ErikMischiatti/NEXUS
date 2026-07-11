# NEXUS Project Overview

## 1. Purpose of This Learning Guide

This guide is meant to help me read the NEXUS repository as if I were studying a small framework, not just a single app.

The goal is to understand:

- what the project is trying to become
- what is already implemented today
- what is only mocked today
- what is intentionally postponed until later
- how the core runtime, plugin platform, and UI shell relate to each other

I should use this document before jumping into implementation details. It is the "big picture" layer that makes the rest of the code easier to read.

## 2. Current Project Status

NEXUS is still early-stage.

The roadmap and changelog show that:

- Phase 0 is complete
- Phase 1 is complete
- Phase 2 is complete
- Phase 3 is complete
- Phase 4 and later are intentionally paused for review and future work

What exists now is a working headless core runtime, a public plugin platform, and a browser-based operator UI shell. The UI shell is mock-only and does not connect to the real core runtime yet.

That means the repository is in a useful but incomplete state:

- the core runtime exists and runs in-process
- the plugin system exists and is lifecycle-managed
- the UI exists and renders a shell from mock state
- the adapter ecosystem is not implemented yet

This matters because many later concepts in NEXUS are deliberately designed around boundaries that are already visible in the code, even if the full product is not built yet.

## 3. Repository Structure

At a high level, the repository is organized into these main areas:

```text
core/        Headless TypeScript runtime and plugin platform
ui/          Browser-based operator UI shell
examples/    Example plugin packages
docs/        Architecture, roadmap, and learning material
```

The important thing is that `core/` and `ui/` are separate:

- `core/` is the runtime and plugin platform
- `ui/` is the React shell that consumes mock runtime data
- they are not wired together yet

This separation is intentional. It keeps the runtime architecture independent from the browser shell.

### What to read first

For orientation, the most useful source files and docs are:

- `README.md`
- `CHANGELOG.md`
- `docs/roadmap.md`
- `docs/system-design.md`
- `docs/architecture.md`
- `docs/core-design.md`
- `docs/plugin-sdk-design.md`
- `docs/ui-shell-design.md`
- `core/src/index.ts`
- `core/src/runtime/basic-runtime.ts`
- `core/src/bus/`
- `core/src/plugins/`
- `ui/package.json`
- `ui/src/main.tsx`
- `ui/src/App.tsx`
- `ui/src/providers/AppProviders.tsx`
- `ui/src/runtime/`
- `ui/src/types/runtime-snapshot.ts`
- `ui/src/components/layout/ShellFrame.tsx`
- `ui/src/components/layout/Workspace.tsx`
- `ui/src/store/use-shell-store.ts`
- `ui/src/plugins/`
- `examples/plugins/telemetry-demo/`

## 4. Main Architectural Blocks

### 4.1 Core Runtime

The core runtime is the headless TypeScript runtime in `core/`.

Why it exists:

- to hold the minimum runtime infrastructure
- to manage plugin lifecycle in a controlled way
- to provide event routing, configuration, logging, and service lookup
- to stay independent from the UI and from robot-specific protocols

What problem it solves:

- it gives NEXUS a stable runtime boundary
- it avoids pushing runtime concerns into the React shell
- it makes plugin behavior testable in-process

How it appears in NEXUS today:

- `core/src/runtime/basic-runtime.ts` boots the runtime
- `core/src/bus/` provides the in-memory event bus
- `core/src/plugins/` provides discovery, loading, registry, and lifecycle management
- `core/src/di/` provides the service container
- `core/src/config/` and `core/src/logging/` support startup and runtime services

What it should not be confused with:

- the browser UI shell
- the UI mock runtime snapshot
- a robot controller
- a middleware bridge

In simple terms, the core runtime is the "engine room" of NEXUS.

### 4.2 Plugin Platform

The plugin platform is the extensibility layer inside the core.

Why it exists:

- to make features loadable as plugins instead of hard-coded behavior
- to keep the architecture plugin-first
- to support future capability-driven extensions

What problem it solves:

- it lets NEXUS grow without centralizing every feature in the shell or core
- it keeps feature boundaries explicit
- it gives plugin authors a stable contract

How it appears in NEXUS today:

- `core/src/plugins/types.ts` defines plugin contracts
- `core/src/plugins/manifest-validation.ts` validates manifests
- `core/src/plugins/discovery/` finds local descriptors
- `core/src/plugins/loader/` loads plugin modules
- `core/src/plugins/registry/` tracks plugin metadata and lifecycle state
- `core/src/plugins/basic-plugin-manager.ts` runs plugin hooks
- `examples/plugins/telemetry-demo/` shows a minimal example plugin package

What it should not be confused with:

- the UI-side plugin view registry
- the React component tree
- the adapter layer

The plugin platform is about runtime-managed plugins, not UI mounting.

### 4.3 Operator UI Shell

The operator UI shell is the browser app in `ui/`.

Why it exists:

- to provide a browser-first operator workspace
- to host plugin-provided views and panels
- to show runtime state through a stable boundary

What problem it solves:

- it gives users a structured way to interact with NEXUS
- it keeps layout and workspace state separate from plugin lifecycle
- it lets the team design the operator experience without wiring real runtime communication yet

How it appears in NEXUS today:

- `ui/src/main.tsx` mounts the app
- `ui/src/App.tsx` defines routing
- `ui/src/providers/AppProviders.tsx` installs providers
- `ui/src/runtime/runtime-snapshot-provider.tsx` supplies mock runtime state
- `ui/src/components/layout/ShellFrame.tsx` composes the shell
- `ui/src/components/layout/Workspace.tsx` resolves the active plugin view
- `ui/src/plugins/` contains the UI-side plugin view registry
- `ui/src/store/use-shell-store.ts` stores local shell UI state with Zustand

What it should not be confused with:

- the core runtime
- real runtime communication
- plugin discovery/loading in `core/`

The shell is a client of runtime state, not the runtime itself.

### 4.4 Examples

The `examples/` directory demonstrates how to use the contracts.

Why it exists:

- to provide a concrete plugin example
- to keep the SDK understandable through code
- to show middleware-independent behavior

What problem it solves:

- it helps validate the public plugin contract
- it gives a reference implementation for plugin authors

How it appears in NEXUS today:

- `examples/plugins/telemetry-demo/README.md` explains the example
- `examples/plugins/telemetry-demo/nexus.plugin.json` provides the descriptor
- `examples/plugins/telemetry-demo/src/index.cjs` exports the plugin object

What it should not be confused with:

- production plugins
- UI plugin views
- runtime adapters

The example is intentionally minimal and focused on contracts.

### 4.5 Documentation Layer

The documentation in `docs/` is part of the project architecture, not just extra notes.

Why it exists:

- to define terms and boundaries before implementation drifts
- to keep the architecture readable over time
- to document phases and future intent clearly

What problem it solves:

- it prevents the codebase from becoming a pile of implicit assumptions
- it helps new readers understand what is real, what is mock, and what is planned

How it appears in NEXUS today:

- `docs/roadmap.md` tracks phases
- `docs/system-design.md` explains the planned architecture
- `docs/architecture.md` summarizes conceptual blocks
- `docs/core-design.md` explains Phase 1 runtime contracts
- `docs/plugin-sdk-design.md` explains the Phase 2 plugin SDK
- `docs/ui-shell-design.md` explains the Phase 3 UI shell

What it should not be confused with:

- the implementation itself
- a promise that all future phases are already built

The docs describe both current reality and future direction, but they do not mean the future parts are implemented yet.

## 5. How Core, UI, and Plugins Relate to Each Other Today

Today, the relationship is split into two largely separate halves:

```text
Current implemented state:

core/                         ui/
Headless runtime              Browser UI shell
Event bus                     RuntimeSnapshotProvider
Plugin manager                Mock RuntimeSnapshot
Plugin registry               UI Plugin View Registry
Config / logging / DI         Telemetry Demo View

Important: these two sides are not connected yet.
```

The core side can boot, manage plugins, and emit events.

The UI side can render a shell, switch workspace sections, and mount a plugin view component from a UI registry.

What is not happening yet:

- the UI is not reading the real core event bus
- the UI is not talking to the real core plugin manager
- the UI is not receiving live runtime data
- the UI is not mounting runtime plugins directly

The shared idea between the two sides is `RuntimeSnapshot`, but that snapshot is currently a UI-facing mock model, not a live bridge to the core.

## 6. Current UI Startup and Rendering Flow

The UI boot sequence is simple and entirely browser-side.

```text
main.tsx
  -> AppProviders
  -> RuntimeSnapshotProvider
  -> BrowserRouter
  -> App
  -> ShellFrame
  -> TopBar / ActivityBar / Sidebar / Workspace / BottomEventPanel
  -> Workspace resolves active panel
  -> UI Plugin View Registry
  -> TelemetryDemoView
```

What each step does:

- `ui/src/main.tsx` creates the React root and wraps the app in providers
- `ui/src/providers/AppProviders.tsx` installs `RuntimeSnapshotProvider`
- `ui/src/runtime/runtime-snapshot-provider.tsx` owns mock snapshot state and a local adapter
- `ui/src/App.tsx` maps routes to the shell frame
- `ui/src/components/layout/ShellFrame.tsx` picks the active shell section and lays out the main regions
- `ui/src/components/layout/Workspace.tsx` chooses the active panel and resolves a UI plugin view
- `ui/src/plugins/plugin-view-registry.ts` looks up a React component by `pluginId`
- `ui/src/plugins/telemetry-demo/TelemetryDemoView.tsx` renders the current mock telemetry plugin view

The important learning point is that the UI renders from a snapshot. It does not ask the core runtime for state directly.

The current `RuntimeSnapshotProvider` is mock-only, deterministic, and local to the UI tree.

## 7. Current Runtime Startup Flow

The core runtime has its own boot flow inside `core/src/runtime/basic-runtime.ts`.

```text
BasicRuntime.start()
  -> load config
  -> create logger factory
  -> create runtime logger
  -> register services
  -> attach plugin context services
  -> loadAll() plugins
  -> startAll() plugins
  -> publish core.runtime.started
```

The stop flow is the reverse shape:

```text
BasicRuntime.stop()
  -> stopAll() plugins
  -> publish core.runtime.stopped
```

Important characteristics:

- startup is one-shot
- the runtime starts in-process
- plugin lifecycle is explicit
- failures are surfaced fast
- shutdown tries to stop plugins in reverse activation order

The runtime owns real plugin lifecycle management in `core/`.

The UI mock adapter does not participate in this flow.

## 8. Current Mock-Only Boundary

The most important present-day boundary in NEXUS is the mock boundary between the UI and the future runtime integration.

```text
Mock-only boundary today:

RuntimeSnapshotProvider
  -> mock RuntimeSnapshot
  -> local MockRuntimeAdapter
  -> React tree
```

What this means:

- the UI gets data from `RuntimeSnapshotProvider`
- the provider starts with `createMockRuntimeSnapshot()`
- the mock adapter mutates local React state
- the UI updates from that local state

What this does not mean:

- there is no live event bus connection
- there is no WebSocket bridge
- there is no IPC bridge
- there is no direct access to core runtime internals

This boundary is intentional. It gives the UI a stable shape now, while leaving the real runtime binding for later.

The mock runtime adapter only updates local mock UI state. It does not talk to the headless runtime.

## 9. Future Intended Architecture

The future design is adapter-based, capability-driven, and middleware-independent.

```text
Robot / Payload / Simulator
        ->
Adapter Layer
        ->
Normalized NEXUS Events
        ->
Event Bus
        ->
Runtime Services / Plugins
        ->
RuntimeSnapshot or future UI binding
        ->
Operator UI Shell
```

This is the intended direction, not the current implementation.

What the future architecture is trying to achieve:

- robot-agnostic operation
- middleware independence
- a normalized event model
- capability-driven UI behavior
- plugin-first feature growth

Why this matters:

- adapters should isolate ROS, MQTT, MAVLink, and similar systems from the core
- the core should receive normalized concepts, not protocol-specific detail
- the UI should consume a stable boundary object instead of private runtime internals

The repository says these integrations are not implemented yet, so I should not treat them as current functionality.

## 10. Important Distinctions

### 10.1 Core Plugin Registry vs UI Plugin View Registry

These are two different registries for two different layers.

Core Plugin Registry:

- lives in `core/src/plugins/registry/`
- stores plugin manifests and lifecycle state
- is part of runtime plugin management
- knows about registered, loaded, started, stopped, and failed plugins

UI Plugin View Registry:

- lives in `ui/src/plugins/`
- stores React component definitions keyed by `pluginId`
- is part of the browser shell
- mounts UI components, not runtime plugins

What not to confuse them with:

- the core registry does not render React
- the UI registry does not manage plugin lifecycle

### 10.2 Runtime Plugin vs UI Plugin View

A runtime plugin and a UI plugin view are related, but they are not the same thing.

Runtime plugin:

- runs inside the headless core
- participates in `onLoad`, `onStart`, and `onStop`
- can subscribe to and publish events on the core event bus

UI plugin view:

- is a React component
- is mounted by the shell
- reads from `RuntimeSnapshot`
- does not execute core plugin lifecycle hooks

Why this matters:

- one lives in the runtime layer
- the other lives in the interface layer
- the same conceptual feature may have both a runtime side and a UI side

### 10.3 RuntimeSnapshot vs Event Bus

This is one of the most important distinctions in the project.

`RuntimeSnapshot`:

- is a UI-facing boundary object
- is a shaped block of current state for the shell
- is currently mock data in the UI
- is designed for rendering and local state composition

Event Bus:

- is the core runtime communication mechanism
- carries events between plugins and runtime services
- is about live behavior and message flow

What not to confuse them with:

- `RuntimeSnapshot` is not the event bus
- the event bus is not a frozen UI state object
- the UI snapshot does not replace event-driven design

### 10.4 Mock Runtime Adapter vs Future Real Runtime Adapter

The current adapter is a mock runtime adapter inside the UI layer.

Mock runtime adapter:

- updates local React state
- appends mock events
- changes labels and status fields
- never leaves the browser shell

Future real runtime adapter:

- would bind the UI to live runtime data
- would translate live runtime state into `RuntimeSnapshot` or a successor model
- would probably sit across a real transport boundary

What not to confuse them with:

- mock adapter is not a transport layer
- future real adapter is not guaranteed to be the same implementation

### 10.5 Core Runtime vs Robot Middleware

The core runtime is not the same thing as ROS, MQTT, or MAVLink.

Core runtime:

- is NEXUS internal
- manages lifecycle, events, services, and plugins
- stays middleware-independent

Robot middleware:

- is external infrastructure
- speaks protocol-specific data
- belongs behind an adapter layer

Why this matters:

- it keeps NEXUS portable across robot types and protocols
- it prevents the core from being locked to one robotics stack

## 11. Glossary of Terms

### repository

**Simple definition:** A repository is a stored collection of project files, usually managed with Git.

**In NEXUS:** The NEXUS repository contains the core runtime, UI shell, examples, and documentation in one place.

**Example:** `core/`, `ui/`, and `docs/` all live in the same repository.

### package

**Simple definition:** A package is a unit of code that can be built, published, or imported.

**In NEXUS:** `@nexus/core`, `@nexus/ui`, and the example plugin package are all packages in the project structure.

**Example:** `ui/package.json` defines the UI package.

### module

**Simple definition:** A module is a file or set of files that exports code for reuse.

**In NEXUS:** The core runtime files, UI components, and plugin entrypoints are all modules.

**Example:** `core/src/runtime/basic-runtime.ts` exports the runtime class.

### framework

**Simple definition:** A framework is a structured foundation that provides rules, patterns, and reusable building blocks.

**In NEXUS:** NEXUS is being shaped as a framework-like platform for robotics operations, even though it is still early-stage.

**Example:** The plugin SDK acts like a framework boundary for plugin authors.

### platform

**Simple definition:** A platform is a shared foundation that multiple features or applications build on.

**In NEXUS:** The core runtime, plugin system, and shell together form the platform.

**Example:** The UI shell is a platform surface for plugin views.

### runtime

**Simple definition:** A runtime is the code that is actively executing the application's behavior.

**In NEXUS:** The core runtime is the live headless engine that boots, loads plugins, and publishes events.

**Example:** `BasicRuntime.start()` begins the runtime lifecycle.

### headless runtime

**Simple definition:** A headless runtime runs without a visible UI.

**In NEXUS:** The core runtime in `core/` is headless.

**Example:** It can load plugins and publish events even though no browser shell is connected.

### core runtime

**Simple definition:** The core runtime is the central runtime layer of the system.

**In NEXUS:** It manages events, config, logging, services, and plugin lifecycle.

**Example:** `core/src/runtime/basic-runtime.ts` is the main core runtime implementation.

### bootstrap

**Simple definition:** Bootstrap is the startup process that prepares the application to run.

**In NEXUS:** Bootstrap means loading config, creating services, starting plugins, and publishing the runtime started event.

**Example:** The boot flow in `BasicRuntime.start()` is the runtime bootstrap.

### lifecycle

**Simple definition:** Lifecycle is the sequence of states or hooks something goes through from start to finish.

**In NEXUS:** Plugins have `onLoad`, `onStart`, and `onStop` lifecycle hooks.

**Example:** The plugin manager calls lifecycle hooks in order.

### service

**Simple definition:** A service is a reusable piece of functionality shared by multiple parts of a system.

**In NEXUS:** Event bus, config, and logging are services exposed through the runtime container.

**Example:** The runtime registers `eventBus` as a service.

### service container

**Simple definition:** A service container stores and provides access to services by key.

**In NEXUS:** `BasicServiceContainer` stores runtime services.

**Example:** Plugins read services through the limited plugin service facade.

### dependency injection

**Simple definition:** Dependency injection means giving code the things it needs from the outside instead of creating them itself.

**In NEXUS:** Plugins receive `PluginContext` objects that already contain public runtime dependencies.

**Example:** The runtime injects the event bus into plugin context.

### event

**Simple definition:** An event is a message that says something happened.

**In NEXUS:** Events describe runtime state changes, telemetry, plugin activity, and other normalized signals.

**Example:** `core.runtime.started` is a runtime lifecycle event.

### event bus

**Simple definition:** An event bus is a system for publishing events and subscribing to them.

**In NEXUS:** `InMemoryEventBus` is the current in-process event bus.

**Example:** Plugins subscribe to `telemetry.raw.received`.

### publish

**Simple definition:** To publish an event means to send it onto the event bus.

**In NEXUS:** The core runtime publishes lifecycle events and plugins may publish domain events.

**Example:** A plugin can publish `telemetry.normalized.updated`.

### subscribe

**Simple definition:** To subscribe means to register interest in events of a certain type.

**In NEXUS:** Plugins subscribe to event types on the event bus.

**Example:** The telemetry demo plugin subscribes to raw telemetry events.

### handler

**Simple definition:** A handler is the function that runs when an event arrives.

**In NEXUS:** Event handlers process events in subscription order.

**Example:** A telemetry handler normalizes incoming payload data.

### payload

**Simple definition:** A payload is the data carried inside an event.

**In NEXUS:** Event payloads hold the event-specific information, such as runtime name or telemetry values.

**Example:** The `core.runtime.started` payload contains the runtime name.

### normalized event

**Simple definition:** A normalized event is an event translated into a shared internal shape.

**In NEXUS:** Future adapters should turn ROS, MQTT, or MAVLink data into normalized NEXUS events.

**Example:** A telemetry message from a robot becomes a standardized event inside NEXUS.

### plugin

**Simple definition:** A plugin is a feature module that extends the platform through defined contracts.

**In NEXUS:** Plugins run in the core runtime and can contribute logic, events, and future UI concepts.

**Example:** `example.telemetry.demo` is the example plugin.

### plugin-first architecture

**Simple definition:** A plugin-first architecture grows the product through plugins instead of hard-coding everything centrally.

**In NEXUS:** The project aims to deliver major operator-facing features through plugins.

**Example:** Future mission tools should be plugin-based when possible.

### plugin SDK

**Simple definition:** A plugin SDK is the public set of types and contracts used to build plugins.

**In NEXUS:** The Phase 2 plugin SDK defines manifests, context, lifecycle, and compatibility expectations.

**Example:** `core/src/plugins/types.ts` is part of the plugin SDK surface.

### plugin manifest

**Simple definition:** A plugin manifest is the metadata file or object that describes a plugin.

**In NEXUS:** The manifest includes the plugin id, name, version, entrypoint, and optional capability requirements.

**Example:** `examples/plugins/telemetry-demo/nexus.plugin.json` contains a manifest.

### plugin descriptor

**Simple definition:** A plugin descriptor is a discoverable record that points to a plugin and its manifest.

**In NEXUS:** Discovery returns descriptors before code is loaded.

**Example:** `LocalPluginDescriptorDiscovery` reads `nexus.plugin.json` files.

### plugin registry

**Simple definition:** A plugin registry stores information about known plugins.

**In NEXUS:** The core registry tracks validated plugin manifests and lifecycle state.

**Example:** `BasicPluginRegistry` prevents duplicate plugin IDs.

### plugin loader

**Simple definition:** A plugin loader imports the plugin module and turns it into a usable plugin object.

**In NEXUS:** `LocalPluginLoader` reads descriptors, resolves entrypoints, and loads modules.

**Example:** The loader can import a CommonJS plugin entrypoint.

### plugin manager

**Simple definition:** A plugin manager coordinates plugin lifecycle execution.

**In NEXUS:** `BasicPluginManager` registers plugins and calls `onLoad`, `onStart`, and `onStop`.

**Example:** The manager starts plugins in registration order.

### plugin lifecycle

**Simple definition:** Plugin lifecycle is the sequence of stages a plugin passes through.

**In NEXUS:** The lifecycle is discover, validate, load, register, start, and stop.

**Example:** A plugin is registered before it is started.

### discovery

**Simple definition:** Discovery is the process of finding plugins or descriptors.

**In NEXUS:** Discovery scans local `nexus.plugin.json` files.

**Example:** `LocalPluginDescriptorDiscovery.discover()` finds candidate plugins.

### validation

**Simple definition:** Validation checks that data has the right shape and values.

**In NEXUS:** Manifest validation trims fields, checks required strings, and rejects malformed plugin metadata.

**Example:** An empty plugin id fails validation.

### loading

**Simple definition:** Loading is the step where a plugin module is imported into memory.

**In NEXUS:** Loading happens after validation and before runtime lifecycle hooks.

**Example:** The loader imports `./src/index.cjs`.

### registration

**Simple definition:** Registration is the act of adding something to a known list or registry.

**In NEXUS:** Plugins are registered in the core registry before lifecycle startup.

**Example:** Duplicate plugin IDs are rejected at registration.

### activation

**Simple definition:** Activation is when a loaded component is made active and starts doing work.

**In NEXUS:** Plugin activation happens during `onStart`.

**Example:** A plugin begins listening to events after activation.

### adapter

**Simple definition:** An adapter translates between two different systems or data models.

**In NEXUS:** Adapters will translate ROS, MQTT, MAVLink, or simulator data into NEXUS concepts.

**Example:** A future ROS adapter will map topics into normalized telemetry events.

### adapter layer

**Simple definition:** An adapter layer is the boundary where external systems are translated into internal concepts.

**In NEXUS:** The adapter layer is planned, not implemented yet.

**Example:** A future adapter layer will sit between robots and the event bus.

### middleware

**Simple definition:** Middleware is software that sits between systems and helps them communicate.

**In NEXUS:** ROS, MQTT, and MAVLink are treated as middleware/protocol ecosystems that should stay outside the core.

**Example:** The project should not require the core runtime to know ROS details.

### ROS

**Simple definition:** ROS is the Robot Operating System ecosystem used in robotics software.

**In NEXUS:** ROS integration is planned for a future adapter, not implemented now.

**Example:** A ROS adapter would translate topics and services into NEXUS events and commands.

### MQTT

**Simple definition:** MQTT is a lightweight messaging protocol often used in connected systems.

**In NEXUS:** MQTT support is planned through an adapter layer.

**Example:** MQTT messages could become telemetry or alerts in NEXUS later.

### MAVLink

**Simple definition:** MAVLink is a protocol commonly used for communicating with autopilots and drones.

**In NEXUS:** MAVLink support is planned as a future adapter, not built yet.

**Example:** A MAVLink adapter could map vehicle state into normalized runtime events.

### capability

**Simple definition:** A capability is something a connected system can do or provide.

**In NEXUS:** Capabilities describe robot, payload, or system affordances so plugins can adapt to them.

**Example:** A system might expose telemetry, imaging, or command capabilities.

### capability-driven UI

**Simple definition:** A capability-driven UI changes based on what the connected system can actually do.

**In NEXUS:** The UI is intended to react to capabilities instead of assuming a single robot type.

**Example:** A plugin view may appear only when a capability exists.

### robot-agnostic

**Simple definition:** Robot-agnostic means not tied to one robot type.

**In NEXUS:** The platform should work across heterogeneous systems, not just one vehicle class.

**Example:** The same operator shell should make sense for UAVs, UGVs, and payload systems.

### UI shell

**Simple definition:** A UI shell is the outer frame of the user interface that hosts content and navigation.

**In NEXUS:** The browser app in `ui/` is the operator UI shell.

**Example:** `ShellFrame` composes the top bar, sidebar, workspace, and event panel.

### operator workspace

**Simple definition:** An operator workspace is the current working layout and context for a user.

**In NEXUS:** Workspaces represent different operator compositions such as telemetry review or mission prep.

**Example:** The mock snapshot includes an "Operator Default" workspace.

### panel

**Simple definition:** A panel is a UI region that shows a focused piece of information or controls.

**In NEXUS:** Panels live inside the shell workspace and are tied to plugin IDs.

**Example:** The telemetry demo panel is one workspace panel.

### dock

**Simple definition:** A dock is a fixed UI region for tabs, tools, or hosted content.

**In NEXUS:** The shell uses main, inspector, and event docks as workspace regions.

**Example:** `Workspace` renders a main dock and inspector dock.

### plugin view

**Simple definition:** A plugin view is a UI component that represents a plugin in the browser shell.

**In NEXUS:** Plugin views are React components mounted by the UI-side registry.

**Example:** `TelemetryDemoView` is the current plugin view.

### UI-side plugin view registry

**Simple definition:** The UI-side plugin view registry maps plugin IDs to React components.

**In NEXUS:** It is separate from the core plugin registry and exists only in the browser app.

**Example:** `ui/src/plugins/plugin-view-registry.ts` stores the telemetry demo view.

### RuntimeSnapshot

**Simple definition:** A RuntimeSnapshot is a structured snapshot of runtime-related UI state.

**In NEXUS:** It is the current UI/runtime boundary model and is mock-driven today.

**Example:** The snapshot contains runtime info, workspace data, panels, plugins, events, and connection state.

### boundary object

**Simple definition:** A boundary object is a data structure that crosses a boundary between layers or systems.

**In NEXUS:** `RuntimeSnapshot` is the boundary object between the mock runtime seam and the React tree.

**Example:** The UI should use the snapshot instead of private runtime internals.

### DTO

**Simple definition:** A DTO, or data transfer object, is a simple object used to move data between layers.

**In NEXUS:** `RuntimeSnapshot` behaves like a DTO for the UI boundary.

**Example:** The shell reads snapshot fields without caring how they were produced.

### mock

**Simple definition:** Mock data or mock behavior imitates real behavior without using the real system.

**In NEXUS:** The UI shell uses mock runtime state, mock events, and mock adapter updates.

**Example:** The current provider initializes from `createMockRuntimeSnapshot()`.

### mock provider

**Simple definition:** A mock provider supplies fake or simulated data to the application.

**In NEXUS:** `RuntimeSnapshotProvider` is the current mock provider for the UI tree.

**Example:** The provider updates snapshot state through a local adapter.

### mock runtime adapter

**Simple definition:** A mock runtime adapter changes local mock state as if it were a real integration.

**In NEXUS:** The adapter in `ui/src/runtime/mock-runtime-adapter.ts` appends events and updates statuses locally.

**Example:** It can change the mock connection label without touching the core runtime.

### provider pattern

**Simple definition:** The provider pattern supplies shared values to a tree of components.

**In NEXUS:** React providers pass runtime snapshot state to the shell.

**Example:** `RuntimeSnapshotContext.Provider` makes snapshot data available to children.

### React

**Simple definition:** React is a UI library for building component-based interfaces.

**In NEXUS:** The operator shell is a React application.

**Example:** `ShellFrame` and `Workspace` are React components.

### component

**Simple definition:** A component is a reusable UI piece.

**In NEXUS:** Buttons, panels, layout regions, and plugin views are all components.

**Example:** `TelemetryDemoView` is a component mounted inside the workspace.

### hook

**Simple definition:** A hook is a React function that lets components use state, context, or effects.

**In NEXUS:** The UI uses hooks for context, routing, shell store state, and side effects.

**Example:** `useRuntimeSnapshot()` reads the runtime snapshot from context.

### context

**Simple definition:** Context is a React mechanism for passing values without prop drilling.

**In NEXUS:** The runtime snapshot is made available through React context.

**Example:** `RuntimeSnapshotContext` stores the current snapshot and adapter.

### state

**Simple definition:** State is data that can change while the app is running.

**In NEXUS:** Shell section selection, active panel, and snapshot data are stateful.

**Example:** The active panel changes when the user clicks a tab.

### global state

**Simple definition:** Global state is shared application state used by multiple components.

**In NEXUS:** The shell uses a small global state store for active section, workspace, and panel selection.

**Example:** `useShellStore` stores the current active workspace ID.

### Zustand

**Simple definition:** Zustand is a lightweight React state library.

**In NEXUS:** The shell uses Zustand for local UI state.

**Example:** `ui/src/store/use-shell-store.ts` defines the store.

### routing

**Simple definition:** Routing maps URLs to UI screens or sections.

**In NEXUS:** The shell uses React Router to switch between shell sections.

**Example:** `/plugins` and `/workspaces` select different shell sections.

### Vite

**Simple definition:** Vite is a fast frontend build tool and development server.

**In NEXUS:** The UI package uses Vite for development and build scripts.

**Example:** `ui/package.json` defines `vite` as the dev server.

### npm

**Simple definition:** npm is a Node.js package manager and script runner.

**In NEXUS:** The UI package uses npm scripts for dev, build, and test tasks.

**Example:** `npm run dev` starts the UI.

### TypeScript

**Simple definition:** TypeScript is a typed superset of JavaScript.

**In NEXUS:** The core and UI are written in TypeScript, with some example JavaScript where that is intentional.

**Example:** `core/src/runtime/basic-runtime.ts` is TypeScript.

### interface

**Simple definition:** An interface describes the shape of an object.

**In NEXUS:** Interfaces define event buses, plugin managers, service containers, and React props shapes.

**Example:** `PluginManager` is an interface in the core plugin types.

### type alias

**Simple definition:** A type alias gives a name to a type expression.

**In NEXUS:** Many models such as events, plugin manifests, and snapshot types use type aliases.

**Example:** `type RuntimeState = "stopped" | "starting" | "running" | "stopping"`.

### generic type

**Simple definition:** A generic type works with different data types through a type parameter.

**In NEXUS:** Event and service APIs are generic over payload or stored type.

**Example:** `NexusEvent<TPayload>` lets the event bus carry typed payloads.

### props

**Simple definition:** Props are the inputs passed into a React component.

**In NEXUS:** Layout components such as `ShellFrame` and `Workspace` receive snapshot props.

**Example:** `Workspace` takes a `snapshot` prop.

### immutability

**Simple definition:** Immutability means data is not changed in place; new copies are created instead.

**In NEXUS:** The mock runtime adapter returns new snapshot objects instead of mutating the existing one.

**Example:** `updateConnectionSnapshot()` creates a new object with updated fields.

### deterministic behavior

**Simple definition:** Deterministic behavior means the same inputs produce the same outputs.

**In NEXUS:** The mock UI data and event ordering are intentionally deterministic.

**Example:** The mock snapshot uses fixed timestamps and known IDs.

### fail-fast behavior

**Simple definition:** Fail-fast behavior means errors are reported immediately instead of being hidden.

**In NEXUS:** The core runtime and plugin manager surface invalid states early.

**Example:** Invalid plugin manifests fail during validation.

### in-process

**Simple definition:** In-process means components run in the same program memory space.

**In NEXUS:** The core runtime and plugin manager currently run in-process.

**Example:** The event bus and plugin manager communicate directly in memory.

### distributed system

**Simple definition:** A distributed system is made of parts that run in separate processes or machines.

**In NEXUS:** The future adapter ecosystem may connect NEXUS to distributed robot systems.

**Example:** A robot control stack may live on a different machine than the UI shell.

### sandboxing

**Simple definition:** Sandboxing limits what code can access or do.

**In NEXUS:** Sandboxing is explicitly not implemented yet and remains a future concern.

**Example:** Plugin sandboxing is listed as a non-goal for the current phases.

### semver

**Simple definition:** Semver, or semantic versioning, is a versioning scheme that uses major, minor, and patch numbers.

**In NEXUS:** Plugin compatibility and package versions are expected to follow semver ideas, but enforcement is still evolving.

**Example:** `1.0.0` is a semver-style version string.

### compatibility

**Simple definition:** Compatibility is whether two versions or components can work together.

**In NEXUS:** Plugin manifests record compatibility assumptions about `nexusCore` and `pluginApi`.

**Example:** A plugin may declare the runtime version it expects.

## 12. Interview Explanation

If I had to explain NEXUS in a short interview-style summary, I would say:

NEXUS is a plugin-first robotics operations platform that is currently split into a headless core runtime and a separate browser-based operator shell. The core runtime handles events, plugins, config, logging, and service lookup. The UI shell is mock-only today and renders from a `RuntimeSnapshot` boundary object rather than from the live core runtime. The long-term plan is to connect robots and external systems through adapter layers that translate protocol-specific data into normalized NEXUS concepts.

The easiest way to remember the current state is:

- core exists
- plugin platform exists
- UI shell exists
- real adapter integrations do not exist yet
- the UI does not talk to the real runtime yet

## 13. Self-Check Questions

Use these questions to test whether I really understand the architecture:

- Why is the UI currently mock-only?
- Why should the UI not reach directly into private runtime internals?
- What is the difference between a runtime plugin and a UI plugin view?
- What is the difference between the Event Bus and `RuntimeSnapshot`?
- Why is the adapter layer not part of the core?
- Why is NEXUS described as robot-agnostic?
- What does plugin-first mean in this project?
- What will likely change when Phase 4 starts?
- Why does the core runtime use a service container?
- Why are plugin discovery, loading, registration, and lifecycle separate steps?
- Why does the UI use a local store in addition to the runtime snapshot?
- Why is the example telemetry plugin important even though it is small?

## 14. Future Study Path

The next useful things to study are:

1. `core/src/runtime/basic-runtime.ts` to understand the startup and shutdown flow.
2. `core/src/plugins/` to understand plugin discovery, validation, loading, registry state, and lifecycle execution.
3. `ui/src/runtime/runtime-snapshot-provider.tsx` to understand the mock-only UI boundary.
4. `ui/src/components/layout/Workspace.tsx` to understand how the shell mounts a plugin view.
5. `examples/plugins/telemetry-demo/src/index.cjs` to see a minimal plugin using the public event bus.
6. A later learning doc when adapter work resumes.

The main idea is to move from this overview into the implementation details in a controlled order:

- first the core runtime
- then the plugin platform
- then the UI shell
- then the adapter layer when it actually exists
