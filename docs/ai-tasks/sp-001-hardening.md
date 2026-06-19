Status: Completed historical hardening review.

Perform a read-only hardening review of the completed SP-001 implementation.

Context:

SP-001 adds ZIP export support to Split PDF.

The implementation:

- Adds a local ZIP writer in `apps/web/src/splitZip.ts`.
- Does not add an external ZIP dependency.
- Generates ZIP files lazily when the user clicks `Download ZIP`.
- Derives ZIP contents from already-generated Split PDF outputs.
- Preserves individual PDF downloads.
- Adds a primary action slot to `ExportResultPanel`.
- Does not store ZIP bytes as a second source of truth.
- Preserves UX-003, UX-004, UX-005, and existing Split validation behavior.

Requirements:

- Do not modify files.
- Do not implement fixes.
- Do not broaden scope beyond SP-001.
- Evaluate the implementation as it currently exists.
- Assume the feature is complete and look for correctness issues, ZIP-format issues, stale-output bugs, accessibility issues, UX inconsistencies, maintainability concerns, browser behavior issues, memory/performance concerns, and test gaps.

Review Areas:

- ZIP archive correctness
- ZIP filename generation
- ZIP entry filename handling
- Lazy ZIP generation behavior
- Repeated ZIP downloads
- Stale-output invalidation
- Error handling
- Export Result Panel integration
- Individual PDF download preservation
- Single-output Split behavior
- Memory/performance behavior
- Browser compatibility
- Accessibility
- Local-only/privacy-first guarantees
- Test coverage

For every issue found provide:

- Severity: Must Fix / Should Fix / Nice To Have
- File(s) involved
- Description
- Risk if left unchanged
- Recommended fix

Also identify:

- Strong implementation decisions worth keeping
- Areas that are cleaner than expected
- Areas that appear over-engineered or under-engineered
- Any places where SP-001 scope may have expanded beyond Split PDF ZIP export

---

## Specific Validation Questions

### ZIP Format and Compatibility

1. Does the ZIP archive structure conform well enough for common ZIP readers?

2. Does the generated ZIP open successfully in common archive tools?

Review for:

- malformed local file headers
- malformed central directory records
- incorrect file sizes
- incorrect offsets
- incorrect CRC values
- filename encoding issues
- archive-reader compatibility concerns

3. Are generated PDFs included with the expected filenames?

4. Does the ZIP filename follow:

```text
original-name-split.zip
```

5. Could ZIP entry filenames collide or overwrite one another for any supported Split workflow output configuration?

---

### Split Workflow Behavior

6. Are single-output Split results free of ZIP actions?

7. Are individual PDF downloads still available and unchanged?

8. Is the ZIP action clearly primary without hiding individual downloads?

9. Does `Generated Files (N)` still count only PDFs, not the ZIP artifact?

10. Is ZIP generation derived from current Split outputs rather than rerunning PDF splitting?

11. Is ZIP generation lazy and free of unnecessary long-lived ZIP state?

12. Do repeated ZIP downloads work correctly?

---

### Stale Output and Async Behavior

13. Does changing Split configuration invalidate the ZIP action/state along with outputs?

14. Does changing the source file invalidate the ZIP action/state along with outputs?

15. Does Clear remove ZIP-related UI/state along with Split outputs?

16. Does regeneration produce a ZIP corresponding exactly to the newly visible outputs?

17. Can stale ZIP data be downloaded after inputs/configuration change?

18. Can a user begin ZIP generation, then change Split inputs, and still receive a ZIP corresponding to stale outputs?

Review whether lazy ZIP generation correctly respects current Split state throughout the ZIP-generation lifecycle.

19. Does the ZIP download always correspond exactly to the currently visible generated outputs?

---

### Error Handling

20. Do ZIP generation failures show clear user-facing errors distinct from PDF-processing failures?

21. Do ZIP generation failures preserve valid individual PDF outputs?

22. Are ZIP-generation failure paths covered by automated tests?

If not, is the gap significant?

---

### Export Result Panel Integration

23. Does the primary action slot remain generic and safe for other workflows?

24. Does the primary action slot preserve ExportResultPanel's workflow-agnostic design?

25. Does the Export Result Panel avoid becoming Split-specific?

---

### Memory and Performance

26. Does the implementation avoid duplicating generated PDF bytes unnecessarily?

27. Does ZIP generation temporarily duplicate all generated PDF bytes in memory?

If so:

- quantify the duplication where practical
- assess whether it is reasonable for realistic LocalFiles usage

28. Are memory and performance reasonable for large but realistic split outputs?

29. Are the no-compression and no-ZIP64 limitations acceptable and appropriately scoped?

---

### Browser Compatibility

30. Does ZIP download rely on browser behavior that may differ across:

- Chromium
- Firefox
- Safari

Identify assumptions that may reduce compatibility.

31. Are Blob creation, download triggering, and cleanup handled safely across major browsers?

---

### Privacy and Security

32. Does the implementation avoid:

- external requests
- telemetry
- analytics
- uploads
- accounts
- new dependencies

33. Does ZIP generation remain entirely local?

---

### Test Coverage

34. Are tests sufficient for:

- ZIP filename generation
- ZIP entry mapping
- ZIP archive structure
- multi-output ZIP availability
- single-output no-ZIP behavior
- repeated ZIP downloads
- stale-output invalidation
- individual download preservation
- no-external-request guarantees

35. Are the most important SP-001 behaviors verified through automated tests rather than only manual reasoning?

---

## After Review Provide

1. Overall assessment
2. Must Fix issues
3. Should Fix issues
4. Nice To Have improvements
5. ZIP format and compatibility assessment
6. UX/accessibility assessment
7. Memory/performance assessment
8. Browser compatibility assessment
9. Test coverage assessment
10. Future extensibility assessment
11. Recommended next steps

Do not propose speculative redesigns.

Prefer incremental improvements that align with the current architecture and V1.5 goals.
