# LocalFiles Project Structure Guide

This guide is the durable map of the repository. It explains where current
truth lives and where new information should go without cataloging every source
file.

## First Ten Minutes Back

Read these documents in order after time away:

1. [`README.md`](../README.md) — product purpose, current features, and setup.
2. [`PRIVACY.md`](../PRIVACY.md) — the user-facing processing and trust model.
3. [`RELEASE_HISTORY.md`](RELEASE_HISTORY.md) — what has already been built.
4. [`ROADMAP.md`](../ROADMAP.md) — current and later product direction.
5. [`FEATURE_BACKLOG.md`](FEATURE_BACKLOG.md) — unscheduled user-visible ideas.
6. [`setup/developer-setup.md`](setup/developer-setup.md) — local development.

## Repository Map

```text
/
|-- apps/web/                 Browser application
|-- packages/core/            Pure domain types and page-range rules
|-- packages/pdf/             PDF adapter and pdf-lib implementation
|-- packages/ui/              Small shared React components
|-- packages/config/          Reserved shared-configuration package
|-- tests/                    Workspace smoke tests, E2E tests, and fixtures
|-- docs/                     Planning, architecture, investigations, and history
|-- scripts/                  Repository-maintenance scripts
|-- README.md                 Product and contributor entry point
|-- PRIVACY.md                User-facing privacy and processing model
|-- ROADMAP.md                High-level product direction
|-- CHANGELOG.md              Verifiable release-by-release changes
|-- SECURITY.md               Vulnerability reporting and security scope
`-- package.json              Product version and workspace commands
```

Generated directories such as `node_modules`, `apps/web/dist`, `test-results`,
and `playwright-report` are not source and should not be documented as permanent
structure.

## Architecture at a Glance

LocalFiles is a static React/Vite application. Implemented document workflows
run in browser memory and do not use a document-processing backend.

```text
File selected by user
        -> workflow page and pure planning logic
        -> PdfAdapter
        -> LocalPdfAdapter / pdf-lib
        -> Uint8Array result
        -> user-chosen browser download
```

The main boundary is `PdfAdapter`. Application code depends on the interface;
`packages/pdf` owns the concrete PDF-library dependency.

## Where Relevant Code Lives

| Area                     | Location                                                                          | Responsibility                                          |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| App shell and navigation | `apps/web/src/App.tsx`                                                            | Page composition, navigation, privacy copy              |
| PDF tool screens         | `apps/web/src/*Page.tsx`                                                          | File input, browser state, validation feedback, actions |
| Workflow planning        | `apps/web/src/*Workflow.ts`                                                       | Mostly pure requests, plans, and output names           |
| Shared browser helpers   | `apps/web/src/ExportResultPanel.tsx`, `asyncOperationToken.ts`, `pdfObjectUrl.ts` | Export UI and transient resource lifecycle              |
| Split ZIP generation     | `apps/web/src/splitZip.ts`                                                        | Local ZIP32 creation and limits                         |
| Domain rules             | `packages/core/src/index.ts`                                                      | Shared types and page-range logic                       |
| PDF processing           | `packages/pdf/src/index.ts`                                                       | Adapter contracts and local PDF operations              |
| Shared UI                | `packages/ui/src/index.tsx`                                                       | Small app-shell components                              |
| Tests                    | colocated `*.test.*`, `tests/e2e`, `tests/smoke.test.ts`                          | Unit, component, browser, and workspace coverage        |

Each application and package directory has a short README for its local
boundary. Use those before adding package-level prose here.

## Documentation Map

| Question                              | Source of truth                                              |
| ------------------------------------- | ------------------------------------------------------------ |
| What is the product?                  | `README.md` and `docs/architecture/vision.md`                |
| Why should users trust it?            | `PRIVACY.md`, `SECURITY.md`, `docs/security/threat-model.md` |
| What has shipped?                     | `docs/RELEASE_HISTORY.md` and `CHANGELOG.md`                 |
| What comes next?                      | `ROADMAP.md`                                                 |
| What features might be useful?        | `docs/FEATURE_BACKLOG.md`                                    |
| Why was a technical choice made?      | `docs/decisions`                                             |
| What future area has been researched? | `docs/investigations`                                        |
| How do I develop it?                  | `docs/setup/developer-setup.md` and `CONTRIBUTING.md`        |
| Where is historical project context?  | `docs/archive`                                               |

## Documentation Rules

- Keep the roadmap strategic; do not turn it into a task list.
- Keep the backlog user-facing. If a completed item could not appear in release
  notes, it probably does not belong there.
- Create an ADR only for a meaningful decision whose reasoning should survive
  the implementation.
- Create an investigation only when there is actual research or a set of open
  questions worth preserving. Investigation is not commitment.
- Move shipped outcomes into release history and the changelog.
- Archive superseded plans instead of keeping multiple files as current truth.
- Prefer updating an existing source of truth over adding a new document.

## Validation Commands

The normal repository checks are:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

For documentation-only changes, at minimum check formatting, links, and the
diff. Run broader validation when documentation changes include executable
examples or when release policy requires it.
