# docs/decisions

Architecture decision records for LocalFiles.

Use this folder to record meaningful decisions and tradeoffs as the product evolves. Early decisions should keep the codebase boring, local-first, and free of backend, cloud, analytics, telemetry, account, payment, and PDF implementation commitments until they are justified.

Current ADRs:

- [`0001-local-first-browser-processing.md`](0001-local-first-browser-processing.md)
  — local-first browser processing is the default architecture.
- [`0002-browser-redaction-not-in-v1.md`](0002-browser-redaction-not-in-v1.md)
  — browser redaction is excluded from V1 because the current stack cannot meet
  the required trust standard.

Use the next sequential four-digit number for a decision that changes or
clarifies the durable architecture. Product ideas belong in the feature backlog;
unresolved research belongs in `docs/investigations`.
