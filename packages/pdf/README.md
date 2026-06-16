# packages/pdf

Thin PDF abstraction layer for LocalDocs.

This package defines the PDF adapter contract that the rest of the app should depend on. It intentionally does not include real PDF parsing or manipulation yet.

## Current API

- `PdfDocumentMetadata`
- `PdfProcessingError`
- `PdfAdapter`
- `StubLocalPdfAdapter`

`StubLocalPdfAdapter` is a safe local stub. It validates obvious bad inputs and then reports unsupported operations. It does not parse PDFs, alter bytes, upload files, call the network, use the filesystem, collect telemetry, or assume server-side processing.

## Future Backends

Real adapters can later be implemented behind `PdfAdapter` using tools such as:

- `pdf-lib`
- PDF.js
- WASM-based PDF tooling

Those implementations should remain explicit, reviewable, and local-first. The app should continue depending on the adapter interface instead of a specific PDF library.
