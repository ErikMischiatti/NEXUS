---
name: nexus-verification-before-completion
description: NEXUS verification gate skill for selecting and running the smallest relevant build, test, lint, typecheck, and diff checks before completion.
---

# NEXUS Verification Before Completion

Use this skill as the final verification gate for NEXUS changes.

## Goal

Verify the actual diff before saying a task is complete.

## Operating Rules

- Analyze the effective diff first.
- Select checks based on the files that changed.
- Prefer focused verification over generic test runs.
- Run the smallest build, test, lint, and type-check commands that cover the modified area.
- Verify architectural and documentation contracts when behavior changes.
- Always run `git diff --check`.
- Always inspect the final worktree state.
- Do not mark work complete unless the relevant verification actually passed.

## Selection Heuristics

- `core/` TypeScript changes:
  - run `cd core && npm run build`
  - run `cd core && npm test`
  - run `cd core && npm run typecheck`
- `ui/` TypeScript or React changes:
  - run `cd ui && npm run build`
  - run `cd ui && npm test`
  - run `cd ui && npm run dev` only when runtime behavior needs a local smoke check
- Example plugin or contract changes:
  - run the most direct package or focused tests that cover the contract
- Documentation-only changes:
  - verify the updated docs against the current code and contract, then run `git diff --check`

## Boundary Checks

- Confirm that public behavior changes are reflected in docs.
- Confirm that core/plugin/UI boundaries still match the repository architecture.
- Confirm that manifest, loader, registry, and lifecycle contracts still align with the tests.

## Completion Criteria

Do not declare completion until all applicable items are true:

- the diff was reviewed;
- the relevant checks ran successfully, or any skipped check is explicitly justified;
- contract and documentation impact were checked;
- `git diff --check` passed;
- the final worktree state was checked and reported.

## Failure Handling

- Report failing commands exactly.
- Report skipped checks and the reason for skipping them.
- Report checks that could not be run.
- If verification is incomplete, say so directly.
