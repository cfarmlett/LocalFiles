# LocalFiles Threat Model

## Scope

This document covers realistic early risks for LocalFiles as a local-first browser PDF utility. It focuses on common users handling sensitive personal, legal, tax, medical, business, or administrative documents.

It does not assume protection against compromised devices, malicious browser extensions, targeted nation-state attackers, or users who intentionally share their own files.

## Assets To Protect

- Document contents
- Document filenames and metadata
- Page selections, redaction regions, and workflow choices
- Generated output files
- User privacy expectations
- LocalFiles source code, release artifacts, and dependency chain
- Future account, billing, support, or hosted-processing data if those features are added

## Trust Boundaries

- User device and browser
- LocalFiles application code loaded in the browser
- Third-party dependencies bundled into the app
- Browser APIs used for file selection, download, storage, or workers
- Future optional hosted services, if introduced
- Future payment, support, or account providers, if introduced

The current architecture should treat files selected by users as local browser data. No server-side trust boundary should be crossed unless a future feature makes that explicit before any upload occurs.

## Attack Surfaces

- Client-side PDF parsing and manipulation code
- Malformed or hostile PDF files
- Browser file handling and download flows
- Dependency vulnerabilities or malicious package updates
- Cross-site scripting through filenames, metadata, or generated document text
- Build and release pipeline compromise
- Documentation or UI copy that overstates privacy guarantees
- Future hosted processing endpoints
- Future account, payment, support, or analytics-like integrations

## Privacy Risks

- Accidental file upload caused by unclear UI or implementation mistakes
- Logging document names, metadata, page text, or workflow details
- Telemetry that reveals sensitive behavior even without file contents
- Third-party scripts observing user activity
- Browser storage retaining documents or derived data unexpectedly
- Users misunderstanding whether a feature is local or server-side

## Dependency Risks

PDF tooling is a high-risk dependency area because parsers handle complex, attacker-controlled input. Risks include:

- Vulnerabilities in PDF libraries, WASM modules, or transitive packages
- Large dependency trees that are hard to audit
- Packages that add network behavior, tracking, or unexpected side effects
- Supply-chain compromise during install, build, or release

Mitigations should include limiting dependencies, reviewing PDF-related packages carefully, pinning versions through the lockfile, keeping dependencies updated, and isolating PDF adapters behind internal interfaces.

## Future Server-Side Feature Risks

LocalFiles may later add premium hosted convenience, batch processing, support, or workflow features. Those features would create new risks:

- Files or metadata leaving the user's device
- Retention of uploaded or generated documents
- Access control mistakes
- Operational logging of sensitive data
- Payment or account data exposure
- Support workflows that request too much user information

Any server-side feature should be opt-in, clearly labeled before upload, technically separated from local-only workflows, and documented with retention and deletion behavior.

## Mitigations

- Prefer local browser processing whenever feasible.
- Do not add analytics, telemetry, ads, trackers, or dark-pattern scripts.
- Do not upload files unless a feature clearly requires it and the user explicitly chooses it.
- Keep UI copy plain about what happens to files.
- Treat PDF redaction as high risk and avoid fake redaction.
- Do not ship browser redaction unless the implementation can satisfy the
  project's definition of successful redaction.
- Avoid rendering untrusted filenames or metadata as HTML.
- Keep PDF processing behind adapter interfaces.
- Keep dependencies small, reviewable, and documented.
- Avoid storing documents in browser storage unless the user explicitly asks for persistence.
- Add tests for privacy-sensitive assumptions, such as no upload path in local workflows.
- Review future hosted features separately before implementation.

## Non-Goals

- Perfect confidentiality on compromised devices
- Protection from malicious browser extensions
- Enterprise compliance claims before the system is designed and reviewed for them
- Guarantees that all future workflows will be local-only

The goal is a technically honest, understandable privacy posture: local by default, explicit when not local, and conservative about claims.

## Current Processing Model

For implemented V1 workflows, the expected data flow is:

```text
User PDF -> Browser memory -> Local processing -> Download
```

There is no upload step, backend processing step, analytics pipeline, telemetry
pipeline, or cloud storage step in current local workflows.

## Redaction Position

Browser redaction is intentionally unavailable in V1. The completed capability
assessment concluded that the current browser-only stack cannot confidently
remove targeted information from all recoverable PDF representations or verify
that removal afterward.

LocalFiles should not imply that drawing boxes, hiding content visually, or
removing only some PDF structures is successful redaction. Future desktop or
native research may revisit redaction, but any implementation must be reviewed
against the project's redaction definition before it becomes product work.
