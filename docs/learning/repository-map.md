# NEXUS Repository Map and Package Boundaries

## 1. Purpose of This Document

This document is a structural map of the NEXUS repository.

Its job is to explain what each top-level folder and package owns, what it must not own, and how the pieces relate to each other today.

The main learning goal is separation of concerns:

- `docs/` stores architectural memory and learning material
- `core/` stores the headless runtime and plugin platform
- `ui/` stores the browser-based operator shell
- `examples/` stores sample runtime plugins and integration examples

This is not a feature guide. It is a repository map.

## 2. High-Level Repository Map

```text
NEXUS/
├─ docs/
│  └─ architecture and design documentation
├─ core/
│  └─ @nexus/core headless runtime package
├─ ui/
│  └─ @nexus/ui browser operator shell
└─ examples/
   └─ sample plugin packages
```

Current state summary:

- `core/` is implemented today as a headless TypeScript runtime package
- `ui/` is implemented today as a browser-first React shell package
- `examples/` contains a runtime plugin example plus a separate UI-side plugin view
- `docs/` contains both implemented-phase documentation and future-facing design material

## 3. Top-Level Folders

### 3.1 docs/

What it is:

- the documentation and learning layer of the repository

Why it exists:

- to preserve architectural intent
- to explain the phases in human language
- to help future readers understand the codebase without guessing

What it owns:

- roadmap and phase status
- conceptual architecture
- implementation-oriented design docs
- learning guides such as this one

What it must not own:

- runtime behavior
- build logic
- package runtime code
- tests
- implementation changes disguised as documentation

How it relates to the rest of the repo:

- `docs/` explains the shape of `core/`, `ui/`, and `examples/`
- it includes both current behavior and planned behavior
- it is not always an implementation reference

Important distinction:

- `docs/architecture.md` and `docs/system-design.md` describe the intended architecture, not only the fully implemented one
- `docs/core-design.md`, `docs/plugin-sdk-design.md`, and `docs/ui-shell-design.md` explain phases and contracts, but some of those contracts are still only partially implemented or are mock-only

### 3.2 core/

What it is:

- the `@nexus/core` package
- the headless TypeScript runtime and plugin platform

Why it exists:

- to provide the runtime foundation of NEXUS
- to keep core behavior independent from React and the browser shell
- to manage plugin lifecycle in a controlled in-process environment

What it owns:

- runtime bootstrap
- runtime lifecycle
- Event Bus
- configuration loading
- logging
- service container and dependency injection
- plugin contracts
- plugin registry
- plugin discovery
- plugin loader
- plugin manager
- runtime tests

What it must not own:

- UI rendering
- React components
- robot-specific logic
- ROS, MQTT, or MAVLink adapters
- mission semantics
- autopilot behavior
- safety-critical control

How it relates to the rest of the repo:

- `ui/` consumes a mock boundary today, not the live runtime
- `examples/` uses the public core plugin contracts
- `docs/` explains the boundaries and the intended future adapter layer

### 3.3 ui/

What it is:

- the `@nexus/ui` package
- the browser-first React Operator UI Shell

Why it exists:

- to give NEXUS an operator-facing workspace
- to render plugin-hosted UI in a browser
- to keep the shell separate from runtime lifecycle management

What it owns:

- React app startup
- routing
- shell layout
- top bar
- sidebar
- workspace region
- event panel
- UI state through Zustand
- `RuntimeSnapshot` provider
- mock runtime adapter
- UI-side plugin view registry
- Telemetry Demo UI view

What it must not own:

- core runtime lifecycle
- real plugin lifecycle execution
- adapter integrations
- robot middleware protocols
- backend transport
- real robot control

How it relates to the rest of the repo:

- `ui/` is currently mock-only
- it does not connect to the real core runtime yet
- it mounts UI views that mirror plugin concepts, but it does not run runtime plugins itself

### 3.4 examples/

What it is:

- a home for sample plugins and integration examples

Why it exists:

- to demonstrate how to use the public contracts
- to keep examples separate from core implementation
- to give readers a concrete reference for plugin structure

What it owns:

- example plugin packages
- example descriptors
- example entrypoints
- example documentation

What it must not own:

- core runtime internals
- UI shell architecture
- production-only behavior
- hidden shared logic that should actually live in `core/`

How it relates to the rest of the repo:

- `examples/` shows how plugin authors should think
- it uses the core plugin SDK boundary
- it is a reference area, not the platform itself

## 4. Top-Level Files

### 4.1 README.md

What it is:

- the first stop for a new reader

Why it exists:

- to summarize the current state in short form
- to show what is implemented now and what is not
- to point to the main docs

What it owns:

- high-level project description
- current status
- quick start pointers
- core design principles

What it must not own:

- detailed architecture
- phase-by-phase implementation specs
- API contracts

### 4.2 CHANGELOG.md

What it is:

- the record of major completed changes

Why it exists:

- to preserve what changed between phases
- to show which capabilities were added in each milestone

What it owns:

- phase completion notes
- major additions and changes

What it must not own:

- implementation detail
- future roadmap promises
- duplicated design docs

### 4.3 Other Root-Level Files

In the current checkout, the meaningful root-level project files are `README.md` and `CHANGELOG.md`.

The package-specific configuration files live inside `core/` and `ui/`, not at the repository root.

That structure is intentional:

- root files explain the project
- package folders own their own package configuration
- the repository root is not trying to behave like the only package boundary

## 5. Package Boundaries

### 5.1 What Is a Package?

A package is a unit of code that has its own purpose, dependencies, and build/test scripts.

In NEXUS, the important packages are:

- `@nexus/core`
- `@nexus/ui`
- example plugin packages under `examples/`

Why this matters:

- packages define ownership
- packages control dependencies
- packages keep runtime and UI concerns separate

### 5.2 @nexus/core

What it is:

- the headless TypeScript runtime package

Why it exists:

- to bootstrap the platform
- to manage plugins and events
- to stay UI-agnostic

What it owns:

- `core/src/runtime/`
- `core/src/bus/`
- `core/src/plugins/`
- `core/src/config/`
- `core/src/logging/`
- `core/src/di/`
- `core/src/index.ts` as the public re-export surface
- `core/test/` as runtime and plugin platform tests

What it must not own:

- React components
- browser routing
- shell layout
- UI plugin view mounting
- robot middleware code

How it relates to the rest of the repo:

- it is the runtime foundation that future UI bindings will eventually talk to
- it already supports plugin lifecycle in-process
- it is not the backend for the UI yet

Core package facts from the current checkout:

- package name: `@nexus/core`
- it uses TypeScript
- it has its own build and test scripts
- it is private to this repository

### 5.3 @nexus/ui

What it is:

- the browser operator shell package

Why it exists:

- to provide the shell that operators interact with
- to host plugin views in a React interface

What it owns:

- `ui/src/main.tsx`
- `ui/src/App.tsx`
- `ui/src/providers/`
- `ui/src/runtime/`
- `ui/src/types/runtime-snapshot.ts`
- `ui/src/components/layout/`
- `ui/src/store/`
- `ui/src/plugins/`
- `ui/src/data/`
- `ui/src/test/`

What it must not own:

- core runtime lifecycle
- runtime plugin loading
- real adapter integrations
- external protocol translation
- robot control

How it relates to the rest of the repo:

- it consumes mock runtime data today
- it mirrors the shape of runtime concepts without connecting to them yet
- it is designed to be replaceable at the boundary level later

Package facts from the current checkout:

- package name: `@nexus/ui`
- it uses React, React Router, Zustand, and Vite
- it is private to this repository

### 5.4 Example Plugin Packages

What they are:

- sample packages that demonstrate the plugin contract

Why they exist:

- to show real plugin structure
- to demonstrate descriptor, manifest, and entrypoint usage
- to illustrate middleware-independent behavior

What they own:

- plugin descriptors such as `nexus.plugin.json`
- plugin manifests
- plugin entrypoints
- example-specific README files

What they must not own:

- core runtime internals
- shared application logic that belongs in `core/`
- UI shell mounting code that belongs in `ui/`

How they relate to the rest of the repo:

- they are consumers of the core plugin SDK
- they are examples, not the system architecture itself
- they should remain small and focused

## 6. Responsibility Boundaries

### 6.1 What the Core Owns

The core owns the runtime engine of NEXUS.

It is responsible for:

- booting the runtime
- managing lifecycle
- routing events
- loading configuration
- providing logging
- registering and resolving services
- discovering, loading, registering, and starting plugins

Why it exists:

- to keep platform logic centralized in one headless runtime

What problem it solves:

- it prevents the UI from becoming the place where platform behavior lives
- it gives plugins a stable execution environment

### 6.2 What the UI Owns

The UI owns the operator-facing browser shell.

It is responsible for:

- shell startup
- page routing
- workspace composition
- panel mounting
- local shell state
- rendering runtime snapshots

Why it exists:

- to give operators a usable interface without depending on live runtime connectivity yet

What problem it solves:

- it separates interaction design from runtime internals

### 6.3 What the Plugin Platform Owns

The plugin platform owns plugin contracts and lifecycle management.

It is responsible for:

- manifest validation
- descriptor discovery
- plugin loading
- registry state
- lifecycle execution

Why it exists:

- to make the platform extensible without mixing plugin logic into the UI or configuration logic into the runtime core

What problem it solves:

- it gives NEXUS a plugin-first architecture

### 6.4 What Examples Own

Examples own demonstration code and reference behavior.

They are responsible for:

- showing how to structure a plugin
- showing how to use public contracts
- demonstrating event flow or data normalization

Why they exist:

- to make the architecture concrete

What problem they solve:

- they reduce ambiguity for future plugin authors

### 6.5 What Documentation Owns

Documentation owns explanation.

It is responsible for:

- architectural memory
- phase tracking
- terminology
- learning paths

Why it exists:

- to keep the architecture understandable over time

What problem it solves:

- it prevents later readers from having to infer intent from code alone

## 7. What Each Area Must Not Own

### 7.1 Core Non-Responsibilities

The core must not own:

- UI rendering
- React state
- browser routing
- middleware protocol details
- mission-specific workflows
- autopilot behavior
- safety-critical control

### 7.2 UI Non-Responsibilities

The UI must not own:

- real plugin lifecycle execution
- core event bus internals
- adapter translation
- robot middleware behavior
- backend transport details

### 7.3 Plugin Non-Responsibilities

The plugin platform must not own:

- shell layout
- browser-specific rendering
- protocol adapters
- robot control
- marketplace logic
- distribution infrastructure

### 7.4 Documentation Non-Responsibilities

Documentation must not own:

- runtime code
- hidden implementation behavior
- architecture claims that are not supported by the repository

## 8. Current Implemented Relationships

```text
Current state:

core/                         ui/
@nexus/core                   @nexus/ui
Headless runtime              Browser React shell
Event Bus                     RuntimeSnapshotProvider
Plugin Manager                Mock RuntimeSnapshot
Plugin Registry               Mock Runtime Adapter
Config / Logging / DI         UI Plugin View Registry

Important:
The UI does not connect to the real core runtime yet.
```

Current practical relationship:

- the core can run without the UI
- the UI can render without the core
- the example plugin can demonstrate the public plugin contract
- the docs explain how the pieces are meant to relate

## 9. Current Non-Relationships

These relationships do not exist yet:

- the browser UI does not talk to the real runtime
- the mock runtime adapter does not bridge to the core event bus
- the core plugin registry is not the same thing as the UI plugin view registry
- the runtime plugin example is not the same thing as the UI Telemetry Demo view
- the adapter layer is not implemented

That is not a missing accident. It is the current architecture.

## 10. Import and Export Boundaries

### 10.1 core/src/index.ts as the Public Core Surface

`core/src/index.ts` is the public export surface for the core package.

Why it matters:

- it gives consumers one stable entrypoint
- it keeps package internals out of the public API

What it exports today:

- the event bus
- plugin APIs and utilities
- config APIs
- logging APIs
- DI helpers
- runtime creation helpers and runtime types

What it should not do:

- become a dumping ground for unrelated code
- expose private implementation details just because they exist

### 10.2 ui/src/main.tsx as the UI Entrypoint

`ui/src/main.tsx` is the browser entrypoint.

Why it matters:

- it starts the React tree
- it attaches the shell to the DOM

What it does today:

- loads global styles
- creates the root
- wraps the app in providers
- mounts the router and the app component

What it should not do:

- contain shell logic
- contain runtime business logic
- bypass providers and route composition

### 10.3 ui/src/App.tsx as the Routing Root

`ui/src/App.tsx` is the routing root.

Why it matters:

- it decides which shell section to show
- it keeps section selection out of the low-level entrypoint

What it does today:

- redirects `/` to `/plugins`
- maps route params to shell sections
- renders `ShellFrame`

What it should not do:

- own shell layout details
- own runtime data acquisition

### 10.4 ui/src/providers/ as Application Providers

`ui/src/providers/` contains React providers for app-wide concerns.

Why it matters:

- providers make shared state available without prop drilling

What it does today:

- installs `RuntimeSnapshotProvider`

What it should not do:

- execute core runtime lifecycle
- act as a hidden backend

### 10.5 examples/plugins/telemetry-demo as a Runtime Plugin Example

This example package is a runtime plugin example, not a UI component library.

Why it matters:

- it shows how plugin discovery and lifecycle are supposed to work

What it does today:

- declares `nexus.plugin.json`
- exports a plugin object from `src/index.cjs`
- subscribes to `telemetry.raw.received`
- publishes `telemetry.normalized.updated`

What it should not do:

- become a place for shared core logic
- become the UI plugin registry

## 11. Current Data and Control Flow by Package

`core/`:

1. configuration is loaded
2. services are registered
3. plugins are discovered or registered
4. plugins are loaded
5. plugin lifecycle hooks run
6. events are published and subscribed to in-process

`ui/`:

1. React starts in `main.tsx`
2. app providers install `RuntimeSnapshotProvider`
3. routing selects a shell section
4. shell layout renders
5. Zustand stores local section and panel state
6. the UI-side plugin view registry mounts a React component

`examples/`:

1. a plugin descriptor points to an entrypoint
2. the loader imports the plugin module
3. the plugin uses the public event bus
4. the plugin normalizes and republishes events

`docs/`:

1. explain the current state
2. explain the intended state
3. explain the gap between them

## 12. Why This Repository Split Matters

This split matters because it keeps the architecture understandable and extensible.

The benefits are:

- the runtime can evolve without rewriting the shell
- the shell can evolve without owning plugin lifecycle
- the plugin SDK can stay small and explicit
- example plugins can teach the public contract
- future adapters can be added without turning the core into a middleware-specific implementation

In practice, the split lets NEXUS stay:

- plugin-first
- robot-agnostic
- middleware-independent
- capability-driven

## 13. Common Confusions

1. `core/` is not the backend for the UI yet.
   - The UI currently consumes mock snapshot state.
   - The real runtime is not connected to the browser shell yet.

2. `ui/` does not currently connect to the real core runtime.
   - `RuntimeSnapshotProvider` is mock-only today.
   - The adapter there only updates local React state.

3. `RuntimeSnapshot` is not the same thing as the core Event Bus.
   - `RuntimeSnapshot` is a UI-facing boundary object.
   - The Event Bus is a live message system inside the core.

4. Core Plugin Registry is not the same thing as UI Plugin View Registry.
   - The core registry tracks plugin lifecycle and manifest state.
   - The UI registry maps plugin IDs to React components.

5. Runtime plugin is not the same thing as React plugin view.
   - A runtime plugin runs in the headless core.
   - A React plugin view renders in the browser shell.

6. The Telemetry Demo runtime plugin and Telemetry Demo UI view share the same conceptual plugin ID, but they live in different architectural worlds.
   - The runtime plugin consumes and publishes events.
   - The UI view reads snapshot state and renders a panel.

7. Adapter Layer is planned, not implemented.
   - ROS, MQTT, and MAVLink integrations are future work.
   - The current repository only defines the architectural boundary.

8. NEXUS is not a flight controller, autopilot, robotics middleware, or safety-certified control system.
   - The project is an operations and integration layer around those systems.

9. `docs/` can contain future-facing design, not only implemented behavior.
   - Some docs are conceptual and some are phase-completion records.
   - Not every doc describes current code.

10. `examples/` demonstrates usage patterns, but should not become core logic.
    - It is a teaching and validation area.
    - It should stay smaller than the platform itself.

## 14. Interview Explanation

If asked, “How is the NEXUS repository organized, and why is it split this way?”, a good technical answer is:

NEXUS is split by responsibility. `core/` contains the headless runtime and plugin platform, `ui/` contains the browser-based operator shell, `examples/` contains sample plugin packages, and `docs/` contains the architectural memory of the project. This split keeps the runtime independent from React, keeps the UI from owning plugin lifecycle, and lets the project stay plugin-first, robot-agnostic, and middleware-independent. Today the UI is still mock-only and uses `RuntimeSnapshot` as its boundary, while the future adapter layer is planned to connect external robotics systems into the core event bus. That structure makes the repository extensible because each major concern can evolve without forcing the other concerns to change at the same time.

## 15. Self-Check Questions

- What does `core/` own?
- What does `ui/` own?
- Why is `examples/` separate from `core/`?
- Why is `docs/architecture.md` not always an implementation reference?
- Why should the core not render UI?
- Why should the UI not own plugin lifecycle execution?
- What is the difference between a package and a folder?
- What is the role of `core/src/index.ts`?
- What is the role of `ui/src/main.tsx`?
- Why is the current UI mock-only?
- What is the difference between a runtime plugin and a UI plugin view?
- What is the difference between Event Bus and `RuntimeSnapshot`?
- Why are adapters planned outside the core?
- What would likely change in Phase 4?
- How would you explain the current repository split in a technical interview?
- What does the example telemetry plugin prove about the plugin platform?
- Why should documentation stay aligned with the current implementation state?
- What would be a bad reason to move logic from `core/` into `ui/`?

## 16. Next Study Step

The next useful study step is to read the repository in this order:

1. `core/src/index.ts`
2. `core/src/runtime/basic-runtime.ts`
3. `core/src/plugins/`
4. `ui/src/main.tsx`
5. `ui/src/App.tsx`
6. `ui/src/runtime/runtime-snapshot-provider.tsx`
7. `ui/src/components/layout/Workspace.tsx`
8. `examples/plugins/telemetry-demo/src/index.cjs`

That sequence moves from package boundaries to runtime behavior to UI composition, which matches how NEXUS is split today.
