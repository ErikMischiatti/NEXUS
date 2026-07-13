---
name: nexus-plugin-contract-audit
description: Read-only audit skill for NEXUS plugin manifests, registration, lifecycle, dependency direction, adapter/UI boundaries, and contract tests.
---

# NEXUS Plugin Contract Audit

Use this skill for read-only audits of the NEXUS plugin surface.

## Default Mode

- Read-only by default.
- Do not modify files unless the user explicitly asks for edits.
- Focus on evidence, not assumptions.

## Audit Targets

- plugin manifest shape and normalization
- plugin registration and duplicate handling
- capability declarations and required services
- lifecycle order and failure handling
- dependency direction between core, plugins, UI, and adapters
- adapter and registry boundary behavior
- UI-side plugin view registry and snapshot boundary
- coupling between `core/` and any implementation-specific plugin code
- contract tests and supporting documentation

## What To Verify

1. Manifest contract.
   - Check required fields, optional fields, normalization, and mismatch handling.
2. Registration and registry behavior.
   - Check duplicate detection, state transitions, ordering, and error retention.
3. Capability and service contracts.
   - Check whether required capabilities/services are validated or only documented.
4. Lifecycle.
   - Check `onLoad`, `onStart`, and `onStop` sequencing and failure propagation.
5. Boundary direction.
   - Check that core depends on public plugin abstractions, not on plugin implementations.
   - Check that UI depends on snapshot and view contracts, not on core internals.
6. Adapter and UI registry boundaries.
   - Check for accidental cross-layer imports or runtime assumptions.
7. Tests and docs.
   - Check that tests cover the contract being claimed.
   - Check that docs match the current implementation.

## Reporting Format

Report findings as:

- severity
- file and line references
- facts
- risk
- recommendation

Classify findings by severity and keep facts separate from inferred risk.

## Constraints

- Do not rewrite architecture.
- Do not add new workflows.
- Do not claim a contract is enforced unless code or tests prove it.
- Cite files and lines for every material conclusion.
