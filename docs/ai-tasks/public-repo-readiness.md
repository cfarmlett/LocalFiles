Implement the “Before making it public” items from the repository audit.

Scope:

1. Add SECURITY.md

   - Create a standard open-source security policy.
   - Include:

     - Supported versions.
     - Vulnerability reporting guidance.
     - Scope of security reports.

   - Include response expectations only if they can be reasonably maintained; otherwise use non-committal language.
   - Align with the LocalFiles privacy-first and local-processing model.
   - Reference existing security documentation where appropriate.
   - Do not invent email addresses, contact methods, or placeholder security contacts.
   - If no security contact exists, document that a reporting process will be established before public release.
   - For supported versions:

     - Reflect the current repository state accurately.
     - If only the current release-candidate version is supported, state that clearly.
     - Do not invent support commitments for future or historical versions.

2. Add CONTRIBUTING.md

   - Document:

     - Local development setup.
     - Branch workflow.
     - Pull request expectations.
     - Testing requirements.
     - Code review expectations.
     - Privacy and security expectations for new dependencies.

   - Emphasize maintaining the local-only processing model.
   - Keep contributor guidance concise and practical.

3. Add CHANGELOG.md

   - Adopt a conventional, maintainable format.
   - The changelog should begin with the existing v1.5.0-rc1 release candidate.
   - Do not attempt to reconstruct undocumented historical development history.
   - Only include information that can be directly verified from the repository, existing tags, implemented functionality, and current documentation.
   - Do not invent features that do not exist.
   - Do not fabricate release dates, release notes, or development history.
   - Clearly distinguish release candidates from future releases.

4. Add GitHub templates

   - Add a pull request template.
   - Add issue templates for:

     - Bug reports.
     - Feature requests.
     - Security/privacy concerns.

   - Include a privacy-impact checklist where appropriate.
   - Encourage disclosure of any new network behavior, external services, analytics, telemetry, or data collection.

5. Expand README.md

   - Improve readiness for public viewing.
   - Add:

     - License information.
     - Contribution guidance.
     - Security policy links.
     - Supported Node.js and pnpm versions.
     - Testing commands.
     - E2E testing instructions.
     - Release/versioning overview.
     - Project status summary.

   - Preserve the existing privacy-focused messaging.
   - Keep claims accurate and verifiable.
   - Clearly distinguish implemented functionality from ideas, backlog items, and future possibilities.
   - Do not present planned features as committed future releases.

6. Create a user-facing privacy and processing model document

   - Explain:

     - Documents are processed locally in the browser.
     - Files are not uploaded to LocalFiles servers.
     - No analytics, telemetry, advertising, or tracking are included.
     - What data does and does not leave the user's device.

   - Keep language understandable to non-technical users.
   - Avoid legal or regulatory claims that cannot be substantiated.
   - Avoid marketing language; prioritize clarity and trust.
   - All privacy claims must be traceable to the current implementation.
   - Do not claim that audits, certifications, reproducible builds, third-party reviews, or similar trust measures have already occurred unless they are already true.

7. Documentation cleanup

   - Identify and fix mojibake or encoding issues in public-facing documentation.
   - Remove or generalize personal machine paths, usernames, and machine-specific examples where appropriate.
   - Preserve useful setup instructions while making documentation suitable for public publication.

8. Add CODE_OF_CONDUCT.md

   - Use a standard, widely adopted template.
   - Keep modifications minimal.
   - Prefer a conventional open-source community code of conduct.

Constraints:

- Keep changes low-risk.
- Do not change application behavior.
- Do not introduce analytics, telemetry, external services, external fonts, CDN assets, or remote APIs.
- Preserve the local-only privacy model.
- Prefer standard, boring, maintainable documentation.
- Documentation should be concise and maintainable.
- Prefer clear, practical guidance over exhaustive policies.
- Avoid creating obligations, processes, or governance structures that are disproportionate to a small open-source project.
- Do not modify CI workflows unless required by documentation consistency.
- Do not add Cloudflare Pages configuration yet.
- Do not create legal, compliance, certification, audit, or privacy claims that cannot be substantiated.

Validation:

- Verify all new documentation links resolve correctly.
- Verify referenced files exist.
- Run:

  - pnpm format:check
  - pnpm typecheck
  - pnpm lint
  - pnpm test
  - pnpm test:e2e
  - pnpm build

Output:

- Summary of files added and modified.
- SECURITY.md highlights.
- CONTRIBUTING.md highlights.
- CHANGELOG structure and entries.
- Templates added.
- README improvements.
- Privacy/processing model summary.
- Documentation cleanup performed.
- CODE_OF_CONDUCT.md summary.
- Validation results.
