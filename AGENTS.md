---
name: nexus-repository-guidelines
description: NEXUS project-specific guidance for working in the plugin-first robotics platform repository.
---

# NEXUS Repository Guidelines

## Scope

NEXUS is a plugin-first robotics operations platform. Keep changes small, local, and aligned with the existing split between headless core, browser UI, plugin examples, and future adapter work.

## Important Directories

- `core/`: headless runtime, plugin SDK, plugin manager, registry, discovery, loader, and core tests.
- `ui/`: browser Operator UI Shell, mock `RuntimeSnapshot` flow, UI plugin view registry, and UI tests.
- `examples/plugins/telemetry-demo/`: reference plugin package and descriptor used by tests and docs.
- `adapters/`: reserved for future integration boundaries. Do not move platform logic here.
- `docs/`: design and contract documents. Update when public behavior or architecture changes.
- `tests/`: reserved for repository-level tests and fixtures.

## Verified Commands

Run commands from the package directory that owns the code you changed.

Core:

- `cd core && npm run build`
- `cd core && npm test`
- `cd core && npm run typecheck`

UI:

- `cd ui && npm run build`
- `cd ui && npm test`
- `cd ui && npm run dev`
- `cd ui && npm run preview`

No lint command is currently verified in the repository manifests.

## Architecture Rules

- Preserve the plugin-first architecture.
- Keep `core/` free of UI concerns and plugin-specific implementation dependencies.
- Keep plugin contract logic in the public SDK surface, registry, loader, discovery, and manager layers.
- Preserve runtime boundaries: `core/` owns execution, `ui/` consumes snapshot-style data, and adapters remain a future integration layer.
- Keep `ui/` dependent on public runtime snapshot and plugin view abstractions, not on private core internals.
- Treat `examples/` as reference material and test fixtures, not as a place for core platform behavior.
- Treat `docs/` as the contract for current behavior. If public behavior changes, update the relevant docs in the same change.

## Directory Guidance

- `core/`: prefer minimal changes that preserve manifest validation, registry semantics, lifecycle order, and event/runtime contracts.
- `ui/`: keep mock data deterministic and keep the shell composition separate from plugin loading or core runtime execution.
- `examples/plugins/telemetry-demo/`: keep the example plugin SDK-only, small, and aligned with the current manifest and loader contract.
- `adapters/`: only introduce adapter code when the adapter boundary itself is being implemented.
- `docs/`: keep architecture docs and contract docs synchronized with shipped behavior.

## Change Policy

- Make the smallest coherent change that satisfies the request.
- Do not introduce new package-manager workflows, build steps, or architecture rules unless they are verified in this repository.
- Do not add plugin-specific dependencies to `core/`.
- Do not relax or bypass manifest validation, plugin registration rules, lifecycle order, or UI/runtime boundary contracts.
- Prefer using existing patterns, naming, and data flow over refactoring working code.

## Definition Of Done

A change is complete only when all of the following are true:

- the requested behavior is implemented;
- touched packages are built and tested with the verified commands above;
- relevant type-checking is run when `core/` or `ui/` TypeScript changes;
- public behavior changes are reflected in the relevant docs;
- architectural boundary checks still hold;
- `git diff --check` is clean;
- the final worktree state is understood and reported.
