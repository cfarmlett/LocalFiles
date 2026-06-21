# Redaction Investigation

**Status:** Browser implementation rejected for V1; future desktop or stronger
local approaches remain open for research.

Investigation does not imply a commitment to ship redaction.

## Why It Matters

People handling legal, medical, financial, or personal documents need to remove
sensitive information before sharing a PDF. Many tools create visible black
boxes without removing the underlying data, which is especially dangerous
because the result looks safe.

LocalFiles should offer redaction only if it can make a technically honest,
understandable claim about irreversible removal.

## Required Outcome

Successful redaction means targeted information cannot reasonably be recovered
through ordinary viewing, searching, copying, text extraction, object
inspection, or file analysis of the exported document.

The workflow must consider more than visible page content, including text and
image layers, vectors, annotations, forms, metadata, XMP, attachments, hidden
streams, structure trees, actions, and incremental revisions where relevant.

## Current Finding

The current browser stack is well suited to page manipulation and standard
metadata removal, but it does not provide enough removal and verification
confidence for safe general-purpose redaction.

In particular:

- drawing an overlay is not redaction;
- editing only obvious text does not cover mixed PDF representations;
- rasterization trades recoverability for fidelity, accessibility, search, and
  file-size costs; and
- a feature cannot claim success without meaningful output verification.

The accepted decision is therefore to keep browser redaction out of V1. See
[`../decisions/0002-browser-redaction-not-in-v1.md`](../decisions/0002-browser-redaction-not-in-v1.md).

## Possible Future Paths

- A desktop or native application using mature PDF tooling and controlled
  post-processing.
- A stronger local WASM engine that can rewrite all relevant structures.
- Full-page rasterization for a narrowly defined mode, with explicit quality
  and accessibility limitations.
- Continued omission if no approach meets the trust standard at a sustainable
  maintenance cost.

## Dependencies and Open Questions

- Which PDF engine can remove content across text, images, vectors, forms,
  annotations, metadata, attachments, and prior revisions?
- How will scanned, OCR, and mixed-content PDFs be handled?
- What automated checks can verify text, object, metadata, and visual removal?
- Can output preserve acceptable fidelity and accessibility?
- What warnings and claim language can non-technical users understand?
- Can the implementation and its dependencies remain local, reviewable, and
  maintainable by a solo developer?

## Revisit Criteria

Redaction may move from investigation to release planning only after a proposed
engine and verification strategy demonstrate the required outcome across a
representative adversarial test corpus.
