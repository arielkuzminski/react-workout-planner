# TASK-004 Legacy Migration and Template Mapping

- Status: `done`

## Goal

Map existing A/B/C plans into optional templates and migrate legacy persisted sessions into the v2 model.

## Why

Existing user data must survive the refactor, and current plans still need to exist as helpers.

## In Scope

- template mapping
- persisted data migration path
- legacy import compatibility

## Out of Scope

- new session UI

## Implementation Notes

- Keep A/B/C names and exercise definitions as templates.
- Convert old `WorkoutSession` records to completed v2 sessions.
- Avoid destructive migration steps.

## Acceptance Criteria

- Existing data loads into the new app shape.
- A/B/C are available as templates after migration.

## Test Plan

- `npm run build`
- manual migration smoke test using sample data/local storage later tasks

## Dependencies

- TASK-002
- TASK-003

## Completion Notes

- Converted A/B/C definitions into optional templates.
- Added normalization paths for legacy JSON and CSV imports.
