# Contributing to LocalFiles

LocalFiles welcomes focused changes that preserve its privacy-first,
browser-local processing model.

## Development Setup

Use Node.js 24 and pnpm 11.6.0. From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

See the [developer setup guide](docs/setup/developer-setup.md) for additional
details.

## Branch and Pull Request Workflow

1. Create a short-lived feature or fix branch from `main`.
2. Keep the change focused and update tests and documentation with the code.
3. Run the required validation commands before opening a pull request.
4. Open a pull request that explains the problem, the solution, and any privacy
   or security impact.
5. Address review feedback with additional commits. Maintainers merge only
   after required checks and review are complete.

`main` is intended to remain deployable. Do not commit generated build output,
test results, credentials, private documents, or real user data.

## Required Validation

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Add or update unit tests for logic changes and E2E coverage for material user
workflow changes. Keep fixtures small, synthetic, and safe to publish.

## Review Expectations

Reviewers look for correctness, clear tests, maintainable scope, accessible UI,
and consistency with documented behavior. Privacy- or security-sensitive
changes may require additional review even when tests pass.

Review lifecycle-sensitive changes for the following:

- transient browser state does not retain stale outputs;
- object URLs are cleaned up and revoked;
- errors are truthful and specific;
- privacy-sensitive behavior does not regress; and
- generated or downloadable results are invalidated when source inputs change.

## Privacy, Security, and Dependencies

Current document workflows must remain local to the browser. A contribution
must clearly disclose any new:

- network request or upload path;
- external service, remote API, script, font, or CDN asset;
- analytics, telemetry, advertising, tracking, or data collection;
- browser persistence or logging of document-derived information; or
- runtime dependency, especially one that parses untrusted documents.

Explain why a new dependency is necessary, whether it runs in the browser, its
network or storage behavior, and how it affects the dependency tree. Do not add
privacy-affecting behavior incidentally.

Read the [security policy](SECURITY.md),
[threat model](docs/security/threat-model.md), and
[privacy and processing model](PRIVACY.md) before changing
document handling or dependencies.
