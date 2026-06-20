# Desktop Application Investigation

**Status:** Deferred pending browser-product validation.

Investigation does not imply a commitment to ship a desktop application.

## Why It Is Interesting

A desktop application could keep processing local while gaining access to
stronger native tools, larger files, filesystem workflows, and capabilities
that are difficult to verify or distribute safely in a browser.

## Potential User Value

- Better handling of large or repeated jobs.
- Local folder and batch workflows.
- Stronger native PDF engines for high-trust operations.
- An installable, potentially offline-first product experience.

## Open Questions

- Which user needs are genuinely blocked by the browser application?
- Is a cross-platform shell sufficient, or do target features require native
  platform code?
- How will signing, notarization, updates, rollback, and release verification
  work?
- Can the web UI and domain packages be reused without coupling them to desktop
  APIs?
- Which operating systems can a solo developer support reliably?

## Risks and Dependencies

- A second platform multiplies packaging, security, release, and support work.
- Native filesystem access and update mechanisms create new trust boundaries.
- Platform-specific PDF engines may produce inconsistent behavior.
- Starting desktop work too early could split attention before product demand is
  understood.

Revisit after early feedback identifies browser limits that materially block
valuable workflows. Any proposal should name the blocked use case and its full
distribution and update model.
