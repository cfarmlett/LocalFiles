Review and harden the existing Merge PDF implementation.

Important:

- Start by inspecting the current implementation.
- Do not rewrite the feature.
- Do not add Split PDF or any new V1 feature.
- Make only small, scoped fixes for issues you actually find.
- Preserve the existing architecture and UX unless there is a clear bug or safety issue.

Review standard:

Prefer proven defects over hypothetical improvements.

Do not make changes solely because something could be improved.

Only modify code when:

- a bug exists
- a stale state exists
- a memory leak risk exists
- an accessibility issue exists
- a privacy issue exists
- a test gap exists
- a maintainability issue is concrete and low-risk to fix

Review focus:

1. Object URL lifecycle
   - Ensure every URL.createObjectURL usage has appropriate URL.revokeObjectURL cleanup.
   - Avoid memory leaks after repeated merges, downloads, removals, or page navigation.

2. Local-only/privacy guarantees
   - Confirm no document data is uploaded, fetched, logged, tracked, or sent over the network.
   - Confirm no telemetry, analytics, CDN assets, external fonts, or server processing were introduced.

3. Dependency boundaries
   - Confirm the web app does not import pdf-lib directly.
   - PDF implementation details should remain inside packages/pdf.
   - The web app should depend on the PDF adapter abstraction.

4. User-facing error quality
   - Ensure invalid, corrupted, encrypted/password-protected, empty, and adapter-failure cases produce clear user-facing messages.
   - Avoid leaking raw implementation errors into the UI.

5. Page-count and file-state robustness
   - Ensure failed page-count extraction cannot leave files in confusing or inconsistent states.
   - Ensure removing/reordering files cannot leave stale merge outputs or stale errors.

6. Accessibility and usability
   - Ensure file selection, removal, move up/down, merge, and download controls are keyboard-accessible.
   - Ensure disabled/loading states are clear.

7. E2E coverage
   - Ensure the e2e test verifies a real download occurs.
   - Prefer checking download event, sensible filename, and nonzero file size.

8. Test reliability
   - Ensure tests do not rely on brittle timing, stale dev servers, or network access.
   - Keep test fixtures small and deterministic.

9. Dependency discipline
   - Do not add new dependencies unless strictly necessary.
   - If any dependency was added previously, verify it is justified.

10. Future-tool pattern

- Ensure Merge PDF remains a clean implementation pattern for future V1 tools.

Validation:

Run and fix issues from:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e
- pnpm build

Output:

1. Issues found.
2. Fixes made.
3. Files changed.
4. Validation results.
5. Remaining known limitations.

If no issues are found, say so clearly and make no code changes.
