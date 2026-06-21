# apps/web

Browser application for LocalFiles.org.

This app is a Vite, React, and TypeScript browser app for local-first PDF tools.
The current V1 workflows are Merge PDF, Split PDF, Reorder Pages, Rotate Pages,
Delete Pages, and Metadata Removal.

The app has no backend, login, server upload path, analytics, telemetry, external fonts, trackers, or CDN assets. Page copy should continue to state plainly that files stay local in the browser.

Browser redaction remains intentionally unavailable. The app may show the
Redact PDF section only as a clear placeholder that makes no redaction claims.

## Result and ZIP lifecycle

Split PDF outputs are the canonical generated results. ZIP export is generated
lazily from the current results and must not rerun splitting. When inputs or
settings change, invalidate the ZIP export along with all stale outputs.
