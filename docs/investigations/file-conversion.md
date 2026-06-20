# File Conversion Investigation

**Status:** Preliminary; candidate workflows remain independent backlog items.

Investigation does not imply a commitment to ship conversion tools.

## Why It Is Interesting

PDF-to-image, image-to-PDF, text extraction, and compression are common tasks
that fit LocalFiles' local utility model. They could broaden everyday value
without requiring accounts or cloud storage.

## Potential User Value

- Export PDF pages as common image formats.
- Combine scans or photos into a PDF.
- Extract text for reuse or accessibility.
- Reduce file size for email or form-upload limits.

## Open Questions

- Which workflow has enough demand to justify its own focused tool?
- What output-quality controls are understandable without becoming complex?
- Which conversions can the current PDF adapter support, and which need a new
  rendering or encoding engine?
- How should multiple outputs, filenames, ZIP export, and large jobs behave?
- What metadata, color, transparency, orientation, and accessibility properties
  must be preserved?

## Risks and Dependencies

- Rendering and image encoding may add large dependencies or memory pressure.
- Compression claims can be misleading when output becomes visibly worse or
  unexpectedly larger.
- Text extraction quality depends on the PDF's content model and may require
  OCR for scanned pages.
- Combining several conversions into one generic engine could create more
  maintenance burden than a few isolated workflows.

Evaluate and ship conversion workflows separately. Each candidate should have a
clear user outcome, supported formats, quality limits, and local performance
budget before it enters the roadmap.
