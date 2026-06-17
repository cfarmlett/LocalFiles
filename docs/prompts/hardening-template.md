# LocalDocs Hardening Review Template

This document defines the standard hardening review process for LocalDocs features.

Feature-specific hardening prompts should reference this document and add only the feature-specific review areas.

---

## Review Standard

Prefer proven defects over hypothetical improvements.

Do not make changes solely because something could be improved.

Only modify code when:

* a bug exists
* a stale state exists
* a memory leak risk exists
* an accessibility issue exists
* a privacy issue exists
* a test gap exists
* a maintainability issue is concrete and low-risk to fix

Do not introduce:

* new features
* speculative abstractions
* utility layers
* helper frameworks
* architectural patterns

unless required to fix a concrete issue.

Prefer the smallest change that resolves the identified problem.

---

## Preserve Existing UX

Preserve the existing workflow and user experience.

Do not redesign:

* navigation
* workflow structure
* output presentation
* download behavior
* page layout

unless required to fix a specific issue.

---

## Review Areas

### 1. Correctness

Verify the feature behaves according to its specification.

Review:

* edge cases
* invalid inputs
* boundary conditions
* state transitions
* output correctness

Do not change intended behavior unless a clear defect exists.

---

### 2. Existing Utility Reuse

Inspect the implementation and confirm:

* existing utilities are reused where appropriate
* validation logic is not unnecessarily duplicated
* architecture remains consistent with existing project patterns

---

### 3. Adapter Boundaries

Confirm:

* the web application does not import pdf-lib directly
* PDF manipulation remains inside packages/pdf
* adapter boundaries remain intact
* implementation follows established architecture

---

### 4. Privacy / Local-Only Behavior

Confirm no new:

* fetch calls
* XMLHttpRequest calls
* navigator.sendBeacon usage
* analytics
* telemetry
* external assets
* upload paths
* server processing
* browser storage of document contents

Review newly added dependencies for:

* telemetry capabilities
* cloud integrations
* hidden network behavior
* unexpected browser storage behavior

Only report concrete findings.

---

### 5. Object URL Lifecycle

Confirm generated output URLs are revoked appropriately when:

* outputs are replaced
* files change
* inputs change
* actions rerun
* components unmount

Fix any memory leak risk with minimal changes.

---

### 6. State Cleanup

Check for stale:

* validation errors
* adapter errors
* generated outputs
* download links
* selected file state
* feature-specific workflow state

when:

* files change
* invalid input occurs
* actions rerun
* settings change

Fix confusing stale UI states with minimal changes.

---

### 7. Error Quality

Ensure user-facing errors are:

* clear
* sanitized
* actionable
* consistent with other LocalDocs tools

---

### 8. Accessibility

Review:

* file inputs
* drag-and-drop zones
* buttons
* controls
* download links
* status messages
* error messages

Make small improvements such as:

* labels
* aria-labels
* aria-describedby
* role="alert"

where appropriate.

Do not redesign the UI.

---

### 9. Test Coverage and Reliability

Review tests for:

* correctness
* edge cases
* invalid inputs
* output generation
* download behavior
* no-external-requests assertions

Add or adjust tests only where there is a clear gap or brittleness.

Do not add large fixtures or heavy dependencies unless necessary.

---

### 10. Dependencies and Bundle

Confirm no unnecessary dependencies were introduced.

Do not optimize bundle size unless a concrete issue is found.

Do not perform speculative performance work.

---

### 11. Workflow Consistency

Review whether the feature remains consistent with other LocalDocs tools.

Consider:

* file-selection behavior
* error presentation
* loading states
* output presentation
* download behavior

Only recommend changes if inconsistency creates user confusion.

---

## Validation

Run and fix issues from:

* pnpm format:check
* pnpm typecheck
* pnpm lint
* pnpm test
* pnpm test:e2e
* pnpm build

---

## Output

Provide:

1. Issues found.
2. Fixes made.
3. Files modified.
4. Validation results.
5. Remaining known limitations.
6. Whether the feature is ready for independent review.

If no issues are found in an area, explicitly say so.

If a possible improvement requires significant refactoring, defer it and explain why.

Keep the review focused, practical, and evidence-based.
