Status: Completed historical implementation task.

Implement UX-003: Persistent Export Result Panel for LocalFiles.

Context:

- This is the first V1.5 implementation task.
- A read-only architecture review has already been completed.
- V1.5 is focused on UX polish and workflow refinement.
- Preserve LocalFiles' privacy-first, local-only architecture.
- Do not add cloud processing, analytics, telemetry, external uploads, accounts, or network dependencies.

Reference documentation:

- docs/product/v1-product-spec.md
- docs/product/v1.5-product-spec.md
- docs/product/feature-backlog.md

Goal:
Replace the current export-completion experience with a reusable persistent result-panel pattern.

Success criteria:

- Export completion UI should be driven by a reusable result-panel pattern rather than feature-specific implementations.
- Future workflows should be able to reuse the same pattern with minimal additional code.
- Generated output should remain available until invalidated by workflow changes.
- Existing document-processing behavior should remain unchanged.
- The design should naturally support future ZIP export, multiple generated outputs, and batch-processing results without requiring major redesign.
- Generated filenames should be clearly visible so users understand what will be downloaded.

Architecture guidance (from review):

- Use an array-based result model from the start, even for single-output workflows.
- The architecture review suggested an ExportResultItem-style model. You may adapt the exact shape if a simpler implementation better fits the existing codebase while preserving multi-output support.
- Keep generated document bytes and object URLs local to each feature instance.
- Do not introduce global generated-document state.
- Prefer a reusable ExportResultPanel component plus a small helper/hook for URL lifecycle management.
- Keep Blob URL and browser-specific behavior inside apps/web rather than generic shared UI packages.
- Do not move components into packages/ui solely for reuse. Only promote components into packages/ui if they remain genuinely document-type agnostic and are likely to be reused outside PDF workflows.

Preferred migration sequence:

1. Add shared result-item types and URL lifecycle helper in apps/web/src.
2. Add ExportResultPanel.
3. Migrate Split PDF first.
4. Migrate Merge PDF.
5. Migrate Reorder Pages, Rotate Pages, Delete Pages, and Metadata Removal.
6. Update tests.

Requirements:

1. Create a reusable export result UI pattern/component where appropriate.
2. After successful document generation, display a persistent result panel.
3. Clearly communicate success or failure.
4. Provide an obvious Download action.
5. Download is required.
6. Open is optional.
7. If a clean, maintainable, local-only Open action is practical, include it.
8. If Open cannot be implemented cleanly, omit it and document why.
9. Do not introduce browser-specific hacks, plugin dependencies, or fragile behavior solely to support Open.
10. Generated output should remain available until:

    - source files change,
    - relevant configuration changes,
    - workflow reset/clear occurs,
    - a new output is generated.

11. Preserve all current local-processing behavior.
12. Preserve existing output-generation behavior.
13. Do not introduce external network activity.
14. Continue clearing stale generated output when inputs or configuration change.

Important constraints:

- Do not redesign the entire application.
- Prefer incremental, reusable changes.
- Prefer the simplest architecture that satisfies current requirements.
- Do not introduce abstractions that exist solely for hypothetical future features.
- Support future ZIP and batch workflows through reasonable extensibility, not speculative framework construction.
- Do not put generated document bytes into global app state.
- Each feature should continue owning:

  - selected file/configuration state,
  - processing state,
  - generated output state.

- Avoid implementation decisions that would make future integration with:

  - UX-004 Clear Loaded Document
  - UX-005 Collapsible Feature Content
    unnecessarily difficult.

- Do not implement UX-004.
- Do not implement UX-005.
- Do not implement RP-001, RP-003, or RP-004.
- Keep changes focused on UX-003.

Before making changes:

1. Briefly summarize the current export/result flow.
2. Briefly describe the intended architecture.
3. Explain where reusable result-panel state and URL lifecycle logic will live.

Then implement.

Testing requirements:

- Add or update tests as appropriate.
- Verify stale output is cleared when inputs/configuration change.
- Verify accessibility basics:

  - keyboard accessibility,
  - meaningful labels,
  - clear status messaging.

- Preserve existing no-external-request guarantees.

Special handling notes:

- Split PDF must retain first-class support for multiple outputs.
- Metadata Removal should not imply metadata was definitely present.
- Delete Pages should preserve existing validation behavior.
- Accessibility should include appropriate status announcement behavior where applicable.

After implementation:

Report:

- Files changed.
- Architectural approach taken.
- UX behavior before vs after.
- Tests added or updated.
- Any notable design decisions.

Run:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e

Report all failures and likely causes.
