# TASK-005 Routing and App Shell

- Status: `done`

## Goal

Refactor the app shell and routes so the default flow starts at a capture-first home screen.

## Why

The current app opens on workout selection, which is no longer the primary interaction model.

## In Scope

- route structure
- navigation labels
- shell consistency for mobile-first flow

## Out of Scope

- detailed screen internals

## Implementation Notes

- Home should be the default route.
- Keep routes for history, progress, and import/export.
- Old plan-based workout route can be removed or repurposed once replaced.

## Acceptance Criteria

- Default route opens the new home flow.
- Navigation exposes the v2 surfaces.

## Test Plan

- `npm run build`
- manual route navigation check

## Dependencies

- TASK-003
- TASK-004

## Completion Notes

- Replaced plan-first routing with capture-first home/session routes.
- Updated the shell navigation to `Start`, `Historia`, `Progres`, and `Import / Export`.
