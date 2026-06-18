Implement RP-001: Reset Page Order for LocalDocs.

Context:

- UX-003 (Persistent Export Result Panel) has been completed.
- UX-004 (Clear Loaded Document) has been completed.
- UX-005 (Collapsible Large Workflow Sections) has been completed.
- Reorder Pages currently allows users to modify page order, but users need a fast way to restore the original document order without clearing the loaded document.
- Preserve LocalDocs' privacy-first, local-only architecture.
- Do not add cloud processing, analytics, telemetry, external uploads, accounts, or network dependencies.

Reference documentation:

- docs/product/v1-product-spec.md
- docs/product/v1.5-product-spec.md
- docs/product/feature-backlog.md

Goal:

Add a Reset Order action to the Reorder Pages workflow that restores the loaded PDF's page order to its original sequence while preserving the loaded document.

Success Criteria:

- Users can reset page order to the original document order.
- Original order means the order present when the currently loaded document was first loaded into the Reorder Pages workflow.
- If a different PDF is loaded, that document establishes a new original-order baseline.
- Reset Order does not remove the loaded PDF.
- Reset Order does not clear the loaded document.
- Reset Order does not reload the file.
- Reset Order immediately invalidates and clears stale generated output.
- Reset Order removes the UX-003 Export Result Panel for stale reordered output.
- After Reset Order, the workflow should behave as though no reordering changes have been made since the document was loaded.
- Existing document-processing behavior remains unchanged.

Scope:

Only modify the Reorder Pages workflow and directly related tests/helpers.

Do not change Merge, Split, Rotate, Delete, Metadata Removal, or unrelated workflows unless a small shared helper already exists and must be adjusted safely.

Requirements:

1. Add a Reset Order action to the Reorder Pages workflow.

2. Reset Order must:

   - restore page order to the original sequence
   - preserve the loaded file
   - preserve file/page metadata
   - clear any generated reorder output
   - remove the UX-003 Export Result Panel for stale reordered output
   - clear reorder-specific validation or processing errors if they no longer apply

3. Reset Order must not:

   - clear the loaded file
   - reset the entire workflow
   - trigger processing
   - generate output
   - reload the page
   - introduce network activity

4. UX Requirements:

   - The action should be clearly labeled `Reset Order`.
   - The action should be placed near the page-order controls.
   - The action should not be confused with UX-004 `Clear`.
   - `Clear` should remain available and retain its existing behavior.
   - Reset Order should be visually and semantically distinct from Clear.
   - Reset Order should only be available when a document is loaded.
   - Disable Reset Order when the current page order already matches the original document order.
   - No confirmation dialog is needed.

5. Output Invalidation Requirements:

   - Reset Order should immediately invalidate prior generated output.
   - Reset Order should behave like any other page-order modification with respect to stale output.
   - Users should never see reordered output presented as current after Reset Order has restored the original order.

6. UX-005 Compatibility:

   - Reset Order must work whether the page-order section is expanded or collapsed.
   - If the page-order section is collapsed, Reset Order should still restore default ordering.
   - Prefer preserving the current expanded/collapsed presentation state.
   - Do not require users to expand the page list before resetting order.

7. State Requirements:

   - Reset Order is document-processing state, not presentation state.
   - Reset Order should not affect collapse/expand state.
   - Reset Order should not affect file input state.
   - Reset Order should not affect UX-004 async invalidation safeguards except as needed to clear stale output.

8. Architecture Requirements:

   - Reuse existing reorder helper functions where practical.
   - Prefer existing default-order creation logic if available.
   - Keep state ownership within `ReorderPagesPage`.
   - Do not introduce global workflow state.
   - Do not introduce a generalized reset framework.
   - Do not redesign the reorder workflow.

Important Constraints:

- Do not implement RP-003.
- Do not implement drag-and-drop.
- Do not implement order-expression input.
- Do not change the output PDF generation logic except as required to clear stale output.
- Do not change UX-003, UX-004, or UX-005 behavior outside Reorder Pages.
- Keep changes focused on RP-001.
- Preserve local-only processing guarantees.

Before making changes:

1. Summarize the current Reorder Pages state model.
2. Identify the existing helper used to create default page order.
3. Describe where the Reset Order action will appear.
4. Explain how stale generated output will be cleared.
5. Explain how Reset Order will interact with Clear and collapsible page sections.
6. Explain how the original-order baseline will be tracked for the currently loaded document.

Then implement.

Testing Requirements:

- Add or update tests as appropriate.
- Verify Reset Order restores original page order after modifications.
- Verify Reset Order preserves the loaded file.
- Verify Reset Order clears stale generated output and removes the Export Result Panel.
- Verify Reset Order works when the page-order section is collapsed.
- Verify Clear behavior remains unchanged.
- Verify loading a new document establishes a new original-order baseline.
- Verify Reset Order does not unintentionally alter collapse/expand state.
- Verify no external requests are introduced.
- Verify keyboard accessibility and clear labeling.
- Preserve existing UX-003, UX-004, and UX-005 behavior.

After implementation report:

- Summary
- Architecture decisions
- Files modified
- UX behavior before vs after
- Tests added or updated
- Validation results
- Known limitations
- Recommended hardening/review follow-up

Run:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e

Report all failures and likely causes.
