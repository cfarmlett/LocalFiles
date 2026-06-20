# Documentation Audit — June 2026

This point-in-time audit records the documentation state before the current
reorganization. It is historical evidence, not a current navigation guide.

## Inventory and Disposition

| Document                                                | Current Purpose                                                              | Recommended Location                                                           | Action  |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------- |
| `README.md`                                             | Product overview, current features, setup, release status                    | `README.md`                                                                    | Keep    |
| `PROJECT_STRUCTURE_GUIDE.md`                            | Exhaustive architecture, source, dependency, and test map                    | Concise `docs/PROJECT_STRUCTURE_GUIDE.md`; original snapshot in `docs/archive` | Split   |
| `docs/privacy-and-processing.md`                        | User-facing privacy and processing explanation                               | `PRIVACY.md`                                                                   | Move    |
| `CHANGELOG.md`                                          | Detailed verifiable release changes                                          | `CHANGELOG.md`                                                                 | Keep    |
| `SECURITY.md`                                           | Security policy and reporting guidance                                       | `SECURITY.md`                                                                  | Keep    |
| `CONTRIBUTING.md`                                       | Contributor workflow and validation expectations                             | `CONTRIBUTING.md`                                                              | Keep    |
| `CODE_OF_CONDUCT.md`                                    | Community conduct policy                                                     | `CODE_OF_CONDUCT.md`                                                           | Keep    |
| `.github/PULL_REQUEST_TEMPLATE.md`                      | Pull request checklist                                                       | Existing location                                                              | Keep    |
| `.github/ISSUE_TEMPLATE/bug_report.md`                  | Bug intake form                                                              | Existing location                                                              | Keep    |
| `.github/ISSUE_TEMPLATE/feature_request.md`             | Feature intake form                                                          | Existing location                                                              | Keep    |
| `.github/ISSUE_TEMPLATE/security_privacy.md`            | Public security/privacy concern intake                                       | Existing location                                                              | Keep    |
| `.github/workflows/README.md`                           | CI directory boundary                                                        | Existing location                                                              | Keep    |
| `docs/product/feature-backlog.md`                       | Mixed shipped features, candidates, release chores, and implementation notes | Clean `docs/FEATURE_BACKLOG.md`; original snapshot in `docs/archive`           | Split   |
| `docs/product/v1-product-spec.md`                       | Completed V1 scope and status                                                | Summary in `docs/RELEASE_HISTORY.md`; detail in `docs/archive`                 | Merge   |
| `docs/product/v1.5-product-spec.md`                     | Completed V1.5 plan and release-candidate status                             | Summary in `docs/RELEASE_HISTORY.md`; detail in `docs/archive`                 | Merge   |
| `docs/architecture/vision.md`                           | Product purpose, principles, target users, and long-term intent              | Existing location                                                              | Keep    |
| `docs/architecture/v0.1.md`                             | Short, partially stale V1 status snapshot                                    | Summary in `docs/RELEASE_HISTORY.md`; detail in `docs/archive`                 | Merge   |
| `docs/architecture/project-history.md`                  | Detailed foundation and setup narrative                                      | Summary in `docs/RELEASE_HISTORY.md`; detail in `docs/archive`                 | Merge   |
| `docs/architecture/ai-workflow.md`                      | Durable AI-assisted development expectations                                 | Existing location                                                              | Keep    |
| `docs/decisions/README.md`                              | ADR folder guidance                                                          | Existing location                                                              | Keep    |
| `docs/decisions/0001-local-first-browser-processing.md` | Accepted local-first architecture decision                                   | Existing location                                                              | Keep    |
| `docs/decisions/ADR-001-redaction-not-in-v1.md`         | Accepted browser-redaction scope decision                                    | `docs/decisions/0002-browser-redaction-not-in-v1.md`                           | Move    |
| `docs/prompts/*.md` (21 files)                          | Feature prompts, hardening prompts, review templates, and research briefs    | `docs/archive/prompts`                                                         | Archive |
| `docs/ai-tasks/*.md` (18 files)                         | Implementation, hardening, review, planning, and readiness task briefs       | `docs/archive/ai-tasks`                                                        | Archive |
| `docs/reviews/*.md` (2 files)                           | Point-in-time independent technical reviews                                  | `docs/archive/reviews`                                                         | Archive |
| `docs/security/README.md`                               | Security documentation directory boundary                                    | Existing location                                                              | Keep    |
| `docs/security/threat-model.md`                         | Current threats, boundaries, risks, and mitigations                          | Existing location                                                              | Keep    |
| `docs/setup/developer-setup.md`                         | Reproducible local setup and validation                                      | Existing location                                                              | Keep    |
| `apps/web/README.md`                                    | Web application boundary and privacy constraints                             | Existing location                                                              | Keep    |
| `packages/core/README.md`                               | Core package responsibility and API                                          | Existing location                                                              | Keep    |
| `packages/pdf/README.md`                                | PDF adapter responsibility, API, and limits                                  | Existing location                                                              | Keep    |
| `packages/ui/README.md`                                 | Shared UI package boundary                                                   | Existing location                                                              | Keep    |
| `packages/config/README.md`                             | Reserved configuration package boundary                                      | Existing location                                                              | Keep    |
| `scripts/README.md`                                     | Maintenance-script directory boundary                                        | Existing location                                                              | Keep    |
| `tests/e2e/README.md`                                   | Browser-test directory guidance                                              | Existing location                                                              | Keep    |
| `tests/fixtures/README.md`                              | Safe fixture guidance                                                        | Existing location                                                              | Keep    |

No useful document was deleted. Repetitive historical groups are represented as
grouped rows because every file in each group had the same purpose and
disposition; their individual names remain visible in the archive directories.

## Main Findings

- There was no concise roadmap; release planning was embedded in version specs
  and task briefs.
- The backlog mixed future user value with shipped work, release readiness,
  technical sketches, and architecture constraints.
- Three separate product/status documents repeated V1 and V1.5 state.
- The root structure guide was accurate but too detailed to maintain after each
  source-file change.
- Prompts, AI task briefs, and reviews were useful provenance but visually
  competed with current documentation.
- Redaction research existed as a prompt and an ADR, but not as a durable
  investigation summary.

## Resulting Design

The live system uses six primary entry points:

- `README.md` — product
- `PRIVACY.md` — trust model
- `ROADMAP.md` — major direction
- `docs/FEATURE_BACKLOG.md` — future user-visible capabilities
- `docs/PROJECT_STRUCTURE_GUIDE.md` — repository orientation
- `docs/RELEASE_HISTORY.md` — completed milestones

Architecture, security, setup, and package-local references remain where they
were already clear. Research lives in `docs/investigations`; superseded detail
lives in `docs/archive`.
