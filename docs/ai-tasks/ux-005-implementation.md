Status: Completed historical implementation task.

Implement UX-005: Collapsible Large Workflow Sections for LocalFiles.

Context:

- UX-003 (Persistent Export Result Panel) has been completed.
- UX-004 (Clear Loaded Document) has been completed.
- Some workflow sections can become extremely large when working with large PDFs.
- Examples include:

  - Split PDF generated output lists
  - Reorder Pages page lists
  - Rotate Pages page lists
  - Delete Pages page lists

- These large sections can make the page difficult to navigate.
- Preserve LocalFiles' privacy-first, local-only architecture.
- Do not add cloud processing, analytics, telemetry, external uploads, accounts, or network dependencies.

Reference documentation:

- docs/product/v1-product-spec.md
- docs/product/v1.5-product-spec.md
- docs/product/feature-backlog.md

Goal:

Allow users to collapse large workflow sections that grow with document size while preserving all workflow state.

Success Criteria:

- Users can collapse large workflow sections that would otherwise consume substantial vertical space.
- Collapsing significantly reduces page height for large PDFs.
- Collapsing preserves all workflow state.
- Collapsing preserves generated outputs.
- Collapsing preserves loaded files.
- Collapsing preserves configuration.
- Collapsing preserves errors.
- Collapsing does not interrupt processing.
- Existing document-processing behavior remains unchanged.

Scope:

Focus only on sections that can become substantially large.

Examples:

- Split PDF generated output list
- Reorder Pages page list
- Rotate Pages page list
- Delete Pages page list

You may include additional sections only if they clearly exhibit the same large-content problem.

Do not add collapse controls to small static sections solely for consistency.

Only add collapse controls where they provide meaningful reduction in vertical space.

It is acceptable for some workflows to receive no collapse controls if they do not exhibit the large-content problem UX-005 is intended to solve.

Requirements:

1. Add collapse/expand controls only to large-content sections.

2. Generated output lists may be collapsed.

3. Collapse controls may be shown whenever a section is capable of becoming large.

   - Do not require a minimum item threshold before showing the control.
   - Keep behavior predictable and consistent.

4. Collapse must preserve:

   - loaded files
   - generated outputs
   - Export Result Panel state
   - workflow-specific document-processing state
   - configuration
   - errors
   - async operation guards

5. Expand must restore visibility of the preserved content.

6. Collapse must not:

   - reload the page
   - trigger processing
   - generate output
   - clear state
   - introduce network activity

7. Collapse should hide the large repeated-content region itself.

Examples:

- page rows
- generated output rows
- page-operation rows

Do not hide primary workflow controls, action buttons, file information, workflow identity, processing state, success/error messaging, Export Result Panel summaries, or Clear actions solely because a large-content section is collapsed.

8. UX Requirements:

   - Collapse controls should clearly communicate what is being hidden.
   - Section headers should include useful context.
   - The collapsed state should still allow users to understand what content exists without expanding it.
   - Wording should be consistent across workflows.

Examples:

- Generated Files (11)
- Page Order (548 Pages)
- Page Rotations (548 Pages)
- Pages Marked for Deletion (548 Pages)

The summary/header only needs to communicate what content exists and how many items are hidden.

Do not attempt to expose detailed workflow status, modification counts, or processing details in collapsed summaries.

9. Default Behavior:

   - Large-content sections should remain expanded when content first appears.
   - Do not automatically collapse sections after loading a file, generating output, or performing an operation.
   - Users should explicitly choose when to collapse a section.

10. UX-003 Compatibility:

- Generated outputs and Export Result Panels should remain discoverable.
- Users should not have to guess whether output exists.
- If output sections are collapsed, the collapsed header must communicate:

  - output exists
  - how many outputs are available

Example:

- Generated Files (11)

- For workflows that use the UX-003 Export Result Panel, the preferred implementation is to collapse the large result list within the panel rather than hiding the entire result panel.

- When collapsing generated output lists, preserve enough visible result-panel information that users can immediately tell output was successfully generated without expanding the list.

Example:

```text
PDFs Generated
11 files ready

▶ Generated Files (11)
```

is preferred over hiding the entire result panel.

11. UX-004 Compatibility:

- Clear actions must remain visible and usable.
- Users should not need to expand a section in order to clear a workflow.
- If a workflow is cleared while a section is collapsed, the workflow should return to its normal initial-state presentation.

12. Architecture Requirements:

- Reuse existing state ownership patterns.
- Do not introduce global workflow state.
- Do not introduce a centralized layout manager.
- Do not redesign workflow architecture.
- A small reusable collapsible-section component is preferred if it remains presentation-focused and reduces duplication across multiple workflows.
- Keep collapse state local to the owning workflow.
- Collapse state is presentation state only.
- Do not mix collapse state with document-processing state.

13. Accessibility Requirements:

- Collapse controls must be keyboard accessible.
- Controls must expose expanded/collapsed state.
- Accessible names should describe the section being controlled.
- Hidden content should not remain keyboard-focusable.
- Prefer native HTML disclosure patterns unless a custom implementation provides a clear accessibility or usability benefit.

Important Constraints:

- Do not redesign the entire application.
- Do not implement RP-001.
- Do not implement RP-003.
- Do not change document-processing behavior.
- Do not change UX-003 generation behavior.
- Do not change UX-004 reset behavior except where required for compatibility.
- Keep changes focused on UX-005.
- Preserve local-only processing guarantees.

Before making changes:

1. Identify which sections currently create the largest vertical growth.
2. Explain which sections will receive collapse controls and why.
3. Explain where collapse state will live.
4. Determine whether a small reusable collapsible component is justified.
5. Explain how collapsed output sections will still communicate output availability.

Then implement.

Testing Requirements:

- Add or update tests as appropriate.
- Verify large sections can be collapsed and expanded.
- Verify collapsing preserves loaded files and configuration.
- Verify collapsing preserves generated output and Export Result Panels.
- Verify collapsing and expanding repeatedly does not alter workflow state.
- Verify Clear remains usable when sections are collapsed.
- Verify Clear still resets workflows correctly.
- Verify collapsed hidden content is not keyboard-focusable.
- Verify accessible expanded/collapsed state is exposed.
- Verify no external requests are introduced.
- Preserve existing UX-003 and UX-004 behavior.

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
