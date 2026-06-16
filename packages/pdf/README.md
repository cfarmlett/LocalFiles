# packages/pdf

Thin PDF abstraction layer for LocalDocs.

This package defines the PDF adapter contract that the rest of the app should depend on. PDF implementation details stay behind this boundary so app code does not depend directly on a specific PDF library.

## Current API

- `PdfDocumentMetadata`
- `PdfProcessingError`
- `PdfAdapter`
- `LocalPdfAdapter`
- `StubLocalPdfAdapter`

`LocalPdfAdapter` is the browser-local implementation used by V1 Merge PDF. It uses `pdf-lib` behind the adapter interface to read page counts and merge PDFs in memory.

`StubLocalPdfAdapter` is a safe test and placeholder adapter. It validates obvious bad inputs and then reports unsupported operations.

The package does not upload files, call the network, use the filesystem, collect telemetry, or assume server-side processing.

## Future Backends

Additional adapters can later be implemented behind `PdfAdapter` using tools such as:

- PDF.js
- WASM-based PDF tooling

Those implementations should remain explicit, reviewable, and local-first. The app should continue depending on the adapter interface instead of a specific PDF library.
