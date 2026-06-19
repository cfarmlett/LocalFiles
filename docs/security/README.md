# docs/security

Security and privacy documentation for LocalDocs.

This folder holds threat models, privacy assumptions, and security notes. The
default stance is local-first processing with no backend, no cloud dependency,
no surprise uploads, no analytics, no telemetry, no accounts, and no payment
code for the current V1 workflows.

The current redaction position is conservative: browser redaction is
intentionally unavailable because the current browser stack cannot satisfy the
project's definition of successful redaction without creating false confidence.

Public-facing guidance is available in the repository
[security policy](../../SECURITY.md) and
[privacy and processing model](../privacy-and-processing.md).
