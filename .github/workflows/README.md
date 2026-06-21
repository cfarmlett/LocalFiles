# .github/workflows

[`ci.yml`](ci.yml) runs formatting, typechecking, linting, unit tests,
production builds, and Playwright E2E tests on pushes and pull requests without
product telemetry, analytics, cloud upload assumptions, account systems, or
payment behavior.

The Playwright job installs only Chromium because the current E2E configuration
targets desktop Chromium. The verification and E2E jobs are separate checks so
both can be required independently by branch protection.
