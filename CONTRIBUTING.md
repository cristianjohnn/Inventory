# Contributing to IT Inventory Monitoring System

Thank you for contributing! This guide ensures everyone follows the same workflow so we can collaborate without stepping on each other's toes.

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Naming Rules](#branch-naming-rules)
- [Development Workflow](#development-workflow)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [What NOT to Commit](#what-not-to-commit)
- [Anti-Conflict Rules](#anti-conflict-rules)

---

## Getting Started

1. Clone the repo (see [README.md](README.md) for full setup instructions)
2. Make sure the dev environment works: `npm run docker:dev && npm run dev`
3. Read the [Architecture docs](docs/ARCHITECTURE.md) to understand the project structure

---

## Branch Naming Rules

Always branch from `develop` unless fixing a production hotfix.

| Type    | Pattern              | Example                           | Base Branch |
|---------|----------------------|-----------------------------------|-------------|
| Feature | `feature/<name>`     | `feature/depreciation-engine`     | `develop`   |
| Bug fix | `fix/<name>`         | `fix/salvage-value-calc`          | `develop`   |
| Docs    | `docs/<name>`        | `docs/update-readme`              | `develop`   |
| Hotfix  | `fix/<name>`         | `fix/critical-db-connection`      | `main`      |

```bash
# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Start a bug fix
git checkout develop
git pull origin develop
git checkout -b fix/my-bugfix
```

---

## Development Workflow

### Before You Start Working

```bash
# Always pull latest changes from develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/my-feature
```

### While You Work

```bash
# Regularly sync with develop to avoid large conflicts
git fetch origin develop
git rebase origin/develop

# If there are conflicts during rebase, resolve them file by file
# then: git rebase --continue
```

### Before You Push

```bash
# Pull latest develop and rebase your work on top of it
git fetch origin develop
git rebase origin/develop

# Make sure everything still works
npm run lint
npm run build

# Push your branch
git push origin feature/my-feature
```

> **Important**: Rebase, don't merge. This keeps the commit history clean and linear.

---

## Commit Message Format

Use the `type: description` format. Keep the description under 72 characters.

| Type       | When to use                                          | Example                              |
|------------|------------------------------------------------------|--------------------------------------|
| `feat`     | A new feature                                        | `feat: add depreciation engine`      |
| `fix`      | A bug fix                                            | `fix: correct salvage value formula` |
| `docs`     | Documentation only                                   | `docs: update branch strategy`       |
| `refactor` | Code change that doesn't fix a bug or add a feature  | `refactor: extract depreciation utils` |
| `chore`    | Maintenance (deps, config, build)                    | `chore: update dependencies`         |
| `test`     | Adding or updating tests                             | `test: add asset CRUD tests`         |
| `style`    | Formatting, whitespace (no logic change)             | `style: fix indentation in routes`   |

### Good examples

```
feat: add employee assignment modal with form validation
fix: prevent negative depreciation values for retired assets
docs: add API route map to architecture docs
refactor: move depreciation logic to shared service
chore: upgrade Prisma to v6.2
```

### Bad examples

```
update stuff          ← too vague
fixed it              ← what was fixed?
WIP                   ← don't commit work-in-progress
asdfasdf              ← just no
```

---

## Pull Request Process

### Where to target your PR

| Your branch type | Target branch | Example |
|------------------|---------------|---------|
| `feature/*`      | `develop`     | feature/depreciation → develop |
| `fix/*`          | `develop`     | fix/calc-bug → develop |
| `docs/*`         | `develop`     | docs/update-readme → develop |
| Hotfix           | `main`        | fix/critical-bug → main (then back-merge to develop) |

### PR checklist

Before requesting a review, make sure:

- [ ] Your branch is rebased on the latest `develop`
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds
- [ ] You tested your changes locally (server + client)
- [ ] No `console.log` statements left in the code
- [ ] `.env.example` is updated if you added new environment variables
- [ ] No hardcoded values — use env vars or constants
- [ ] Screenshots or recordings attached for any UI changes

### Review process

1. Open a PR with a clear title following the commit message format
2. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md)
3. At least **1 approval** is required before merging
4. The **CODEOWNERS** reviewer will be auto-assigned based on which files you changed
5. All CI checks must pass (lint + build)
6. Use **"Squash and merge"** to keep the history clean
7. Delete your branch after merging

---

## Code Style

- **ESLint** enforces JavaScript best practices — see `.eslintrc.json`
- **Prettier** handles formatting — see `.prettierrc`
- Run `npm run format` before committing to auto-format your code
- Use `const` by default, `let` when reassignment is needed, never `var`
- Use arrow functions for callbacks
- Use async/await instead of `.then()` chains
- Destructure props and objects when it improves readability

---

## What NOT to Commit

These are in `.gitignore` but worth calling out:

| File/Folder        | Why                                           |
|--------------------|-----------------------------------------------|
| `.env`             | Contains secrets (passwords, API keys)        |
| `node_modules/`    | Installed by `npm install` — never committed  |
| `dist/` / `build/` | Generated by build tools                      |
| `*.log`            | Log files are ephemeral                       |
| `.DS_Store`        | macOS system file                             |
| `Thumbs.db`        | Windows system file                           |

---

## Anti-Conflict Rules

Our codebase uses a **feature-based architecture** to minimize merge conflicts:

```
client/src/features/
├── dashboard/    ← Developer A's domain
├── assets/       ← Developer B's domain
└── assignment/   ← Developer C's domain
```

### Rules

1. **Stay in your feature folder.** If you're working on the dashboard, only edit files inside `features/dashboard/`.
2. **Shared components (`components/ui/`) are a coordination zone.** If you need to modify a shared component, announce it in the team channel first and make it a separate, small PR.
3. **Use barrel files.** Each feature folder has an `index.js` that exports its public API. Import from the barrel file, not from internal files.
4. **Don't cross feature boundaries.** If feature A needs something from feature B, discuss it — you might need to move it to the shared `components/` or `utils/` folder.
5. **Keep PRs small and focused.** One feature or one fix per PR. Don't bundle unrelated changes.
6. **Rebase daily.** Run `git fetch origin develop && git rebase origin/develop` at least once a day to stay in sync.

---

## Questions?

If you're unsure about anything, ask in the team channel before making changes. It's always better to ask first than to create a conflict that takes time to resolve.
