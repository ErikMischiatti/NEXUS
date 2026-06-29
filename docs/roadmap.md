# Roadmap

This roadmap describes the planned development phases for NEXUS. It is intentionally early-stage and may change as the architecture is validated.

## Phase 0: Project Foundation

Define the initial repository structure, documentation, project scope, contribution expectations, and architectural vocabulary.

## Phase 1: Core Shell

Introduce the minimal application shell and core service boundaries needed to host future plugins, adapters, configuration, workspace state, and internal events.

## Phase 2: Plugin SDK

Define the first plugin development model, including plugin metadata, lifecycle hooks, UI extension points, capability access, and compatibility expectations.

## Phase 3: Telemetry Plugin

Create an initial telemetry plugin to display normalized state from connected systems. This phase should validate the event bus, capability model, and plugin UI integration.

## Phase 4: Map Plugin

Add a map-focused plugin for spatial awareness, vehicle positions, overlays, and mission context. This should remain independent of any single robot type or protocol.

## Phase 5: Mission Plugin

Introduce mission planning and execution concepts that can work across heterogeneous systems. Early work should focus on abstractions before advanced automation.

## Phase 6: ROS Adapter

Add a ROS-oriented adapter to validate integration with common robotics middleware while keeping the NEXUS core middleware-independent.

## Phase 7: MQTT Adapter

Add an MQTT adapter for lightweight event, telemetry, and command integration with distributed systems and custom deployments.

## Phase 8: MAVLink Adapter

Add a MAVLink adapter for UAV and autopilot interoperability while preserving the broader robot-agnostic architecture.

## Phase 9: EAGLE Adapter/Demo

Create an EAGLE adapter or demonstration integration to validate a realistic end-to-end workflow with the NEXUS platform model.
