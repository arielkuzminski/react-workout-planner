# TASK-013 Polish and Regression Pass

- Status: `done`

## Goal

Close regressions, remove dead code, and finish the rollout with final QA.

## Why

The refactor changes the product center of gravity and will leave cleanup work behind.

## In Scope

- dead route/component cleanup
- copy polish
- empty states
- final build and regression checks

## Out of Scope

- new roadmap items

## Implementation Notes

- Remove plan-first dead paths once replacement flow is stable.
- Keep templates and import/export reachable.

## Acceptance Criteria

- Build passes.
- No broken routes remain.
- Obvious dead code from the old flow is removed.

## Test Plan

- `npm run build`
- full manual smoke test across major routes

## Dependencies

- TASK-005
- TASK-006
- TASK-007
- TASK-008
- TASK-009
- TASK-010
- TASK-011
- TASK-012

## Completion Notes

- Removed stale helper files from the old model and verified the refactor with a clean production build.
