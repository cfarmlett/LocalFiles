# LocalDocs

Privacy-first PDF tools that run locally in the browser.

LocalDocs currently focuses on common PDF workflows for people who do not want
to upload sensitive files to unknown servers. The browser app has no backend,
accounts, analytics, telemetry, ads, trackers, or server upload path for the
implemented V1 workflows.

For the implemented workflows, documents remain in browser memory and are not
uploaded to a LocalDocs document-processing server. See the
[privacy and processing model](docs/privacy-and-processing.md) for the exact
current behavior and limits.

## Project Status

The current LocalDocs version is the `1.5.0-rc1` release candidate. Final
validation and early feedback are underway. It is prerelease software, not a
final `1.5.0` release.

## Implemented Features

Implemented and hardened:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

Implemented workflow polish includes:

- Persistent export result panel
- Collapsible feature content
- Clear loaded document
- Reset Page Order
- Drag-and-drop page reordering
- Reorder Pages label cleanup
- Split custom-range page-count validation
- Metadata Removal suffix idempotency
- ZIP export for Split PDF multi-output downloads
- ZIP export stale-output and ZIP32 hardening
- Pre-release polish for ZIP cleanup, current-section announcements, Delete
  Pages wording, and Remove Metadata terminology

Ideas in product documents and backlogs are exploratory. They are not committed
features or promised release content.

Browser redaction is intentionally excluded from V1. The current browser-only
architecture does not meet the project's definition of successful redaction, and
offering partial redaction would create false confidence.

## Requirements

- Node.js 24
- pnpm 11.6.0

## Development

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch, review, testing, privacy,
and dependency expectations. Additional context is in the
[project vision](docs/architecture/vision.md),
[V1 product specification](docs/product/v1-product-spec.md), and
[threat model](docs/security/threat-model.md).

## Security

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability. A private
reporting process will be established before public release; do not place
exploit details or sensitive information in public issues.

## Versioning and Releases

LocalDocs follows semantic versioning. The root `package.json` version is the
authoritative product version; private workspace packages may remain at
`0.0.0` because they are not published independently.

Release tags use the root version prefixed with `v`. For example, product
version `1.5.0-rc1` is tagged `v1.5.0-rc1`, and the final release is tagged
`v1.5.0`. Release candidates must point to a commit that passes the same CI
checks required for `main`.

Notable release changes are recorded in [CHANGELOG.md](CHANGELOG.md).

## License

LocalDocs is licensed under the [Apache License 2.0](LICENSE).
