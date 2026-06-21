# LocalFiles Vision

## Purpose

LocalFiles is a privacy-first document utility site focused on common PDF workflows that people often need but do not necessarily trust random websites to perform.

The core promise is simple:

> Useful document tools that run locally whenever possible, with clear privacy expectations and no surprise uploads.

LocalFiles should feel boring, serious, and trustworthy. It should be suitable for individuals, small businesses, law firms, accountants, medical offices, consultants, and anyone else handling documents they would rather not send to an unknown server.

## Product Philosophy

LocalFiles should be built around a few durable principles:

1. **Local-first by default**
   Files should stay on the user’s device whenever technically feasible. Browser-based processing should be preferred over server-side processing.

2. **No surprise uploads**
   If a feature ever requires server-side processing, the user must be told clearly before any file leaves their device.

3. **Generous free utility**
   The free version should be genuinely useful, not crippled into uselessness.

4. **Premium convenience, not coercion**
   Paid features should focus on batch processing, saved workflows, larger jobs, automation, support, or team convenience rather than artificial friction.

5. **No ads or dark patterns**
   Trust is central to the product. Advertising, deceptive buttons, confusing downloads, fake urgency, and privacy-hostile analytics are inconsistent with the brand.

6. **Explainable privacy**
   Users should be able to understand what happens to their files without reading a legal document.

7. **Boring is good**
   The site should look professional, calm, and competent rather than flashy or gimmicky.

8. **Complete workflows in one place**
   Favor workflows that let users inspect documents and finish a task within
   LocalFiles. Page-based tools should not require coordination with an
   external PDF viewer.

## Initial Target Users

LocalFiles is intended for people who need simple document manipulation but are uneasy about uploading sensitive files to random websites.

Likely early users include:

- Individuals handling tax, legal, mortgage, insurance, or medical documents
- Small law firms
- Accountants and bookkeepers
- Consultants
- Administrative staff
- Small business owners
- Privacy-conscious technical users

The product should not initially try to serve large enterprises with complex compliance procurement needs, though the architecture should avoid decisions that would make that impossible later.

## Current V1 Scope

The first useful version focuses on a small set of local PDF tools. These V1
workflows are implemented and hardened:

- Merge PDFs
- Split PDF by page range
- Reorder pages
- Rotate pages
- Delete pages
- Metadata removal

Completed V1.5/V1 polish includes ZIP export for Split PDF multi-output
downloads, persistent export results, Clear actions, collapsible workflow
sections, Reorder Pages reset/drag-and-drop polish, Split validation polish, and
Metadata Removal filename-suffix idempotency.

The current privacy and processing behavior is documented in
[`PRIVACY.md`](../../PRIVACY.md). Current release status is summarized in
[`docs/RELEASE_HISTORY.md`](../RELEASE_HISTORY.md), and future direction lives
in [`ROADMAP.md`](../../ROADMAP.md).

Browser redaction is intentionally excluded from V1. The completed redaction
research found that the current browser-only stack cannot satisfy the project's
definition of successful redaction, and a partial implementation would create
false confidence.

The first version does not need:

- User accounts
- Subscriptions
- Cloud storage
- Team management
- Mobile apps
- AI features
- OCR
- E-signatures
- Complex document management
- Enterprise admin features
- Browser redaction

Those may be considered later, but they should not distract from the initial goal: prove that LocalFiles can provide useful, trustworthy, local-first PDF tools.

## Technical Direction

The application should initially be a browser-based web app using TypeScript.

The architecture should separate:

- UI and user interaction
- Core document workflow logic
- PDF-processing adapters
- Tests and fixtures
- Documentation and security decisions

The rest of the app should depend on stable internal interfaces rather than directly depending on a specific PDF library wherever possible.

A rough structure:

```text
apps/web        - main web application
packages/core   - pure business logic and shared types
packages/pdf    - PDF adapter interfaces and implementations
packages/ui     - reusable UI components
packages/config - shared TypeScript, lint, and test config
tests/e2e       - browser-level tests
docs            - planning, architecture, investigations, security, and history
```

Core business logic should be deterministic, well-tested, and independent of the browser where possible.

PDF processing should be isolated behind adapter interfaces so that implementation details can change later.

The current PDF adapter boundary owns metadata reading, splitting, merging,
reordering, rotating, page deletion, and supported metadata removal. Browser app
code should continue to call the adapter rather than importing PDF libraries
directly.

## Privacy and Security Posture

LocalFiles should assume users may process sensitive documents.

Security and privacy expectations:

- Do not upload documents unless explicitly required and clearly disclosed.
- Do not add analytics that track document names, document contents, or detailed user behavior.
- Do not log file contents.
- Do not retain documents without explicit user action.
- Avoid unnecessary third-party scripts.
- Keep dependencies limited and reviewable.
- Treat redaction as high risk and avoid unsafe “fake redaction.”
- Make privacy claims technically accurate.

For current local workflows, the processing model is:

```text
User PDF -> Browser memory -> Local processing -> Download
```

There is no upload step in this model.

The product should never imply more security than it actually provides.

## Monetization Direction

The likely business model is:

- Free local browser tools for common individual use
- Premium paid features for convenience, scale, and workflow efficiency

Possible premium features later:

- Batch processing
- Larger file workflows
- Saved presets
- Desktop app
- Team features
- Priority support
- Advanced automation
- Private hosted processing for users who explicitly opt in
- Compliance-oriented offerings for professional offices

The free tier should build trust. Premium should feel earned.

## Open Source Direction

Open sourcing the project is likely attractive because it supports trust, auditability, and adoption.

However, open source does not automatically prove that the deployed site is running the published code. If LocalFiles leans on open source as part of its trust strategy, it should eventually consider:

- Reproducible builds
- Public release artifacts
- Signed releases
- Independent audits
- Clear deployment transparency
- Simple self-hosting instructions

This does not need to be solved in the first version, but early architecture should avoid making it impossible.

## Non-Goals for v0.1

LocalFiles v0.1 should not attempt to be:

- Google Drive
- Dropbox
- DocuSign
- Adobe Acrobat
- A full document management system
- An AI document analysis platform
- An enterprise compliance platform
- A file hosting service

The first milestone is narrower:

> A trustworthy local-first PDF utility that performs a few common tasks well.

## Success Criteria for Early Development

The early project is successful if:

- A user can open the site and understand the privacy model quickly.
- Basic PDF tasks work locally in the browser.
- The codebase is organized enough for future contributors to understand.
- The app has tests for core logic.
- Security and privacy assumptions are documented.
- The project can be run locally by a developer without special knowledge.
- The product feels credible rather than gimmicky.

## Guiding Question

When making product or architecture decisions, ask:

> Does this make LocalFiles more trustworthy, useful, and maintainable without adding unnecessary complexity?

If the answer is no, defer it.
