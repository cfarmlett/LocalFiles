Status: Completed historical implementation task.

Implement UX-004: Clear Loaded Document for LocalFiles.

Context:

- UX-003 (Persistent Export Result Panel) has been completed.
- Users can now generate and retain outputs across workflows.
- Users need an obvious way to discard the current document and return a workflow to its initial state.
- Preserve LocalFiles' privacy-first, local-only architecture.
- Do not add cloud processing, analytics, telemetry, external uploads, accounts, or network dependencies.

Reference documentation:

- docs/product/v1-product-spec.md
- docs/product/v1.5-product-spec.md
- docs/product/feature-backlog.md

Goal:

Add a consistent Clear action across all implemented PDF workflows that completely resets the current workflow.

Success Criteria:

- Users can completely clear the current workflow.
- Loaded files are removed.
- Generated outputs are removed.
- Export Result Panels are removed.
- Validation and processing errors are removed.
- Workflow-specific document-processing state is reset to defaults.
- The workflow returns to the same state a user sees immediately after opening it for the first time.
- Any generated object URLs are properly revoked and cleaned up when workflow output is cleared.
- Existing document-processing behavior remains unchanged.

Implemented Workflows:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

Requirements:

1. Add a Clear action to all implemented workflows.

2. Clear must remove:

   - loaded files
   - generated outputs
   - Export Result Panel content
   - validation errors
   - processing errors
   - workflow-specific document-processing state

3. Clear must restore:

   - default configuration values
   - default page selections
   - default workflow state

4. The post-clear state should match the state a user sees immediately after opening the workflow for the first time.

5. The Clear action must not alter the normal processing workflow. After clearing, users should be able to load a new document and complete the workflow exactly as they could on a fresh page load.

6. Clear must not:

   - reload the page
   - trigger processing
   - generate output
   - introduce network activity

7. UX Requirements:

   - Clear should be easy to discover.
   - Clear should appear in a consistent location across workflows.
   - Clear should use consistent wording across workflows.
   - If workflow layouts differ, prioritize consistency relative to the primary workflow actions (Generate, Process, etc.) rather than exact pixel placement.
   - Do not add a confirmation dialog unless a concrete accidental-loss risk is identified that cannot be mitigated through simpler UX.

8. Architecture Requirements:

   - Reuse existing state ownership patterns.
   - Do not introduce global workflow state.
   - Do not introduce a centralized reset manager.
   - Do not introduce a generic workflow-reset framework.
   - Prefer simple per-page clear handlers that reset each workflow's owned state.
   - Small reusable helpers are acceptable if an obvious repeated pattern already exists.
   - Keep state ownership within each feature page.

9. Existing stale-output invalidation behavior must continue to work.

Important Constraints:

- Do not redesign the application.
- Do not implement UX-005.
- Do not implement RP-001.
- Do not implement RP-003.
- Keep changes focused on UX-004.
- Preserve the UX-003 result panel architecture.
- Preserve local-only processing guarantees.

Before making changes:

1. Summarize the current reset behavior for each workflow.
2. Describe the intended UX.
3. Explain where reset logic will live.
4. Identify any truly reusable reset patterns that already exist.

Then implement.

Testing Requirements:

- Add or update tests as appropriate.
- Verify Clear returns each workflow to its initial state.
- Verify generated output is removed.
- Verify Export Result Panels are removed.
- Verify errors are removed.
- Verify configuration is reset.
- Verify generated object URLs are cleaned up when results are cleared.
- Verify no external requests are introduced.
- Verify keyboard accessibility.
- Verify clear labeling and discoverable behavior.

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
