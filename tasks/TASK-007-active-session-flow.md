# TASK-007 Active Session Flow

- Status: `done`

## Goal

Implement an active draft session that autosaves and can be resumed after refresh.

## Why

This is the core product behavior that replaces self-messaging.

## In Scope

- active session page
- draft lifecycle
- complete and abandon actions

## Out of Scope

- advanced analytics

## Implementation Notes

- Session draft should exist as soon as the user starts.
- Draft must survive refresh through store persistence.

## Acceptance Criteria

- User can start, resume, complete, and abandon a session.
- Refresh preserves the current draft state.

## Test Plan

- `npm run build`
- manual draft/resume/complete smoke test

## Dependencies

- TASK-003
- TASK-005
- TASK-006

## Completion Notes

- Added persisted active draft sessions with completion into history.
