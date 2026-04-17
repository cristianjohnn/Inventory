# Collaborators Guide

How to add team members, set permissions, and configure GitHub for safe team collaboration.

## Adding Collaborators

### For a Personal Repository (current setup)

1. Go to your repository on GitHub: `github.com/cristianjohnn/Inventory`
2. Click **Settings** (top tab)
3. Click **Collaborators** in the left sidebar (under "Access")
4. Click **Add people**
5. Enter their GitHub username or email
6. Select permission level:

| Permission | Who gets it       | What they can do                                    |
|------------|-------------------|-----------------------------------------------------|
| **Read**   | Stakeholders      | View code and issues, clone the repo                |
| **Write**  | Developers        | Push to branches, open/merge PRs, manage issues     |
| **Maintain**| Tech leads       | Manage PRs and branches, no settings access         |
| **Admin**  | Repo owner only   | Full access including settings, branch protection   |

> **Rule**: Give everyone **Write** access. Only the repo owner should have **Admin**.

### For a GitHub Organization (recommended for real teams)

If you later move this to a GitHub Organization:

1. **Create the organization**: GitHub → Settings → Organizations → New
2. **Create teams**:
   - `frontend-team` — frontend developers
   - `backend-team` — backend developers
   - `devops-team` — infrastructure and deployment
3. **Add members** to the appropriate teams
4. **Grant team access**: Organization → Repositories → Select repo → Add team → **Write**
5. **Update CODEOWNERS** (`.github/CODEOWNERS`):
   ```
   /client/              @your-org/frontend-team
   /server/              @your-org/backend-team
   /nginx/               @your-org/devops-team
   /docker-compose*.yml  @your-org/devops-team
   ```

## Setting Up Branch Protection

After adding collaborators, configure these protections so nobody can accidentally break production.

### Step-by-Step

1. Go to **Settings → Branches**
2. Click **Add branch protection rule** (or **Add classic branch protection rule**)
3. In **Branch name pattern**, type: `main`
4. Enable these settings:

#### For `main` branch:
- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Require review from Code Owners
- [x] **Require status checks to pass before merging**
  - Search for and select: `lint-and-build` (from the CI workflow)
  - [x] Require branches to be up to date
- [x] **Do not allow bypassing the above settings**
- [ ] Allow force pushes → **Leave unchecked**
- [ ] Allow deletions → **Leave unchecked**

5. Click **Create**
6. Repeat for `staging` (same settings but Code Owners review is optional)
7. Repeat for `develop` (only require PR, no approvals needed)

## Workflow for New Developers

When a new developer joins the team, share this checklist with them:

### Day 1 Checklist

- [ ] Accept the GitHub collaborator invitation (check email)
- [ ] Read the [README.md](../README.md) — understand the project and setup
- [ ] Clone the repo and run the [local setup steps](../README.md#local-setup-step-by-step)
- [ ] Read [CONTRIBUTING.md](../CONTRIBUTING.md) — understand branch naming, commit format, PR process
- [ ] Read [ARCHITECTURE.md](ARCHITECTURE.md) — understand folder structure, data models, API routes
- [ ] Read [BRANCH_STRATEGY.md](BRANCH_STRATEGY.md) — understand the branch flow
- [ ] Read [WORK_SPLIT.md](WORK_SPLIT.md) — understand developer assignments and file ownership
- [ ] Identify your role assignment (Developer A–E) from the tech lead
- [ ] Create your first branch: `git checkout -b feature/my-first-task develop`

### First PR Checklist

- [ ] Stay within your assigned feature folder
- [ ] Follow the commit message format (`feat:`, `fix:`, etc.)
- [ ] Rebase on latest develop before pushing
- [ ] Fill in the PR template completely
- [ ] Wait for CI to pass and a review approval
- [ ] Use "Squash and merge" to merge

## Feature Folder Assignments

To avoid merge conflicts, assign each developer to a specific feature domain:

| Developer | Role | Domain | Responsibilities |
|-----------|------|--------|------------------|
| **Dev A** | Frontend | `features/assets/`, `api/client.js` | Asset CRUD UI, modals, filters, assignment workflows |
| **Dev B** | Frontend | `features/dashboard/`, `features/reports/` | KPI stats, Recharts mapping, depreciation dashboards |
| **Dev C** | Frontend | `components/`, `features/profile/`, `features/auth/`, `index.css` | UI/UX primitives, layouts, theming, user profile UI |
| **Dev D** | Backend | `server/controllers/`, `server/routes/` | API routing, data controllers, Prisma queries |
| **Dev E** | Backend | `server/services/`, `server/middleware/`, `server/utils/schemas.js` | Depreciation engine, global error handling, Zod validation |

### Shared Code Rules

The following folders are **shared** — multiple developers may need to touch these:

- `client/src/components/ui/` — Reusable UI primitives (Modal, Badge, ProgressBar, etc.)
- `client/src/hooks/` — Shared hooks (useDebounce, useTheme)
- `client/src/utils/` — Utility functions (constants, formatters, exportCsv)
- `client/src/api/client.js` — API wrapper (add methods, don't modify existing)
- `server/src/middleware/` — Express middleware

**Rules for shared code:**
1. Announce in the team channel before modifying a shared file
2. Make shared changes in a **separate, small PR** (don't bundle with feature work)
3. Get approval from the tech lead before merging shared code changes

## Security Best Practices

- **Never share your `.env` file** — it contains database passwords
- **Never commit secrets** — the `.gitignore` prevents this, but double-check
- **Use SSH keys for Git** — not HTTPS with passwords
- **Enable 2FA** on your GitHub account (strongly recommended)
- **Review all PR diffs** before approving — look for hardcoded secrets or credentials
