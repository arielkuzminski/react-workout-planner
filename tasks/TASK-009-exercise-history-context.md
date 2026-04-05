# TASK-009 Exercise History Context

- Status: `done`

## Goal

Show last result, previous result, and a lightweight suggestion while logging an exercise.

## Why

Fast context during logging is more valuable than a separate heavy dashboard.

## In Scope

- exercise inline context
- lightweight progression suggestion from history

## Out of Scope

- complex recommendation engines

## Implementation Notes

- Use completed session history from the v2 store.
- Suggestions should degrade gracefully when no history exists.

## Acceptance Criteria

- Logging UI shows prior context when available.
- Empty-state behavior is clear when there is no history.

## Test Plan

- `npm run build`
- manual check with and without prior exercise history

## Dependencies

- TASK-003
- TASK-008

## Completion Notes

- Session logging now shows previous performance context and history-based progression hints.
