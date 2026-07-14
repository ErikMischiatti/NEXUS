# NEXUS RuntimeSnapshot Guide

## 1. Purpose of This Document

This document explains the NEXUS `RuntimeSnapshot` boundary in depth.

The goal is to understand:

- what `RuntimeSnapshot` is
- why the UI consumes a snapshot instead of talking to runtime internals
- why it is a boundary object and read model
- how `RuntimeSnapshotProvider` works
- how React Context exposes snapshot data
- how the mock runtime adapter updates local UI state
- how this differs from the core Event Bus and core runtime snapshot type
- how a future real runtime binding could replace the mock provider

This is a learning guide, not a statement that the UI is already connected to the live runtime.

## 2. What Is a Snapshot?

### 2.1 Simple Definition

A snapshot is a current picture of state at a point in time.

It is a structured summary of "what is true right now" from the point of view of the consumer.

### 2.2 Generic Example

In a dashboard app:

- the backend calculates a current system summary
- the frontend receives a snapshot with the current values
- components render cards, alerts, and charts from that snapshot

The UI does not need to ask every backend service directly for every small piece of data.

### 2.3 Snapshot in NEXUS

In NEXUS, the UI `RuntimeSnapshot` is the main data model consumed by the browser shell in Phase 3.

It is:

- a UI-facing read model
- a boundary object between runtime concepts and React components
- mock-only today
- deterministic for tests and development
- designed so the provider seam can later be replaced by a real runtime binding

It is not:

- the core Event Bus
- the core Plugin Manager
- the core Plugin Registry
- the UI Plugin View Registry
- Zustand state
- a live backend connection
- a real robotics adapter
- a command interface
- persisted workspace state

## 3. What Is RuntimeSnapshot?

`RuntimeSnapshot` is the UI data shape defined in `ui/src/types/runtime-snapshot.ts`.

It represents:

- runtime info
- workspace info
- plugin inventory
- panel inventory
- event summaries
- connection state

It is the UI's current read model for rendering the shell.

The core package also has a type named `RuntimeSnapshot`, but that type means something different. The core version represents internal runtime handles and state references, not the UI read model.

## 4. Why the UI Needs a RuntimeSnapshot Boundary

The shell needs a boundary because it should not reach into private runtime internals.

Why this helps:

- the UI stays decoupled from the core runtime implementation
- the shell can be developed before the live runtime binding exists
- the UI becomes easier to test with fixed mock data
- the data shape can later be replaced without rewriting the component tree

The snapshot acts like a stable contract between runtime ideas and React rendering.

## 5. RuntimeSnapshot as a Read Model

A read model is data that is shaped for reading and rendering.

It is not the same as raw live state or event flow.

In NEXUS:

- the snapshot is assembled for the UI
- components render from the snapshot
- the snapshot contains already-organized data for shell sections, panels, and event display

Why this helps:

- the UI can render quickly and predictably
- components do not need to query multiple runtime internals
- the shell can be built around one clear data structure

## 6. RuntimeSnapshot as a Boundary Object

A boundary object is a data structure that crosses a boundary between systems or layers.

In NEXUS, `RuntimeSnapshot` crosses the boundary between:

- runtime concepts
- React components

Why this is useful:

- the runtime can later produce or update the snapshot
- the UI can render without knowing how the snapshot was produced
- the boundary keeps core internals hidden

This is a common architecture technique when one layer should not depend on another layer's internal representation.

## 7. Current Mock-Only Architecture

The current UI runtime boundary is mock-only.

That means:

- the snapshot comes from local mock data
- the adapter only updates local React state
- there is no live connection to `@nexus/core`
- there is no WebSocket or IPC bridge yet
- there is no adapter-driven runtime data flowing into the shell yet

This is intentional.

The mock boundary gives the team a stable shell to work on before live integration exists.

## 8. Main Files and Folders

### 8.1 ui/src/types/runtime-snapshot.ts

This file defines the UI `RuntimeSnapshot` type and its subtypes.

### 8.2 ui/src/runtime/runtime-snapshot-context.ts

This file defines the React Context and custom hooks used to read the snapshot and adapter.

### 8.3 ui/src/runtime/runtime-snapshot-provider.tsx

This file owns the mock snapshot state and exposes it through context.

### 8.4 ui/src/runtime/mock-runtime-adapter.ts

This file contains immutable update helpers and the mock adapter API.

### 8.5 ui/src/data/mock-runtime-snapshot.ts

This file provides the initial mock snapshot data.

### 8.6 ui/src/App.tsx

This file routes the shell and passes the snapshot into `ShellFrame`.

### 8.7 ui/src/components/layout/

These components consume the snapshot and render shell regions.

### 8.8 ui/src/plugins/telemetry-demo/

This folder contains the UI Telemetry Demo view that reads the snapshot.

## 9. RuntimeSnapshot Type Model

### 9.1 RuntimeSnapshot

```ts
export interface RuntimeSnapshot {
  runtime: RuntimeInfoSnapshot;
  workspace: WorkspaceSnapshot;
  workspaces: WorkspaceSnapshot[];
  plugins: PluginSnapshot[];
  panels: PanelSnapshot[];
  events: EventSnapshot[];
  connection: ConnectionSnapshot;
}
```

This is the top-level UI snapshot object.

### 9.2 RuntimeInfoSnapshot

Represents runtime metadata:

- `id`
- `name`
- `mode`
- `state`
- `uptimeLabel`

### 9.3 WorkspaceSnapshot

Represents workspace metadata:

- `id`
- `name`
- `description`
- `sessionLabel`
- `sourceLabel`

### 9.4 PluginSnapshot

Represents plugin inventory items:

- `id`
- `name`
- `status`
- `description`
- optional `version`

### 9.5 PanelSnapshot

Represents shell panels:

- `id`
- `title`
- `pluginId`
- `workspaceId`
- `region`
- `status`
- `description`

### 9.6 EventSnapshot

Represents event stream items:

- `id`
- `time`
- `severity`
- `source`
- `type`
- `description`
- optional `payloadPreview`

### 9.7 ConnectionSnapshot

Represents connection status:

- `state`
- `label`
- `isMock`

## 10. RuntimeSnapshot Fields

### 10.1 runtime

The current runtime summary used by the top bar and plugin view.

### 10.2 workspace

The currently selected workspace.

### 10.3 workspaces

The list of available workspaces.

### 10.4 plugins

The list of plugin inventory items shown in the shell.

### 10.5 panels

The list of workspace panels shown in the dock. Each panel carries a `workspaceId` so the UI can resolve the active workspace-panel pair without guessing membership from panel order.

### 10.6 events

The current event stream used by the bottom panel and the telemetry demo view.

### 10.7 connection

The current connection summary shown in the top bar and sidebar.

## 11. RuntimeSnapshotProvider

### 11.1 What the Provider Does

`RuntimeSnapshotProvider` owns the snapshot state and exposes it through React Context.

### 11.2 Initial Snapshot

It accepts:

```ts
initialSnapshot?: RuntimeSnapshot
```

If no initial snapshot is supplied, it falls back to `createMockRuntimeSnapshot()`.

### 11.3 useState()

It uses `useState<RuntimeSnapshot>` to store the current snapshot in React state.

### 11.4 useMemo()

It uses `useMemo` to create a stable adapter object so the adapter reference does not change on every render.

### 11.5 Exposing snapshot and adapter

The provider exposes:

```ts
{ snapshot, adapter }
```

through context.

### 11.6 Why the Provider Wraps the App

The provider wraps the app so every shell component below it can read the same snapshot and adapter through hooks.

Diagram:

```text
RuntimeSnapshotProvider
        ↓
creates snapshot state
        ↓
creates mock adapter
        ↓
provides { snapshot, adapter }
        ↓
React components consume via custom hooks
```

Why this is a seam for future replacement:

- a future provider can supply live runtime data instead of local mock state
- the component tree can stay mostly the same

## 12. RuntimeSnapshotContext

### 12.1 React Context

React Context lets a value be shared across a component tree without passing props through every intermediate component.

### 12.2 RuntimeSnapshotContextValue

The context value contains:

- `snapshot`
- `adapter`

### 12.3 useRuntimeSnapshotContext()

This custom hook reads the context value and throws if the provider is missing.

### 12.4 useRuntimeSnapshot()

This hook returns only the current snapshot.

### 12.5 useRuntimeSnapshotAdapter()

This hook returns only the mock adapter.

### 12.6 Why the Hook Throws Without a Provider

Throwing early makes the dependency clear and avoids silent failures if a component is rendered outside the provider.

Custom hooks are useful because they:

- hide direct context access
- provide a stable API to components
- enforce provider presence
- improve testability

## 13. Mock Runtime Adapter

### 13.1 What the Adapter Is

The mock runtime adapter is a set of local update methods that mutate React state immutably.

### 13.2 appendEvent()

Adds a new event to the snapshot event list.

### 13.3 setConnection()

Updates the connection summary.

### 13.4 setRuntimeUptimeLabel()

Updates the runtime uptime label.

### 13.5 setPluginStatus()

Updates a plugin entry by id.

### 13.6 setPanelStatus()

Updates a panel entry by id.

### 13.7 Why This Is Not a Real Backend Adapter

This adapter does not talk to the core runtime, a robot, or a backend service.

It only updates local UI state.

## 14. Immutable Snapshot Updates

### 14.1 Why Immutability Matters in React

React works best when state changes create new objects instead of mutating old ones in place.

### 14.2 Object Spread

Object spread creates a new object with updated fields.

### 14.3 Array Mapping

Array mapping creates a new array while replacing only the matching item.

### 14.4 Appending Events

`appendMockEvent()` creates a new event id and appends a new event object.

### 14.5 Updating Nested Objects

The update helpers rebuild nested snapshot objects so React sees a new value.

### 14.6 Updating Items by ID

Plugin and panel updates locate the matching item by id and replace only that item.

Diagram:

```text
adapter.setPluginStatus(pluginId, status)
        ↓
setSnapshot(current => updatePluginStatus(current, pluginId, status))
        ↓
updatePluginStatus maps over current.plugins
        ↓
matching plugin receives new status
        ↓
React re-renders consumers
```

## 15. How UI Components Consume RuntimeSnapshot

### 15.1 App

`App` uses the snapshot indirectly through the `ShellRoute`.

### 15.2 ShellFrame

`ShellFrame` receives the snapshot as a prop and passes it to layout components.

### 15.3 TopBar

`TopBar` uses the snapshot to show runtime and workspace data.

### 15.4 Sidebar

`Sidebar` uses the snapshot to show plugins, workspaces, events, or connection details.

### 15.5 Workspace

`Workspace` uses the snapshot to render panels and mount plugin views.

### 15.6 BottomEventPanel

`BottomEventPanel` uses the snapshot's events list to show the mock event feed.

### 15.7 TelemetryDemoView

`TelemetryDemoView` uses the snapshot to show runtime status, counters, latest event, and a timeline.

## 16. RuntimeSnapshot vs Event Bus

Event Bus:

- event stream
- publish/subscribe
- runtime communication mechanism
- lives in core
- pushes events to handlers

RuntimeSnapshot:

- current UI read model
- consumed by React components
- lives in UI
- represents current state for rendering

The two are separate today.

A future runtime binding may derive snapshots from Event Bus events, but that is not implemented yet.

## 17. UI RuntimeSnapshot vs Core RuntimeSnapshot Type

The core package also has a type named `RuntimeSnapshot` in `core/src/runtime/types.ts`.

That type represents internal runtime handles, config, logger, services, and plugin manager references.

The UI snapshot type in `ui/src/types/runtime-snapshot.ts` represents browser-rendered read state.

These are different:

```text
core/src/runtime/types.ts RuntimeSnapshot
        ≠
ui/src/types/runtime-snapshot.ts RuntimeSnapshot
```

This naming can be confusing, so the easiest rule is:

- core version = internal runtime state/handles
- UI version = browser shell read model

## 18. RuntimeSnapshot vs Zustand State

RuntimeSnapshot:

- runtime/workspace/plugin/panel/event/connection data
- provided by `RuntimeSnapshotProvider`
- mock representation of platform state

Zustand state:

- activeSection
- activeWorkspaceId
- activePanelId
- local UI selection state

Why both exist:

- the snapshot holds data to render
- Zustand holds interaction state for shell selection

## 19. RuntimeSnapshot vs Plugin Registry

The UI snapshot may contain plugin inventory items, but it is not the same thing as the core plugin registry.

The core plugin registry tracks runtime plugin metadata and lifecycle state.

The UI snapshot tracks what the shell wants to display.

## 20. RuntimeSnapshot vs UI Plugin View Registry

The UI plugin view registry maps plugin ids to React components.

The snapshot may contain panels that refer to plugin ids.

The snapshot does not mount components by itself.

## 21. End-to-End Mock Data Flow

```text
createMockRuntimeSnapshot()
        ↓
RuntimeSnapshotProvider useState()
        ↓
RuntimeSnapshotContext.Provider
        ↓
useRuntimeSnapshot()
        ↓
App / ShellFrame / Workspace / TelemetryDemoView
        ↓
UI renders runtime, workspace, plugins, panels, events, connection
```

Update flow:

```text
useRuntimeSnapshotAdapter()
        ↓
adapter method called
        ↓
setSnapshot()
        ↓
immutable update function
        ↓
new RuntimeSnapshot
        ↓
React re-render
```

## 22. Future Real Runtime Binding

The current design prepares for later phases by keeping the provider seam replaceable.

Possible future shape:

```text
Current:
MockRuntimeSnapshotProvider
        ↓
mock local state

Future:
RealRuntimeSnapshotProvider
        ↓
WebSocket / IPC / HTTP / Tauri / Electron bridge
        ↓
core runtime / adapter layer
        ↓
normalized runtime state
```

Possible future snapshot sources:

- core runtime state
- Event Bus event stream
- adapter data
- plugin registry state
- workspace service
- connection service

This is conceptual and planned for later, not implemented now.

## 23. TypeScript and React Syntax Explained

### 23.1 Interface

An interface describes an object shape.

### 23.2 Union Types

String unions restrict values to a known set.

### 23.3 Optional Properties

Optional properties may be present or absent.

### 23.4 Indexed Access Types

Indexed access types can pull out the element type from an array property.

### 23.5 Pick<>

`Pick<>` selects a subset of properties from another type.

### 23.6 Partial<>

`Partial<>` makes the selected fields optional.

### 23.7 useState()

`useState()` stores the current snapshot in React state.

### 23.8 useMemo()

`useMemo()` memoizes the adapter object so its reference stays stable.

### 23.9 React Context

Context shares the snapshot and adapter through the tree.

### 23.10 Custom Hooks

Custom hooks wrap context access and provide a simpler API.

### 23.11 Object Spread

Object spread creates new snapshot objects with updated nested fields.

### 23.12 Array map()

`map()` creates updated arrays while preserving immutability.

### 23.13 Optional Initial Props

`initialSnapshot?: RuntimeSnapshot` means the provider can be seeded with custom starting data.

## 24. Design Patterns Used

### Read Model

Simple definition:

- data shaped for reading, not writing

Where it appears in NEXUS:

- UI `RuntimeSnapshot`

Why it helps:

- components render from one predictable object

Tradeoff:

- requires a separate update path

### Boundary Object

Simple definition:

- a structured object that crosses a layer boundary

Where it appears in NEXUS:

- `RuntimeSnapshot`

Why it helps:

- hides internal runtime details

Tradeoff:

- the boundary shape must be maintained carefully

### DTO

Simple definition:

- a data transfer object

Where it appears in NEXUS:

- snapshot objects and subtypes

Why it helps:

- simple data passing between layers

Tradeoff:

- DTOs can become large if too much is packed into them

### Provider Pattern

Simple definition:

- provide shared data through a wrapper component

Where it appears in NEXUS:

- `RuntimeSnapshotProvider`

Why it helps:

- avoids prop drilling

Tradeoff:

- introduces context-based indirection

### React Context

Simple definition:

- shared data available to nested components

Where it appears in NEXUS:

- `RuntimeSnapshotContext`

Why it helps:

- makes snapshot access easy

Tradeoff:

- can hide dependencies if overused

### Custom Hook

Simple definition:

- a reusable hook that wraps common logic

Where it appears in NEXUS:

- `useRuntimeSnapshot()`
- `useRuntimeSnapshotAdapter()`

Why it helps:

- gives a stable API and enforces provider usage

Tradeoff:

- adds another abstraction layer

### Adapter Seam

Simple definition:

- a place where one implementation can be swapped for another

Where it appears in NEXUS:

- the mock runtime provider and adapter

Why it helps:

- future real runtime binding can replace the mock path

Tradeoff:

- more architectural planning up front

### Mock Adapter

Simple definition:

- local update functions that imitate an integration

Where it appears in NEXUS:

- `mock-runtime-adapter.ts`

Why it helps:

- deterministic UI state updates

Tradeoff:

- not a real integration

### Immutable State Update

Simple definition:

- create new objects instead of mutating old ones

Where it appears in NEXUS:

- snapshot update helpers

Why it helps:

- React can detect state changes reliably

Tradeoff:

- slightly more object creation

### State Container

Simple definition:

- a place where current values are stored and updated

Where it appears in NEXUS:

- React state inside the provider

Why it helps:

- the shell has one source of truth for the snapshot

Tradeoff:

- state shape must stay coherent

### Snapshot-Based UI

Simple definition:

- components render from a structured snapshot instead of many ad hoc queries

Where it appears in NEXUS:

- the shell components

Why it helps:

- simpler rendering logic

Tradeoff:

- the snapshot must be kept up to date

### Separation of Runtime State and UI Selection State

Simple definition:

- operational data and local selection state are stored separately

Where it appears in NEXUS:

- `RuntimeSnapshot` vs Zustand store

Why it helps:

- the model stays easier to reason about

Tradeoff:

- two state systems to understand

### Facade-like Hook API

Simple definition:

- a small hook API that exposes only what most components need

Where it appears in NEXUS:

- `useRuntimeSnapshot()`
- `useRuntimeSnapshotAdapter()`

Why it helps:

- most components do not need the full context object

Tradeoff:

- more hooks to learn

## 25. Design Tradeoffs

### Snapshot read model vs direct Event Bus subscription in every component

Current choice:

- snapshot read model

Why:

- easier to render and test

Tradeoff:

- another data shaping layer exists

### Context provider vs passing snapshot props everywhere

Current choice:

- provider plus some props at layout boundaries

Why:

- avoids prop drilling

Tradeoff:

- context indirection

### Mock provider vs real runtime integration immediately

Current choice:

- mock provider

Why:

- lets the shell exist before live binding

Tradeoff:

- not connected to the runtime yet

### Immutable updates vs direct mutation

Current choice:

- immutable updates

Why:

- predictable React re-renders

Tradeoff:

- more copying

### Single large snapshot vs many smaller contexts/stores

Current choice:

- one snapshot plus a separate UI state store

Why:

- simpler early design

Tradeoff:

- snapshot can become broad

### Local mock adapter vs backend adapter

Current choice:

- local mock adapter

Why:

- deterministic development behavior

Tradeoff:

- no live data integration yet

### Deterministic mock data vs live asynchronous runtime data

Current choice:

- deterministic mock data

Why:

- predictable testing and layout work

Tradeoff:

- not real-time

### String union status fields vs arbitrary strings

Current choice:

- string union types

Why:

- prevents invalid values

Tradeoff:

- less flexible than free-form strings

### Simple read model vs fully normalized frontend store

Current choice:

- simple read model

Why:

- easier to understand during Phase 3

Tradeoff:

- some future normalization may be needed later

### Provider seam now vs later refactor

Current choice:

- seam now

Why:

- future real binding can replace the provider more easily

Tradeoff:

- more abstraction today

## 26. What Is Implemented Today

Today the RuntimeSnapshot layer includes:

- UI `RuntimeSnapshot` type
- sub-types for runtime, workspace, plugins, panels, events, connection
- mock snapshot data
- `RuntimeSnapshotContext`
- `RuntimeSnapshotProvider`
- custom hooks
- mock runtime adapter
- immutable update helpers
- UI components consuming the snapshot
- deterministic mock-only flow

## 27. What Is Not Implemented Yet

Today this layer does not include:

- real connection to `@nexus/core`
- WebSocket transport
- IPC bridge
- backend service
- adapter-driven data
- event-stream-to-snapshot reducer
- persistence
- workspace synchronization
- real connection status
- real plugin registry synchronization
- real runtime command API
- production error handling
- authentication or authorization

## 28. Common Confusions

1. UI `RuntimeSnapshot` is not the core Event Bus.
   - One is a read model.
   - The other is an event stream.

2. UI `RuntimeSnapshot` is not the core runtime internal snapshot type.
   - They are different types with different purposes.

3. `RuntimeSnapshotProvider` is not the core runtime.
   - It only manages UI snapshot state.

4. Mock runtime adapter is not a robotics adapter.
   - It only updates local UI state.

5. Mock runtime adapter is not ROS, MQTT, or MAVLink.
   - It is not a real protocol bridge.

6. React Context is not publish/subscribe event routing.
   - It is tree-scoped value sharing.

7. Zustand state is not the same as RuntimeSnapshot.
   - Zustand stores UI selection state.

8. `RuntimeSnapshot` is read data, not a command API.
   - It is for rendering.

9. Updating mock snapshot state does not command a robot.
   - It only changes browser state.

10. Plugin status in the UI snapshot is not necessarily the same as core plugin lifecycle state yet.
    - The UI is mock-only.

11. Panel status is UI composition state, not runtime plugin execution state.
    - It describes shell panels.

12. Events in the UI snapshot are mock event summaries, not necessarily live core Event Bus events.
    - They are shape-compatible mock data.

13. A future real provider can replace the mock provider without rewriting all shell components.
    - That is the point of the boundary.

14. The snapshot is useful even before real adapters exist.
    - It makes the UI structure possible now.

15. Mock-only does not mean architecturally useless.
    - It is a deliberate seam for future integration.

## 29. Generic Snapshot Boundary Example

Here is a generic dashboard example unrelated to robotics:

```text
Backend system state
        ↓
DashboardSnapshot
        ↓
React Provider
        ↓
Components render cards, alerts, charts
```

This shows why snapshot-based UIs are useful: the frontend renders a stable read model instead of reaching into many backend details.

## 30. NEXUS RuntimeSnapshot Walkthrough

This is the current NEXUS flow in plain English:

1. `createMockRuntimeSnapshot()` creates deterministic mock data.
2. `RuntimeSnapshotProvider` stores that snapshot in React state.
3. The provider exposes `snapshot` and `adapter` through context.
4. `useRuntimeSnapshot()` reads the snapshot in shell components.
5. `ShellFrame`, `TopBar`, `Sidebar`, `Workspace`, and `TelemetryDemoView` consume the data.
6. The mock adapter updates snapshot state immutably.
7. React re-renders the shell with the new snapshot.

## 31. Interview Explanation

If asked, “What is RuntimeSnapshot in NEXUS, and why was it introduced?”, a concise technical answer is:

RuntimeSnapshot is the UI read model introduced in Phase 3 to give the browser shell a stable boundary object between runtime concepts and React components. The provider currently supplies mock data through React Context, which makes the shell deterministic and testable before live runtime binding exists. Components read the snapshot through custom hooks instead of talking to core internals directly. The mock runtime adapter updates local UI state immutably, which makes the shell easy to reason about and re-render. This design keeps the UI decoupled from the core runtime, the Event Bus, and plugin lifecycle, while leaving a clean seam for a future real runtime provider or adapter-backed binding.

## 32. Self-Check Questions

- What problem does RuntimeSnapshot solve?
- Why does the UI consume a snapshot?
- What fields are inside RuntimeSnapshot?
- What is a read model?
- What is a boundary object?
- Why is the provider mock-only today?
- What does RuntimeSnapshotProvider provide?
- What does `useRuntimeSnapshot()` return?
- What does `useRuntimeSnapshotAdapter()` return?
- Why does the context default to null?
- Why does the hook throw if the provider is missing?
- What does the mock runtime adapter update?
- Why are snapshot updates immutable?
- How does `appendMockEvent` work?
- How does `updatePluginStatus` work?
- What is the difference between RuntimeSnapshot and Event Bus?
- What is the difference between UI RuntimeSnapshot and core RuntimeSnapshot?
- What is the difference between RuntimeSnapshot and Zustand state?
- Why is mock runtime adapter not a robotics adapter?
- How does Workspace use RuntimeSnapshot?
- How does TelemetryDemoView use RuntimeSnapshot?
- What future component could replace RuntimeSnapshotProvider?
- How could future adapters influence snapshots?
- What is not implemented yet?
- How would you explain RuntimeSnapshot in an interview?
- Why are snapshot status values string unions instead of arbitrary strings?
- Why is the adapter object memoized?
- Why does appendMockEvent generate a new event id?

## 33. Next Study Step

The next learning document should be:

```text
docs/learning/ui-state-and-plugin-views-guide.md
```

That document should deeply analyze:

- Zustand UI state
- active section/workspace/panel selection
- UI Plugin View Registry
- PluginViewDefinition
- Workspace panel mounting
- Telemetry Demo UI view
- UI plugin view vs runtime plugin distinction
