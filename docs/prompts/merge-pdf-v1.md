Implement the LocalFiles Merge PDF workflow.

Context:

- LocalFiles is a privacy-first PDF utility suite.
- All document processing must occur locally in the browser.
- No document data may be uploaded to any server.
- Simplicity, trust, privacy, and maintainability are higher priorities than feature count.

Reference:
Read and follow:
docs/product/v1-product-spec.md

The Merge PDF feature is the first V1 feature and should serve as the implementation pattern for future PDF tools.

Task:
Implement a complete, production-quality Merge PDF workflow.

Functional requirements:

1. Navigation
   - Add a Merge PDF route/page if one does not already exist.
   - Ensure it fits the existing application navigation structure.

2. File selection
   - Allow selecting multiple PDF files.
   - Support drag-and-drop upload.
   - Prevent non-PDF file types from entering the workflow.

3. File list
   - Display uploaded files.
   - Display filename.
   - Display page count when available.
   - Allow removing files from the list.

4. Reordering
   - Allow users to reorder files before merge.
   - Prefer a simple, maintainable implementation over a complex drag-and-drop dependency if appropriate.

5. Merge operation
   - Use the existing PDF adapter abstraction.
   - Do not bypass architectural boundaries.
   - Merge PDFs in the user-selected order.
   - Generate a downloadable PDF.

6. Error handling
   - Handle:
     - empty input
     - invalid files
     - corrupted PDFs
     - encrypted/password-protected PDFs
     - adapter failures
   - Show clear user-facing error messages.

7. Privacy
   - Ensure processing remains entirely local.
   - Do not introduce telemetry, analytics, uploads, or cloud processing.

Non-functional requirements:

- Strong TypeScript typing.
- Accessible controls where practical.
- Responsive UI.
- Consistent styling with the existing application.
- Keep dependencies minimal.
- Do not introduce large UI frameworks or unnecessary packages.

Testing requirements:

Unit tests:

- merge success path
- file validation
- adapter error handling
- merge ordering logic

Component/UI tests:

- file selection
- file removal
- reordering
- merge action state transitions

End-to-end tests:

- upload multiple PDFs
- reorder PDFs
- merge PDFs
- download result
- invalid file handling

Validation:

Run and fix issues from:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e

Deliverables:

1. Implementation.
2. Tests.
3. Brief architecture summary.
4. List of modified files.
5. Validation results.
6. Known limitations.
7. Recommended next feature based on the V1 specification.
