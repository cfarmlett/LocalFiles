# AI Workflow

AI-generated code must:

- Pass format, typecheck, lint, test, and build unless a prompt specifies a
  narrower validation set
- Avoid cloud dependencies
- Avoid analytics
- Avoid surprise uploads
- Keep logic separated from UI
- Include tests when practical

Every generated batch should be:

1. Generated
2. Reviewed
3. Tested
4. Committed

Feature implementation is followed by a focused hardening pass when requested.
Hardening should preserve the feature scope, address correctness and trust
issues, and run the validation steps named in the prompt.

Independent Claude review artifacts live under `docs/reviews`. They should be
treated as review inputs, not as automatically current roadmap truth; product
and architecture docs remain the source of current project status.
