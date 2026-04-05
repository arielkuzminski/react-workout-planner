# TASK-002 Domain Model v2

- Status: `done`

## Goal

Replace the plan-bound session types with capture-first session, entry, set, exercise library, and template types.

## Why

The current type system assumes a full A/B/C workout form, which blocks a dynamic logging flow.

## In Scope

- new domain interfaces in `src/types`
- template-compatible shapes
- legacy types only as migration inputs when needed

## Out of Scope

- store implementation
- UI updates

## Implementation Notes

- Introduce `Session`, `SessionEntry`, `SetEntry`, `ExerciseLibraryItem`, `WorkoutTemplate`.
- Model `status` on sessions.
- Keep support for `weight` and `time` exercise units.

## Acceptance Criteria

- Domain types support active draft sessions and completed sessions.
- Templates are optional helpers, not core workflow.
- Types are sufficient for history, progress, and import/export.

## Test Plan

- `npm run build`

## Dependencies

- TASK-001

## Completion Notes

- Added v2 session, entry, set, template, and exercise library types.
- Preserved legacy session shapes only for migration and import.
