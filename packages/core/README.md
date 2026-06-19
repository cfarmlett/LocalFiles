# packages/core

Pure TypeScript business logic and shared domain types for LocalFiles.

This package should stay independent of browsers, servers, PDF libraries, analytics, telemetry, accounts, payments, and storage providers. It is the place for deterministic logic that can be tested without product infrastructure.

## Current API

`packages/core` provides the first small set of shared document workflow primitives:

- `DocumentId`
- `PageNumber`
- `PageRange`
- `SplitPlan`
- `MergePlan`
- `RedactionRegion`
- `ValidationResult`
- `validatePageRange`
- `normalizePageRange`
- `validatePageRanges`
- `normalizePageRanges`
- `localProcessingPolicy`

The range helpers are pure and deterministic. Validators return a `ValidationResult` with clear error messages. Normalizers return new values without mutating inputs and throw a `RangeError` when input cannot be normalized safely.

Page ranges are one-based and inclusive. `normalizePageRange` accepts reversed bounds and returns ascending bounds. `normalizePageRanges` normalizes each range, sorts by start page, and merges overlapping or contiguous ranges.

This package does not process PDFs, touch the DOM, access the filesystem, call the network, or assume a browser runtime.
