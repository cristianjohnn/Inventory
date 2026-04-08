# Branch Strategy

> **Who is this for?** Every developer. Read this to understand how code moves from your laptop to production.

---

## Key Terms

If you're new to Git or GitHub, here are the terms you'll see throughout this guide:

| Term | What It Means |
|------|---------------|
| **Branch** | A separate copy of the codebase where you can make changes without affecting anyone else's work. |
| **PR (Pull Request)** | A request on GitHub to merge your branch into another branch. Your teammates review your code, leave comments, and approve it before it gets merged. Think of it as "asking permission to add your code." |
| **Merge** | Combining the code from one branch into another. After a PR is approved, you merge it. |
| **Rebase** | Replaying your changes on top of the latest code from another branch. Keeps history clean — use this instead of merge when syncing your branch. |
| **Squash and Merge** | Combines all your commits into one single commit when merging. Keeps the history tidy. |
| **CI (Continuous Integration)** | An automated system that runs lint checks and builds your code every time you open a PR. If CI fails, fix your code before merging. |
| **Code Owners** | People automatically assigned to review PRs for specific files (configured in `.github/CODEOWNERS`). |

> 📖 **Need more terms?** See the full [Glossary](GLOSSARY.md) for React, Express, Prisma, Docker, and project-specific definitions.

---

## Table of Contents

- [The Big Picture](#the-big-picture)
- [Branch Purposes Explained](#branch-purposes-explained)
- [Branch Rules at a Glance](#branch-rules-at-a-glance)
- [Daily Workflow](#daily-workflow)
- [Step-by-Step: Creating a Feature Branch](#step-by-step-creating-a-feature-branch)
- [Branch Naming Convention](#branch-naming-convention)
- [Merge Strategy](#merge-strategy)
- [Hotfix Procedure](#hotfix-procedure)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)
- [Branch Protection Settings](#branch-protection-settings)

---

## The Big Picture

Code flows in **one direction** — from your feature branch all the way to production:

```
  YOUR WORK              TEAM CODE            QA TESTING           LIVE USERS
  ─────────              ─────────            ──────────           ──────────

  feature/xyz  ───PR───→  develop  ───PR───→  staging  ───PR───→  main
  fix/abc      ───PR───→    │                    │                   │
  docs/readme  ───PR───→    │                    │                   │
                             │                    │                   │
                        Everyone's work       "Does it work          The real
                        comes together         together?"            production
                        here first             Test here.            app.
```

**Think of it like a pipeline:**
1. You build your feature in isolation (your branch)
2. You merge it into `develop` so it joins everyone else's work
3. The tech lead moves `develop` → `staging` weekly for testing
4. After QA passes, `staging` → `main` goes live

---

## Branch Purposes Explained

### `main` — Production (🔴 Do NOT touch directly)

- **What it is:** The live, deployed version of the app. Whatever is on `main` is what real users see.
- **Who manages it:** Tech lead only.
- **How code gets here:** PR from `staging` → `main`, after QA verification.
- **Golden rule:** Code on `main` should **always work**. If it's broken, that's an emergency.

### `staging` — Testing Ground (🟡 Do NOT touch directly)

- **What it is:** A near-exact copy of production used for testing. This is where we catch bugs *before* they reach users.
- **Who manages it:** Tech lead merges `develop` → `staging` at the end of each week.
- **How code gets here:** PR from `develop` → `staging`.
- **What happens here:** The team tests the combined work. QA checks. Bug fixes go through the normal flow (branch from `develop`, PR into `develop`, then it reaches staging on the next merge).

### `develop` — Integration Hub (🟢 Do NOT push directly)

- **What it is:** The "latest and greatest" — all approved features come together here. This is where you can see what the full app looks like with everyone's work combined.
- **Who manages it:** All developers contribute via PRs.
- **How code gets here:** PR from your `feature/*`, `fix/*`, or `docs/*` branch.
- **Key point:** `develop` may occasionally be unstable because new features are constantly being merged. That's normal — it's what `staging` is for.

### `feature/*` — Your Feature Work (✅ Your branch, your rules)

- **What it is:** A temporary branch where you build one specific feature. Create it, build the feature, open a PR, merge it, delete it.
- **Who creates it:** Any developer.
- **Branches from:** `develop`
- **Merges into:** `develop` via PR
- **Lifespan:** Short! Aim for 1–3 days max. The longer it lives, the harder it is to merge.

### `fix/*` — Bug Fixes (✅ Your branch, your rules)

- **What it is:** Same as a feature branch, but for fixing bugs instead of adding new features.
- **Who creates it:** Any developer.
- **Branches from:** `develop` (or `main` for critical hotfixes — see [Hotfix Procedure](#hotfix-procedure))
- **Merges into:** `develop` via PR

### `docs/*` — Documentation Changes (✅ Your branch, your rules)

- **What it is:** For updating README, docs, comments, or any non-code changes.
- **Who creates it:** Any developer.
- **Branches from:** `develop`
- **Merges into:** `develop` via PR

---

## Branch Rules at a Glance

| Branch | Purpose | Who Creates | Branches From | Merges Into | PR Required | Direct Push |
|--------|---------|-------------|---------------|-------------|-------------|-------------|
| `main` | Production app | Repo owner | — | — | ✅ Yes | ❌ Blocked |
| `staging` | QA testing | Tech lead | `develop` | `main` | ✅ Yes | ❌ Blocked |
| `develop` | Integration | Tech lead | `main` | `staging` | ✅ Yes | ❌ Blocked |
| `feature/*` | New features | Any dev | `develop` | `develop` | ✅ Yes | ✅ Own branch |
| `fix/*` | Bug fixes | Any dev | `develop` | `develop` | ✅ Yes | ✅ Own branch |
| `docs/*` | Documentation | Any dev | `develop` | `develop` | ✅ Yes | ✅ Own branch |

---

## Daily Workflow

Every day before you start coding, run these two commands to get the latest changes from the team:

```bash
git fetch origin develop
git rebase origin/develop
```

**Why rebase instead of merge?**
- `merge` creates messy "merge commit" bubbles in the history
- `rebase` replays your changes on top of the latest code, keeping history clean and linear

**If you get a rebase conflict:**
1. Git will tell you which files conflict
2. Open those files, look for `<<<<<<<` markers, and resolve them
3. Run `git add .` then `git rebase --continue`
4. If it's too messy, run `git rebase --abort` to undo and ask for help

---

## Step-by-Step: Creating a Feature Branch

```bash
# 1. Make sure you're on the latest develop
git checkout develop
git pull origin develop

# 2. Create and switch to your feature branch
git checkout -b feature/my-feature

# 3. Work on your feature...
#    Make commits as you go:
git add .
git commit -m "feat: add asset search filter"

# 4. Periodically rebase to stay current (do this daily)
git fetch origin develop
git rebase origin/develop

# 5. Push when ready
git push origin feature/my-feature

# 6. Go to GitHub → Open a Pull Request → Target: develop
```

**After your PR is merged:**
```bash
# 7. Clean up
git checkout develop
git pull origin develop
git branch -d feature/my-feature        # delete local branch
```

---

## Branch Naming Convention

Use these prefixes so everyone can tell at a glance what a branch is for:

| Prefix | Use When | Examples |
|--------|----------|---------|
| `feature/` | Adding something new | `feature/asset-bulk-delete`, `feature/dashboard-charts`, `feature/dark-mode` |
| `fix/` | Fixing a bug | `fix/salvage-value-calc`, `fix/pagination-off-by-one`, `fix/login-redirect` |
| `docs/` | Updating documentation | `docs/update-api-routes`, `docs/add-setup-guide`, `docs/fix-typos` |

**Rules:**
- Use lowercase and hyphens: `feature/asset-search` ✅ not `feature/AssetSearch` ❌
- Be descriptive but brief: `feature/csv-export` ✅ not `feature/add-the-csv-export-button-to-assets-page` ❌
- One feature per branch: don't mix unrelated changes

---

## Merge Strategy

### For feature/fix/docs branches → `develop`

**Use: Squash and Merge**

This combines all your commits into a single clean commit on `develop`. Your branch might have 20 messy commits like "wip", "fix typo", "actually fix it this time" — squash turns that into one clean commit.

### For `develop` → `staging`

**Use: Regular Merge (Create a merge commit)**

This preserves the full history of what was included in the staging release.

### For `staging` → `main`

**Use: Regular Merge (Create a merge commit)**

Same reason — we want to see exactly what went into production and when.

---

## Hotfix Procedure

> **When to use this:** Only for critical production bugs that can't wait for the normal `develop → staging → main` flow. Example: the app is crashing for all users.

```
                    fix/critical-bug
                         │
                         │  (PR directly into main)
                         ▼
  main ◄─────────── merge fix
    │
    └──────────────► develop  (back-merge so develop has the fix too)
```

**Steps:**

```bash
# 1. Branch from main (not develop!)
git checkout main
git pull origin main
git checkout -b fix/critical-bug

# 2. Fix the bug — keep changes minimal
git add .
git commit -m "fix: resolve crash on asset delete"

# 3. Push and open a PR targeting main
git push origin fix/critical-bug
# → GitHub PR → target: main

# 4. After merging into main, back-merge into develop
git checkout develop
git pull origin develop
git merge origin/main
git push origin develop
```

**⚠️ Important:** Hotfixes skip staging. Only use this for genuine emergencies. If it can wait until the next staging cycle, use the normal flow instead.

---

## Common Mistakes to Avoid

| ❌ Mistake | ✅ What to Do Instead |
|-----------|----------------------|
| Pushing directly to `main` or `develop` | Always open a PR, even for small changes |
| Creating a branch from `main` | Branch from `develop` (except hotfixes) |
| Keeping a branch alive for weeks | Merge within 1–3 days. Break big features into smaller PRs |
| Using `git merge` to sync with develop | Use `git rebase origin/develop` for clean history |
| Mixing multiple features in one branch | One branch = one feature = one PR |
| Forgetting to delete merged branches | Delete after merge: `git branch -d feature/xyz` |
| Not rebasing before pushing | Rebase daily. Stale branches cause painful conflicts |
| Making a huge PR (500+ lines) | Split into smaller, focused PRs that are easier to review |

---

## Branch Protection Settings

These settings must be configured in **GitHub → Settings → Branches → Branch protection rules**:

### `main` branch
- ✅ Require a pull request before merging
- ✅ Require at least 1 approval
- ✅ Require review from Code Owners
- ✅ Require status checks to pass (CI: `lint-and-build`)
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
- ❌ Allow force pushes → **Disabled**
- ❌ Allow deletions → **Disabled**

### `staging` branch
- ✅ Require a pull request before merging
- ✅ Require at least 1 approval
- ✅ Require status checks to pass (CI)
- ❌ Allow force pushes → **Disabled**

### `develop` branch
- ✅ Require a pull request before merging
- ❌ Allow force pushes → **Disabled**
