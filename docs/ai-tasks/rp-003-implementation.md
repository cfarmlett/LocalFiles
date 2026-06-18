Implement RP-003: Drag-and-Drop Page Reordering for LocalDocs.

Context:

- UX-003 (Persistent Export Result Panel) has been completed.
- UX-004 (Clear Loaded Document) has been completed.
- UX-005 (Collapsible Large Workflow Sections) has been completed.
- RP-001 (Reset Page Order) has been completed.
- Reorder Pages currently supports page reordering through existing controls.
- Users need a faster, more intuitive way to reorder pages directly.
- Preserve LocalDocs' privacy-first, local-only architecture.
- Do not add cloud processing, analytics, telemetry, external uploads, accounts, or network dependencies.

Reference documentation:

- docs/product/v1-product-spec.md
- docs/product/v1.5-product-spec.md
- docs/product/feature-backlog.md

Goal:

Add drag-and-drop page reordering to the Reorder Pages workflow while preserving existing controls, Reset Order behavior, Clear behavior, collapsible section behavior, and export-result behavior.

Success Criteria:

- Users can reorder pages by dragging page rows.
- Existing non-drag reorder controls remain available.
- Dragging updates page order correctly.
- Dragging invalidates stale generated reorder output.
- Dragging enables Reset Order when the new order differs from the original order.
- Dragging works within the existing Reorder Pages workflow only.
- Existing document-processing behavior remains unchanged.
- Local-only/privacy-first guarantees remain intact.

Scope:

Only modify the Reorder Pages workflow and directly related tests/helpers/components.

Do not modify Merge, Split, Rotate, Delete, Metadata Removal, or unrelated workflows unless a small shared presentation helper already exists and must be adjusted safely.

Requirements:

1. Add drag-and-drop reordering to the Reorder Pages page list.

2. Drag Interaction Requirements:

   - Prefer making the entire page row draggable if it integrates cleanly with the existing controls and UX.
   - If full-row dragging interferes with existing controls, buttons, accessibility, or usability, use a dedicated drag handle instead.
   - The implementation should prioritize usability and accessibility over forcing full-row dragging.

3. Preserve existing reorder controls.

   - Do not remove existing Move Up / Move Down controls.
   - Drag-and-drop should supplement, not replace, the existing reorder functionality.
   - Users must retain a fully functional non-drag reordering path through existing controls.

4. Drag-and-drop must:

   - update page order correctly
   - preserve all page metadata
   - clear stale generated reorder output
   - remove stale UX-003 Export Result Panel output
   - enable Reset Order when order differs from original
   - preserve the loaded file
   - preserve collapse/expand presentation state
   - avoid triggering PDF generation

5. Drag-and-drop must not:

   - clear the loaded file
   - reset the entire workflow
   - reload the page
   - trigger processing/export
   - introduce network activity
   - add telemetry, analytics, accounts, or external uploads

6. Accessibility Requirements:

   - Existing keyboard-accessible reorder controls must remain usable.
   - Drag-and-drop must not be the only way to reorder pages.
   - Drag handles or draggable rows should have meaningful accessible labels where applicable.
   - Pointer interactions should not make existing buttons difficult to use.
   - Focus behavior should remain predictable after reorder operations.
   - Do not sacrifice keyboard accessibility for drag behavior.

7. UX Requirements:

   - Drag affordance should be discoverable but not visually noisy.
   - Existing page row information should remain readable.
   - Existing Move Up / Move Down controls should still work.
   - Reset Order should remain visible and retain RP-001 behavior.
   - Clear should remain visible and retain UX-004 behavior.
   - The page-order section should remain compatible with UX-005 collapse/expand behavior.
   - If the page-order section is collapsed, drag-and-drop does not need to be available until expanded.

8. Drag Placement Requirements:

   - Drag operations should produce deterministic insertion behavior.
   - Use a simple insert-before model.
   - Dropping Page A onto Page B inserts Page A immediately before Page B.
   - The behavior should be consistent and easy to reason about.
   - Drag placement behavior should be documented in the implementation notes and consistently applied regardless of drag direction.
   - Do not implement different insertion rules for upward and downward moves.

9. State Requirements:

   - Drag reorder is document-processing state.
   - Drag reorder should use the same page-order state as existing reorder controls.
   - Drag reorder should not introduce a second source of truth for page order.
   - Drag reorder should not affect collapse/expand presentation state.
   - Drag reorder should not affect file input state.
   - Drag reorder should not interfere with UX-004 async invalidation safeguards.

10. Architecture Requirements:

- Prefer a simple, local implementation within Reorder Pages.
- Avoid broad architecture changes.
- Do not introduce global drag state.
- Do not introduce a generalized sortable-list framework unless a small local helper is clearly justified.
- Avoid large third-party drag-and-drop dependencies.
- Prefer the simplest implementation that integrates cleanly with the existing architecture.
- Native browser drag-and-drop is acceptable but not required.
- Keep all generated document bytes and object URLs within existing UX-003 patterns.

11. Reorder Logic Requirements:

- Drag-and-drop should ultimately invoke the same page-order update path used by existing reorder controls whenever practical.
- Avoid creating a second reorder implementation with separate business rules.
- Drag-and-drop should ultimately produce the same page-order array shape used by existing reorder controls.
- Avoid maintaining separate drag-order representations.
- Existing output invalidation, Reset Order enablement, and page-order state updates should remain consistent regardless of how reordering occurs.
- If existing Move Up / Move Down behavior relies on helper functions for output invalidation, Reset Order state updates, or page-order updates, reuse those helpers rather than duplicating equivalent logic for drag operations.

12. Output Invalidation Requirements:

- Any successful drag reorder must immediately clear stale generated reorder output.
- Users should never see an old reordered export presented as current after dragging pages.
- Dragging a page back to the original order may leave Reset Order disabled, but stale output should still have been invalidated by the order change.

13. Drag Completion Requirements:

- A completed drag operation is one that results in a page changing position.
- Incomplete, canceled, or abandoned drag interactions should not invalidate output.
- Drag interactions that result in no actual position change should not modify workflow state.
- Dragging a page and dropping it back into its original position should be treated as a no-op.
- Dropping a page onto itself should be treated as a no-op.

14. Visual Feedback Requirements:

- During drag operations, provide simple visual feedback indicating:

  - which item is being dragged
  - where it will be inserted

- The feedback should be lightweight and consistent with the existing UI.
- Native browser drag previews are acceptable.
- Do not implement custom drag preview systems unless required by the chosen approach.
- Do not introduce complex animation systems or large visual redesigns.

15. RP-001 Compatibility:

- Reset Order must restore the original document order after drag reordering.
- Reset Order must be disabled when drag operations result in the original order.
- Loading a new document must still establish a new original-order baseline.
- Drag reorder must not mutate the original-order baseline.

16. UX-005 Compatibility:

- Drag reorder should work when the page-order section is expanded.
- Collapse/expand state should remain presentation-only.
- Collapsing and expanding after drag reorder should preserve the reordered state.
- Clear should still reset the workflow and restore normal initial presentation.

17. Large Document Expectations:

- RP-003 is intended to improve direct manipulation of page order.
- RP-003 is intended to improve nearby moves and visual rearrangement.
- It is not intended to solve every large-document reordering workflow.
- It does not need to optimize large-distance moves within very large PDFs.
- Do not introduce virtualization, auto-scroll systems, multi-select dragging, or advanced list-management features as part of this implementation.

18. Non-Requirements:

- Touch-specific drag support is not required for RP-003.
- Keyboard drag-and-drop support is not required because existing keyboard-accessible reorder controls remain available.
- Multi-select dragging is not required.
- Cross-workflow dragging is not required.

Important Constraints:

- Do not implement order-expression input.
- Do not implement RP-004 or unrelated reorder features.
- Do not remove existing keyboard-accessible reorder behavior.
- Do not redesign the entire Reorder Pages workflow.
- Do not change PDF generation logic except as needed for stale-output invalidation.
- Do not change UX-003, UX-004, UX-005, or RP-001 behavior outside Reorder Pages.
- Keep changes focused on RP-003.
- Preserve local-only processing guarantees.

Before making changes:

1. Summarize the current Reorder Pages state model.
2. Identify how existing page-order controls update state.
3. Describe the intended drag-and-drop UX.
4. Explain whether native drag-and-drop or a small local helper will be used.
5. Explain how drag reorder will clear stale output.
6. Explain how drag reorder will interact with Reset Order.
7. Explain how drag reorder will preserve keyboard accessibility.
8. Explain how drag reorder will reuse the existing page-order update path.
9. Explain the chosen insert-before behavior.

Then implement.

Testing Requirements:

- Add or update tests as appropriate.
- Verify dragging changes page order correctly.
- Verify drag behavior works correctly for both upward and downward moves.
- Verify existing Move Up / Move Down controls still work.
- Verify Move Up / Move Down continue to invalidate output, update Reset Order state, and preserve existing behavior after drag-and-drop is introduced.
- Verify dragging clears stale generated output and removes the Export Result Panel.
- Verify Reset Order works after drag reorder.
- Verify Reset Order is disabled when drag returns the order to original.
- Verify dragging does not mutate the original-order baseline.
- Verify canceled or abandoned drag interactions do not clear output.
- Verify drag operations that result in no position change do not alter workflow state.
- Verify dropping a page onto itself behaves as a no-op.
- Verify Clear behavior remains unchanged.
- Verify collapse/expand preserves dragged order.
- Verify no external requests are introduced.
- Verify keyboard accessibility is preserved through existing reorder controls.
- Preserve existing UX-003, UX-004, UX-005, and RP-001 behavior.

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
