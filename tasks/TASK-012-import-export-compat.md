# TASK-012 Import Export Compatibility

- Status: `done`

## Goal

Adapt import/export so backups and legacy imports remain usable with the v2 model.

## Why

Local-first apps need a credible backup and recovery path.

## In Scope

- v2 import/export shape
- legacy import compatibility
- clearer preview and feedback

## Out of Scope

- cloud sync

## Implementation Notes

- Favor importing old data into v2 completed sessions.
- Keep JSON support primary; keep CSV as basic compatibility.

## Acceptance Criteria

- User can import valid backup data into v2.
- User can export usable backup data from v2.

## Test Plan

- `npm run build`
- manual import/export smoke test

## Dependencies

- TASK-003
- TASK-004

## Completion Notes

- Import page now supports legacy JSON/CSV reads and current JSON/CSV exports.
