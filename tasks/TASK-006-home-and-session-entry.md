# TASK-006 Home and Session Entry

- Status: `done`

## Goal

Build the new home screen with `Start session`, `Continue session`, recent exercises, and template shortcuts.

## Why

The new product needs a low-friction entry point more like a private capture tool than a workout picker.

## In Scope

- home page layout
- continue session state
- recent exercise shortcuts
- optional A/B/C template starts

## Out of Scope

- detailed session editing

## Implementation Notes

- Prioritize one-tap start and resume.
- Surface templates as optional shortcuts, not required choices.

## Acceptance Criteria

- Home shows the right primary action depending on active session presence.
- Templates are visible but secondary.

## Test Plan

- `npm run build`
- manual home screen smoke test

## Dependencies

- TASK-005

## Completion Notes

- Added new home screen with start, continue, templates, recent exercises, and sample data.
