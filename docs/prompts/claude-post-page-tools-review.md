Read and follow:

docs/prompts/claude-review-template.md

Review Scope:

The LocalDocs codebase after implementation and hardening of:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages

This review is intended to evaluate the architecture after the first major group of PDF tools has been completed.

Do not review planned features.

Review only what currently exists.

---

## Review Focus

### 1. PdfAdapter Architecture

Evaluate the current PdfAdapter design.

Consider:

- method design
- cohesion
- clarity
- future maintainability

Current capabilities include:

- merge
- split
- reorder
- rotate
- deletePages

Assess whether the adapter is evolving cleanly.

Identify any signs of architectural drift.

---

### 2. Page-List Architecture

Review the architecture shared by:

- Reorder Pages
- Rotate Pages
- Delete Pages

Evaluate:

- reuse
- duplication
- maintainability
- future flexibility

Determine whether this pattern appears healthy.

Consider whether it is likely to support future page-action workflows without major rework.

Assess whether Reorder Pages, Rotate Pages, and Delete Pages should continue as separate implementations or whether a small shared page-list component or workflow helper is now justified.

Do not recommend abstraction unless there is a concrete maintainability benefit.

---

### 3. Privacy Claims

Evaluate whether the implementation continues to support LocalDocs' public claims:

- local processing
- no uploads
- no telemetry
- no analytics

Assess whether a privacy-conscious reviewer would likely agree with those claims.

---

### 4. Testing Quality

Evaluate whether the tests are proving the correct things.

Pay particular attention to:

- page order verification
- rotation verification
- deletion verification
- output correctness
- state cleanup behavior

Identify meaningful blind spots if they exist.

---

### 5. Repository Health

Review:

- CI
- dependency footprint
- project organization
- generated artifacts
- reproducibility concerns

Identify anything that would concern an experienced reviewer.

Review whether the existing bundle-size warning remains acceptable or is becoming a practical concern.

---

### 6. Readiness for Remaining V1 Features

Evaluate readiness for:

- Metadata Removal
- Redaction

Do not design those features.

Instead assess:

- whether the current architecture supports them
- whether any architectural risks should be addressed before starting them

---

### 7. Trust Review

Assume this repository were open-sourced today.

Evaluate:

- whether the privacy claims appear credible
- whether the implementation appears trustworthy
- what questions a skeptical reviewer would ask

Focus on realistic concerns.

---

## Recommendation

Recommend one of the following:

- Proceed directly to Metadata Removal.
- Address specific Should Fix items first.
- Address specific Must Fix items first.

Explain the reasoning.

---

## Additional Request

If you identify issues, classify them as:

- Must Fix
- Should Fix
- Nice to Have

Do not inflate severity.

Prefer evidence-based findings.

The goal is to determine whether the project is ready to proceed to Metadata Removal and Redaction.
