# Archived Project Structure Guide (June 2026)

This snapshot preserves the detailed repository map that preceded the concise,
maintainable guide in `docs/PROJECT_STRUCTURE_GUIDE.md`.

## 1. High-Level Architecture

LocalFiles is a privacy-first, static browser application for common PDF tasks. The current `1.5.0-rc1` application merges and splits PDFs, reorders, rotates, and deletes pages, and removes standard PDF metadata. Redaction is deliberately represented only by an unavailable placeholder because the current browser stack cannot provide the project's required redaction guarantees.

The repository is a pnpm monorepo with one application and four internal packages:

- `apps/web` is the React/Vite product. It owns browser interaction, workflow state, accessibility, and downloads.
- `packages/core` contains browser-independent domain types and deterministic page-range logic.
- `packages/pdf` defines the PDF boundary and implements it locally with `pdf-lib`.
- `packages/ui` provides small shared React shell components.
- `packages/config` is a reserved shared-configuration package; it currently exports only a scaffold marker.

The principal architectural boundary is `PdfAdapter`. React pages and workflow modules depend on this interface, while `LocalPdfAdapter` is the only production code that imports `pdf-lib`. UI state and browser APIs stay in `apps/web`; byte-level PDF parsing and generation stay in `packages/pdf`; reusable pure range rules stay in `packages/core`.

The high-level data flow is:

```text
User selects File objects
        |
        v
React workflow page validates selection and reads File.arrayBuffer()
        |
        v
Workflow module creates a plan/request and user-facing filenames
        |
        v
PdfAdapter -> LocalPdfAdapter -> pdf-lib, entirely in browser memory
        |
        v
Uint8Array result -> Blob/object URL -> user-initiated browser download
```

Split PDF can also pass its generated PDF byte arrays to the local ZIP32 writer in `apps/web/src/splitZip.ts`, producing a ZIP without a service or additional runtime dependency.

Privacy and local-only processing are enforced in several complementary ways:

- There is no backend application, API client, account system, upload path, analytics, telemetry, advertising, or tracking code in the repository.
- Selected files and outputs are held in component state as `File`/`Uint8Array` values. The implementation does not use local storage, session storage, IndexedDB, or cloud storage.
- `eslint.config.js` rejects direct use of `fetch`, `XMLHttpRequest`, `WebSocket`, and `EventSource` unless that policy is deliberately revisited.
- Only `packages/pdf/src/index.ts` imports `pdf-lib`; the adapter boundary keeps parser behavior localized and reviewable.
- Generated downloads use temporary object URLs. Shared export hooks revoke them when results change or components unmount, and Split ZIP revokes its one-off URL after triggering the download.
- Async-operation tokens prevent a cleared, replaced, or reconfigured workflow from publishing a stale result.
- The Playwright suite records browser requests and asserts that no request leaves the local Vite origin during the complete workflow test.
- The hosted page itself must still be downloaded normally. The privacy claim concerns document data and workflow activity, not the initial HTML, CSS, and JavaScript requests.

# 2. Repository Structure

Generated directories such as `node_modules`, `apps/web/dist`, `test-results`, and `playwright-report` are intentionally omitted.

```text
/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   │   └── ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── apps/
│   └── web/
│       ├── src/
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
├── docs/
│   ├── ai-tasks/
│   ├── architecture/
│   ├── decisions/
│   ├── product/
│   ├── prompts/
│   ├── reviews/
│   ├── security/
│   ├── setup/
│   └── privacy-and-processing.md
├── packages/
│   ├── config/
│   ├── core/
│   ├── pdf/
│   └── ui/
├── scripts/
│   └── README.md
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   └── smoke.test.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── eslint.config.js
├── playwright.config.ts
├── vitest.config.ts
├── tsconfig.base.json
├── tsconfig.json
└── tsconfig.test.json
```

| Location        | Purpose and responsibilities                                                                                                                   | What belongs here                                                                                     | What does not belong here                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/`      | GitHub contribution forms, review templates, and CI definitions.                                                                               | Repository-hosting automation and contributor-facing templates.                                       | Product runtime code, document fixtures, secrets, or generated reports.                                                                                                 |
| `apps/`         | Deployable applications. It currently contains only the browser app.                                                                           | App composition, browser state, user interaction, app-specific styling, and application entry points. | Reusable domain rules or direct PDF-library implementation details that belong behind package boundaries.                                                               |
| `docs/`         | Product, architecture, privacy, security, setup, decision, prompt, task, and review history.                                                   | Durable rationale and current behavior, plus clearly historical implementation/review artifacts.      | Runtime behavior or claims that are not reflected by the code. The product and architecture documents, rather than old prompts/reviews, are the current-status sources. |
| `packages/`     | Internal workspace libraries with explicit responsibilities.                                                                                   | Reusable pure logic, PDF adapters, shared UI primitives, and shared configuration.                    | Application-only orchestration or unrelated infrastructure.                                                                                                             |
| `scripts/`      | Reserved location for small, reviewable repository-maintenance scripts.                                                                        | Local maintenance automation when needed.                                                             | Deployment/cloud integration, telemetry, account provisioning, payments, or document-upload workflows.                                                                  |
| `tests/`        | Cross-application smoke, fixture, and browser-level tests.                                                                                     | Workspace checks, safe synthetic shared fixtures, and Playwright journeys.                            | Feature-local unit tests, which are colocated with source, or sensitive real documents.                                                                                 |
| Repository root | Workspace manifests, lockfile, shared TypeScript/lint/format/test configuration, project policies, release notes, and top-level documentation. | Settings that apply to the whole monorepo and public project governance files.                        | Feature implementations or generated build/test output.                                                                                                                 |

Important documentation subdirectories have distinct roles:

- `docs/architecture` explains the vision, project history, current V1 alignment, and AI-assisted development process.
- `docs/decisions` records accepted architecture decisions, especially local-first processing and the omission of browser redaction.
- `docs/product` describes shipped scope and backlog status.
- `docs/security` holds the threat model and security-specific context.
- `docs/prompts`, `docs/ai-tasks`, and `docs/reviews` preserve development and review history; they are useful provenance but are not automatically current roadmap truth.
- `docs/setup` contains reproducible developer setup instructions.

# 3. Application Overview

## `apps/web`

**Purpose.** The sole product application is a static React browser app for all implemented LocalFiles workflows. Vite supplies the development and production build environment; there is no application server.

**Entry points.** `index.html` provides the `#root` element and loads `src/main.tsx`. `main.tsx` creates the React root and renders `App` in `StrictMode`. `App.tsx` composes the navigation, privacy messaging, six live tools, and the intentionally unavailable redaction section.

**Main responsibilities.** The app accepts local files, tracks independent state for each tool, calls workflow helpers and the injected `PdfAdapter`, presents validation and processing status, and exposes generated bytes through download/open links. It also owns transient browser concerns such as file inputs, drag-and-drop, object URLs, stale async invalidation, and accessible announcements.

**Key architectural decisions.** The app is one hash-navigated document rather than a routed multi-page app; all feature sections are mounted together and preserve their own state. Each tool is split into a React page (`*Page.tsx`) and a mostly pure workflow module (`*Workflow.ts`). Page components accept an optional `PdfAdapter`, defaulting to `LocalPdfAdapter`, which makes the processing boundary explicit and testable. Shared result, collapse, URL, and async-token helpers keep cross-workflow behavior consistent without introducing a large component framework.

# 4. Package Overview

## `packages/core`

This package exists for deterministic business concepts that must not depend on React, browser APIs, storage, servers, or PDF libraries. Its public API includes document/page types, split/merge/redaction planning shapes, page-range validation and normalization, and the declarative `localProcessingPolicy`.

Internally it validates positive one-based inclusive ranges, normalizes reversed bounds, sorts ranges, and merges overlapping or contiguous ranges without mutating input. `apps/web/src/splitWorkflow.ts` currently uses its `PageRange` type and range validator. The remaining planning types describe intended domain shapes and are covered by package tests even where the app does not yet consume them.

## `packages/pdf`

This package exists to isolate all PDF-library-specific behavior behind `PdfAdapter`. Its public responsibilities are metadata types, stable processing errors, request contracts, the adapter interface, the production `LocalPdfAdapter`, and a validating `StubLocalPdfAdapter` for placeholders/tests.

Internally `LocalPdfAdapter` loads and validates bytes, maps parser failures to stable error codes, copies or mutates pages with `pdf-lib`, checks page orders/ranges/rotations/deletions, reads metadata, and deletes supported Info dictionary fields. Every implemented web workflow depends on this package. No application file imports `pdf-lib` directly.

## `packages/ui`

This package exists for small, reusable React shell primitives that are not specific to PDF operations. It publicly provides `Section`, `PlaceholderPanel`, and `PrivacyNote`; its internal behavior is intentionally just semantic JSX and class names, leaving styling to the app.

`apps/web/src/App.tsx` is its current consumer. Workflow-specific controls and state remain in `apps/web` rather than this package.

## `packages/config`

This package reserves a boundary for reusable TypeScript, lint, test, and formatting configuration. It currently exposes only `configPackageReady`, with a scaffold test, and has no runtime consumer.

Its documented responsibility is shared project configuration without runtime dependencies or product behavior. The active shared configuration still lives in root-level files.

# 5. Source File Reference

This reference treats implementation, tests, declarations, and executable build/test configuration as source. Prose documentation is mapped in Section 2, and the generated dependency lockfile is covered in Sections 8 and 9.

## Web application source

| File                                      | Purpose                                                                                                                                 | Notes                                                                                                           |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `apps/web/index.html`                     | Defines the HTML shell, metadata, root element, and module entry.                                                                       | Modify when changing document-level markup or page metadata.                                                    |
| `apps/web/vite.config.ts`                 | Configures the Vite development server on `127.0.0.1:5173`.                                                                             | Modify when changing web build or development-server behavior.                                                  |
| `apps/web/src/main.tsx`                   | Boots React, verifies the root element, and renders `App` under `StrictMode`.                                                           | Modify when changing application bootstrap or root providers.                                                   |
| `apps/web/src/App.tsx`                    | Composes the complete one-page app shell, hash navigation, privacy copy, implemented tools, and redaction placeholder.                  | Modify when changing global navigation, section composition, or app-wide messaging.                             |
| `apps/web/src/styles.css`                 | Holds all global, shell, workflow, result-panel, responsive, and accessibility utility styles.                                          | Modify for application-wide presentation or shared workflow styling.                                            |
| `apps/web/src/css.d.ts`                   | Declares TypeScript support for CSS module imports.                                                                                     | Modify only if stylesheet module typing changes.                                                                |
| `apps/web/src/vite-env.d.ts`              | Includes Vite's client-side ambient types.                                                                                              | Modify when adding Vite-specific type declarations.                                                             |
| `apps/web/src/CollapsibleSection.tsx`     | Wraps content in a controlled native `details`/`summary` disclosure.                                                                    | Modify when changing shared collapse semantics used by page and result lists.                                   |
| `apps/web/src/ExportResultPanel.tsx`      | Presents persistent single- or multi-file export results, download/open actions, and an optional primary action such as ZIP download.   | Modify when changing the cross-workflow export-result experience.                                               |
| `apps/web/src/exportResults.ts`           | Defines export result types and turns byte results into lifecycle-managed object URLs through a React hook.                             | Modify when adding export MIME types or changing shared URL cleanup behavior.                                   |
| `apps/web/src/pdfObjectUrl.ts`            | Copies PDF bytes into an `ArrayBuffer`, creates a PDF `Blob`, and returns an object URL.                                                | Modify when changing low-level PDF download URL creation.                                                       |
| `apps/web/src/asyncOperationToken.ts`     | Creates monotonic tokens used to ignore async completions after clear, replacement, or a newer operation.                               | Modify when changing stale-operation coordination across workflows.                                             |
| `apps/web/src/MergePdfPage.tsx`           | Implements file selection, ordering, removal, merge execution, clearing, status, and export UI.                                         | Modify for Merge PDF interaction/state behavior; byte processing remains in the adapter.                        |
| `apps/web/src/mergeWorkflow.ts`           | Validates PDF file identity, builds merge items, performs adapter-backed merge requests, and maps processing failures to safe messages. | It also contains the shared `validatePdfFile` and `getPdfErrorMessage` helpers imported by the other workflows. |
| `apps/web/src/SplitPdfPage.tsx`           | Implements single-file selection, split modes, output generation, persistent results, and local multi-output ZIP download.              | Modify for Split PDF interaction, state invalidation, or ZIP-trigger behavior.                                  |
| `apps/web/src/splitWorkflow.ts`           | Parses and validates split options, creates deterministic ranges/names, calls the adapter, and maps outputs/errors.                     | Modify when changing every-page, every-N-pages, or custom-range planning rules.                                 |
| `apps/web/src/splitZip.ts`                | Implements an uncompressed UTF-8 ZIP32 writer, CRC32 calculation, split-entry mapping, limits, and ZIP naming.                          | Modify when changing the dependency-free Split ZIP format or its safety limits.                                 |
| `apps/web/src/ReorderPagesPage.tsx`       | Implements single-file loading, collapsible page order, button and drag reordering, reset, clear, and export UI.                        | Modify for Reorder Pages interaction and state behavior.                                                        |
| `apps/web/src/reorderWorkflow.ts`         | Creates and validates complete page permutations, moves pages immutably, calls the adapter, and names outputs.                          | Modify when changing page-order rules or reorder request construction.                                          |
| `apps/web/src/RotatePagesPage.tsx`        | Implements per-page rotation controls, collapsible page settings, clear behavior, and export UI.                                        | Modify for Rotate Pages interaction and state behavior.                                                         |
| `apps/web/src/rotateWorkflow.ts`          | Initializes existing rotations, applies normalized quarter turns, validates page state, calls the adapter, and names outputs.           | Modify when changing rotation rules or adapter request mapping.                                                 |
| `apps/web/src/DeletePagesPage.tsx`        | Implements page marking/restoration, the delete-all guard, collapsible selection, clear behavior, and export UI.                        | Modify for Delete Pages interaction and state behavior.                                                         |
| `apps/web/src/deleteWorkflow.ts`          | Models immutable delete state, validates complete page coverage, blocks empty output, calls the adapter, and names outputs.             | Modify when changing deletion rules or delete request construction.                                             |
| `apps/web/src/MetadataRemovalPage.tsx`    | Loads one PDF, displays supported metadata fields, invokes removal, and presents the generated copy.                                    | Modify for metadata-removal interaction, disclosure, or result behavior.                                        |
| `apps/web/src/metadataRemovalWorkflow.ts` | Builds metadata file state, formats detected fields, calls the adapter, and creates idempotent output filenames.                        | Modify when changing displayed supported fields, naming, or request mapping.                                    |

## Package source

| File                           | Purpose                                                                                                    | Notes                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/core/src/index.ts`   | Defines pure domain types, local-processing policy, and page-range validation/normalization.               | Modify for reusable, browser-independent document rules.                                        |
| `packages/pdf/src/index.ts`    | Defines the complete PDF adapter contract and errors, then implements local PDF operations with `pdf-lib`. | Modify for byte-level PDF capabilities, adapter contracts, validation, or parser error mapping. |
| `packages/ui/src/index.tsx`    | Exports semantic shared shell components used by the app.                                                  | Modify for small reusable, non-workflow-specific React primitives.                              |
| `packages/config/src/index.ts` | Exports the current shared-config package readiness marker.                                                | Modify when this reserved package begins exposing real shared configuration.                    |

## Unit and component test source

| File                                           | Purpose                                                                                                                                                                                    | Notes                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `apps/web/src/App.test.tsx`                    | Verifies the expected section registry and local-first shell copy through static rendering.                                                                                                | Review when navigation sections or global privacy messaging change.                                     |
| `apps/web/src/CollapsibleSection.test.tsx`     | Verifies native disclosure markup and summary text.                                                                                                                                        | Review when shared collapse semantics change.                                                           |
| `apps/web/src/ExportResultPanel.test.tsx`      | Verifies single- and multi-output result markup, actions, details, and primary actions.                                                                                                    | Review when export presentation changes.                                                                |
| `apps/web/src/asyncOperationToken.test.ts`     | Exercises invalidation, newer-operation precedence, and stale read/processing suppression.                                                                                                 | Review when async state coordination changes.                                                           |
| `apps/web/src/mergeWorkflow.test.ts`           | Covers PDF file validation, immutable merge ordering/removal, adapter calls, empty input, and safe error messages.                                                                         | Review for any Merge workflow or shared PDF validation/error change.                                    |
| `apps/web/src/SplitPdfPage.test.tsx`           | Smoke-renders the default every-page Split controls.                                                                                                                                       | Review when the Split page's initial UI changes.                                                        |
| `apps/web/src/splitWorkflow.test.ts`           | Covers every split mode, edge cases, range validation, adapter mapping, output count integrity, and safe errors.                                                                           | Review when Split planning or request behavior changes.                                                 |
| `apps/web/src/splitZip.test.ts`                | Parses generated archives and tests filenames, preserved bytes, empty input, and ZIP32 boundary failures.                                                                                  | Review when Split ZIP construction or limits change.                                                    |
| `apps/web/src/ReorderPagesPage.test.tsx`       | Smoke-renders the default Reorder controls.                                                                                                                                                | Review when the Reorder page's initial UI changes.                                                      |
| `apps/web/src/reorderWorkflow.test.ts`         | Covers default order, button/drag movement, permutation integrity, adapter mapping, errors, and filenames.                                                                                 | Review when Reorder logic changes.                                                                      |
| `apps/web/src/RotatePagesPage.test.tsx`        | Smoke-renders the default Rotate controls.                                                                                                                                                 | Review when the Rotate page's initial UI changes.                                                       |
| `apps/web/src/rotateWorkflow.test.ts`          | Covers existing/default rotations, repeated quarter turns, normalization, adapter mapping, invalid state, and filenames.                                                                   | Review when Rotate logic changes.                                                                       |
| `apps/web/src/DeletePagesPage.test.tsx`        | Smoke-renders the default Delete controls.                                                                                                                                                 | Review when the Delete page's initial UI changes.                                                       |
| `apps/web/src/deleteWorkflow.test.ts`          | Covers marking/restoring, remaining order, delete-all protection, adapter mapping, safe errors, and filenames.                                                                             | Review when Delete logic changes.                                                                       |
| `apps/web/src/MetadataRemovalPage.test.tsx`    | Smoke-renders the default metadata-removal controls.                                                                                                                                       | Review when the Metadata Removal page's initial UI changes.                                             |
| `apps/web/src/metadataRemovalWorkflow.test.ts` | Covers displayed fields, empty metadata, adapter mapping, safe errors, and idempotent output naming.                                                                                       | Review when metadata display/removal workflow behavior changes.                                         |
| `packages/core/src/index.test.ts`              | Covers privacy policy values, range validation/normalization, list merging, immutability, and planning types.                                                                              | Review when core domain contracts change.                                                               |
| `packages/pdf/src/index.test.ts`               | Builds synthetic PDFs and exercises every real and stub adapter operation, validation path, metadata behavior, and stable error mapping.                                                   | This is the main byte-level PDF integration suite; review for any adapter or `pdf-lib` behavior change. |
| `packages/ui/src/index.test.ts`                | Confirms that the shared UI primitives are exported.                                                                                                                                       | Review when the UI package's public surface changes.                                                    |
| `packages/config/src/index.test.ts`            | Confirms the configuration scaffold marker.                                                                                                                                                | Review when the config package moves beyond its placeholder state.                                      |
| `tests/smoke.test.ts`                          | Provides a minimal root-level assertion that the workspace test environment runs.                                                                                                          | Modify only for a workspace-wide smoke concern.                                                         |
| `tests/e2e/app-shell.spec.ts`                  | Drives the built browser experience across navigation and all six workflows using embedded synthetic PDFs, verifies downloads and stale-output behavior, and asserts no external requests. | Review for material user-flow, privacy, download, collapse/reset/clear, or cross-feature changes.       |

## Build and validation source

| File                           | Purpose                                                                                                               | Notes                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `package.json`                 | Defines product version, required pnpm version, root validation/build scripts, and shared development dependencies.   | Modify for workspace-wide commands, versions, or tooling dependencies.                      |
| `pnpm-workspace.yaml`          | Includes `apps/*` and `packages/*` as workspace projects.                                                             | Modify when adding or relocating workspace packages.                                        |
| `pnpm-lock.yaml`               | Pins the complete resolved dependency graph for reproducible installs.                                                | Updated through pnpm when dependencies change; it is not hand-maintained application logic. |
| `apps/web/package.json`        | Declares the web app's scripts, internal package dependencies, React runtime, and Vite/type development dependencies. | Modify when the web app's dependency or command surface changes.                            |
| `packages/core/package.json`   | Defines the private core package export and check-only scripts.                                                       | Modify when core exports, dependencies, or package scripts change.                          |
| `packages/pdf/package.json`    | Defines the PDF package export, scripts, and sole runtime dependency on `pdf-lib`.                                    | Modify when PDF package dependencies or package entry points change.                        |
| `packages/ui/package.json`     | Defines the UI export, React peer dependency, and package scripts.                                                    | Modify when the shared UI package's dependency contract changes.                            |
| `packages/config/package.json` | Defines the reserved config package export and scripts.                                                               | Modify when shared configuration becomes a substantive package.                             |
| `tsconfig.base.json`           | Sets strict, ES2022, bundler-resolution, and React JSX defaults.                                                      | Modify for compiler behavior shared by production and tests.                                |
| `tsconfig.json`                | Type-checks non-test app, package, script, and configuration source without emitting files.                           | Modify when production source inclusion or compiler overrides change.                       |
| `tsconfig.test.json`           | Type-checks colocated tests and root tests with Node/Vitest globals.                                                  | Modify when test source layout or ambient test types change.                                |
| `eslint.config.js`             | Applies TypeScript and React Hooks rules, generated-file ignores, and privacy-sensitive network-global restrictions.  | Modify for repository lint policy or an explicit privacy review of network access.          |
| `vitest.config.ts`             | Runs package, app, and root unit tests in a Node environment while excluding generated directories.                   | Modify when unit test discovery or environment changes.                                     |
| `playwright.config.ts`         | Runs desktop Chromium specs from `tests/e2e` against a fresh local Vite server.                                       | Modify when browser coverage, server startup, or E2E discovery changes.                     |
| `.github/workflows/ci.yml`     | Defines separate verification and Chromium E2E jobs on Node 24 and pnpm 11.6.0.                                       | Modify when the repository's required automated validation changes.                         |

# 6. Workflow Map

All workflow pages follow the same broad sequence: validate selection, read bytes and metadata, track user configuration, call a workflow helper, call `PdfAdapter`, convert output bytes to temporary download URLs, and invalidate prior output whenever its inputs change.

## Merge PDF

**Primary files:** `apps/web/src/MergePdfPage.tsx`, `apps/web/src/mergeWorkflow.ts`, and `packages/pdf/src/index.ts` (`merge`).

**Supporting files:** `ExportResultPanel.tsx`, `exportResults.ts`, `pdfObjectUrl.ts`, `asyncOperationToken.ts`, `CollapsibleSection.tsx`, and `styles.css`.

**Tests:** `mergeWorkflow.test.ts`, the merge portion of `tests/e2e/app-shell.spec.ts`, and merge cases in `packages/pdf/src/index.test.ts`. Merge order is controlled with buttons; merge-file drag reordering is not part of the current implementation.

## Split PDF

**Primary files:** `apps/web/src/SplitPdfPage.tsx`, `apps/web/src/splitWorkflow.ts`, and `packages/pdf/src/index.ts` (`split`).

**Supporting files:** `packages/core/src/index.ts` supplies `PageRange` and validation; `splitZip.ts` builds local multi-output archives; the shared export, URL, async-token, and style files manage results and browser lifecycle.

**Tests:** `SplitPdfPage.test.tsx`, `splitWorkflow.test.ts`, `splitZip.test.ts`, Split and ZIP sections of the E2E spec, core range tests, and adapter split tests. Split planning intentionally keeps each entered custom range as a separate output, including overlapping or duplicate ranges.

## Reorder Pages

**Primary files:** `apps/web/src/ReorderPagesPage.tsx`, `apps/web/src/reorderWorkflow.ts`, and `packages/pdf/src/index.ts` (`reorder`).

**Supporting files:** `CollapsibleSection.tsx`, the shared export/URL helpers, `asyncOperationToken.ts`, `mergeWorkflow.ts` for common file/error handling, and `styles.css` for page rows and drag states.

**Tests:** `ReorderPagesPage.test.tsx`, `reorderWorkflow.test.ts`, extensive button/drag/reset/output coverage in the E2E spec, and adapter permutation tests. Button controls remain the keyboard-accessible ordering path alongside drag-and-drop.

## Rotate Pages

**Primary files:** `apps/web/src/RotatePagesPage.tsx`, `apps/web/src/rotateWorkflow.ts`, and `packages/pdf/src/index.ts` (`readMetadata` rotations and `rotate`).

**Supporting files:** the collapsible page list, shared file/error handling, export/URL lifecycle, async tokens, and styles.

**Tests:** `RotatePagesPage.test.tsx`, `rotateWorkflow.test.ts`, the Rotate E2E journey, and adapter rotation/metadata tests. Existing page rotations are read first and subsequent controls operate on normalized quarter turns.

## Delete Pages

**Primary files:** `apps/web/src/DeletePagesPage.tsx`, `apps/web/src/deleteWorkflow.ts`, and `packages/pdf/src/index.ts` (`deletePages`).

**Supporting files:** the collapsible page list, common file/error handling, export/URL helpers, async tokens, and styles.

**Tests:** `DeletePagesPage.test.tsx`, `deleteWorkflow.test.ts`, the Delete E2E journey, and adapter delete tests. Both workflow and adapter layers reject an operation that would remove every page.

## Metadata Removal

**Primary files:** `apps/web/src/MetadataRemovalPage.tsx`, `apps/web/src/metadataRemovalWorkflow.ts`, and `packages/pdf/src/index.ts` (`readMetadata`, `removeMetadata`, and Info dictionary handling).

**Supporting files:** common PDF selection/error handling, shared export/URL lifecycle, async tokens, and styles.

**Tests:** `MetadataRemovalPage.test.tsx`, `metadataRemovalWorkflow.test.ts`, metadata E2E cases, and adapter metadata tests. The feature removes the supported standard Info fields; it is explicitly not a forensic sanitizer for all possible PDF artifacts.

## Application Shell and Privacy

**Primary files:** `apps/web/src/App.tsx`, `packages/ui/src/index.tsx`, `apps/web/src/styles.css`, `docs/privacy-and-processing.md`, and `docs/decisions/0001-local-first-browser-processing.md`.

**Tests:** `App.test.tsx`, the hash-navigation E2E test, and the complete E2E test's external-request assertion. The redaction placeholder is governed by `docs/decisions/ADR-001-redaction-not-in-v1.md`.

# 7. Testing Map

## Test locations and roles

- **Unit tests** are colocated as `*.test.ts` beside pure helpers and workflow modules in `apps/web/src` and package entry points in `packages/*/src`.
- **Component smoke tests** are colocated as `*.test.tsx`. They use `react-dom/server` to verify default static markup without a browser DOM.
- **Package integration tests** are not in a separate directory. `packages/pdf/src/index.test.ts` creates synthetic PDFs with `pdf-lib` and exercises the real adapter end to end at the byte-processing boundary.
- **End-to-end tests** live in `tests/e2e`. `app-shell.spec.ts` contains one hash-navigation test and one comprehensive local-first journey across every implemented workflow.
- **Shared fixtures** are reserved under `tests/fixtures`, but the current E2E suite embeds small synthetic base64 PDFs directly in the spec. No real user documents are tracked.
- **Workspace smoke coverage** is in `tests/smoke.test.ts`.

## Feature-to-test guide

| If a change is made to…                                          | Review these tests                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| App sections, navigation, privacy copy, or redaction placeholder | `App.test.tsx`; both tests in `tests/e2e/app-shell.spec.ts`                                                      |
| Shared PDF file validation or user-facing adapter errors         | `mergeWorkflow.test.ts`; all affected workflow tests; E2E invalid-file cases                                     |
| Merge behavior                                                   | `mergeWorkflow.test.ts`; merge adapter tests; Merge section of the E2E journey                                   |
| Split modes or custom ranges                                     | `splitWorkflow.test.ts`; core range tests; split adapter tests; Split E2E section                                |
| Split ZIP export                                                 | `splitZip.test.ts`; ZIP/stale-output E2E helpers and cases                                                       |
| Reorder buttons, drag-and-drop, reset, or permutation rules      | `reorderWorkflow.test.ts`; `ReorderPagesPage.test.tsx`; reorder adapter tests; Reorder E2E section               |
| Rotation state or handling of existing rotations                 | `rotateWorkflow.test.ts`; `RotatePagesPage.test.tsx`; rotate adapter tests; Rotate E2E section                   |
| Delete state or delete-all protection                            | `deleteWorkflow.test.ts`; `DeletePagesPage.test.tsx`; delete adapter tests; Delete E2E section                   |
| Metadata fields, removal, or naming                              | `metadataRemovalWorkflow.test.ts`; `MetadataRemovalPage.test.tsx`; metadata adapter tests; Metadata E2E section  |
| Export results or object URL lifecycle                           | `ExportResultPanel.test.tsx`; `asyncOperationToken.test.ts`; result, stale-output, clear, and download E2E cases |
| `PdfAdapter`, validation, parser mapping, or `pdf-lib` usage     | `packages/pdf/src/index.test.ts`; every affected workflow test; complete E2E journey                             |
| Core page-range rules or policy types                            | `packages/core/src/index.test.ts`; `splitWorkflow.test.ts`                                                       |
| Shared UI exports or disclosure markup                           | `packages/ui/src/index.test.ts`; `CollapsibleSection.test.tsx`; collapse cases in E2E                            |

# 8. Build & Validation Pipeline

## pnpm workspace layout

The root is private and pins pnpm `11.6.0`. `pnpm-workspace.yaml` includes every immediate child of `apps` and `packages`. Internal dependencies use `workspace:*`, so the web app resolves local source directly from package exports. The root `build` command runs each workspace package's build script recursively; library packages type-check only, while the web package type-checks and creates the Vite production bundle in `apps/web/dist`.

Requirements and installation:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Run the app:

```bash
pnpm --filter @localfiles/web dev
```

Validation commands:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

- `pnpm format:check` runs Prettier in check mode over the repository.
- `pnpm typecheck` runs strict TypeScript checks once for production/config source and once with `tsconfig.test.json` for tests.
- `pnpm lint` applies ESLint's recommended JavaScript/TypeScript rules, React Hooks rules, and the privacy-sensitive network-global restrictions.
- `pnpm test` runs Vitest once in Node, discovering package, app, and root `*.test.ts(x)` files.
- `pnpm test:e2e` starts a fresh Vite server on `127.0.0.1:5173` and runs Playwright against desktop Chromium.
- `pnpm build` recursively checks all workspaces and emits only the web production bundle.

GitHub Actions mirrors these commands on Node 24. The `verify` job runs install, format, typecheck, lint, unit tests, and build. A separate `e2e` job installs Chromium with operating-system dependencies and runs Playwright. Both jobs use the frozen lockfile.

# 9. Dependency Reference

| Dependency/tool             | Responsibility and rationale in this repository                                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React / React DOM           | Provides component state, rendering, hooks, and the browser root for the single-page UI. The code uses direct React primitives rather than a larger application framework.                                      |
| Vite                        | Supplies the local development server and static production bundling for the browser-only app. Its small configuration matches the absence of server rendering or backend routes.                               |
| TypeScript                  | Enforces strict contracts across UI state, workflow plans, package APIs, and adapter requests. Separate production and test configurations keep both code paths checked.                                        |
| `pdf-lib`                   | Performs in-memory PDF parsing, copying, page mutation, serialization, and standard metadata access/removal in the browser. It is isolated in `packages/pdf` so application code is not coupled directly to it. |
| Vitest                      | Runs fast colocated unit/component tests and shares the Vite/TypeScript ecosystem. The suite uses Node because most workflow and package logic is deterministic and browser-independent.                        |
| Playwright                  | Validates the real Chromium application, file inputs, drag-and-drop, downloads, object URL cleanup, hash navigation, and the no-external-request privacy invariant.                                             |
| pnpm workspaces             | Manages the monorepo, links private internal packages through `workspace:*`, and provides one lockfile and root command surface.                                                                                |
| ESLint / typescript-eslint  | Enforces JavaScript/TypeScript correctness conventions and contains the explicit ban on unreviewed network globals.                                                                                             |
| `eslint-plugin-react-hooks` | Enforces Rules of Hooks and exhaustive dependencies in browser React code.                                                                                                                                      |
| Prettier                    | Provides repository-wide deterministic formatting and a CI format gate.                                                                                                                                         |
| Node type definitions       | Supply Node APIs used by configuration and tests, including E2E filesystem reads. Node 24 is the documented and CI runtime.                                                                                     |

The runtime dependency surface is deliberately small: the web app has React and internal workspace packages, `packages/pdf` has `pdf-lib`, `packages/ui` has React as a peer, and the other internal packages have no runtime dependencies.

# 10. Architectural Principles

## Local-only, privacy-first processing

Files become in-memory byte arrays and are passed directly to a browser-local adapter. Results become temporary object URLs and user-initiated downloads. There is no persistence, upload endpoint, remote API, or activity tracking, and lint/E2E checks guard the claim.

## Explicit architectural boundaries

React pages own browser interaction; workflow modules own feature rules and request shaping; `packages/core` owns pure cross-feature domain logic; `packages/pdf` owns PDF bytes and `pdf-lib`; `packages/ui` owns only generic shell primitives. The `PdfAdapter` interface is the central seam between product behavior and parser implementation.

## Pure, immutable workflow logic

Range normalization, list movement, page marking, rotation, and filename construction return new values rather than mutating their inputs. These helpers can be tested without mounting the application or reading actual documents.

## Transient and invalidatable state

Generated output is cleared whenever its source file or configuration changes. Async tokens prevent old work from repopulating cleared state, and object URLs are revoked as their owning result set changes. Clear actions are scoped to one tool because all tools coexist on the same page.

## Dependency injection at processing boundaries

Each workflow page accepts a `PdfAdapter` prop and otherwise uses a local default. Workflow tests pass fakes, while adapter tests exercise real PDF bytes. This keeps UI/workflow tests focused and preserves one production processing contract.

## Accessible native interaction first

The shell uses semantic sections, native file inputs, `details`/`summary`, fieldsets, live regions, and explicit labels. Reorder drag-and-drop supplements rather than replaces Move Up/Move Down controls. Collapsing content preserves workflow state.

## Conservative security claims

Metadata Removal is described as removal of supported standard fields, not forensic sanitization. Redaction is omitted rather than represented by a visually convincing but unverifiable operation. Privacy documentation also states the limits of local processing on a compromised device.

## Simplicity and reviewability over abstraction

There is one static application, no router, no backend, no styling framework, a small runtime dependency set, and straightforward colocated tests. Shared helpers are introduced around repeated lifecycle behavior, while feature-specific state stays close to each page.

## Documentation preserves rationale

Architecture decisions, threat assumptions, product scope, project history, prompts, and independent reviews are kept in separate document categories. Current product/architecture documents define present status; historical prompts and reviews explain how the implementation arrived there.

# 11. Future Maintainer Quick Start

If returning after six months, read in this order:

1. `README.md` for current release status, implemented features, and validation commands.
2. `docs/privacy-and-processing.md` and `docs/decisions/0001-local-first-browser-processing.md` for the product's central trust contract.
3. `apps/web/src/App.tsx` to see the complete product surface and navigation model.
4. One page/workflow pair—`SplitPdfPage.tsx` plus `splitWorkflow.ts` is the broadest example because it includes planning, multiple outputs, ZIP export, and stale-result handling.
5. `packages/pdf/src/index.ts` to understand the adapter contract and every byte-level capability.
6. `packages/core/src/index.ts` for shared domain rules and `packages/ui/src/index.tsx` for the small shared UI surface.
7. `tests/e2e/app-shell.spec.ts` for executable end-to-end behavior and the privacy request assertion.
8. `package.json`, `pnpm-workspace.yaml`, and the root test/lint/TypeScript configs for the validation model.
9. `docs/security/threat-model.md`, `docs/architecture/vision.md`, and `docs/product/v1.5-product-spec.md` for risk boundaries, long-term intent, and current product rationale.

The three concepts to recover first are:

1. **Everything implemented is browser-local.** Files flow through memory to a local adapter and then to temporary download URLs.
2. **A workflow has three layers.** The `*Page.tsx` file owns interaction, the `*Workflow.ts` file owns feature rules, and `PdfAdapter` owns PDF bytes.
3. **Every input/configuration change invalidates prior output.** Clear/reset behavior, async tokens, and URL cleanup are part of correctness, not incidental UI polish.
