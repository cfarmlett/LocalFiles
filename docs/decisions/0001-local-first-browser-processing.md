# ADR 0001: Local-First Browser Processing

## Status

Accepted

## Context

LocalFiles is intended to provide useful PDF utilities for people handling documents they may not want to upload to a random website. Likely users include individuals, small businesses, professional offices, and privacy-conscious technical users.

The project philosophy favors a public-service free tier, strong privacy posture, plain explanations, no dark patterns, no ads, no telemetry, and no surprise uploads. Premium features may later focus on batch processing, hosted convenience, saved workflows, automation, support, or team needs.

The first product architecture needs a default processing model before PDF features are implemented.

## Decision

LocalFiles will default to local-first browser processing for document workflows whenever technically feasible.

Selected files should remain on the user's device and be processed in the browser by default. The app should not require a backend, user account, analytics service, telemetry pipeline, or file upload path for local workflows.

PDF implementation details should be isolated behind internal adapter interfaces so the app can evaluate libraries such as `pdf-lib`, PDF.js, or WASM tools without coupling product code to one backend.

If a future feature requires server-side processing, it must be opt-in and clearly explained before any file leaves the user's device.

## Consequences

Positive consequences:

- Users can understand the basic privacy model.
- Sensitive files avoid routine server exposure.
- The free tier can provide useful public-service functionality without accounts.
- The architecture stays simpler early because no backend is required for core workflows.
- Open source review becomes more meaningful because local behavior can be inspected.

Tradeoffs and costs:

- Browser memory, CPU, and file-size limits may constrain large jobs.
- Some PDF operations may be slower or less capable than server-side tooling.
- Browser compatibility and PDF library behavior need careful testing.
- Redaction remains high risk and must not be marketed before it is technically safe.
- Premium hosted convenience features will require a separate, explicit trust model.

## Alternatives Considered

### Server-First Processing

All files could be uploaded to a backend for processing. This would simplify some PDF operations and make batch workflows easier to control, but it conflicts with the main privacy promise and creates immediate retention, logging, access control, and infrastructure risks.

### Hybrid Processing By Default

The app could decide automatically whether to process locally or upload based on file size or feature complexity. This may be convenient, but it risks surprise uploads and makes the privacy model harder for users to understand.

### Desktop App First

A desktop app could offer stronger local processing control and larger-file workflows, but it adds distribution, updates, signing, and platform support work before the web product has proven demand.

## Future Implications

- Product copy must stay technically accurate about when files are local.
- Future server-side features need separate documentation for upload, retention, deletion, logging, and support access.
- Hosted premium features should be additive convenience, not coercive limitations on the local free tier.
- Dependency choices for PDF processing should remain reviewable and isolated.
- Architecture decisions should continue favoring simple, explicit boundaries over hidden automation that weakens user trust.
