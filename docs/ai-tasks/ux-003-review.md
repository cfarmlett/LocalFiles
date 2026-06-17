Read the LocalDocs repository and evaluate UX-003: Persistent Export Result Panel before making any code changes.

This is a read-only review.

Do not modify code.
Do not create files.
Do not implement anything.

Context:
UX-003 is the first planned V1.5 feature.

Goal:
Introduce a reusable persistent export result panel that improves the current export/download workflow while preserving LocalDocs' local-only privacy model.

Reference documentation:

* docs/product/v1-product-spec.md
* docs/product/v1.5-product-spec.md
* docs/product/feature-backlog.md

Review objectives:

1. Identify the current export workflow architecture.
2. Identify how generated output is currently stored and surfaced to users.
3. Identify existing shared UI patterns and reusable components.
4. Determine the best location for reusable result-panel state.
5. Identify any workflows that may require special handling.
6. Identify any risks, architectural concerns, or edge cases.
7. Evaluate how the implementation can support future:

   * ZIP export
   * Multiple generated outputs
   * Batch-processing results
8. Evaluate compatibility with the planned V1.5 feature-header direction:

   * Export
   * Clear
   * Collapse

Deliverables:

* Current architecture summary
* Recommended implementation approach
* Proposed component/state ownership
* Risks and mitigations
* Suggested implementation sequence

Do not implement changes.

Provide a concise implementation plan only.
