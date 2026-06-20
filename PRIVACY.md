# LocalFiles Privacy and Processing Model

LocalFiles is designed so that you can work with PDFs without sending the
documents to a document-processing server.

## What Happens to a Document

When you choose a PDF, the LocalFiles application reads and processes it in your
browser. The implemented Merge, Split, Reorder Pages, Rotate Pages, Delete
Pages, and Metadata Removal tools operate in browser memory.

The basic flow is:

```text
Your PDF -> Browser memory -> Local processing -> Download you choose
```

LocalFiles does not upload the selected PDF, its contents, its filename, or its
metadata to a LocalFiles server. Generated PDFs and ZIP files are prepared in
the browser and saved only when you choose to download them.

## Network Activity

Your browser must download the LocalFiles HTML, CSS, and JavaScript files when
you open the hosted site. Those normal page requests do not contain your
documents.

The current application code does not send document data or workflow activity
to remote APIs. It includes no analytics, telemetry, advertising, tracking,
external fonts, or CDN-loaded application assets.

## Storage and Retention

Selected documents and generated results are held in browser memory for the
current page session. The application does not put documents into local
storage, session storage, IndexedDB, cloud storage, or a LocalFiles account.

Using a clear/reset action or closing or reloading the page removes the
application's references to that in-memory data. A file you download is stored
wherever your browser and operating system normally save downloads; LocalFiles
does not control that location or delete downloaded files for you.

## What LocalFiles Does Not Protect Against

Local processing cannot protect documents from a compromised device, a
malicious browser extension, browser or operating-system vulnerabilities, or
someone who already has access to your files. Metadata Removal clears the
common fields supported by the current PDF adapter; it is not a forensic
sanitization guarantee.

Browser redaction is intentionally unavailable. Hiding content visually is not
enough to guarantee that sensitive information has been removed from a PDF.

For technical details, see the [security policy](SECURITY.md) and
[threat model](docs/security/threat-model.md).
