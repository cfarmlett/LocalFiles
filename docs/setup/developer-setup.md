# LocalDocs Development Setup

## Requirements

- Git
- Node.js 24
- pnpm 11.6.0

Docker, WSL, Python, and a particular editor are not required for the current
web application.

## Get the Repository

Clone the repository and enter its root directory:

```bash
git clone <repository-url>
cd LocalDocs
```

The repository URL will be available after the public GitHub repository is
created. The local filesystem path is not significant.

## Install Dependencies

```bash
pnpm install --frozen-lockfile
```

If pnpm is unavailable, enable the version declared in `package.json` with
Corepack:

```bash
corepack enable
corepack prepare pnpm@11.6.0 --activate
```

Install Chromium for the Playwright suite:

```bash
pnpm exec playwright install chromium
```

On Linux, Playwright may also require operating-system packages:

```bash
pnpm exec playwright install --with-deps chromium
```

## Run the Application

```bash
pnpm --filter @localdocs/web dev
```

Vite serves the application at `http://127.0.0.1:5173` by default.

## Validate Changes

Run the same checks used by continuous integration:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

The production static files are written to `apps/web/dist` and are not tracked
by Git.

## Repository Structure

```text
apps/web         Browser application
packages/core    Pure business logic and shared types
packages/pdf     Local PDF adapter and interfaces
packages/ui      Shared React components
packages/config  Shared configuration placeholder
tests/e2e        Playwright browser tests
docs             Architecture, product, security, and project documentation
```

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the branch, pull request,
testing, privacy, and dependency expectations.
