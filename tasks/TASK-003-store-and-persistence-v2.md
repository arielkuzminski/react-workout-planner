# TASK-003 Store and Persistence v2

- Status: `done`

## Goal

Refactor Zustand persistence around `activeSession`, completed sessions, exercise library lookups, and template access.

## Why

The current store is too thin and only supports append-only historic sessions.

## In Scope

- store state and actions
- persisted schema v2
- selectors for recent exercises and exercise history

## Out of Scope

- page rewrites

## Implementation Notes

- Persist the full v2 state under the existing app key if feasible.
- Add actions for session lifecycle: start, resume, update, complete, abandon.
- Add selectors for last exercise result and recent exercise usage.

## Acceptance Criteria

- App can keep one active draft session.
- App can complete draft sessions into history.
- Exercise history is queryable by exercise id.

## Test Plan

- `npm run build`
- manual store smoke test through UI later tasks

## Dependencies

- TASK-002

## Completion Notes

- Rebuilt Zustand store around `activeSession` and `completedSessions`.
- Added persistence migration from legacy localStorage sessions.
