# Security Policy

LocalFiles processes documents locally in the browser. The current application
has no document-processing backend, upload path, analytics, telemetry,
advertising, or tracking. Security reports that could affect this model are
especially important.

## Supported Versions

The current LocalFiles version is the `1.5.0-rc1` release candidate. Only this
release-candidate line is supported while the project is in prerelease.
Historical development versions are not supported, and no support commitment
is made here for future versions.

| Version                      | Supported |
| ---------------------------- | --------- |
| `1.5.0-rc1`                  | Yes       |
| Earlier development versions | No        |

## Reporting a Vulnerability

Report potential vulnerabilities privately by email to
[security@localfiles.org](mailto:security@localfiles.org). Include the affected
version or commit, a concise description of the impact, and reproduction steps
when practical.

Do not publish exploit details, sensitive documents, personal information,
credentials, or other confidential material in a public issue. Do not attach a
private document to a report; use a small synthetic example when a file is
needed. Non-sensitive privacy questions and hardening suggestions may be raised
through the security/privacy issue template.

Reports will be reviewed on a best-effort basis. Response or remediation times
are not guaranteed while the project remains a small prerelease project.

## Scope

Useful reports include:

- document contents, filenames, or metadata unexpectedly leaving the device;
- unexpected network requests, telemetry, analytics, or tracking;
- unsafe handling of malformed or hostile PDFs;
- cross-site scripting or unsafe rendering of document-controlled values;
- retention of documents or derived data without clear user action;
- dependency or build-pipeline vulnerabilities affecting distributed code; and
- privacy or security claims that do not match implementation behavior.

Reports about compromised devices, malicious browser extensions, or behavior
outside LocalFiles code may be out of scope unless LocalFiles makes the impact
worse.

See the [threat model](docs/security/threat-model.md) and
[privacy and processing model](PRIVACY.md) for the current
security boundaries and privacy behavior.
