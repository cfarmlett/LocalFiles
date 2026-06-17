# Project Alignment Pass

Perform a Project Alignment Pass for LocalDocs.

This is a documentation, roadmap, planning, and project-positioning task.

This is not a feature implementation task.

Do not implement new functionality.
Do not add dependencies.
Do not perform architectural refactors.
Do not implement ZIP export.
Do not implement accessibility changes.
Do not perform UI redesigns.

The goal is to align the repository documentation, roadmap, architecture descriptions, and product positioning with the current state of the project.

---

## Current Project State

Implemented and hardened features:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

Completed infrastructure:

- Local-only processing architecture
- PdfAdapter boundary
- CI pipeline
- Hardening review workflow
- Independent Claude review workflow
- Privacy-first project positioning

Redaction research has been completed.

Current project position:

- Browser redaction is intentionally excluded from V1.
- Browser redaction does not meet the project's definition of successful redaction.
- Future desktop/native research may occur.
- Browser redaction should not appear as planned V1 work.

---

## Primary Objective

Bring the repository into alignment with reality.

A new contributor should be able to read the documentation and accurately understand:

- what has been completed
- what is currently planned
- what is intentionally excluded
- how development works
- how reviews work
- where the project is going next

---

## Documentation Alignment Priority

Documentation alignment takes priority over creating new planning documents.

When an existing document can be updated to accurately reflect the current project state:

- update the existing document

Do not create duplicate documents that contain overlapping information.

Create new documents only when there is no appropriate existing location for the information.

Minimize documentation sprawl.

---

## Documentation Audit

Review project documentation, including but not limited to:

- README files
- architecture documents
- roadmap documents
- product documents
- planning documents
- prompt documents
- review documents
- onboarding/contributor documents
- vision documents

Before making changes, identify:

- stale assumptions
- outdated roadmap items
- V1 features incorrectly listed as incomplete
- V1 features incorrectly listed as future work
- references to browser redaction as a planned feature
- roadmap inconsistencies
- architecture descriptions that no longer match the codebase
- development workflow descriptions that no longer match reality

Include a summary of these findings in the final output.

---

## V1 Definition

Update documentation so V1 accurately reflects:

### Implemented

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

### V1 Polish

- ZIP export for Split PDF
- Privacy page
- Processing model explanation
- Accessibility review and improvements
- Error-message consistency review
- Success-message consistency review
- Documentation alignment

### Explicitly Excluded

- Browser Redaction

Document why:

- trust
- false-confidence risk
- capability assessment results
- project definition of successful redaction

The documentation should clearly communicate that browser redaction is intentionally omitted, not forgotten.

---

## V1.5 Definition

Update roadmap documentation so V1.5 accurately reflects current priorities.

Expected examples:

- PDF → Images
- Images → PDF
- Text Extraction
- Compression

If current roadmap documents differ, update them to match current project direction.

Do not invent major new product categories.

Do not create speculative future roadmaps beyond what is already supported by project discussions and documentation.

---

## Privacy & Trust Documentation

Review whether the repository contains clear documentation describing:

### Privacy Model

- local processing
- no uploads
- no telemetry
- no analytics
- no cloud processing

### Processing Model

Example concept:

User PDF
→ Browser Memory
→ Local Processing
→ Download

Never leaves device.

### Redaction Position

Explain:

- browser redaction is intentionally unavailable
- why
- future possibilities
- trust-first philosophy

If these topics already exist, improve them.

If they do not exist, create appropriately scoped documentation.

---

## Accessibility Planning

Review accessibility documentation.

If none exists, create a small planning document.

Document:

- current accessibility posture
- keyboard-navigation expectations
- future review items

Do not perform a full accessibility implementation pass.

This is planning/documentation only.

---

## UX Consistency Review

Review current implemented workflows.

Identify inconsistencies involving:

- success messages
- error messages
- terminology
- output naming
- empty states

Create a prioritized polish checklist.

Do not perform broad UI rewrites.

Document findings and recommendations.

---

## ZIP Export Planning

ZIP export is now considered V1 polish.

Create or update planning documentation describing:

- why ZIP export belongs in V1
- user workflow improvements
- expected UX
- expected constraints
- interaction with Split PDF

Do not implement ZIP export.

The purpose is to prepare for the next implementation pass.

---

## Architecture & Contributor Readiness

Ensure documentation accurately describes:

### Repository Structure

- apps/web
- packages/core
- packages/pdf

### Architecture

- PdfAdapter responsibilities
- browser/application boundaries
- local-processing model

### Development Workflow

- feature implementation workflow
- hardening workflow
- Claude review workflow
- validation expectations

A new contributor should be able to understand the project from the documentation alone.

---

## Scope Control

Do not:

- implement ZIP export
- implement accessibility changes
- implement V1.5 features
- implement redaction
- redesign the UI
- perform architectural rewrites

Keep changes focused on:

- documentation
- roadmap alignment
- planning
- contributor understanding
- project positioning

---

## Validation

Run:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm build

Fix any issues caused by documentation updates.

Do not make unrelated code changes.

---

## Output

Provide:

1. Documentation audit findings.
2. Documentation alignment summary.
3. Roadmap changes made.
4. New documents created.
5. Existing documents updated.
6. Remaining documentation debt.
7. Recommended next implementation task.

The repository should be left in a state where the documentation accurately reflects the current product, roadmap, architecture, trust model, and development process.
