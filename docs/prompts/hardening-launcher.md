# LocalDocs Hardening Review Launcher

You are performing a LocalDocs feature hardening review.

A feature-specific hardening prompt will be provided separately.

Your job is to execute the requested hardening review exactly as specified.

## Requirements

- Follow all instructions in the feature-specific hardening prompt.
- Follow all instructions in any referenced documents.
- Follow all instructions in `docs/prompts/hardening-template.md`.
- Do not broaden scope.
- Do not implement new features.
- Do not perform architectural refactors.
- Make only small, scoped fixes for issues actually found.
- Prefer proven defects over hypothetical improvements.
- Preserve the existing workflow and user experience unless a specific issue requires change.

## Review Philosophy

The goal of a hardening review is not to improve code for its own sake.

The goal is to identify and fix:

- bugs
- stale state
- memory leak risks
- accessibility issues
- privacy issues
- concrete maintainability issues
- test gaps

Do not introduce:

- new features
- speculative abstractions
- utility layers
- architectural patterns
- workflow redesigns

unless required to fix a concrete issue.

Prefer the smallest change that resolves the identified problem.

## Validation

Run all validation steps required by the referenced prompt(s).

Fix any issues discovered during validation.

## Reporting

After completing the review:

1. Summarize issues found.
2. Summarize fixes made.
3. List files modified.
4. Report validation results.
5. List remaining known limitations.
6. State whether the feature is ready for independent review.

If no issues are found in an area, explicitly say so.

If a possible improvement requires significant refactoring, defer it and explain why.

Keep the review focused, practical, and evidence-based.
