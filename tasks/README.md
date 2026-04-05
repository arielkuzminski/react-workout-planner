# Silka v2 Taskboard

This folder is the local taskboard for the `silka` v2 refactor.

## Ralph Loop

Each task is executed in the same loop:

1. Read the task file and impacted code.
2. Clarify implementation notes for the current state of the repo.
3. Implement the task.
4. Run the task test plan.
5. Record the result in `Completion Notes`.
6. Mark the task `done`.
7. Move to the next task.

Only one task should be `in_progress` at a time unless the current one is `blocked`.

## Statuses

- `todo`: not started
- `in_progress`: currently being implemented
- `blocked`: cannot continue without resolving a dependency or issue
- `done`: acceptance criteria and test plan passed

## Execution Order

1. `TASK-001-board-and-execution-model.md`
2. `TASK-002-domain-model-v2.md`
3. `TASK-003-store-and-persistence-v2.md`
4. `TASK-004-legacy-migration-and-template-mapping.md`
5. `TASK-005-routing-and-app-shell.md`
6. `TASK-006-home-and-session-entry.md`
7. `TASK-007-active-session-flow.md`
8. `TASK-008-dynamic-exercise-logging.md`
9. `TASK-009-exercise-history-context.md`
10. `TASK-010-progress-view-minimal.md`
11. `TASK-011-history-v2.md`
12. `TASK-012-import-export-compat.md`
13. `TASK-013-polish-and-regression-pass.md`

## Dependencies

- Tasks 002-004 define the data and persistence foundation.
- Tasks 005-009 define the new user flow.
- Tasks 010-012 adapt secondary surfaces to the new model.
- Task 013 closes regressions and cleanup.
