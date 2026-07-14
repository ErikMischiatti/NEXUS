# NEXUS UI State and Plugin Views Guide

## 1. Purpose of This Document

This document explains the NEXUS UI shell state model and UI plugin view mounting system in depth.

The goal is to understand:

- what UI state means in NEXUS
- why Zustand is used
- how URL state, Zustand state, and `RuntimeSnapshot` interact
- how the active workspace and active panel are resolved
- how the UI-side plugin view registry works
- how the Telemetry Demo UI view is mounted
- why UI plugin views are separate from runtime plugins
- how to explain the UI composition model in an interview

This is a learning guide, not a runtime contract for future phases.

## 2. What Is UI State?

### 2.1 Simple Definition

UI state is the state that belongs to the user interface itself.

It usually includes selections, filters, open panels, layout choices, and other interaction state.

### 2.2 Generic Example

In an IDE-like app, UI state might include:

- which sidebar section is selected
- which file is active
- which terminal tab is open
- which panel is currently focused

That state helps the app remember what the user is looking at.

### 2.3 UI State in NEXUS

In NEXUS, UI state includes:

- the active shell section
- the active workspace
- the active panel

This state lives in the UI shell, not in the core runtime.

It is local interaction state, not robot state or runtime lifecycle state.

## 3. What Is Zustand?

### 3.1 Simple Definition

Zustand is a small React state library for shared client-side state.

### 3.2 Why Zustand Is Used

NEXUS uses Zustand because it:

- keeps shell selection state in one place
- avoids excessive prop drilling
- is simple to read and update
- works well for shared UI state

### 3.3 Zustand vs React Local State

React local state is good for state that belongs to one component.

Zustand is better when several shell components need to share the same selection state.

### 3.4 Zustand vs React Context

React Context is good for sharing values like the `RuntimeSnapshot`.

Zustand is better for interactive selection state that changes frequently and is read in multiple places.

### 3.5 Zustand vs Core Service Container

Zustand is UI-only.

The core service container belongs to the runtime and stores services like the Event Bus, config, and logger factory.

Zustand is not a runtime service container.

## 4. Main Files and Folders

### 4.1 ui/src/store/use-shell-store.ts

This file defines the shell's Zustand store.

### 4.2 ui/src/components/layout/ShellFrame.tsx

This file synchronizes route section state into the store, resolves the canonical workspace/panel selection from `RuntimeSnapshot`, and renders the main shell layout.

### 4.3 ui/src/components/layout/Workspace.tsx

This file renders the workspace panels using the canonical selection resolved by `ShellFrame`.

### 4.4 ui/src/plugins/plugin-view.ts

This file defines the shape of a UI plugin view.

### 4.5 ui/src/plugins/plugin-view-registry.ts

This file stores UI plugin views in memory and resolves them by plugin id.

### 4.6 ui/src/plugins/index.ts

This file re-exports the UI plugin registry and the explicit startup bootstrap used by the app entrypoint.

### 4.7 ui/src/plugins/telemetry-demo/

This folder contains the Telemetry Demo UI view and its explicit registration helper.

### 4.8 ui/src/types/runtime-snapshot.ts

This file defines the data model the UI renders.

## 5. Shell UI State Model

### 5.1 useShellStore

`useShellStore` is the Zustand store hook.

It is defined from this state shape:

```ts
type ShellStoreState = {
  activeSection: ShellSectionId;
  activeWorkspaceId?: string;
  activePanelId?: string;
  setActiveSection: (section: ShellSectionId) => void;
  setSelection: (selection: { workspaceId?: string; panelId?: string }) => void;
};
```

Why this state is UI selection state:

- it tracks what the user has selected in the shell
- it does not represent live runtime lifecycle
- it changes in response to navigation and clicks

Why it is global within the UI shell:

- multiple shell components need to read the same selection
- the top bar, activity bar, sidebar, and workspace all participate

Why it does not belong in the core runtime:

- it is a browser UI concern
- it controls shell selection, not platform execution

Why it does not belong in the Event Bus:

- it is not a message for other runtime modules
- it is local UI interaction state

Why it does not belong in the UI Plugin View Registry:

- the registry stores view definitions
- the store stores user selection

Why Zustand avoids excessive prop drilling:

- components can read only the state they need
- state does not need to be passed through every parent component

Why components use selectors:

- selectors reduce unnecessary coupling
- selectors let each component subscribe only to the data it needs

Store creation style:

```ts
export const useShellStore = create<ShellStoreState>((set) => ({
  activeSection: initialShellSection,
  activeWorkspaceId: defaultWorkspaceId,
  activePanelId: defaultWorkspacePanelId,
  setActiveSection: (activeSection) => set({ activeSection }),
  setSelection: (selection) => set({ activeWorkspaceId: selection.workspaceId, activePanelId: selection.panelId }),
}));
```

### 5.2 activeSection

`activeSection` tracks which shell section is active, such as `plugins`, `workspaces`, `events`, or `settings`.

### 5.3 activeWorkspaceId

`activeWorkspaceId` tracks which workspace the user selected in the top bar.

### 5.4 activePanelId

`activePanelId` tracks which panel is selected inside the workspace.

### 5.5 setActiveSection()

Updates the active shell section.

### 5.6 setSelection()

Updates the workspace and panel selection atomically.

## 6. URL State vs Zustand State

### 6.1 URL Section

The shell uses the browser URL to represent the current section.

### 6.2 useParams()

`useParams()` reads the route parameter from React Router.

### 6.3 isShellSection()

`isShellSection()` is a type guard that checks whether the URL section is one of the supported shell sections.

### 6.4 Synchronizing Route State into Zustand

`ShellFrame` reads the URL section and writes it into Zustand with `useEffect()`.

### 6.5 Why Both URL and Zustand Exist

Both exist because they solve different problems:

- the URL is shareable and navigable
- Zustand stores current shell selection state

Diagram:

```text
Browser URL: /plugins
        ↓
React Router
        ↓
ShellFrame useParams()
        ↓
isShellSection(params.section)
        ↓
activeSection = "plugins"
        ↓
useEffect()
        ↓
Zustand setActiveSection("plugins")
        ↓
ActivityBar / Sidebar reflect active section
```

## 7. RuntimeSnapshot vs Zustand State

### 7.1 RuntimeSnapshot as Data

The snapshot contains runtime/workspace/plugin/panel/event/connection data.

### 7.2 Zustand as Selection State

Zustand contains the user's current selection state.

### 7.3 Why activePanelId Is Not Stored in RuntimeSnapshot

`activePanelId` is UI selection state, not platform data.

### 7.4 Why Plugin Data Is Not Stored in Zustand

Plugin inventory belongs in the snapshot because it is rendered as platform data, not as local shell selection.

Why this split is useful:

- snapshot can later come from a real runtime provider
- Zustand remains local shell interaction state
- UI selection can change without modifying runtime data
- runtime data can update without losing user selection

## 8. Workspace State Resolution

### 8.1 Reading activeWorkspaceId

`ShellFrame` resolves the active workspace from the store selection and the current `RuntimeSnapshot`.

### 8.2 Finding Active Workspace

The canonical resolver prefers the stored workspace when it is still valid, then falls back to the current snapshot workspace or the first available workspace.

### 8.3 Fallback to snapshot.workspace

If the selected workspace is not found, the canonical resolver falls back to `snapshot.workspace`.

### 8.4 Reading activePanelId

`ShellFrame` resolves the active panel from the store selection and the current `RuntimeSnapshot`.

### 8.5 Finding Active Panel

The canonical resolver keeps the selected panel only when it belongs to the resolved workspace.

### 8.6 Fallback to First Panel

If the active panel is missing or belongs to another workspace, the canonical resolver falls back to the first panel in the resolved workspace.

### 8.7 Why Fallbacks Matter

Fallbacks keep the shell robust when the selection and snapshot are temporarily out of sync, and the `ShellFrame` syncs the store back to the canonical selection after render with `setSelection({ workspaceId, panelId })`.

Workspace flow:

```text
ShellFrame receives RuntimeSnapshot
        ↓
resolves canonical workspace selection
        ↓
passes workspace + panel selection to TopBar and Workspace
        ↓
Workspace receives canonical selection
        ↓
selects workspace panels from the resolved workspace
        ↓
selects the active panel from the resolved workspace panels
        ↓
reads `panel.pluginId`
        ↓
resolves plugin view from the UI registry
        ↓
renders plugin component or placeholder
```

## 9. Panel Model

### 9.1 PanelSnapshot

`PanelSnapshot` describes a panel in the shell workspace.

### 9.2 Panel ID

The panel id is the stable panel identifier.

### 9.3 Panel Title

The title is the label shown to the user.

### 9.4 Plugin ID

`pluginId` links the panel to a conceptual plugin view.

### 9.5 Workspace ID

`workspaceId` links the panel to its owning workspace in the flat UI snapshot model.

### 9.6 Panel Region

`region` is a layout hint such as `main`, `right`, or `bottom`.

### 9.7 Panel Status

`status` is a display signal such as `ready`, `placeholder`, or `mock`.

### 9.8 Panel Description

The description gives human-readable context.

### 9.9 Panel Tabs

The workspace renders each panel as a tab-like button.

## 10. Workspace Rendering

### 10.1 Workspace Container

The workspace is the main dock surface of the shell.

### 10.2 Dock Header

The header shows the workspace label and connection summary.

### 10.3 Panel Tabs

Each panel in `snapshot.panels` becomes a tab button.

### 10.4 Main Dock

The main dock mounts the active plugin view when it exists.

### 10.5 Inspector Dock

The inspector dock shows details for the currently selected panel.

### 10.6 Placeholder Rendering

If the plugin view does not exist, the shell renders a placeholder.

### 10.7 Badge Rendering

Badges show status like `ready`, `mock`, or `placeholder`.

### 10.8 Accessibility Attributes

The workspace uses roles and labels to make the shell easier to navigate.

## 11. UI Plugin View Concept

### 11.1 What a UI Plugin View Is

A UI plugin view is a React component that the shell can mount for a plugin-associated panel.

### 11.2 Why UI Plugin Views Exist

They let the shell host feature content without hard-coding every panel directly into the workspace.

### 11.3 UI Plugin View vs Regular React Component

A regular React component may be used anywhere.

A UI plugin view has an explicit plugin id and is stored in the UI registry for lookup.

### 11.4 UI Plugin View vs Runtime Plugin

A UI plugin view is rendered in the browser.

A runtime plugin runs in the core plugin lifecycle.

### 11.5 UI Plugin View as a Mountable Panel

The workspace uses the view registry to mount a React component in the main dock.

## 12. PluginViewDefinition

### 12.1 id

The view definition id is the unique UI view identifier.

### 12.2 title

The title is the display name used by the workspace.

### 12.3 pluginId

The plugin id links the view to a conceptual plugin/panel identity.

### 12.4 component

The component is the React component to render.

### 12.5 ComponentType

`ComponentType` is React's typed component shape.

### 12.6 PluginViewComponentProps

`PluginViewComponentProps` is currently `Record<string, never>`, meaning the view currently receives no props.

## 13. UI Plugin View Registry

### 13.1 What the Registry Does

The registry maps plugin ids to UI plugin view definitions.

### 13.2 createPluginViewRegistry()

This helper builds a new in-memory registry, optionally seeded with initial views.

### 13.3 Internal Map

The registry uses `Map<string, PluginViewDefinition>` internally for direct plugin-id lookup.

### 13.4 register()

`register()` adds a view definition for a plugin id, no-ops for the same contribution, and rejects conflicting duplicate ids.

### 13.5 get()

`get()` returns the matching view definition or `undefined`.

### 13.6 list()

`list()` returns all registered view definitions.

### 13.7 Initial Views

The registry can be seeded at creation time, but in this project it is populated by an explicit startup bootstrap.

### 13.8 Singleton pluginViewRegistry

The current shell uses a singleton `pluginViewRegistry` for simplicity.

Why this helps:

- the workspace can resolve views without extra wiring

Tradeoff:

- the registry is global within the UI module graph

## 14. Registering Built-In UI Plugin Views

### 14.1 ui/src/plugins/index.ts

This file exports the startup bootstrap that registers built-in views before the React app renders.

### 14.2 Side-Effect Import

This is an explicit startup step.

It exists so registration happens before the React app renders.

### 14.3 Telemetry Demo Registration

`ui/src/plugins/telemetry-demo/index.ts` registers `telemetryDemoPluginView`.

### 14.4 Why Registration Happens at Startup

Startup registration ensures the shell knows about built-in plugin views before the workspace tries to mount them.

Registration flow:

```text
ui/src/plugins/index.ts
        ↓ imports
ui/src/plugins/telemetry-demo/index.ts
        ↓ calls
pluginViewRegistry.register(telemetryDemoPluginView)
        ↓ stores
pluginId "example.telemetry.demo" → TelemetryDemoView
        ↓ used by
Workspace
```

## 15. Mounting a Plugin View in Workspace

### 15.1 Active Panel

The active panel comes from Zustand selection state.

### 15.2 panel.pluginId

The workspace reads `panel.pluginId` from the current panel.

### 15.3 pluginViewRegistry.get()

The registry resolves the `pluginId` to a view definition.

### 15.4 Component Resolution

If a view definition exists, the workspace reads `activePluginView.component`.

### 15.5 Rendering PluginViewComponent

The workspace renders `<PluginViewComponent />` when the component exists.

### 15.6 Fallback Placeholder

If no view is registered, the workspace renders a placeholder instead.

### 15.7 Inspector Metadata

The inspector still shows the panel metadata even if the plugin view is missing.

## 16. Telemetry Demo UI View

### 16.1 Location

The UI Telemetry Demo view lives in `ui/src/plugins/telemetry-demo/TelemetryDemoView.tsx`.

### 16.2 telemetryDemoPluginView

`telemetryDemoPluginView` links the UI view to the plugin id.

### 16.3 pluginId: example.telemetry.demo

The view is registered under `example.telemetry.demo`.

### 16.4 TelemetryDemoView Component

The component reads the snapshot and renders a mock operational panel.

### 16.5 useRuntimeSnapshot()

The component uses `useRuntimeSnapshot()` to read the current snapshot.

### 16.6 Runtime Status

It shows the runtime name and current status.

### 16.7 Connection Status

It shows the mock connection label and state.

### 16.8 Plugin Status

It shows the status for the telemetry demo plugin entry in the snapshot.

### 16.9 Event Counters

It displays event counts and panel counts.

### 16.10 Latest Event

It shows the latest event summary.

### 16.11 Timeline

It renders the recent events as a timeline.

## 17. Runtime Plugin vs UI Plugin View

### 17.1 Runtime Plugin Location

Runtime plugin example:

```text
examples/plugins/telemetry-demo/
        ↓
nexus.plugin.json
        ↓
core LocalPluginLoader
        ↓
BasicPluginManager
        ↓
onStart / Event Bus / onStop
```

### 17.2 UI Plugin View Location

UI plugin view example:

```text
ui/src/plugins/telemetry-demo/
        ↓
pluginViewRegistry
        ↓
Workspace
        ↓
TelemetryDemoView React component
        ↓
RuntimeSnapshot rendering
```

### 17.3 Runtime Plugin Lifecycle

Runtime plugins are managed by the core plugin lifecycle.

### 17.4 UI Plugin View Rendering

UI plugin views are mounted by the browser shell.

### 17.5 Shared Conceptual Plugin ID

They may share `example.telemetry.demo` as a conceptual id.

### 17.6 Why They Are Separate Today

They are separate because the shell is still mock-only and does not yet bind to the real runtime plugin system.

### 17.7 How They Might Relate in the Future

In the future, a real runtime binding could make the UI view and runtime plugin line up more directly through a live integration layer.

## 18. End-to-End UI Selection and Mounting Flow

```text
User opens /plugins
        ↓
React Router sets section route
        ↓
ShellFrame validates section
        ↓
Zustand activeSection = "plugins"
        ↓
Workspace reads activeWorkspaceId and activePanelId
        ↓
Workspace finds active panel from RuntimeSnapshot
        ↓
activePanel.pluginId = "example.telemetry.demo"
        ↓
pluginViewRegistry.get("example.telemetry.demo")
        ↓
TelemetryDemoView component resolved
        ↓
TelemetryDemoView reads RuntimeSnapshot
        ↓
UI renders mock telemetry panel
```

## 19. State Ownership Rules

```text
Concern                         Owner
-------------------------------------------------------
Runtime/workspace/plugin data    RuntimeSnapshot
Selected section                 Zustand
Selected workspace ID            Zustand
Selected panel ID                Zustand
URL path                         React Router
Plugin view lookup               UI Plugin View Registry
Runtime plugin lifecycle          Core Plugin Manager
Runtime plugin metadata/state     Core Plugin Registry
Runtime communication             Event Bus
```

Why this ownership split helps:

- each state concern has one obvious place to live
- the shell remains easier to reason about
- runtime and UI responsibilities stay separate

## 20. TypeScript and React Syntax Explained

### 20.1 Zustand create()

`create()` is Zustand's store factory function.

### 20.2 Store State Type

`ShellStoreState` defines the shape of the shell state.

### 20.3 Setter Functions

Setter functions update the selected section, workspace, or panel.

### 20.4 Selector Functions

Selectors like `useShellStore((state) => state.activePanelId)` read only the state slice a component needs.

### 20.5 Type Guards

`isShellSection` narrows a string into a shell section id when the value matches the allowed section set.

### 20.6 ComponentType

`ComponentType` is React's type for a renderable component.

### 20.7 Record<string, never>

`Record<string, never>` means the object has no props.

### 20.8 Map<string, Value>

The view registry uses a `Map` for keyed lookup by plugin id.

### 20.9 Optional Chaining

Optional chaining safely reads `activePluginView?.component`.

### 20.10 Nullish Coalescing

Nullish coalescing helps pick fallback values when selections are missing.

### 20.11 Conditional Rendering

The workspace renders the plugin view if it exists, otherwise a placeholder.

### 20.12 Array map()

Arrays like panels and events are mapped into lists of React elements.

### 20.13 React Keys

Each rendered list item uses a stable key such as `panel.id`.

### 20.14 Dynamic Component Rendering

The workspace stores a component in a variable and then renders `<PluginViewComponent />`.

## 21. Design Patterns Used

### Global UI State Store

Simple definition:

- shared client-side state stored in one place

Where it appears in NEXUS:

- Zustand shell store

Why it helps:

- avoids prop drilling and makes selection state easy to access

Tradeoff:

- another state layer to learn

### Selector Pattern

Simple definition:

- read only the state slice you need

Where it appears in NEXUS:

- `useShellStore((state) => state.activePanelId)`

Why it helps:

- reduces coupling and unnecessary re-renders

Tradeoff:

- components must know how to select state carefully

### Registry Pattern

Simple definition:

- map known ids to stored definitions

Where it appears in NEXUS:

- UI plugin view registry

Why it helps:

- decouples panel resolution from component imports

Tradeoff:

- one more lookup step

### Plugin Host Surface

Simple definition:

- a UI area that can mount feature-provided content

Where it appears in NEXUS:

- the workspace main dock

Why it helps:

- makes the shell extensible

Tradeoff:

- requires fallback behavior when a view is unavailable

### Component Composition

Simple definition:

- build the UI from smaller components

Where it appears in NEXUS:

- shell layout regions

Why it helps:

- keeps the interface modular

Tradeoff:

- requires consistent prop boundaries

### State Ownership Separation

Simple definition:

- different kinds of state live in different systems

Where it appears in NEXUS:

- snapshot, Zustand, router, and registry separation

Why it helps:

- architecture becomes clearer

Tradeoff:

- more concepts to understand

### Route-to-State Synchronization

Simple definition:

- keep URL state and local UI state aligned

Where it appears in NEXUS:

- `ShellFrame`

Why it helps:

- makes the URL and UI selection consistent

Tradeoff:

- syncing code is required

### Placeholder/Fallback Rendering

Simple definition:

- render a safe fallback when a dynamic view is missing

Where it appears in NEXUS:

- `Workspace`

Why it helps:

- the shell remains usable even if a view is missing

Tradeoff:

- some panels are intentionally not "real" yet

### Side-Effect Registration

Simple definition:

- import a module to trigger registration code

Where it appears in NEXUS:

- `ui/src/plugins/index.ts`

Why it helps:

- built-in UI views are registered automatically

Tradeoff:

- side effects should be used carefully because they are less explicit

### In-Memory Lookup Table

Simple definition:

- keep definitions in memory for quick id-based lookup

Where it appears in NEXUS:

- `pluginViewRegistry`

Why it helps:

- simple and fast

Tradeoff:

- no persistence

### Boundary Between Runtime Plugin and UI View

Simple definition:

- separate execution from rendering

Where it appears in NEXUS:

- plugin system vs UI shell

Why it helps:

- keeps core and UI responsibilities separate

Tradeoff:

- the two sides must stay conceptually aligned

## 22. Design Tradeoffs

### Zustand vs React Context for UI selection state

Current choice:

- Zustand

Why:

- efficient shared state access

Tradeoff:

- another library and pattern to learn

### Zustand vs prop drilling

Current choice:

- Zustand

Why:

- avoids passing selection props through many layers

Tradeoff:

- state is less explicit in the component signature

### UI-side registry vs hard-coded plugin component in Workspace

Current choice:

- registry

Why:

- panel mounting stays decoupled from view imports

Tradeoff:

- one more indirection

### Singleton registry vs provider-based registry

Current choice:

- singleton registry

Why:

- simple for the current shell

Tradeoff:

- global module state

### Explicit bootstrap registration vs implicit import registration

Current choice:

- explicit bootstrap registration for built-ins

Why:

  - convenient and easy to initialize

Tradeoff:

  - still requires the bootstrap call to stay near app startup

### Active panel by ID vs storing full panel object

Current choice:

- store the id

Why:

- smaller state and easier updates

Tradeoff:

- requires lookup in the snapshot

### Fallback placeholder vs throwing error when view is missing

Current choice:

- fallback placeholder

Why:

- the shell stays usable

Tradeoff:

- missing views may be less obvious unless inspected

### Plugin view receives no props vs passing snapshot/panel props directly

Current choice:

- no props

Why:

- the view can read shared snapshot data itself

Tradeoff:

- the view depends on context rather than explicit inputs

### UI plugin view registry now vs future dynamic UI plugin loading

Current choice:

- local registry

Why:

- simple and deterministic

Tradeoff:

- not a remote plugin UI loader

### Local UI state vs persisted workspace state

Current choice:

- local state only

Why:

- easier to build and test in Phase 3

Tradeoff:

- user choices do not persist yet

## 23. What Is Implemented Today

Today this area includes:

- Zustand shell store
- active section state
- active workspace ID state
- active panel ID state
- route-to-state synchronization in ShellFrame
- workspace active panel resolution
- panel tabs
- main dock and inspector dock
- UI Plugin View Registry
- built-in telemetry demo view registration
- Telemetry Demo React view
- placeholder rendering for unavailable plugin views
- mock-only UI composition

## 24. What Is Not Implemented Yet

Today this area does not include:

- persisted workspace layout
- drag-and-drop docking
- fully resizable panels
- dynamic remote UI plugin loading
- browser execution of runtime plugins
- real plugin UI bundles
- plugin marketplace UI
- runtime-driven plugin view registration
- user-customizable layouts
- permission-aware plugin views
- real runtime plugin state synchronization
- real adapter-backed panel data

## 25. Common Confusions

1. Zustand is not RuntimeSnapshot.
   - Zustand stores selection state.
   - RuntimeSnapshot stores shell data.

2. Zustand is not the core service container.
   - It is only for UI state.

3. Zustand is not the Event Bus.
   - It does not publish or subscribe to runtime events.

4. activePanelId is not a runtime plugin state.
   - It is a UI selection value.

5. A panel is not a plugin package.
   - A panel is a shell surface.

6. A UI plugin view is not a runtime plugin.
   - One renders React.
   - The other runs in the core lifecycle.

7. UI Plugin View Registry is not Core Plugin Registry.
   - They solve different problems.

8. Rendering a React plugin view does not start a runtime plugin.
   - It only mounts UI.

9. Registering a UI plugin view does not load plugin code through the core loader.
   - It only stores a React component mapping.

10. `pluginId` is a conceptual link, not a live connection today.
    - The shell uses it for lookup.

11. Explicit bootstrap is convenient and should be used carefully.
    - It keeps registration visible in the app entrypoint.

12. The Telemetry Demo UI view is mock-only today.
    - It reads snapshot data, not live runtime data.

13. Workspace state is not persisted today.
    - It is local shell state.

14. React Router controls URL navigation, not runtime lifecycle.
    - It only manages browser routes.

15. Placeholder rendering is intentional robustness, not a broken plugin by itself.
    - It keeps the shell usable while features are incomplete.

## 26. Generic UI Registry Example

Here is a generic IDE-like example:

```text
Open files:
- File Explorer panel
- Editor panel
- Terminal panel

UI state:
- active file ID
- active sidebar section
- active bottom panel

Registry:
- panel type "editor" → EditorComponent
- panel type "terminal" → TerminalComponent
```

This shows why shell state and view registries are useful:

- selection state stays separate from panel data
- a registry can map ids to components without hard-coding the UI

## 27. NEXUS UI State and Plugin View Walkthrough

This is the current NEXUS flow in plain English:

1. The browser opens `/plugins`.
2. React Router resolves the section route.
3. `ShellFrame` validates the section and syncs it into Zustand.
4. `TopBar`, `ActivityBar`, `Sidebar`, `Workspace`, and `BottomEventPanel` render.
5. `Workspace` reads the active workspace and active panel ids from Zustand.
6. `Workspace` finds the matching panel in `RuntimeSnapshot`.
7. `Workspace` reads `panel.pluginId`.
8. `Workspace` asks the UI registry for the matching view.
9. The Telemetry Demo view is resolved if the id matches.
10. The view renders snapshot data in the main dock.

## 28. Interview Explanation

If asked, “How does NEXUS manage UI state and plugin views in the Operator UI Shell?”, a concise technical answer is:

NEXUS uses Zustand for local shell selection state such as active section, active workspace, and active panel. React Router controls the URL section, and `ShellFrame` synchronizes the route into the Zustand store so the URL and UI selection stay aligned. The shell uses `RuntimeSnapshot` for runtime/workspace/plugin/panel data, while Zustand stores only interaction state. The `Workspace` component resolves the active workspace and active panel, then uses the UI Plugin View Registry to map `pluginId` values to React components. The Telemetry Demo view is registered as a built-in UI plugin view and mounted when the active panel points to `example.telemetry.demo`. This is separate from the core plugin lifecycle, which remains in the headless runtime. Today the model is mock-only, but the registry and selection layers give the shell a clean seam for future runtime-driven UI plugin registration.

## 29. Self-Check Questions

- What problem does Zustand solve in the UI shell?
- What state is stored in `useShellStore`?
- Why is `activePanelId` stored as an ID instead of a full object?
- How does ShellFrame synchronize URL section into Zustand?
- What is the difference between URL state and UI selection state?
- What is the difference between Zustand and RuntimeSnapshot?
- What does Workspace receive as props?
- How does Workspace find the active workspace?
- How does Workspace find the active panel?
- What does `panel.pluginId` do?
- What is a `PanelSnapshot`?
- What is a UI plugin view?
- What is a `PluginViewDefinition`?
- What does `pluginViewRegistry.get()` return?
- How is the Telemetry Demo UI view registered?
- Why is the registry keyed by plugin ID?
- What happens if no plugin view is registered for a panel?
- What is placeholder rendering?
- What is the difference between runtime plugin and UI plugin view?
- Why does rendering a plugin view not start a runtime plugin?
- What does `ComponentType` mean?
- What does `Record<string, never>` mean?
- What is explicit bootstrap registration?
- What is not implemented yet in the workspace system?
- How would you explain UI state and plugin views in an interview?
- Why does the shell keep panel selection separate from runtime data?
- Why is the registry global in the current UI implementation?

## 30. Next Study Step

The next learning document should be:

```text
docs/learning/interview-notes.md
```

This final synthesis document will collect:

- concise architecture explanations
- technical interview answers
- diagrams
- tradeoffs
- implemented vs future behavior
- common pitfalls
- presentation-ready summaries
