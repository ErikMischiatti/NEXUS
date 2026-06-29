# Contributing to NEXUS

NEXUS is an early-stage open-source project. Contributions should help establish a clear, modular foundation for a robotics operations platform without overcommitting to runtime behavior before the core architecture is validated.

## Current Focus

The initial focus is project structure, scope, terminology, architecture documents, and design discussions. Runtime components, protocol integrations, and UI implementations will be introduced incrementally.

## Contribution Guidelines

- Keep changes scoped and easy to review.
- Prefer clear technical language over marketing language.
- Do not imply implemented functionality unless it exists in the repository.
- Document architectural decisions that affect extension points, plugin behavior, adapters, or operator workflows.
- Favor robot-agnostic abstractions over vehicle-specific assumptions.
- Treat UAV, UGV, USV, robotic arm, payload, sensor, and mission-module use cases as first-class design inputs.

## Development Expectations

Runtime code has not been introduced yet. When implementation begins, contributions should include focused tests for behavior that affects core contracts, adapters, plugins, or user-facing workflows.

## Issues and Proposals

Use issues to propose architecture changes, plugin concepts, adapter targets, and workflow requirements. Larger design changes should include enough context for maintainers and contributors to evaluate tradeoffs.
