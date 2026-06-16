# LocalDocs Development Environment Setup

## Purpose

This document describes the baseline LocalDocs development environment and provides instructions for rebuilding it from scratch on a new Windows machine.

---

# Baseline Environment

## Operating System

Windows 11

## Repository Location

```text
D:\Downloads\Code\LocalDocs
```

The exact path is not critical, but all instructions assume the LocalDocs repository is the working directory.

---

# Required Software

## Git

Verify:

```powershell
git --version
```

Current known-good version:

```text
2.54.0.windows.1
```

Configure identity:

```powershell
git config --global user.name "Christopher Farmlett"
git config --global user.email "your-email@example.com"
```

Check configuration:

```powershell
git config --global user.name
git config --global user.email
```

---

## Node.js

Verify:

```powershell
node --version
npm --version
```

Current known-good versions:

```text
Node v24.16.0
npm 11.13.0
```

PowerShell execution policy fix if npm scripts fail:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## pnpm

Verify:

```powershell
pnpm --version
```

Current known-good version:

```text
11.6.0
```

Install if missing:

```powershell
npm install -g pnpm
```

---

## VS Code

Verify:

```powershell
code --version
```

Install recommended extensions:

* ESLint
* Prettier
* GitLens
* Markdown All in One

Optional:

* Error Lens
* Docker
* Playwright Test

AI extensions intentionally deferred until a need emerges.

---

## Docker Desktop

Configuration:

* All Users Installation
* WSL2 Backend Enabled
* Windows Containers Disabled

Verify:

```powershell
docker --version
docker compose version
```

Current known-good versions:

```text
Docker 29.5.3
Docker Compose v5.1.4
```

Docker Hub account not required for LocalDocs development.

---

## WSL

Verify:

```powershell
wsl --version
```

Current known-good version:

```text
WSL 2.7.8.0
```

WSL is primarily used by Docker and does not require additional configuration for initial LocalDocs development.

---

## Python

Verify:

```powershell
python --version
```

Current version:

```text
Python 3.11.6
```

No upgrade required at this time.

---

# Repository Structure

```text
LocalDocs/
├── apps/
│   └── web/
├── packages/
│   ├── config/
│   ├── core/
│   ├── pdf/
│   └── ui/
├── tests/
│   ├── e2e/
│   └── fixtures/
├── docs/
│   ├── architecture/
│   ├── security/
│   └── decisions/
├── scripts/
└── .github/
    └── workflows/
```

---

# Workspace Initialization

Initialize repository:

```powershell
git init
```

Create workspace file:

`pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Initialize package:

```powershell
pnpm init
```

Install baseline dependencies:

```powershell
pnpm add -D typescript eslint prettier vitest @types/node
pnpm add -D playwright
pnpm exec playwright install
```

---

# Basic Verification

Verify toolchain:

```powershell
git --version
node --version
npm --version
pnpm --version
docker --version
python --version
code --version
```

Verify workspace:

```powershell
git status
pnpm list
```

---

# Git Checkpoints

Initial repository:

```powershell
git add .
git commit -m "Initial repository structure and vision"
```

After workspace initialization:

```powershell
git add .
git commit -m "Initialize pnpm workspace"
```

---

# Project Documentation

Required early documents:

```text
docs/architecture/vision.md
docs/architecture/dev-environment.md
```

Recommended next:

```text
docs/architecture/v0.1.md
docs/security/threat-model.md
docs/decisions/0001-local-first-processing.md
```

---

# Development Philosophy

* Local-first processing whenever feasible
* No surprise uploads
* Generous free tier
* Premium convenience features
* No ads
* No dark patterns
* Security and privacy prioritized over feature count
* Keep architecture simple until complexity is justified

Primary question:

> Does this make LocalDocs more trustworthy, useful, and maintainable without adding unnecessary complexity?
