# Architecture

This document describes the planned conceptual architecture for NEXUS. It is not an implementation reference yet.

NEXUS is planned as a modular robotics operations platform with a small core, dynamically loadable plugins, adapter-based integrations, and a capability-driven operator interface.

## NEXUS Core

The NEXUS Core is responsible for platform-level services that should remain independent of any specific robot, middleware, or UI plugin.

Planned responsibilities include:

- application lifecycle
- configuration management
- workspace state
- service registration
- permission and trust boundaries
- shared platform APIs

## Event Bus

The Event Bus is the planned internal communication layer for decoupled modules. It should allow adapters, plugins, and core services to exchange structured events without direct dependencies on one another.

Expected event categories include telemetry, system state, commands, alerts, plugin lifecycle events, and workspace changes.

## Plugin Manager

The Plugin Manager is planned to handle plugin discovery, metadata validation, loading, activation, deactivation, and compatibility checks.

Plugins should be able to contribute UI views, commands, panels, data processors, operator tools, and domain-specific workflows through explicit extension points.

## Adapter Layer

The Adapter Layer is the planned integration boundary between NEXUS and external systems. Adapters should translate middleware-specific or protocol-specific data into normalized platform concepts.

Potential adapters include ROS, MQTT, MAVLink, simulator integrations, hardware interfaces, payload APIs, and custom mission systems.

Example adapter boundaries may include:

- A ROS adapter that maps selected topics, services, and actions into NEXUS telemetry events, command requests, and capability declarations.
- An MQTT adapter that maps broker topics into normalized telemetry, alerts, system events, and command channels.

These examples describe intended boundaries only. They do not define a runtime API yet.

## Capability Model

The Capability Model is intended to describe what a connected robot, payload, sensor, or service can do. Instead of assuming a fixed vehicle type, plugins should inspect capabilities and adapt their behavior accordingly.

Example capability categories may include movement, localization, telemetry, imaging, manipulation, mission execution, payload control, health reporting, and command support.

A future capability declaration might look conceptually like this:

```yaml
system:
  id: field-robot-01
  type: ugv
  capabilities:
    - name: telemetry.position
      provides: [latitude, longitude, altitude, heading]
    - name: command.velocity
      accepts: [linear_x, angular_z]
    - name: payload.camera
      provides: [image_stream, snapshot]
    - name: health.status
      provides: [battery, link_quality, fault_state]
```

This is an illustrative shape, not a committed schema.

## UI Shell

The UI Shell is the planned operator-facing application frame. It should provide shared navigation, layout, workspace management, notifications, command surfaces, and plugin-hosting regions.

The shell should remain focused on composition and operator workflow rather than embedding domain-specific control logic directly.

## Plugins

Plugins are planned as independently developed feature modules. They may provide telemetry displays, maps, mission tools, diagnostics, payload controls, robot-specific views, or workflow automation.

Plugins should depend on documented platform APIs, declared capabilities, and extension points instead of private core internals.

## Workspaces

Workspaces are planned to capture operational context. A workspace may include layout, active plugins, connected systems, adapter settings, mission context, and saved operator preferences.

Workspaces should help operators move between projects, missions, fleets, and test environments without rebuilding their environment from scratch.
