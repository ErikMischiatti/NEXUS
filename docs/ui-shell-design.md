# UI Shell Design

## 1. Purpose

Phase 3 introduces the first operator UI shell for NEXUS. The goal is to provide a browser-first workspace that can host plugin-provided panels, surface runtime state, and demonstrate the operator workspace concept without becoming a full ground control station.

This document defines the design boundary for the UI shell before implementation. It is intentionally narrow: it describes the shell, its responsibilities, and the data flow assumptions needed to build it cleanly on top of the completed Phase 1 and Phase 2 work.

## 2. Phase 3 Scope

Phase 3 covers the initial browser-based operator shell and workspace composition model.

Included:

- top-level shell layout
- operator workspace concept
- plugin panel hosting regions
- event stream visibility
- mock data and static state for early development
- responsive browser UI behavior
- accessibility baseline
- testing strategy for shell composition and interaction

## 3. Phase 3 Non-Goals

Phase 3 does not include:

- ROS, MQTT, or MAVLink adapters
- real robot control
- live mission execution logic
- map, video, or mission planner real integrations
- authentication or authorization flows
- Electron or Tauri packaging
- production deployment claims
- sandboxing or security hardening beyond normal browser application practice
- EAGLE or any private project references

Phase 3 is about the shell, not the full operator environment.

## 4. UI Design Goals

The shell should be:

- modular, with clear places for plugin content
- operator-oriented, with persistent workspace context
- understandable at a glance, even with placeholder content
- browser-first and lightweight
- visually structured around tasks, not around a specific robot type
- easy to extend without reshaping the entire layout
- deterministic enough for straightforward testing

The design should support multiple kinds of plugin content without assuming that every plugin is a map, video feed, or telemetry dashboard.

## 5. Relationship With Core Runtime

The UI shell is a client of the core runtime, not a replacement for it.

The core runtime remains responsible for:

- event bus behavior
- configuration and runtime bootstrap
- plugin lifecycle execution
- service container behavior
- runtime-level state and tests

The UI shell should consume runtime state through explicit interfaces and mockable data sources. It should not reach into private runtime internals.

In Phase 3, the shell should be able to render against mock or simulated runtime data without requiring a live runtime connection.

## 6. Relationship With Plugin Platform

The plugin platform from Phase 2 remains the extension boundary.

The UI shell should:

- host plugin-provided panels and views
- read plugin metadata from the registry
- use plugin IDs and capabilities as routing/context labels
- keep plugin rendering separate from plugin loading and lifecycle management

The shell must not merge plugin discovery, loading, and UI rendering into one concern. The plugin manager continues to own lifecycle, while the UI shell consumes already-registered plugin metadata and state.

## 7. Proposed Technology Direction

Recommended direction for Phase 3:

- React + TypeScript + Vite
- browser-first development
- no commitment to Electron or Tauri yet
- keep desktop packaging possible later without restructuring the UI from scratch

This direction keeps the shell simple to build and test while preserving the option to package it as a desktop application in a later phase.

## 8. Initial UI Layout

The first shell should use a clear multi-region layout that can hold navigation, workspace context, plugin panels, and status/event information.

```text
+--------------------------------------------------------------+
| Top Bar: Runtime Status / Workspace / Actions                |
+----------------------+---------------------------------------+
| Sidebar              | Main Workspace                        |
| - Workspaces         | - Plugin Panels                       |
| - Plugins            | - Telemetry Demo / Placeholder Views  |
| - Events             | - Task / Context Modules               |
+----------------------+---------------------------------------+
| Bottom / Event Stream                                        |
+--------------------------------------------------------------+
```

Layout expectations:

- top bar for workspace identity, shell actions, and runtime status
- sidebar for navigation between workspaces, plugins, and event views
- main workspace for plugin panels and operator-focused content
- bottom or docked event stream for recent system and plugin events

The initial shell should be sparse but intentional. It should feel like an operator workspace frame, not a completed ground control station.

## 9. Operator Workspace Concept

A workspace is the operator's current composition of context, plugin panels, and shell state.

The workspace concept should support:

- selecting or switching between named workspaces
- showing which plugins are active in the current composition
- preserving UI state for panels and regions
- exposing high-level context such as mission label, environment, or connected system group

In Phase 3, workspace state can be mock data or static local state. It does not need to be persisted or synchronized yet.

The goal is to establish the workspace as a first-class UI concept before adding more operational features.

## 10. Plugin Panel Concept

A plugin panel is a UI region supplied by a plugin or reserved for plugin content.

The initial panel model should support:

- panel title
- plugin ID or source label
- panel status
- a small, well-defined props contract
- placeholder rendering when a plugin panel is unavailable

The shell should not assume that every plugin renders the same kind of content. Some panels may be informational, some may be configuration-focused, and some may be event-driven.

The UI shell should treat plugin panels as composition units inside the workspace rather than as a monolithic application screen.

## 11. Event Stream Panel Concept

The event stream panel is a shell-level view of recent runtime and plugin events.

It should show:

- event type
- source
- timestamp
- compact payload preview when useful
- filtering or grouping hooks for later phases

The event stream is a visibility aid, not an operations log replacement. In Phase 3 it may use mock events or a simulated event feed.

## 12. Mock Data Strategy

Phase 3 should start with static or simulated data.

This means:

- no requirement for live runtime communication on day one
- no dependency on an always-running event bus connection
- mock plugin metadata, workspace data, and event stream data are acceptable
- mock data should follow the same shapes as the intended runtime data whenever practical

Mock data should be deterministic and easy to replace with real runtime bindings later. The shell should be designed so that data sources can be swapped without rewriting the UI hierarchy.

## 13. Testing Strategy

Phase 3 should be tested with a small set of focused tests around shell behavior.

Recommended test coverage:

- render the shell layout with mock workspace data
- verify sidebar navigation state changes
- verify plugin panel placement and fallback rendering
- verify event stream rendering
- verify responsive layout behavior at narrow and wide widths
- verify keyboard-accessible interactions for basic navigation

The tests should focus on shell composition and UI behavior, not on plugin implementation details or live runtime integration.

## 14. Accessibility And Responsiveness

The shell should be usable on typical desktop browser widths and still remain functional on narrower windows.

Accessibility notes:

- use semantic landmarks for main regions
- ensure keyboard navigation for primary shell actions
- preserve readable contrast for text and status states
- do not rely on color alone to signal important state
- keep focus order predictable across workspace and plugin regions

Responsiveness notes:

- collapse or stack regions on smaller screens
- keep sidebar navigation usable when width is constrained
- avoid layouts that break when plugin panel counts change
- make the event stream usable without consuming all available vertical space

## 15. Open Questions

The following design questions remain open and should be resolved during implementation:

- whether plugin panels are mounted directly or rendered through an adapter layer
- whether the first shell should use tabs, cards, or split regions for plugin content
- how workspace state should be persisted later
- whether the event stream should be global or workspace-scoped
- how plugin-provided actions should be surfaced in the top bar
- whether the shell should later support dockable or resizable regions
- how much of the shell should be routable versus single-page composed state

These questions are intentionally left open so the first implementation can stay focused and lightweight.
