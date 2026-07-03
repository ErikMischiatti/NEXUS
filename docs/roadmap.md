# Roadmap

This roadmap describes the planned development phases for NEXUS. It is intentionally early-stage and may change as the architecture is validated.

## Phase 0: Project Foundation

Define the initial repository structure, documentation, project scope, contribution expectations, and architectural vocabulary.

Success criteria:

- The repository clearly explains the project scope and early-stage status.
- Placeholder directories and documentation files establish the intended project shape.

## Phase 1: Core Shell

Implement the headless in-process core runtime and the minimum service boundaries needed to host future plugins, adapters, configuration, workspace state, and internal events.

Status:

- Implemented in `@nexus/core` as a headless, in-process runtime shell.
- Event bus, plugin lifecycle, configuration, logging, service container, and runtime bootstrap are in place.

Success criteria:

- A minimal headless shell can start without robot integrations.
- Core service boundaries are documented and implemented in `@nexus/core`.

## Phase 2: Plugin SDK

Define the public plugin SDK, manifest validation, local descriptor discovery, registry behavior, and loader semantics for the headless core.

Status:

- Design documented in `docs/plugin-sdk-design.md`.
- Implementation is pending.

Success criteria:

- A minimal plugin can be discovered, validated, loaded, registered, started, and stopped through public SDK contracts.
- Plugin lifecycle and compatibility expectations are documented and enforced.

## Phase 3: Telemetry Plugin

Create an initial telemetry plugin to display normalized state from connected systems. This phase should validate the event bus, capability model, and plugin UI integration.

Success criteria:

- The plugin can display normalized telemetry from a mock or adapter-provided source.
- The telemetry path validates early event and capability assumptions.

## Phase 4: Map Plugin

Add a map-focused plugin for spatial awareness, vehicle positions, overlays, and mission context. This should remain independent of any single robot type or protocol.

Success criteria:

- The map plugin can display one or more system positions from normalized data.
- Map overlays remain decoupled from any single robot middleware.

## Phase 5: Mission Plugin

Introduce mission planning and execution concepts that can work across heterogeneous systems. Early work should focus on abstractions before advanced automation.

Success criteria:

- Basic mission concepts are represented without assuming UAV-only workflows.
- Mission state can be surfaced through the plugin model.

## Phase 6: ROS Adapter

Add a ROS-oriented adapter to validate integration with common robotics middleware while keeping the NEXUS core middleware-independent.

Success criteria:

- Selected ROS topics and services can be mapped into normalized NEXUS concepts.
- ROS-specific behavior remains isolated in the adapter layer.

## Phase 7: MQTT Adapter

Add an MQTT adapter for lightweight event, telemetry, and command integration with distributed systems and custom deployments.

Success criteria:

- MQTT topics can be mapped into telemetry, event, or command channels.
- Broker configuration remains adapter-specific.

## Phase 8: MAVLink Adapter

Add a MAVLink adapter for UAV and autopilot interoperability while preserving the broader robot-agnostic architecture.

Success criteria:

- Core MAVLink telemetry can be represented through the shared capability and event model.
- UAV-specific assumptions do not leak into the platform core.

