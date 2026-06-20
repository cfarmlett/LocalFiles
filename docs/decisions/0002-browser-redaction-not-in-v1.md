# ADR 0002: Browser Redaction Is Not In V1

## Status

Accepted

## Context

LocalFiles is a privacy-first, local-only browser PDF tool. Redaction has a much
higher trust requirement than page manipulation or metadata removal: successful
redaction means targeted information is removed from all recoverable
representations in the resulting PDF and cannot reasonably be recovered through
viewing, searching, copying, extraction, inspection, or file analysis.

The completed redaction research found that the current browser-only stack does
not provide enough capability or verification confidence to meet that standard.

## Decision

LocalFiles will not implement browser redaction in V1.

The Redact PDF section may remain only as a clear placeholder that says
redaction is high risk and intentionally unavailable. Browser redaction should
not appear as planned V1 work.

## Reasons

- A partial browser implementation would create false confidence.
- Visual overlays are not successful redaction if underlying text, images,
  vectors, metadata, XMP, attachments, hidden streams, or historical content
  remain recoverable.
- The current adapter stack is appropriate for page manipulation and standard
  metadata removal, but not for verified content-stream redaction.
- Trust-first positioning requires omitting unsafe features rather than shipping
  a feature that sounds secure but cannot be verified.

## Future Implications

Future desktop or native research may revisit redaction with stronger PDF
tooling and automated verification. Any future redaction work must be evaluated
against the project's redaction definition before product implementation.
