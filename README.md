# LocalDocs

Privacy-first document tools that run locally in the browser.

LocalDocs currently focuses on common PDF workflows for people who do not want
to upload sensitive files to unknown servers. The browser app has no backend,
accounts, analytics, telemetry, ads, trackers, or server upload path for the
implemented V1 workflows.

## Current V1 Features

Implemented and hardened:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

V1 polish still planned:

- ZIP export for Split PDF multi-output downloads
- Privacy page and processing-model explanation
- Accessibility review and improvements
- Error-message and success-message consistency review
- Documentation alignment

Completed V1.5 polish includes:

- Persistent export result panel
- Collapsible feature content
- Clear loaded document
- Reset Page Order
- Drag-and-drop page reordering
- Reorder Pages label cleanup
- Split custom-range page-count validation
- Metadata Removal suffix idempotency

Remaining V1.5 backlog includes Merge drag-and-drop reordering, broader
filename hygiene, Reorder Pages order-expression input, Split ZIP export, and
final feedback-release review.

Browser redaction is intentionally excluded from V1. The current browser-only
architecture does not meet the project's definition of successful redaction, and
offering partial redaction would create false confidence.

## Development

```bash
pnpm install
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

See `docs/architecture/vision.md`, `docs/product/v1-product-spec.md`, and
`docs/security/threat-model.md` for the product direction, roadmap, and trust
model.
