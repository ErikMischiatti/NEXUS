# System Design

## Purpose

This document describes the intended high-level system design for NEXUS, a modular robotics operations platform for heterogeneous autonomous systems.

NEXUS is currently early-stage. This document is a planning artifact, not an implementation reference. It describes the direction for the platform architecture, extension points, data flow, and integration model before runtime components are implemented.

## Design Goals

NEXUS is planned around the following design goals:

- **Modularity**: keep platform responsibilities separated so the core, UI, plugins, adapters, and capability model can evolve independently.
- **Plugin-first architecture**: deliver major operator-facing features through plugins rather than hard-coding domain workflows into the shell.
- **Robot-agnostic operation**: avoid assuming a single vehicle type, mission profile, or control model.
- **Adapter-based integration**: connect robots, payloads, sensors, simulators, and external systems through explicit adapters.
- **Capability-driven UI**: allow the UI and plugins to react to declared system capabilities instead of fixed robot categories.
- **Middleware independence**: prevent the platform core from depending directly on ROS, MQTT, MAVLink, or any other single middleware or protocol.
- **Operator-centric workflows**: prioritize situational awareness, mission execution, diagnostics, safety context, and repeatable operator layouts.
- **Extensibility across robotics domains**: support future work across UAVs, UGVs, USVs, robotic arms, payloads, and sensors.

## High-Level Architecture

The planned architecture separates operator-facing composition, plugin lifecycle, event distribution, integration adapters, and capability modeling.

```text
          +-----------------------------+
          |          NEXUS UI           |
          |     Operator Workspace      |
          +--------------+--------------+
                         |
          +--------------+--------------+
          |      Workspace Manager      |
          +--------------+--------------+
                         |
          +--------------+--------------+
          |        Plugin Manager       |
          +--------------+--------------+
                         |
          +--------------+--------------+
          |          Event Bus          |
          +--------------+--------------+
                         |
        +----------------+----------------+
        |                |                |
+-------+------+ +-------+------+ +-------+------+
| ROS Adapter  | | MQTT Adapter | | MAVLink Adapter |
+-------+------+ +-------+------+ +-------+------+
        |                |                |
        +----------------+----------------+
                         |
          +--------------+--------------+
          |       Capability Model       |
          +--------------+--------------+
                         |
        +----------------+----------------+
        |                |                |
      UAV              UGV              Payload
```

This diagram is conceptual. It is intended to show responsibility boundaries, not process topology or deployment architecture.

## Core Components

### NEXUS Core

NEXUS Core is planned to provide platform-level services shared by the rest of the system. Expected responsibilities include lifecycle management, configuration, service registration, shared platform APIs, and boundaries for plugin and adapter interaction.

The core should remain independent of robot-specific behavior and middleware-specific implementation details.

### Event Bus

The Event Bus is the planned internal communication mechanism for normalized telemetry, state changes, alerts, commands, workspace events, and plugin coordination.

Adapters and plugins should communicate through structured events rather than direct dependencies on each other.

### Plugin Manager

The Plugin Manager is planned to discover, validate, load, activate, and deactivate plugins. It should enforce plugin metadata expectations and provide explicit extension points for UI contributions, command surfaces, data views, and workflow tools.

### Workspace Manager

The Workspace Manager is planned to maintain operator workspace state. A workspace may include active plugins, layout, connected systems, selected adapters, mission context, and operator preferences.

### Adapter Layer

The Adapter Layer is the boundary between NEXUS and external systems. Adapters translate middleware-specific or protocol-specific inputs and outputs into NEXUS events, commands, and capability declarations.

### Capability Model

The Capability Model is planned to describe what a robot, payload, sensor, or external system can provide or accept. Plugins should use capabilities to decide which views, controls, commands, and workflows are applicable.

### UI Shell

The UI Shell is the planned operator-facing frame for the platform. It should provide navigation, layout, workspace composition, notifications, command entry points, and plugin-hosting regions.

### Plugins

Plugins are planned as isolated feature modules. Examples may include telemetry views, maps, mission tools, diagnostics, payload controls, fleet views, and domain-specific operator workflows.

## Data Flow

The intended data flow is:

1. A robot, payload, sensor, simulator, or external system emits data.
2. An adapter receives middleware-specific or protocol-specific input.
3. The adapter translates that input into a normalized NEXUS event.
4. The Event Bus distributes the event to interested plugins and platform services.
5. Plugins and UI views update operator-facing state.
6. The operator takes an action through the UI.
7. The plugin publishes a command or request event.
8. The Event Bus routes the command event to the relevant adapter.
9. The adapter translates the command into the external system protocol.
10. The robot, payload, sensor, or external system receives the command.

This flow is directional for explanation only. Real implementations may include acknowledgements, command validation, permissions, simulation modes, retries, safety interlocks, and audit logging.

## Plugin Model

Plugins are intended to be isolated feature modules with explicit dependencies and declared capabilities.

Planned plugin characteristics:

- Plugins consume normalized events from the Event Bus.
- Plugins publish commands, requests, and domain events through the Event Bus.
- Plugins declare required or optional capabilities.
- Plugins contribute UI views, panels, commands, or workflow tools through documented extension points.
- Plugins should not directly depend on a specific middleware, protocol, robot SDK, or adapter implementation.
- Plugins should degrade gracefully when required capabilities are unavailable.

This model should allow the same plugin concept to support UAV mission monitoring, UGV inspection, payload operation, diagnostics, and mixed-fleet workflows.

## Adapter Model

Adapters are intended to translate external systems into NEXUS concepts and translate NEXUS commands back into external system protocols.

Examples:

- **ROS adapter**: maps selected topics, services, and actions into normalized telemetry events, command requests, capability declarations, and system state.
- **MQTT adapter**: maps broker topics into telemetry, alerts, events, and command channels.
- **MAVLink adapter**: maps autopilot telemetry, mission state, mode changes, command acknowledgements, and control requests into NEXUS events and commands.

Adapters should hide middleware-specific details from plugins. A telemetry plugin should not need to know whether position data originated from a ROS topic, an MQTT message, a MAVLink stream, or a simulator.

## Capability Model

The capability model is intended to be the contract between connected systems, adapters, plugins, and the UI shell. It should describe available data, commands, constraints, and workflow affordances without requiring plugins to assume a fixed robot class.

The following YAML is illustrative only. It is not a finalized schema.

```yaml
vehicle:
  id: uav_01
  type: uav
  capabilities:
    mobility:
      modes: [takeoff, land, goto, return_home]
    telemetry:
      fields: [position, velocity, battery, health]
    payload:
      modules: [net, camera]
    mission:
      supports_waypoints: true
      supports_behavior_tree_state: true
```

Future schema work should define naming conventions, versioning, validation rules, permissions, command constraints, and compatibility behavior.

## Workspaces

NEXUS should allow operator workspaces composed of plugins, connected systems, and mission context.

Example workspace directions include:

- **UAV mission monitoring workspace**: telemetry, map, mission state, payload status, and operator alerts.
- **UGV inspection workspace**: route progress, sensor feeds, diagnostics, and inspection checklist tools.
- **Heterogeneous fleet workspace**: multiple robot types, shared map context, system health, and fleet-level events.
- **Payload operation workspace**: payload controls, data streams, task state, and mission-specific operator views.

Workspaces should help operators switch between missions, environments, and system configurations without rebuilding their interface from scratch.

## Initial Technical Direction

Final technology choices are intentionally open. Early implementation work may explore:

- TypeScript with React for the UI shell.
- Electron or Tauri for a desktop operator application.
- Python or TypeScript for early core prototyping.
- A WebSocket-based or in-process Event Bus abstraction for early integration experiments.
- ROS, MQTT, and MAVLink adapters as later roadmap phases.

These are candidate directions, not final commitments. The first implementation choices should be guided by plugin ergonomics, adapter boundaries, operator UI needs, testability, and deployment constraints.

## Non-Goals

NEXUS is not currently:

- a flight controller
- an autopilot
- a robotics middleware
- a replacement for all specialized ground stations
- a safety-certified control system

The intended role of NEXUS is to become an operations and integration layer around existing robotics systems, not to replace the core responsibilities of autopilots, middleware, safety controllers, or specialized domain tools.

## Open Questions

Important technical decisions remain open:

- UI framework
- plugin packaging format
- event schema
- capability schema
- adapter runtime model
- simulation/demo target
- testing strategy
