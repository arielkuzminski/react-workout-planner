# TASK-008 Dynamic Exercise Logging

- Status: `done`

## Goal

Replace the fixed workout form with dynamic exercise entry and set logging.

## Why

The user needs to log only what was actually performed, without a forced full plan form.

## In Scope

- add exercise to session
- edit sets dynamically
- support weight and time entries

## Out of Scope

- progress analytics beyond inline context

## Implementation Notes

- Support recent exercise selection first.
- Keep inputs simple and fast on mobile.

## Acceptance Criteria

- User can add exercises and record sets without templates.
- Time-based and weight-based exercises both work.

## Test Plan

- `npm run build`
- manual logging smoke test

## Dependencies

- TASK-007

## Completion Notes

- Added dynamic exercise selection and editable weight/time set logging.
