# Vision

NEXUS exists to explore a modular foundation for robotics operations that are no longer limited to a single vehicle type, protocol, or control interface.

Many existing operator tools are built around a specific platform category, especially UAV Ground Control Stations. These tools are valuable for flight planning, telemetry, map interaction, and vehicle command workflows, but they often assume a vehicle model, mission structure, and communication stack that does not generalize cleanly to heterogeneous autonomous systems.

Modern robotics teams may need to operate UAVs, UGVs, USVs, robotic arms, mobile manipulators, sensors, payloads, simulation environments, and external mission services together. They may also need to integrate ROS, MQTT, MAVLink, proprietary APIs, cloud services, and custom mission modules in the same operational workflow.

NEXUS is intended to address this by treating the operator environment as a modular platform rather than a fixed control station.

## How NEXUS Differs from Traditional UAV Ground Control Stations

Traditional UAV Ground Control Stations are usually centered on aircraft operations. Their primary concepts are often vehicles, maps, flight modes, mission plans, telemetry streams, and command interfaces tied to aerial robotics.

The planned NEXUS scope is broader:

- It should be robot-agnostic rather than UAV-only.
- It should use adapters to connect different middleware, protocols, and systems.
- It aims to expose capabilities instead of assuming a fixed vehicle model.
- It should treat UI features as plugins that can be loaded for specific missions and systems.
- It is intended for mixed operations where multiple robots, payloads, and tools may be active at once.

The goal is not to replace every specialized control station. The goal is to define and eventually implement a modular operations platform that can host domain-specific tools while sharing common infrastructure for state, events, plugins, workspaces, and operator workflows.

## Early Direction

The first phase of NEXUS is intentionally conservative. The project is defining vocabulary, scope, architecture, and extension boundaries before implementing runtime behavior. This should make later implementation work more coherent and reduce the risk of hard-coding assumptions that only fit one robot class or middleware stack.
