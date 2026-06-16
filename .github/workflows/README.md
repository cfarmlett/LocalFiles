# .github/workflows

Reserved for future workflow definitions.

CI runs formatting, typechecking, linting, unit tests, and builds without product telemetry, analytics, cloud upload assumptions, account systems, or payment behavior.

Playwright E2E is intentionally not part of the first CI pass. When added, install browser dependencies explicitly and run `pnpm test:e2e` after the standard verification job remains stable.
