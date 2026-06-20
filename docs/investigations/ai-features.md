# AI Features Investigation

**Status:** Preliminary; no model, provider, or release selected.

Investigation does not imply a commitment to ship AI-assisted features.

## Why It Is Interesting

Summaries, classification, structured extraction, rewriting, and question
answering could reduce manual document work. They also create trust questions
that are more consequential than deterministic page manipulation.

## Potential User Value

- Summarize long documents.
- Extract user-defined fields into structured results.
- Classify or organize local files.
- Ask questions about a document with cited source locations.

## Open Questions

- Can useful models run locally at acceptable speed, size, and quality?
- If hosted models are considered, what document data leaves the device and how
  is consent obtained before transmission?
- How will outputs show uncertainty, provenance, and source grounding?
- Which narrow workflow provides real value without turning LocalFiles into a
  generic chat interface?
- What accessibility, licensing, cost, abuse, and support obligations follow
  from the model choice?

## Risks and Dependencies

- Hosted inference would require a trust model distinct from current local-only
  workflows.
- Model outputs can be incomplete, incorrect, or fabricated.
- Local models may require large downloads and substantial memory or compute.
- Document parsing, OCR, chunking, and citation quality may be harder than the
  model call itself.
- Provider or model changes can make behavior and cost unstable.

Any proposal must define a narrow user outcome, processing location, disclosure
and consent model, data-retention behavior, evaluation method, and fallback when
the result is uncertain.
