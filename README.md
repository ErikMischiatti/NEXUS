# NEXUS

A plugin-first robotics operations platform for heterogeneous autonomous systems.

## Problem Statement

Modern autonomous operations increasingly involve mixed fleets, multiple middleware stacks, and rapidly changing mission payloads. Traditional control stations are often tightly coupled to a vehicle class, protocol, or operational model, which makes it difficult to integrate UAVs, UGVs, USVs, robotic arms, sensors, payloads, and mission-specific tools in one coherent operator environment.

NEXUS is intended to provide a modular foundation for this problem: a robot-agnostic operations platform where capabilities are exposed through adapters and surfaced through dynamically loadable plugins.

## Vision

NEXUS aims to become an IDE-like operations environment for robotics teams. Instead of treating the control station as a fixed application, the planned platform will provide a shell where robots, payloads, data sources, mission tools, and operator workflows can be composed through well-defined extension points.

The project is early-stage, but the core package now includes the headless runtime and the minimum in-process contracts needed to support it. The repository still does not include UI, adapters, or production deployment pieces.

## Documentation

- [System Design](docs/system-design.md)
- [Architecture](docs/architecture.md)
- [Vision](docs/vision.md)
- [Roadmap](docs/roadmap.md)

## Core Design Principles

- **Plugin-first**: major platform features should be delivered as plugins with clear extension points.
- **Robot-agnostic**: the platform should not assume a single robot type, domain, or vehicle control model.
- **Adapter-based integration**: robot middleware, transport protocols, payloads, and external systems should integrate through adapters.
- **Capability-driven UI**: the user interface should react to declared capabilities rather than hard-coded vehicle assumptions.
- **Middleware-independent architecture**: NEXUS should support multiple robotics ecosystems without binding the core to one middleware.
- **Operator-centric workflows**: interaction models should prioritize mission execution, situational awareness, safety, and repeatable operations.

## Planned Architecture Overview

The planned architecture is organized around a small core and extensible modules:

- **NEXUS Core**: headless event bus, plugin lifecycle, configuration, structured logging, service container, and runtime bootstrap.
- **Event Bus**: internal communication channel for telemetry, commands, state changes, and plugin coordination.
- **Plugin Manager**: discovery, loading, activation, and isolation boundaries for plugins.
- **Adapter Layer**: integrations for robotics middleware, protocols, hardware, simulators, and external services.
- **Capability Model**: a normalized description of what a robot, payload, sensor, or system can do.
- **UI Shell**: shared operator interface that hosts plugin-provided views and controls.
- **Plugins**: feature modules such as telemetry, maps, missions, payload control, diagnostics, and domain-specific tools.
- **Workspaces**: saved operational layouts, connected systems, plugin state, and mission context.

## Non-goals

NEXUS is not currently:

- a flight controller
- an autopilot
- a robotics middleware
- a replacement for every specialized control station

Specialized systems such as autopilots, robotics middleware, and domain-specific control tools are expected to remain important. NEXUS is intended to become an integration and operations layer around those systems, not a replacement for their core responsibilities.

## Early Roadmap

0. Project foundation
1. Core shell
2. Plugin SDK
3. Telemetry plugin
4. Map plugin
5. Mission plugin
6. ROS adapter
7. MQTT adapter
8. MAVLink adapter

## Current Status
NEXUS is in early development, but the headless core runtime milestones are implemented in `@nexus/core`. UI, adapters, and production-oriented workflows remain unimplemented.
