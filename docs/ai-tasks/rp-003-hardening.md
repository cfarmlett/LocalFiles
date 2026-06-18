Perform a read-only hardening review of the completed RP-003 implementation.

Context:

RP-003 adds drag-and-drop page reordering to the Reorder Pages workflow.

The implementation:

- Uses native browser drag-and-drop.
- Uses a local drag handle.
- Introduces a deterministic insert-before drop model.
- Preserves existing Move Up / Move Down controls.
- Preserves RP-001 Reset Order behavior.
- Preserves UX-003 Export Result Panel behavior.
- Preserves UX-004 Clear and async invalidation behavior.
- Preserves UX-005 collapsible section behavior.

The intended scope is narrow: provide drag-and-drop as an alternate way to manipulate the existing page-order state.

Requirements:

- Do not modify files.
- Do not implement fixes.
- Do not broaden scope beyond RP-003.
- Evaluate the implementation as it currently exists.
- Assume the feature is complete and look for correctness issues, drag-and-drop edge cases, state bugs, stale-output bugs, accessibility issues, UX inconsistencies, maintainability concerns, browser-behavior issues, and test gaps.

Review Areas:

- Drag-and-drop behavior
- Insert-before placement logic
- Native drag-and-drop browser behavior
- Drag lifecycle behavior
- Drag state ownership
- Drag handle usability
- Shared reorder logic reuse
- Output invalidation
- Reset Order compatibility
- Original-order baseline integrity
- Clear compatibility
- Collapse/expand compatibility
- Accessibility
- Keyboard accessibility preservation
- Focus behavior
- Visual state cleanup
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
- Any places where RP-003 scope may have expanded into unrelated reorder features

Specific Validation Questions:

1. Does dragging Page A onto Page B consistently insert Page A immediately before Page B?
2. Is insert-before behavior implemented consistently for both upward and downward moves?
3. Does drag-and-drop ultimately update the same page-order state used by existing controls?
4. Is there a single source of truth for page order?
5. Does drag-and-drop clear stale generated reorder output?
6. Does drag-and-drop remove stale UX-003 Export Result Panel output?
7. Can stale output reappear after drag operations due to async processing completing later?
8. Does drag-and-drop preserve the loaded file and page metadata?
9. Does drag-and-drop preserve RP-001 original-order baseline tracking?
10. Can drag operations accidentally mutate the original-order baseline?
11. Does Reset Order restore the original order after drag reordering?
12. Is Reset Order correctly enabled and disabled after drag operations?
13. Does Clear still fully reset the workflow after drag operations?
14. Does drag-and-drop preserve UX-005 collapse/expand presentation state?
15. Does collapse/expand preserve dragged page order?
16. Are canceled drag operations treated as no-ops?
17. Are abandoned drag operations treated as no-ops?
18. Is dropping a page onto itself treated as a no-op?
19. Are no-op drag interactions prevented from clearing output or modifying workflow state?
20. Does the drag handle remain usable without interfering with Move Up / Move Down controls?
21. Does drag behavior remain understandable for large page counts?
22. Is visual feedback sufficient to understand:

    - which page is being dragged
    - where it will be inserted

23. Is focus behavior reasonable after drag operations?
24. Are existing keyboard-accessible reorder controls still fully functional?
25. Does the implementation avoid introducing network activity, telemetry, analytics, accounts, dependencies, or external uploads?
26. Are tests sufficient for:

    - upward moves
    - downward moves
    - canceled drags
    - self-drop
    - output invalidation
    - Reset Order compatibility
    - baseline preservation
    - Clear compatibility
    - collapse compatibility
    - no-external-request guarantees

27. Are the most important RP-003 behaviors verified through automated tests rather than only manual reasoning?
28. Does the implementation behave correctly if `dragend` occurs without a successful drop?
29. Are drag-related visual indicators always removed after completed, canceled, abandoned, or failed drag interactions?
30. Is drag state kept local and temporary, without becoming a second source of truth for page order?
31. Can collapse/expand interactions during or immediately after drag operations leave drag state inconsistent?
32. Are drag-specific edge cases covered by automated tests, rather than relying solely on the browser's native drag implementation?
33. Is the drag handle discoverable enough for first-time users without requiring instructional text?

After review provide:

1. Overall assessment
2. Must Fix issues
3. Should Fix issues
4. Nice To Have improvements
5. Test coverage assessment
6. Accessibility assessment
7. UX consistency assessment
8. Browser compatibility assessment
9. Future extensibility assessment
10. Recommended next steps

Do not propose speculative redesigns.

Prefer incremental improvements that align with the current architecture and V1.5 goals.
