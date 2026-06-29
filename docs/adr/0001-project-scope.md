# ADR 0001: Project Scope

## Status

Accepted

## Context

Robotics operations increasingly involve heterogeneous autonomous systems rather than a single vehicle class. Teams may need to operate UAVs, UGVs, USVs, robotic arms, sensors, payloads, simulators, and mission services together.

Traditional UAV Ground Control Stations are often optimized for aerial vehicle workflows and autopilot integrations. While those workflows are important, they do not fully cover the broader need for a modular operations environment that can integrate many robot types, protocols, and mission tools.

## Decision

NEXUS will be scoped as a modular robotics operations platform, not a UAV-only Ground Control Station.

The project will prioritize:

- plugin-first platform design
- robot-agnostic abstractions
- adapter-based integration
- middleware-independent core architecture
- capability-driven UI behavior
- operator-centric workflows for heterogeneous systems

UAV support is an important use case, especially through future MAVLink integration, but it will not define the entire platform model.

## Consequences

The core architecture must avoid assumptions that only apply to aircraft, flight controllers, or aerial missions.

Adapters will be responsible for translating external protocols and middleware into NEXUS platform concepts.

Plugins should react to declared capabilities rather than hard-coded vehicle categories whenever practical.

The project may initially move more slowly than a UAV-specific application because it must establish broader extension boundaries and abstractions. This tradeoff is accepted to support long-term modularity and heterogeneous operations.
