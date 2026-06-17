# LocalDocs Independent Technical Review

**Reviewed:** June 16, 2026  
**Scope:** Full source review of LocalDocs — a privacy-first local browser PDF tool  
**Reviewer note:** All findings are based on direct inspection of the source. Prior AI review findings are independently verified, challenged, or refined.

---

## 1. Executive Summary

The project is moving in a **genuinely healthy direction**. For an early-stage repository built with AI assistance by someone without a professional web development background, the code quality is notably high. The architecture shows real discipline: pdf-lib is cleanly isolated behind an adapter interface, there are no network calls in the processing path, the E2E test actively asserts that no external requests are made, and error handling is more careful than most production codebases.

The primary risks are not foundational. They are correctable gaps in tooling and test coverage with no architectural implications. There are no privacy-breaking issues, no hidden network calls, and no structural problems that require reworking before the next feature.

The biggest real concern is the **complete absence of CI**. For a project whose trust claim depends on code correctness, running tests only locally is a meaningful credibility gap — particularly because one of the best things in this codebase (the E2E assertion that no external requests occur) only proves anything if it actually runs automatically.

---

## 2. Must-Fix Issues

### 2.1 No CI pipeline

**Severity:** High (for a trust-oriented project)  
**Location:** `.github/workflows/` — contains only a README  
**Why it matters:** LocalDocs' core value proposition is verifiability. A project claiming privacy guarantees with no automated test runs cannot publicly demonstrate correctness. Experienced engineers and privacy advocates will notice this immediately when the repo goes public. More practically: the "no external requests" E2E assertion is this project's most important test. It currently only runs when you remember to run it locally.  
**Fix:** Add a minimal GitHub Actions workflow — install pnpm, run `pnpm test` (Vitest unit tests) and `pnpm typecheck`. E2E tests need a running dev server so can be added separately, but even unit tests on every push is a major credibility improvement.  
**Should be done before next feature:** Yes.

### 2.2 `tsconfig.base.json` injects Node and Vitest globals into browser code

**Severity:** Medium  
**Location:** `tsconfig.base.json` — `"types": ["node", "vitest/globals"]`  
**Why it matters:** This makes Node.js globals (`process`, `Buffer`, `__dirname`) and Vitest utilities (`describe`, `it`, `expect`) available in type-checked browser code. Practically: browser code that accidentally references `process.env` or a Node API will not produce a TypeScript error. For a project where "no server-side code" is a trust claim, accidentally referencing server-side APIs without a compiler warning is a real (if low-probability) risk. The previous review identified this correctly.  
**Fix:** Remove `"node"` and `"vitest/globals"` from `tsconfig.base.json`. Create a separate `tsconfig.test.json` per-package that extends the base and adds those types only for test files. Vitest supports this natively.  
**Should be done before next feature:** Yes — it is a clean change and the risk of discovering the consequences later is higher once more code exists.

---

## 3. Should-Fix Issues

### 3.1 Stale error state not cleared on reorder or remove

**Severity:** Low-Medium  
**Location:** `apps/web/src/MergePdfPage.tsx` — "Move up", "Move down", and "Remove" onClick handlers  
**Why it matters:** When the user reorders or removes a file after a failed merge, `setMergeResult(undefined)` is called but `setErrors([])` is not. A user who encounters an error, then fixes it by reordering files, will see the old error message still displayed alongside their corrected file list. The previous review identified this correctly.  
**Fix:** Add `setErrors([])` to all three handlers — the same pattern already used in `mergeSelectedFiles`. Two or three lines of code.  
**Should be done before next feature:** No, but in the next polish pass.

### 3.2 E2E test does not cover corrupted or encrypted PDF paths

**Severity:** Low-Medium  
**Location:** `tests/e2e/app-shell.spec.ts`  
**Why it matters:** The unit tests in `packages/pdf/src/index.test.ts` correctly test `LocalPdfAdapter` behavior for corrupted and encrypted PDFs. But there is no E2E test confirming that `MergePdfPage` surfaces the correct user-visible error string when one of these files is added. The `tests/fixtures/` directory exists but is empty. These are the paths most likely to surface bugs after future pdf-lib upgrades.  
**Fix:** Add two E2E scenarios — one for a file with a `.pdf` extension but corrupted bytes, one for an encrypted PDF. Add real PDF fixtures to `tests/fixtures/` rather than more inline base64. Assert the correct user-facing error message appears in each case.  
**Should be done before next feature:** No, but before claiming the merge feature is production-ready.

### 3.3 E2E test does not cover drag-and-drop

**Severity:** Low  
**Location:** `tests/e2e/app-shell.spec.ts`  
**Why it matters:** Drag-and-drop via `onDrop` in `MergePdfPage.tsx` is a primary UX interaction path. The E2E test only uses `setInputFiles`. Playwright has good support for simulating drops.  
**Fix:** Add one drag-and-drop scenario using Playwright's `dispatchEvent` to simulate a drop onto `.drop-zone`.  
**Should be done before next feature:** No.

### 3.4 Repeated action buttons lack accessible labels

**Severity:** Low  
**Location:** `apps/web/src/MergePdfPage.tsx` — file list buttons  
**Why it matters:** Each file row has "Move up", "Move down", and "Remove" buttons. A screen reader user navigating by button will encounter multiple buttons with identical labels with no way to know which file each one affects. The previous review identified this correctly.  
**Fix:** Add descriptive `aria-label` attributes: `aria-label={`Move ${file.file.name} up`}` and similar for down and remove.  
**Should be done before next feature:** No, but before any public launch.

### 3.5 Committed `dist/` folder

**Severity:** Low  
**Location:** `apps/web/dist/` — 620KB compiled JS bundle in version control  
**Why it matters:** Build artifacts in version control are unusual and will raise questions about reproducible builds from security-focused reviewers. The bundle was built from the current source (verified), so it is not a privacy risk — but it signals that the build process is not yet automated.  
**Fix:** Add `apps/web/dist/` to `.gitignore`. The CI workflow (see 2.1) should build the artifact.  
**Should be done before next feature:** Yes, as part of the CI work.

---

## 4. Nice-to-Have Improvements

**Lazy-load `pdf-lib` at merge time.** Currently bundled eagerly. Not worth doing until the feature set grows and initial load time becomes a concern.

**Update `docs/architecture/v0.1.md`.** This file is 60 bytes. The `project-history.md` is good; the version doc could match it. Low value now, useful for future contributors.

**Accept `application/x-pdf` MIME type.** Some systems emit this non-standard variant. The PDF header check in `packages/pdf` will catch it anyway, so this is purely a usability improvement.

**Flesh out `localProcessingPolicy`.** This typed constant in `packages/core` is a thoughtful idea — machine-readable documentation of the privacy policy. Currently unused at runtime. As the project matures, this could be exposed publicly and verified in tests, which would be a genuine trust signal. Worth developing rather than removing.

**Comment the empty-MIME-type case in `validatePdfFile`.** The `hasPdfType = file.type === "" || ...` check is intentionally permissive for files dropped from systems that don't detect MIME types. A one-line comment explaining this would prevent future confusion.

---

## 5. Things That Look Solid

**Privacy architecture is genuinely correct.** No `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `localStorage`, `sessionStorage`, or `indexedDB` calls exist anywhere in the source. The E2E test explicitly collects all outgoing requests and asserts `externalRequests.toEqual([])`. This is not just an absence of bad code — it is an actively tested claim. That is the right approach.

**pdf-lib isolation is clean.** The `PdfAdapter` interface is a real abstraction. `LocalPdfAdapter` is the only implementation that imports `pdf-lib`. `mergeWorkflow.ts` never touches `pdf-lib` directly. Future features have a clear implementation pattern.

**Object URL lifecycle is correct.** The `useEffect` in `MergePdfPage.tsx` that creates and revokes the blob URL is correctly structured — cleanup calls `URL.revokeObjectURL`, effect depends on `mergeResult`. This is a common source of memory leaks; it is handled correctly here.

**PDF header validation before parsing.** `hasPdfHeader` checks for `%PDF-` magic bytes before passing data to pdf-lib. This prevents the library from attempting to parse arbitrary binary data and provides a fast, clean rejection path.

**Encrypted PDF detection is reasonable.** The heuristic that checks for `encrypt|password` in error messages is pragmatic and handles the common case gracefully.

**`StubLocalPdfAdapter` validates inputs before reporting "not implemented".** This ensures future implementations receive pre-validated inputs, and tests for new features can use the stub to confirm input validation without needing real PDF processing.

**Error messages are correctly sanitized.** `getPdfErrorMessage` only passes through specific known messages and falls back to a generic response for anything else. This prevents internal error details from leaking to users.

**Download behavior is tested end-to-end.** The E2E test verifies the filename, that a download occurs, and that the downloaded bytes begin with `%PDF-`.

**No external CDN dependencies in `index.html`.** The HTML file loads only `/src/main.tsx`. No Google Fonts, analytics scripts, or CDN-hosted dependencies at the HTML level.

**`ignoreEncryption: false`** is explicitly passed to `PDFDocument.load`. This is a security-relevant choice — the author understood the API well enough to make it deliberately.

**The threat model document is good.** It is honest about non-goals, identifies realistic attack surfaces including supply-chain risks and documentation that overstates guarantees, and avoids security theater.

---

## 6. Open Source / Trust Assessment

**What experienced engineers would immediately criticize if this went public tomorrow:**

1. **No CI.** Loudest gap by far. A project claiming verifiability with no automated verification is unconvincing to technical reviewers.
2. **Empty `tests/fixtures/`.** The README promises fixtures exist; none are present. Encrypted and corrupted PDF paths are not exercised in E2E tests.
3. **`tsconfig.base.json` globals leak.** Security-focused engineers who look at configs will catch this. It signals that not all details were reviewed carefully.
4. **`UNLICENSED` in `package.json`.** Fine for now, but must be resolved before open-sourcing. Privacy advocates will want to understand redistribution terms.
5. **`dist/` in version control.** Will raise questions about reproducible builds.

**What would increase confidence and credibility:**

1. **The `externalRequests.toEqual([])` E2E assertion** is genuinely impressive and unusual. Most tools do not test this at all.
2. **The `PdfAdapter` interface** shows architectural foresight — server-side processing could be added as an opt-in adapter without changing the UI.
3. **The threat model document** is unusually thoughtful for a project this early.
4. **`localProcessingPolicy`** signals that privacy constraints are modeled in code, not just docs.
5. **`ignoreEncryption: false`** shows the security implications of the PDF API were considered.
6. **The `getPdfErrorMessage` sanitization** shows awareness that error details should not leak to users.

---

## 7. Architecture Assessment

The architecture is appropriate for the current scope and will accommodate all planned V1 features without rework.

**Package boundaries** (`packages/core`, `packages/pdf`, `packages/ui`, `apps/web`) are sensible and correctly enforced. The adapter pattern is correctly applied — the interface has three methods that map to real operations, and is not over-abstracted.

**`mergeWorkflow.ts` is correctly factored.** Pure functions (`validatePdfFile`, `moveMergeFile`, `removeMergeFile`) are tested in isolation. Async functions that call the adapter are tested with a mock adapter. The component handles only React state concerns. This separation is correct and will scale cleanly.

**Future V1 features fit naturally:**

- **Split:** implement `LocalPdfAdapter.split()`, add `splitWorkflow.ts` parallel to `mergeWorkflow.ts`. The `validatePageRange` infrastructure in `packages/core` is already ready and tested.
- **Metadata removal:** add `removeMetadata()` to the adapter interface.
- **Page reorder:** a merge variant where page ranges are specified per document. The `MergePlan` type in `packages/core` already models this.
- **Redaction:** the placeholder correctly warns this is high-risk. Do not implement without a thorough design review of what "redacted" actually means in a PDF context.

**One scaling note:** `MergeFileItem` stores `bytes: Uint8Array` for every loaded PDF in React state. For very large files (100MB+), this will cause significant memory pressure since the bytes are loaded at file selection time rather than at merge time. This is acceptable for V1 but worth noting before any "merge large files" positioning.

**The `packages/core` page range validation** (`validatePageRange`, `normalizePageRanges`, `mergePageRanges`) is well-implemented and well-tested. The overlap-merging logic in `mergePageRanges` is correct. These will be directly useful for Split and Page Reorder.

---

## 8. Privacy Assessment

**Verdict: The claim "All document processing happens locally in your browser. Your files never leave your device." is currently accurate and supportable.**

Evidence:

- No network calls in any source file
- No analytics, telemetry, tracking, or third-party scripts
- No browser storage usage
- No CDN dependencies injected at the HTML level
- The E2E test actively verifies no external requests during a full merge workflow
- All PDF processing uses a bundled library in the main thread

**Risks to track as the project grows:**

**Supply chain.** `pdf-lib` and its dependencies are bundled. The lockfile pins versions, which is correct. Review pdf-lib changelogs before upgrading, since PDF parsers are a historically vulnerable attack surface.

**Future features.** Any feature that adds a backend, analytics, or payment provider must be explicitly scoped and labeled. The threat model correctly identifies this. Do not allow future convenience features to quietly add network calls to existing local-processing flows. The `PdfAdapter` interface specifically enables adding a server-side adapter as an opt-in alternative without contaminating the local flow.

**Memory-only storage.** Files are held only in JavaScript memory. They are not written to `localStorage` or `IndexedDB`. This is correct and consistent with the privacy claim.

**`localProcessingPolicy` is documentation, not enforcement.** The typed constant does not currently enforce anything at runtime. Do not cite it as a technical control; cite it as documented intent.

---

## 9. Assessment of Previous AI Review Findings

| Finding                                             | Verdict                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| Stale error state on reorder/remove                 | **Confirmed** — `setErrors([])` missing from move/remove handlers    |
| tsconfig.base.json globals leak                     | **Confirmed** — `"types": ["node", "vitest/globals"]` in base config |
| CI absent                                           | **Confirmed** — workflows dir contains only a README                 |
| E2E doesn't test drag-and-drop                      | **Confirmed** — only `setInputFiles` is used                         |
| Corrupted/encrypted paths have limited E2E coverage | **Confirmed** — covered at unit level, not at E2E level              |
| Local-only merge processing                         | **Confirmed and verified** — no network calls found                  |
| Proper object URL cleanup                           | **Confirmed** — `revokeObjectURL` in `useEffect` cleanup             |
| pdf-lib isolated to `packages/pdf`                  | **Confirmed** — no direct imports elsewhere                          |
| Adapter boundary maintained                         | **Confirmed**                                                        |
| Download behavior tested                            | **Confirmed** — E2E verifies filename and PDF magic bytes            |
| No obvious external network behavior                | **Confirmed and verified against source**                            |
| Dependency set appears restrained                   | **Confirmed** — lockfile is clean and appropriately scoped           |

All previous findings were accurate. No findings were incorrect. The `dist/` folder committed to git was not flagged in the previous review and is an additional should-fix item.

---

## 10. Recommended Next Implementation Step

**Add CI first, then build Split PDF.**

Before adding any feature:

1. Add a GitHub Actions workflow running `pnpm install --frozen-lockfile`, `pnpm typecheck`, and `pnpm test` on every push.
2. Add `apps/web/dist/` to `.gitignore` and remove it from the repository.
3. Fix `tsconfig.base.json` to separate test-only type globals from browser-targeted code.

These three changes take roughly an hour combined and transform the project's external credibility.

Then implement **Split PDF**. The architecture is ready:

- The `PdfSplitRequest` type and `PdfAdapter.split()` signature already exist
- `LocalPdfAdapter.split()` just needs a pdf-lib implementation using page copying
- `validatePageRange` / `normalizePageRanges` in `packages/core` are already tested and ready
- Add a `splitWorkflow.ts` parallel to `mergeWorkflow.ts`
- Use the `tests/fixtures/` directory for real PDF test files rather than more inline base64
- Cover corrupted and encrypted edge cases in E2E as part of this pass

Split PDF is the natural second feature, will exercise the existing architecture end-to-end, and will produce real fixture files that can backfill the missing coverage for the merge feature as well.
