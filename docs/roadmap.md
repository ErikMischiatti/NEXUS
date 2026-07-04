# Roadmap

This roadmap reflects the current implementation status of NEXUS. It keeps the phase structure intentionally simple.

## Completed

### Phase 0: Project Foundation

Define the initial repository structure, documentation, project scope, contribution expectations, and architectural vocabulary.

Status:

- Completed.

### Phase 1: Core Shell

Implement the headless in-process core runtime and the minimum service boundaries needed to host future plugins, adapters, configuration, workspace state, and internal events.

Status:

- Completed in `@nexus/core` as a headless, in-process runtime shell.
- Event bus, plugin lifecycle, configuration, logging, service container, and runtime bootstrap are in place.

### Phase 2: Plugin SDK

Define the public plugin SDK, manifest validation, local descriptor discovery, registry behavior, loader semantics, and example plugin coverage for the headless core.

Status:

- Completed in `@nexus/core`, `docs/`, and `examples/`.
- The plugin platform now includes the SDK contracts, registry, discovery, loader, and lifecycle integration tests.

## Planned

### Phase 3: Operator UI Shell

Create the initial operator-facing shell for composing plugins and workspace views.

Success criteria:

- The shell can host plugin-provided views and basic layout regions.
- The UI remains decoupled from specific robots and middleware stacks.

### Phase 4: Adapter Ecosystem

Add the first adapter integrations for robotics middleware and related external systems.

Success criteria:

- Initial adapter integrations can map external data into normalized platform concepts.
- Adapter-specific behavior remains isolated from the core and plugin contracts.

### Phase 5: Mission Workspace

Introduce workspace concepts for mission-focused operator layouts, saved context, and repeatable workflows.

Success criteria:

- Workspaces can represent mission context without hard-coding a single robot type.
- Workspace state can be restored and composed from plugins.

## Future Phases

Future phases will extend the platform after the operator shell, adapters, and workspace model are established.

Potential areas include:

- additional adapters
- mission-specialized workflows
- fleet coordination features
- plugin ecosystem expansion
- packaging and distribution improvements
