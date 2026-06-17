# LocalDocs Foundation Phase

## Purpose

This document records the major setup, architecture, tooling, and process decisions made during the initial creation of LocalDocs.

The goal is not only to document what was done, but why it was done. Future contributors (including future Chris) should be able to understand the reasoning behind early decisions and determine whether those reasons still apply.

---

# Phase 0: Defining the Product

Before writing code, the project philosophy was established.

Core principles:

- Local-first processing whenever feasible
- No surprise uploads
- Generous free tier
- Premium convenience features
- No ads
- No dark patterns
- Strong privacy posture
- Trustworthiness over growth optimization

### Why

Many existing document utility websites require users to upload potentially sensitive files to unknown servers. LocalDocs aims to compete primarily on trust and transparency rather than feature count.

The philosophy was intentionally defined before implementation so that architecture decisions could support it.

---

# Phase 1: Development Environment Setup

The first milestone was creating a stable, reproducible development environment.

Installed:

- Git
- Node.js
- npm
- pnpm
- VS Code
- Docker Desktop
- WSL2
- Python

### Why

A reliable development environment reduces future friction and allows development effort to focus on product work rather than machine configuration.

Docker and WSL2 were installed early even though they are not immediately required because they are common parts of modern development workflows and reduce future migration pain.

---

# Phase 2: Repository Creation

Repository location:

```text
D:\Downloads\Code\LocalDocs
```

Git repository initialized.

Default branch renamed:

```text
master → main
```

### Why

Git provides version control, history, and rollback capability.

Using "main" aligns with modern repository conventions.

The specific folder location was chosen because it fits the existing personal workflow and backup strategy rather than because it is technically required.

---

# Phase 3: Project Structure

Initial structure:

```text
apps/
packages/
tests/
docs/
scripts/
.github/
```

Sub-packages:

```text
packages/core
packages/pdf
packages/ui
packages/config
```

### Why

The structure separates concerns early:

- UI
- Business logic
- PDF processing
- Configuration
- Testing
- Documentation

This creates clear boundaries and makes future growth easier.

The intent is not to optimize for current complexity but to avoid future entanglement.

---

# Phase 4: Vision Documentation

Created:

```text
docs/architecture/vision.md
```

### Why

The vision document serves as the project's primary requirements and philosophy reference.

The goal is to preserve reasoning, not merely implementation details.

Future development decisions should be compared against the vision document before implementation.

---

# Phase 5: Workspace Initialization

Created:

```text
pnpm-workspace.yaml
package.json
```

Installed:

- TypeScript
- ESLint
- Prettier
- Vitest
- Playwright
- Node type definitions

### Why

These tools establish:

- Type safety
- Formatting consistency
- Code quality standards
- Automated testing

The objective was to create standards before significant code generation occurred.

---

# Phase 6: Git Normalization

Created:

```text
.gitattributes
```

Configured:

```text
* text=auto eol=lf
```

### Why

The repository should use consistent line endings regardless of operating system.

This reduces friction when using:

- Docker
- Linux CI environments
- Future contributors' machines

The goal was consistency rather than adherence to any specific platform.

---

# Phase 7: Development Environment Documentation

Created:

```text
docs/setup/developer-setup.md
```

### Why

Environment setup is often forgotten shortly after it succeeds.

Documenting versions, installation steps, and verification procedures allows future rebuilds and simplifies onboarding.

The document acts as a reproducible setup guide.

---

# Phase 8: Shared Tooling Configuration

Added:

- TypeScript configuration
- ESLint configuration
- Prettier configuration
- Vitest configuration
- Workspace scripts

### Why

Consistency is easier to establish at the beginning of a project than to retrofit later.

Shared tooling prevents different packages from developing incompatible standards.

---

# Phase 9: Monorepo Scaffold

Created:

```text
apps/web
packages/core
packages/pdf
packages/ui
packages/config
```

along with README files and placeholder tests.

### Why

The goal was to establish architectural boundaries before implementing real functionality.

This encourages clean interfaces and discourages accidental coupling.

---

# Phase 10: Core Package

Created:

```text
packages/core
```

Containing:

- Core document types
- Validation types
- Range logic
- Pure utility functions

### Why

Business logic should not depend on UI frameworks, PDF libraries, browsers, or servers.

Core functionality should be testable in isolation.

This package is intended to become the most stable part of the system.

---

# Phase 11: PDF Abstraction Layer

Created:

```text
packages/pdf
```

Containing:

- PdfAdapter interface
- Metadata types
- Error types
- StubLocalPdfAdapter
- LocalPdfAdapter implementation

### Why

The project should depend on abstractions rather than a specific PDF library.

This preserves flexibility.

Possible future implementations include:

- pdf-lib
- PDF.js
- WASM-based tooling

The interface was intentionally created before selecting a concrete backend.

The current adapter supports metadata reading, split, merge, reorder, rotate,
delete pages, and supported metadata removal. It uses `pdf-lib` behind the
adapter boundary.

---

# Phase 12: Initial Web Application

Created:

```text
apps/web
```

Using:

- Vite
- React
- TypeScript

Included:

- Home page
- Split PDF placeholder
- Merge PDF placeholder
- Redaction placeholder
- Privacy page

### Why

The purpose was to establish application structure and user-facing messaging without prematurely implementing document processing.

The web shell exists to validate architecture, not features.

The shell later grew into the current V1 browser app with implemented Merge,
Split, Reorder Pages, Rotate Pages, Delete Pages, and Metadata Removal
workflows. Redaction remains a placeholder by design.

---

# Phase 13: Security Documentation

Created:

```text
docs/security/threat-model.md
docs/decisions/0001-local-first-browser-processing.md
```

### Why

Security and privacy assumptions should be explicit rather than implied.

The threat model documents risks.

The architecture decision record documents why local-first processing was chosen and what tradeoffs accompany that decision.

---

# Phase 14: Review-Driven Development

AI-generated code was not accepted without review.

Process:

```text
Generate
↓
Review
↓
Patch
↓
Verify
↓
Commit
```

Review criteria included:

- Privacy risks
- Hidden network behavior
- Dependency hygiene
- Testing quality
- Architectural correctness
- Local-first compliance

### Why

AI-generated code can be useful but should not be assumed correct.

The review process is intended to preserve quality while still benefiting from rapid generation.

---

# Phase 15: Initial Review Findings

Several issues were identified and corrected:

- Defensive validation added to PDF adapter boundaries
- Playwright test isolation improved
- Vite moved to development dependencies
- External request detection added to smoke tests

### Why

These fixes strengthened:

- Reliability
- Dependency hygiene
- Test accuracy
- Privacy assurances

The fixes were intentionally small and targeted rather than large refactors.

---

# Guiding Philosophy

Throughout the foundation phase, preference was given to:

- Simplicity over cleverness
- Explicitness over assumptions
- Documentation over memory
- Interfaces over implementations
- Trust over growth optimization
- Small commits over large changes

The primary question remains:

> Does this make LocalDocs more trustworthy, useful, and maintainable without adding unnecessary complexity?

If the answer is no, the change should generally be deferred.

---

# Current V1 Alignment

Implemented and hardened workflows:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

Completed infrastructure:

- Local-only browser processing architecture
- PdfAdapter boundary
- CI pipeline for format, typecheck, lint, test, and build
- Feature implementation prompts
- Focused hardening prompts
- Independent Claude review workflow
- Privacy-first project positioning

Current V1 polish:

- ZIP export for Split PDF
- Privacy page and processing-model explanation
- Accessibility review and improvements
- Error-message consistency review
- Success-message consistency review
- Documentation alignment

Browser redaction is intentionally excluded from V1. Research found that the
current browser stack cannot meet the project's definition of successful
redaction, so shipping browser redaction would create false confidence. Future
desktop or native research may revisit the idea with stronger tooling and
verification.
