# LocalFiles Redaction Research & Capability Assessment

Perform a read-only research and design assessment for a potential LocalFiles Redaction feature.

This is not an implementation task.

Do not write code.
Do not modify files.
Do not implement redaction.
Do not add dependencies.
Do not create UI.
Do not create tests.

The goal is to determine whether redaction can be implemented safely, what level of redaction is feasible with the current architecture, what limitations exist, and what LocalFiles could honestly claim.

---

## Project Context

LocalFiles is a privacy-first, local-only browser PDF tool.

Core principles:

- all document processing happens locally in the browser
- no uploads
- no telemetry
- no analytics
- no cloud processing
- no backend processing
- trust and claim accuracy matter more than feature count

Current V1 features already implemented:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

Current architecture:

- web app must not import pdf-lib directly
- PDF internals belong behind the PdfAdapter abstraction in packages/pdf
- LocalPdfAdapter currently uses pdf-lib
- the app has existing workflow, adapter, testing, hardening, and review patterns

---

## Independence Requirement

Do not assume that LocalFiles should implement redaction.

One valid outcome of this assessment is that redaction should not be implemented in the browser version of LocalFiles.

Evaluate whether the feature should exist at all before evaluating how it should be implemented.

---

## Definition of Successful Redaction

Use this as the ideal target definition:

A successful redaction removes the targeted information from all recoverable representations within the resulting PDF and leaves no reasonable method for recovering that information through viewing, searching, copying, extraction, inspection, or analysis of the file.

The redaction process should be verifiable through automated checks whenever practical.

Treat this as the desired security standard, not an assumption that it is achievable.

---

## False Confidence Risk

Evaluate whether any proposed implementation could create a false sense of security.

A solution that appears secure but leaves recoverable information may be worse than not offering the feature.

Explicitly identify any implementation approaches that could create this risk.

Assess:

- likelihood of user misunderstanding
- likelihood of incomplete removal
- difficulty of communicating limitations
- severity of potential information disclosure

---

## Research Question

Do not answer this as a simple yes/no.

Instead, produce a capability map.

For each part of the redaction definition, determine:

1. Can LocalFiles achieve this with the current stack?
2. If not, what specific parts cannot be achieved?
3. Can those gaps be closed with additional browser-compatible libraries?
4. Would the gap require a desktop/native component?
5. Would the gap require server-side processing?
6. Would the gap be impractical or unreliable even with additional tooling?
7. What automated verification would be possible?
8. What claims could LocalFiles safely make?

---

## PDF Categories

Evaluate capabilities separately for:

### 1. Text-Based PDFs

Examples:

- digitally generated PDFs
- office documents exported to PDF
- PDFs with selectable text

### 2. Scanned / Image PDFs

Examples:

- scanned contracts
- photographed documents
- image-only PDFs

### 3. OCR PDFs

Examples:

- scanned documents
- hidden OCR text layer
- searchable scans

### 4. Mixed-Content PDFs

Examples:

- text plus images
- text plus scanned pages
- forms
- annotations
- complex generated PDFs

Do not assume a capability available for one category applies to the others.

---

## Capability Areas to Evaluate

Evaluate at least the following:

### 1. Visual Removal

The redacted information is not visible in normal PDF viewers.

### 2. Copy/Paste Removal

The redacted information cannot be copied from the resulting PDF.

### 3. Search Removal

The redacted information cannot be found through normal PDF search.

### 4. Text Extraction Removal

The redacted information cannot be recovered through PDF text extraction.

### 5. Content Stream Removal

The redacted information no longer exists in PDF content streams.

### 6. OCR Layer Removal

The redacted information does not remain in hidden OCR/text layers.

### 7. Annotation Cleanup

The redacted information does not remain in annotations, comments, or markup.

### 8. Form Field Cleanup

The redacted information does not remain in AcroForm or other form fields.

### 9. Metadata Cleanup

The redacted information does not remain in document metadata.

### 10. XMP Cleanup

The redacted information does not remain in XMP metadata.

### 11. Embedded File / Attachment Cleanup

The redacted information does not remain in embedded files or attachments.

### 12. Tagged PDF / Structure Tree Cleanup

The redacted information does not remain in:

- accessibility tags
- alternate text
- structure trees
- semantic document representations

### 13. JavaScript / Actions Cleanup

The redacted information does not remain in embedded JavaScript, actions, or scripts.

### 14. Incremental Update / Previous Revision Cleanup

The redacted information does not remain recoverable from:

- prior document revisions
- incremental update history
- retained PDF objects

### 15. Image Redaction

The redacted information is removed from:

- raster images
- scans
- screenshots
- image-based PDFs

### 16. Vector Graphics Redaction

The redacted information is removed from:

- vector graphics
- drawn text converted to paths
- graphic representations of text

### 17. Verification

LocalFiles can automatically verify that the redacted target is no longer recoverable through supported methods.

---

## Capability Matrix

Produce a matrix with columns similar to:

- Requirement / capability area
- Current stack feasibility
- Additional browser-library feasibility
- Desktop/native feasibility
- Server-side feasibility
- Automated verification feasibility
- Risk level
- Confidence level
- Notes

Use statuses such as:

- Achievable now
- Achievable with constraints
- Possibly achievable with additional browser tooling
- Likely requires desktop/native tooling
- Likely requires server-side tooling
- Not reliably achievable
- Unknown / needs deeper research

---

## Current Stack Assessment

Specifically assess whether the current stack can support safe redaction:

- React / browser UI
- pdf-lib
- LocalPdfAdapter
- current testing setup
- no backend
- no uploads
- no cloud processing

Answer:

- What can pdf-lib safely do?
- What can pdf-lib not safely do?
- Can pdf-lib remove or rewrite content streams in a way suitable for redaction?
- Can pdf-lib identify text positions reliably enough for user-selected redaction?
- Can pdf-lib handle:

  - annotations
  - forms
  - XMP
  - embedded files
  - OCR layers
  - previous revisions

- Would using pdf-lib for redaction create a false sense of security?

If a capability cannot be confirmed from:

- the current codebase
- pdf-lib documentation
- established PDF behavior

identify it as uncertain rather than assuming it exists.

---

## Potential Implementation Strategies

Evaluate possible strategies without implementing them.

### Strategy 1: Visual Overlay Only

Example:

- draw black rectangles
- hide content visually

Assess:

- security
- recoverability
- trustworthiness

Explicitly evaluate whether this creates false confidence.

### Strategy 2: Content Stream Modification

Example:

- remove text objects
- rewrite page content streams

Assess:

- feasibility
- limitations
- verification potential

### Strategy 3: Partial Rasterization

Example:

- rasterize redacted regions

Assess:

- privacy benefits
- limitations
- browser feasibility

Assess impacts on:

- accessibility
- screen readers
- selectable text
- searchability
- file size
- print quality

### Strategy 4: Full-Page Rasterization

Example:

- rasterize entire redacted pages

Assess:

- security benefits
- limitations
- browser feasibility

Assess impacts on:

- accessibility
- screen readers
- selectable text
- searchability
- file size
- print quality

### Strategy 5: Hybrid Approach

Example:

- remove supported metadata
- remove supported text content
- remove supported annotations/forms
- rasterize where necessary
- verify where practical

Assess:

- complexity
- safety
- maintainability
- trustworthiness

### Strategy 6: No Browser Redaction

Assess whether not implementing browser redaction is the most trustworthy option.

### Strategy 7: Desktop-Only Redaction

Assess whether redaction belongs in a future desktop application rather than the browser version.

---

## Trust Ranking

For each candidate implementation strategy, rank:

- Trustworthiness
- Safety
- Complexity
- Browser feasibility
- Verification feasibility

Provide a strongest-to-weakest ranking with explanations.

---

## Automated Verification

Evaluate what LocalFiles could automatically verify.

Examples:

- extracted text no longer contains target strings
- PDF search text no longer contains target strings
- metadata no longer contains target strings
- annotations/forms no longer contain target strings
- target region is visually obscured
- content streams do not contain literal target strings where inspectable

Also identify:

- what cannot be fully verified
- what would require manual review
- what could create false confidence if reported as verified

---

## Product Claim Guidance

Based on the capability matrix, propose safe user-facing language.

Include:

### 1. Claims LocalFiles Could Safely Make

### 2. Claims LocalFiles Must Avoid

### 3. Warning Language

Especially for:

- partial redaction
- constrained redaction
- experimental approaches

### 4. Naming Guidance

Assess whether the feature should be called:

- Redaction
- Secure Redaction
- Text Redaction
- Visual Redaction
- Experimental Redaction
- Not Implemented

Prioritize honesty over marketing.

---

## Risks and Non-Goals

Identify:

- risks
- blind spots
- unsupported PDF structures
- categories of information that may remain recoverable

Explicitly identify situations where LocalFiles should refuse to claim successful redaction.

---

## Recommendation

Conclude with one of the following:

1. Proceed with V1 Redaction using the current stack.
2. Proceed only with a constrained redaction feature and strict warnings.
3. Defer Redaction pending additional browser-library research.
4. Defer Redaction to a desktop/native application.
5. Do not implement Redaction.
6. Conduct a focused prototype spike before making a product decision.

Explain the reasoning.

---

## Output Format

Provide:

1. Executive summary.
2. Redaction definition analysis.
3. Capability matrix.
4. Current stack assessment.
5. Potential implementation strategy assessment.
6. Trust ranking.
7. Automated verification assessment.
8. Product claim guidance.
9. Risks and non-goals.
10. Recommendation.
11. Suggested next prompt if implementation or deeper research is justified.

Be conservative.

If uncertain, say so.

Do not overstate what can be safely achieved.
