# tests/e2e

Playwright end-to-end tests for the LocalFiles browser workflows.

The current suite exercises the app shell and implemented PDF workflows,
including export result behavior, stale-output invalidation, clear/reset flows,
Split ZIP export, Reorder drag-and-drop, and Metadata Removal.

These tests are part of release validation alongside format, typecheck, lint,
and unit tests. They should preserve LocalFiles' local-first assumptions and keep
the no-external-request guarantee: no backend services, cloud uploads,
analytics, telemetry, accounts, or payments.
