# NEXUS UI Shell Guide

## 1. Purpose of This Document

This document explains the NEXUS Operator UI Shell in depth.

The goal is to understand:

- what the browser-side shell is
- how the React app starts
- how routing, providers, and layout composition work
- how the UI consumes `RuntimeSnapshot`
- how Zustand stores shell interaction state
- how the UI plugin view registry mounts React plugin views
- why the UI is mock-only today
- how to explain the shell clearly in an interview

This is a learning guide, not a claim that the shell is fully connected to the core runtime.

## 2. What Is a UI Shell?

### 2.1 Simple Definition

A UI shell is the outer frame of an application.

It handles the main structure, navigation, and composition of screens or panels, while the actual content is plugged into that frame.

### 2.2 Generic Example

In a desktop app, the shell might provide:

- a top bar
- a sidebar
- a main workspace
- status areas
- navigation between sections

The shell is not the feature itself. It is the structure that hosts features.

### 2.3 UI Shell in NEXUS

In NEXUS, the Operator UI Shell is the browser-based React application in `ui/`.

It provides:

- app startup
- browser routing
- shell layout
- workspace display
- sidebar navigation
- event stream display
- `RuntimeSnapshot` consumption
- local UI state
- UI plugin view registration
- React plugin view mounting

It is mock-only today and does not connect to the real core runtime yet.

## 3. Why NEXUS Needs an Operator UI Shell

NEXUS needs a UI shell because the platform is meant to be used by operators, not only by code.

The shell solves several problems:

- it gives the project a browser-first operator interface
- it creates a place to host plugin-provided views
- it lets the team design the operator experience before live runtime binding exists
- it keeps layout and interaction state separate from plugin lifecycle
- it provides a stable browser UI boundary that can later bind to the real runtime

Without a shell, NEXUS would have only the core runtime and plugin platform, but no operator frame for using them.

## 4. Phase 3 Scope

Phase 3 introduced the first browser-based operator shell.

Current included scope:

- compact top-level shell layout
- operator workspace concept
- plugin panel hosting regions
- event stream visibility
- mock data and static state for early development
- responsive browser UI behavior
- accessibility baseline
- testing strategy for shell composition and interaction

This is currently implemented in mock-only form.

## 5. Phase 3 Non-Goals

Phase 3 does not include:

- ROS, MQTT, or MAVLink adapters
- real robot control
- live mission execution logic
- map, video, or mission planner real integrations
- authentication or authorization flows
- Electron or Tauri packaging
- production deployment claims
- sandboxing or security hardening beyond normal browser practice

The shell is about composition and operator workflow, not full robotic integration.

## 6. Main UI Files and Folders

### 6.1 ui/package.json

This file defines the `@nexus/ui` package.

It shows the UI uses:

- React
- React DOM
- React Router
- Zustand
- Vite
- Testing Library
- Vitest

Why it exists:

- to make the shell its own package boundary

### 6.2 ui/src/main.tsx

This is the browser entrypoint.

It creates the React root and mounts the app.

### 6.3 ui/src/App.tsx

This is the routing root.

It decides which shell section to show.

### 6.4 ui/src/providers/

This folder holds application providers.

Today it installs the `RuntimeSnapshotProvider`.

### 6.5 ui/src/runtime/

This folder contains the runtime snapshot context, provider, and mock runtime adapter.

### 6.6 ui/src/types/

This folder contains the UI `RuntimeSnapshot` data model.

### 6.7 ui/src/components/layout/

This folder contains the shell layout components:

- `ShellFrame`
- `TopBar`
- `ActivityBar`
- `Sidebar`
- `Workspace`
- `BottomEventPanel`

### 6.8 ui/src/components/ui/

This folder contains smaller reusable UI components such as `Badge` and `Card`.

### 6.9 ui/src/store/

This folder contains the Zustand store for local shell state.

### 6.10 ui/src/plugins/

This folder contains the UI-side plugin view registry and the Telemetry Demo UI view.

### 6.11 ui/src/styles/

This folder contains global styles and tokens for the shell.

## 7. UI Package and Tooling

### 7.1 npm

The UI package uses npm scripts for development, build, and test workflows.

### 7.2 Vite

Vite is the frontend build tool and dev server.

Why it helps:

- fast local development
- modern browser build pipeline

### 7.3 React

React is the UI library used to build the shell as a component tree.

### 7.4 TypeScript

TypeScript is used for typed props, typed snapshots, and typed local state.

### 7.5 Vitest and Testing Library

These tools are used for UI tests and component behavior checks.

### 7.6 Package Scripts

The package scripts in `ui/package.json` are:

- `dev`
- `build`
- `preview`
- `test`
- `test:watch`

## 8. UI Startup Flow

### 8.1 Browser Loads the App

The browser loads `index.html`, which contains the root element used by React.

### 8.2 main.tsx

`ui/src/main.tsx` imports styles, bootstraps built-in plugin views, finds the root element, creates the React root, and renders the application.

### 8.3 createRoot()

`createRoot()` is the modern React DOM API for starting a React app.

### 8.4 StrictMode

`StrictMode` is a React development helper that helps catch unsafe patterns and side effects.

### 8.5 AppProviders

`AppProviders` wraps the app in app-level providers, currently the `RuntimeSnapshotProvider`.

### 8.6 BrowserRouter

`BrowserRouter` enables client-side routing based on the browser URL.

### 8.7 App

`App` defines the route map and renders the shell route.

Startup flow:

```text
main.tsx
   ↓
find #root in index.html
   ↓
createRoot(root)
   ↓
StrictMode
   ↓
AppProviders
   ↓
BrowserRouter
   ↓
App
```

Why the root check throws:

- the app should fail immediately if the HTML entrypoint is broken
- a missing root means React has nowhere to mount

Why global CSS is imported in `main.tsx`:

- the shell needs styles before layout renders
- `main.tsx` is the top-level browser entrypoint

## 9. Routing

### 9.1 React Router

The shell uses React Router for browser URL-based navigation.

### 9.2 Routes

`Routes` groups the route definitions.

### 9.3 Navigate

`Navigate` redirects one URL to another.

### 9.4 Dynamic Section Route

The route `/:section` allows a shell section name to appear in the URL.

### 9.5 ShellRoute

`ShellRoute` reads `RuntimeSnapshot` and passes it into `ShellFrame`.

### 9.6 Invalid Route Handling

The shell redirects invalid or unknown URLs back to `/plugins`.

Routing flow:

```text
Browser URL
   ↓
React Router
   ↓
/
   → redirects to /plugins

/:section
   → renders ShellRoute
   → reads RuntimeSnapshot
   → renders ShellFrame

*
   → redirects to /plugins
```

Why the app redirects to `/plugins`:

- it gives the shell a stable default section
- it avoids empty or invalid states on first load

Why `ShellRoute` reads `RuntimeSnapshot`:

- `ShellFrame` should receive data through props
- route handling and rendering stay separate

## 10. Application Providers

### 10.1 What a Provider Is

A provider is a React component that makes shared values available to its children.

### 10.2 AppProviders

`AppProviders` currently wraps the app with `RuntimeSnapshotProvider`.

### 10.3 RuntimeSnapshotProvider

`RuntimeSnapshotProvider` owns the snapshot state and the local mock runtime adapter.

### 10.4 Why Providers Wrap the App

Providers wrap the app so that any component below them can read shared data through hooks or context.

This avoids prop drilling and gives the shell a single shared runtime snapshot source.

React Context is not the same thing as the core Event Bus.

## 11. RuntimeSnapshot Boundary in the UI

### 11.1 Why the UI Consumes a Snapshot

The UI consumes a snapshot because the shell needs a stable read model for rendering.

It is easier to render layout from a structured snapshot than from live runtime internals.

### 11.2 useRuntimeSnapshot()

`useRuntimeSnapshot()` reads the current snapshot from context.

### 11.3 Snapshot as Read Model

The snapshot is a read model:

- it is shaped for rendering
- it contains already-assembled UI data
- it is not the event bus

### 11.4 Why This Is Mock-Only Today

The provider currently creates mock state and updates it with a local adapter.

That means:

- no live runtime binding exists yet
- no WebSocket or IPC bridge exists yet
- no real robot data is flowing into the shell yet

The shell is intentionally mock-only today so the UI structure can be built and tested before live integration exists.

## 12. ShellFrame

### 12.1 What ShellFrame Is

`ShellFrame` is the main shell composition component.

It receives a `RuntimeSnapshot` prop and renders the page regions.

### 12.2 Section Validation

`ShellFrame` validates route sections with `isShellSection`.

### 12.3 useParams()

`useParams()` reads the current route parameter from React Router.

### 12.4 useEffect()

`useEffect()` synchronizes the current URL section into Zustand state.
The same shell frame also resolves the canonical workspace and panel selection from the `RuntimeSnapshot` and the stored UI ids.

### 12.5 Synchronizing URL Section with Zustand

The shell keeps the route section and the local active section in sync, then realigns the workspace and panel selection after render when the snapshot invalidates the stored ids.

### 12.6 Layout Composition

`ShellFrame` composes:

- `TopBar`
- `ActivityBar`
- `Sidebar`
- `Workspace`
- `BottomEventPanel`

Diagram:

```text
ShellFrame
   ↓
read URL section
   ↓
validate section
   ↓
update Zustand activeSection
   ↓
render shell layout:
   TopBar
   ActivityBar
   Sidebar
   Workspace
   BottomEventPanel
```

Why invalid sections redirect:

- the shell should not render with unknown section state
- the URL should stay canonical

## 13. Shell Layout Components

### 13.1 TopBar

`TopBar` shows:

- runtime name
- active workspace name
- workspace selector
- runtime status
- connection label

It uses Zustand to read and update the active workspace.

### 13.2 ActivityBar

`ActivityBar` is the primary navigation rail.

It links to shell sections like:

- plugins
- workspaces
- events
- settings

### 13.3 Sidebar

`Sidebar` shows context specific inventory or status depending on the active section.

### 13.4 Workspace

`Workspace` is the main dock surface.

It resolves the active panel and mounts a plugin view when one exists.

### 13.5 BottomEventPanel

`BottomEventPanel` shows the mock event stream for runtime and plugin lifecycle signals.

## 14. Zustand UI State

### 14.1 What Zustand Is

Zustand is a lightweight global UI state library.

### 14.2 useShellStore

`useShellStore` stores shell interaction state.

### 14.3 activeSection

`activeSection` tracks the current shell section.

### 14.4 activeWorkspaceId

`activeWorkspaceId` tracks the selected workspace.

### 14.5 activePanelId

`activePanelId` tracks the selected panel in the workspace.

### 14.6 Setter Functions

Setter functions update the current shell state:

- `setActiveSection()`
- `setSelection({ workspaceId, panelId })`

### 14.7 Why Zustand Is Used for Local UI State

This state belongs in Zustand because it is UI interaction state, not runtime state.

It controls selection and navigation inside the shell, and it is shared across multiple components.

Zustand is not the core service container and not the Event Bus.

## 15. Workspace Composition

### 15.1 What the Workspace Does

`Workspace` renders the main panel system of the shell.

### 15.2 Active Workspace Resolution

It reads `activeWorkspaceId` from Zustand and looks up the workspace in `RuntimeSnapshot`.

### 15.3 Active Panel Resolution

It reads `activePanelId` from Zustand and finds the matching panel.

### 15.4 Panel Tabs

It renders tab buttons for each panel in `snapshot.panels`.

### 15.5 Main Dock

The main dock mounts the active plugin view when one is registered.

### 15.6 Inspector Dock

The inspector dock shows details about the selected panel.

### 15.7 Placeholder Rendering

If no plugin view is found, the workspace renders a placeholder instead.

### 15.8 Accessibility Attributes

The workspace uses semantic sections, tab roles, and ARIA labels to keep the shell more usable.

Workspace flow:

```text
Workspace
   ↓
read activePanelId from Zustand
   ↓
read panels from RuntimeSnapshot
   ↓
find active panel
   ↓
read panel.pluginId
   ↓
pluginViewRegistry.get(pluginId)
   ↓
if found: render React component
   ↓
if not found: render placeholder
```

## 16. UI Plugin View Registry

### 16.1 What a UI Plugin View Is

A UI plugin view is a React component associated with a plugin id for shell mounting.

### 16.2 PluginViewDefinition

`PluginViewDefinition` includes:

- `id`
- `title`
- `pluginId`
- `component`

### 16.3 PluginViewRegistry

The registry maps plugin ids to view definitions.

### 16.4 register()

`register()` stores a view definition in the registry.

### 16.5 get()

`get()` resolves a plugin id to a view definition.

### 16.6 list()

`list()` returns all registered views.

### 16.7 Telemetry Demo View Registration

`ui/src/plugins/telemetry-demo/index.ts` exports the telemetry demo registration helper used by the explicit bootstrap path.

### 16.8 Resolving a Plugin View from a Panel

`Workspace` reads `panel.pluginId`, looks it up in `pluginViewRegistry`, and mounts the React component if it exists.

This is not the same as the core Plugin Registry.

## 17. Telemetry Demo UI View

### 17.1 Location

The UI view lives in:

- `ui/src/plugins/telemetry-demo/TelemetryDemoView.tsx`

### 17.2 Plugin ID

The UI view is registered under `example.telemetry.demo`.

### 17.3 Reading RuntimeSnapshot

The view reads the snapshot through `useRuntimeSnapshot()`.

### 17.4 Runtime Status Summary

It displays runtime name, mode, state, and uptime label.

### 17.5 Mock Counters

It shows counts for:

- total events
- telemetry events
- panels

### 17.6 Latest Event

It shows the latest event from the snapshot stream.

### 17.7 Timeline

It shows the three most recent events in a compact timeline.

### 17.8 Difference from Runtime Telemetry Demo Plugin

This is a mock operational panel mounted by the UI registry.

It is not the runtime plugin loaded by the core plugin loader.

## 18. UI Rendering Flow End-to-End

```text
Browser loads app
   ↓
main.tsx
   ↓
AppProviders
   ↓
RuntimeSnapshotProvider
   ↓
BrowserRouter
   ↓
App
   ↓
ShellRoute
   ↓
useRuntimeSnapshot()
   ↓
ShellFrame(snapshot)
   ↓
TopBar / ActivityBar / Sidebar / Workspace / BottomEventPanel
   ↓
Workspace reads Zustand activePanelId
   ↓
Workspace reads snapshot.panels
   ↓
Workspace resolves plugin view
   ↓
TelemetryDemoView reads RuntimeSnapshot
   ↓
UI renders mock runtime data
```

## 19. UI State vs Runtime State

UI state:

- active section
- active workspace
- active panel
- local shell selections

Runtime state:

- runtime lifecycle
- plugin lifecycle
- event bus communication
- config and logging

These are different layers.

## 20. UI Plugin View vs Runtime Plugin

UI plugin view:

- React component
- mounted by the UI registry
- reads `RuntimeSnapshot`
- lives in the browser shell

Runtime plugin:

- managed by the core plugin manager
- uses `PluginContext`
- participates in `onLoad`, `onStart`, and `onStop`

They may share a conceptual plugin id, but they are not the same mechanism.

## 21. React and TypeScript Syntax Explained

### 21.1 JSX

JSX is the syntax that lets React components read like markup.

### 21.2 Functional Components

The UI mostly uses functional components such as `App`, `ShellFrame`, `Workspace`, and `TelemetryDemoView`.

### 21.3 Props

Props are the inputs a component receives.

### 21.4 Type Annotations

Type annotations describe the shape of props and snapshots.

### 21.5 Type Imports

`import type` is used to import TypeScript types without adding runtime code dependencies.

### 21.6 Destructuring Props

Components often destructure props in the function parameter list.

### 21.7 Hooks

Hooks such as `useEffect`, `useParams`, `useState`, and `useContext` provide React behavior.

### 21.8 useEffect()

`useEffect()` is used in `ShellFrame` to synchronize route state into Zustand.

### 21.9 Conditional Rendering

Conditional rendering shows one UI branch or another based on a condition.

### 21.10 Mapping Arrays to Elements

The UI maps arrays like `snapshot.panels` and `snapshot.events` into lists of elements.

### 21.11 Optional Chaining

Optional chaining safely reads nested values that may be missing.

### 21.12 Template Strings

Template strings are used for dynamic labels and accessibility text.

### 21.13 CSS Class Composition

The shell composes class names conditionally to mark active state.

## 22. Design Patterns Used

### Component Composition

Small components are assembled into the shell layout.

### Provider Pattern

`AppProviders` wraps app-wide providers around the tree.

### Context Pattern

`RuntimeSnapshotContext` carries the current snapshot through the React tree.

### Hook Pattern

Custom hooks provide snapshot access and simplify consumption.

### Global UI State Store

Zustand stores selection and navigation state.

### Routing-Based Navigation

The shell uses the browser URL to switch sections.

### Registry Pattern

The UI plugin registry maps plugin ids to view definitions.

### Plugin Host Surface

The workspace is a host surface for plugin-provided views.

### Boundary / Read-Model Pattern

`RuntimeSnapshot` is a read model for rendering.

### Container / Presentational Split

The workspace and layout components handle composition, while the views and cards handle display.

### Mock Adapter Seam

The runtime snapshot provider includes a local mock adapter.

### Placeholder / Fallback Rendering

If no plugin view exists, the shell renders a placeholder.

### Accessibility-Aware Layout

The shell uses semantic regions and ARIA labels.

## 23. Design Tradeoffs

### Browser-first UI vs desktop packaging immediately

Current choice:

- browser-first

Why:

- faster to build and test

Tradeoff:

- desktop packaging comes later

### Mock snapshot provider vs real runtime integration immediately

Current choice:

- mock snapshot provider

Why:

- lets the shell architecture exist before live binding exists

Tradeoff:

- it is not connected to `@nexus/core` yet

### React Context for snapshot vs passing props everywhere

Current choice:

- context plus props

Why:

- shared access is simpler
- snapshot flow stays explicit at layout boundaries

Tradeoff:

- two patterns must be understood

### Zustand for UI state vs React local state only

Current choice:

- Zustand for shared shell selection state

Why:

- avoids prop drilling
- keeps shell state easy to access

Tradeoff:

- another state layer to learn

### UI-side plugin view registry vs direct imports in Workspace

Current choice:

- registry

Why:

- plugin view lookup stays decoupled

Tradeoff:

- one more indirection

### Single-page composed shell vs full route per panel

Current choice:

- composed shell with a few URL sections

Why:

- simpler shell model

Tradeoff:

- less route granularity

### Placeholder panels vs dynamic plugin loading

Current choice:

- placeholders where views do not exist

Why:

- the shell can show structure before every view exists

Tradeoff:

- some content is intentionally mock-like

### Fixed layout vs full dockable window manager

Current choice:

- fixed composed layout

Why:

- easier to understand and test

Tradeoff:

- not a full docking system yet

### Deterministic mock data vs live runtime data

Current choice:

- deterministic mock data

Why:

- stable UI behavior for development and tests

Tradeoff:

- no live integration yet

### CSS-based shell layout vs heavy UI framework

Current choice:

- CSS-based shell layout with small reusable components

Why:

- more control over the operator interface

Tradeoff:

- more layout code is handled directly

## 24. What Is Implemented Today

Today the UI includes:

- browser-first React shell
- Vite-based app
- routing through React Router
- `AppProviders`
- `RuntimeSnapshotProvider`
- mock runtime adapter
- `RuntimeSnapshot` type
- shell layout
- top bar
- activity bar
- sidebar
- workspace dock prototype
- bottom event panel
- Zustand shell state
- UI-side plugin view registry
- Telemetry Demo UI view
- mock-only data flow

## 25. What Is Not Implemented Yet

Today the UI does not include:

- real connection to `@nexus/core`
- WebSocket, IPC, or backend bridge
- real adapter data
- real robot control
- browser execution of runtime plugins
- plugin marketplace UI
- dynamic remote plugin loading
- authentication or authorization
- production security hardening
- real map, video, or mission planner integrations
- fully dockable or resizable workspace engine
- persisted workspaces

## 26. Common Confusions

1. UI Shell is not the Core Runtime.
   - The shell renders the browser interface.
   - The core runtime runs the platform engine.

2. React Context is not the Event Bus.
   - Context passes values through React.
   - The Event Bus passes runtime events.

3. `RuntimeSnapshot` is not the Event Bus.
   - The snapshot is a read model.
   - The Event Bus is live communication.

4. Zustand state is not runtime state.
   - Zustand stores shell selections.

5. UI Plugin View Registry is not Core Plugin Registry.
   - One maps plugin ids to React components.
   - The other tracks runtime plugin metadata and lifecycle state.

6. Telemetry Demo UI View is not Telemetry Demo runtime plugin.
   - One is a React component.
   - The other is a runtime lifecycle participant.

7. Rendering a plugin view is not starting a runtime plugin.
   - Mounting a component is a UI action.

8. Changing active panel is not changing runtime lifecycle.
   - It only changes shell selection state.

9. The UI is mock-only today.
   - It does not connect to the live runtime yet.

10. The mock runtime adapter is not a real backend adapter.
    - It only mutates local UI snapshot state.

11. BrowserRouter is not a runtime router.
    - It only manages browser URL routing for the shell.

12. A panel is not the same thing as a plugin package.
    - A panel is a UI surface.

13. A workspace is currently UI composition state, not persisted mission state.
    - It is local selection and layout context.

14. The shell layout is a prototype, not a full ground station.
    - It demonstrates structure and composition.

15. Vite is a frontend build tool, not part of NEXUS runtime logic.
    - It supports the UI package only.

## 27. Generic UI Shell Example

Here is a generic UI shell example:

```text
App startup
   ↓
load providers
   ↓
read router state
   ↓
render shell frame
   ↓
show navigation, status, and main workspace
   ↓
mount feature panel if available
```

That is the same shape NEXUS uses.

## 28. NEXUS UI Shell Walkthrough

This is the current NEXUS UI flow in plain English:

1. The browser loads the app.
2. `main.tsx` finds the root element.
3. React creates the app root.
4. `AppProviders` wraps the app.
5. `RuntimeSnapshotProvider` creates mock snapshot state.
6. `BrowserRouter` enables route-based shell navigation.
7. `App` maps the URL to a shell section.
8. `ShellRoute` reads the snapshot and renders `ShellFrame`.
9. `ShellFrame` synchronizes the URL section into Zustand and resolves the canonical workspace/panel selection.
10. `TopBar`, `ActivityBar`, `Sidebar`, `Workspace`, and `BottomEventPanel` render.
11. `Workspace` receives the canonical panel selection and looks up the UI plugin view.
12. `Workspace` mounts the selected plugin view or a placeholder.
13. `TelemetryDemoView` reads the snapshot and renders mock operational content.

## 29. Interview Explanation

If asked, “How does the NEXUS Operator UI Shell work?”, a concise technical answer is:

NEXUS uses a browser-first React shell built with Vite, React, React Router, TypeScript, and Zustand. The app starts in `main.tsx`, where it boots built-in plugin views, finds the root element, creates the React root, and wraps the app in `AppProviders` and `BrowserRouter`. `AppProviders` installs `RuntimeSnapshotProvider`, which currently supplies mock runtime state and a local adapter through React Context. `App.tsx` maps the browser URL to shell sections and `ShellFrame` composes the top bar, activity bar, sidebar, workspace, and event panel. Zustand stores local shell selection state such as active section, workspace, and panel, while `ShellFrame` resolves the canonical workspace/panel selection from the snapshot and syncs the store when the snapshot invalidates the stored ids. The `Workspace` component receives the canonical selection, resolves a UI plugin view from the UI-side registry, and mounts the React component when one exists. The shell is mock-only today and is intentionally separated from the real core runtime and plugin lifecycle, which leaves a clean boundary for future runtime binding and adapter integration.

## 30. Self-Check Questions

- What problem does the UI Shell solve?
- Why is the UI browser-first?
- What does `main.tsx` do?
- Why does the app use `BrowserRouter`?
- What does `AppProviders` wrap?
- What does `RuntimeSnapshotProvider` provide?
- Why is the UI mock-only today?
- What does `ShellFrame` compose?
- How does the URL section become active UI state?
- What does Zustand store?
- Why is Zustand used instead of only props?
- What does `Workspace` do?
- How does `Workspace` find the active panel?
- How does `Workspace` mount a plugin view?
- What is a `PluginViewDefinition`?
- What is the UI Plugin View Registry?
- Why is UI Plugin View Registry not the same as Core Plugin Registry?
- What does the Telemetry Demo UI View display?
- Why is the Telemetry Demo UI View not the runtime plugin?
- What is the difference between UI state and runtime state?
- What is React Context?
- What is a React hook?
- What is JSX?
- What is Vite?
- What future work is required to connect the UI to the real runtime?
- Why does `ShellFrame` synchronize route state into Zustand?
- Why is placeholder rendering useful in early shell development?
- Why does the workspace use a registry instead of importing the component directly?

## 31. Next Study Step

The next learning document should be:

```text
docs/learning/runtime-snapshot-guide.md
```

That document should deeply analyze:

- `RuntimeSnapshot`
- `RuntimeSnapshot` as a boundary object
- `RuntimeSnapshotProvider`
- React Context
- mock runtime adapter
- update functions
- read model vs event stream
- future real runtime binding
