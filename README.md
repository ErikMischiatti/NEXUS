# NEXUS

NEXUS is a plugin-first robotics operations platform for heterogeneous autonomous systems. The repository currently implements a headless core runtime, a public plugin platform, and a completed browser-based Operator UI Shell built on mock `RuntimeSnapshot` data. Adapters are still out of scope.

## Current Status

- Phase 3, the Operator UI Shell, is complete.
- The UI remains mock-only and does not connect to the core runtime yet.
- The next step is a review checkpoint before Phase 4 adapter work begins.

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
- end-to-end plugin lifecycle coverage in tests

### Operator UI Shell Capabilities

- browser-first Operator UI Shell
- dockable workspace prototype
- simplified UI ownership model
- shared `RuntimeSnapshot` model
- mock `RuntimeSnapshotProvider`
- mock runtime adapter for deterministic UI updates
- UI-side plugin view registry
- first Telemetry Demo plugin view
- mock-only data flow from snapshot to UI

## What Is Not Implemented Yet

- ROS, MQTT, and MAVLink adapters
- real runtime communication
- WebSocket, IPC, or backend bridges
- robot control
- plugin execution in the browser
- plugin marketplace behavior
- distributed plugin execution
- sandboxing
- dependency resolution
- semver enforcement for plugin compatibility
- production security guarantees

## Project Maturity

NEXUS is still early-stage. The core runtime, plugin extensibility layer, and browser Operator UI Shell are implemented and tested, but the adapter ecosystem and broader operator workflow remain future work.

## UI Shell

The UI shell runs as a browser-first React application in `ui/`.

Run the UI:

```bash
cd ui
npm install
npm run dev
```

Test the UI:

```bash
cd ui
npm run build
npm test
```

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
