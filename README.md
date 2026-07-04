# NEXUS

NEXUS is a plugin-first robotics operations platform for heterogeneous autonomous systems. The repository currently implements a headless core runtime, a public plugin platform, and the first browser-based operator UI shell foundation. Adapters are still out of scope.

## What Exists Now

### Core Capabilities

- headless in-process runtime bootstrap
- structured event bus
- configuration loading and validation
- logging
- service container
- lifecycle orchestration for the core runtime
- runtime integration tests

### Plugin Platform Capabilities

- public plugin SDK contracts
- manifest validation
- plugin registry
- local descriptor discovery
- local plugin loader
- plugin lifecycle management through the plugin manager
- example telemetry plugin package
- browser-based operator UI shell foundation
- end-to-end plugin lifecycle coverage in tests

## What Is Not Implemented Yet

- full operator UI shell feature set
- ROS, MQTT, and MAVLink adapters
- plugin marketplace behavior
- distributed plugin execution
- sandboxing
- dependency resolution
- semver enforcement for plugin compatibility
- production security guarantees

## Project Maturity

NEXUS is still early-stage. The core runtime, plugin extensibility layer, and initial browser operator shell are implemented and tested, but the full operator application and adapter ecosystem remain future work.

## Documentation

- [System Design](docs/system-design.md)
- [Architecture](docs/architecture.md)
- [Core Design](docs/core-design.md)
- [Plugin SDK Design](docs/plugin-sdk-design.md)
- [Roadmap](docs/roadmap.md)
- [Vision](docs/vision.md)

## Core Design Principles

- plugin-first
- robot-agnostic
- adapter-based integration
- capability-driven UI
- middleware-independent architecture
- operator-centric workflows
