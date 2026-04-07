# Work Split Guide

How to divide the codebase among developers so everyone can work in parallel **without merge conflicts**.

---

## New Developer? Start Here

If you just joined the team, follow these steps **in order**. You'll be coding in under 10 minutes.

### Step 1: Clone the repo

```bash
git clone https://github.com/cristianjohnn/Inventory.git
cd Inventory
```

> After cloning, you'll land on the `main` branch. **Do NOT work on `main` directly.** It's the production branch.

### Step 2: Switch to `develop`

```bash
git checkout develop
git pull origin develop
```

> `develop` is the integration branch — all your work starts from here.

### Step 3: Install dependencies

```bash
npm run install:all
```

This installs root, server, and client dependencies in one command.

### Step 4: Set up environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env`. For local development, use these defaults:

```env
DATABASE_URL=postgresql://inventory_user:inventory_pass@localhost:5432/it_inventory
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=inventory_pass
POSTGRES_DB=it_inventory
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 5: Start the database + run migrations + seed

```bash
npm run docker:dev        # Starts PostgreSQL in Docker
npm run db:migrate        # Creates tables
npm run db:seed           # Adds sample data
```

### Step 6: Start the dev servers

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the dashboard. ✅

---

### Step 7: Get your assignment

Ask the tech lead which **Developer role** you've been assigned (A, B, C, D, or E — see [Developer Assignments](#developer-assignments) below). This tells you which files are yours to work on.

### Step 8: Create your first feature branch

```bash
# Make sure you're on the latest develop
git checkout develop
git pull origin develop

# Create your branch (use the correct prefix)
git checkout -b feature/your-feature-name
```

> **Branch naming rules:**
> - New feature → `feature/short-description`
> - Bug fix → `fix/short-description`
> - Docs only → `docs/short-description`

### Step 9: Do your work, then push

```bash
# After making changes, commit with the right format
git add .
git commit -m "feat: describe what you did"

# Push YOUR branch (never push to main, staging, or develop directly)
git push origin feature/your-feature-name
```

### Step 10: Open a Pull Request on GitHub

1. Go to [github.com/cristianjohnn/Inventory](https://github.com/cristianjohnn/Inventory)
2. You'll see a banner: "feature/your-feature-name had recent pushes" → Click **"Compare & pull request"**
3. **Set the target branch to `develop`** (not main!)
4. Fill in the PR template
5. Request a review from at least 1 teammate
6. Wait for approval, then **squash and merge**
7. Delete your branch after merging

### Branch Diagram — Where does my code go?

```
YOU ARE HERE
    │
    ▼
feature/your-feature  ──→  develop  ──→  staging  ──→  main
  (your work)           (integration)   (testing)    (production)
                              ▲
                              │
                     ALL PRs target here
```

> **The golden rule:** You push to `feature/*`, `fix/*`, or `docs/*` branches only.
> You **never** push directly to `develop`, `staging`, or `main`.

### Useful Commands Cheatsheet

| Command                | What it does                              |
|------------------------|-------------------------------------------|
| `npm run dev`          | Starts server + client with hot reload    |
| `npm run docker:dev`   | Starts PostgreSQL in Docker               |
| `npm run db:migrate`   | Runs Prisma migrations                    |
| `npm run db:seed`      | Seeds database with sample data           |
| `npm run db:studio`    | Opens Prisma Studio (visual DB browser)   |
| `npm run lint`         | Runs ESLint to check code quality         |
| `npm run format`       | Formats code with Prettier                |
| `npm run build`        | Builds the React app for production       |

### Further Reading

| Document | What's in it |
|---|---|
| [README.md](../README.md) | Project overview and detailed setup |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Commit message format, PR rules, code style |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Data models, API routes, depreciation formulas |
| [BRANCH_STRATEGY.md](BRANCH_STRATEGY.md) | Full branching rules and hotfix procedure |
| [COLLABORATORS.md](COLLABORATORS.md) | How to add team members on GitHub |

---

## Quick Rules

1. **Stay in your assigned folders.** Don't edit files outside your domain.
2. **Shared files need coordination.** Announce in the team channel before modifying any 🔒 file.
3. **One feature = one branch = one PR.** Keep PRs small and focused.
4. **Rebase daily.** Run `git fetch origin develop && git rebase origin/develop` to stay in sync.

---

## Codebase Map

```
Inventory/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma           ← 🔒 SHARED (coordinate changes)
│   │   └── seed.js                 ← 🔒 SHARED
│   └── src/
│       ├── index.js                ← 🔒 SHARED (Express setup)
│       ├── controllers/
│       │   ├── assetController.js      ← Developer A
│       │   └── dashboardController.js  ← Developer B
│       ├── routes/
│       │   ├── assets.js               ← Developer A
│       │   └── dashboard.js            ← Developer B
│       ├── services/
│       │   └── depreciationService.js  ← Developer C
│       ├── middleware/
│       │   ├── errorHandler.js         ← Developer D
│       │   └── validate.js             ← Developer D
│       └── utils/
│           └── schemas.js              ← Developer D
│
├── client/
│   ├── src/
│   │   ├── App.jsx                 ← 🔒 SHARED (router)
│   │   ├── main.jsx                ← 🔒 SHARED
│   │   ├── index.css               ← 🔒 SHARED (design tokens)
│   │   ├── api/
│   │   │   └── client.js              ← 🔒 SHARED (API wrapper)
│   │   ├── features/
│   │   │   ├── assets/                 ← Developer A
│   │   │   │   ├── AssetsPage.jsx
│   │   │   │   ├── AssetDetailPage.jsx
│   │   │   │   ├── AssetFormModal.jsx
│   │   │   │   └── AssignModal.jsx
│   │   │   └── dashboard/             ← Developer B
│   │   │       └── DashboardPage.jsx
│   │   ├── components/
│   │   │   ├── layout/                 ← Developer E
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── ui/                     ← Developer E
│   │   │       ├── Badge.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── ErrorBoundary.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── ProgressBar.jsx
│   │   │       ├── Skeleton.jsx
│   │   │       └── ThemeToggle.jsx
│   │   ├── hooks/                      ← Developer E
│   │   │   ├── useDebounce.js
│   │   │   └── useTheme.js
│   │   └── utils/                      ← 🔒 SHARED
│   │       ├── constants.js
│   │       ├── exportCsv.js
│   │       └── formatters.js
│   └── vite.config.js              ← 🔒 SHARED
│
├── nginx/                          ← DevOps / Tech Lead
├── docker-compose.yml              ← DevOps / Tech Lead
└── docs/                           ← Anyone (via docs/* branch)
```

---

## Developer Assignments

### Developer A — Asset Management (Full-Stack)

| Layer    | Files Owned                                                                 |
|----------|-----------------------------------------------------------------------------|
| Backend  | `server/src/controllers/assetController.js`, `server/src/routes/assets.js`  |
| Frontend | `client/src/features/assets/*` — AssetsPage, AssetDetailPage, AssetFormModal, AssignModal |

**Branch examples:** `feature/asset-crud-improvements`, `feature/asset-search-filters`, `feature/asset-bulk-delete`

**What they own:** Everything about adding, editing, deleting, assigning, and searching assets. They touch the asset API endpoints and the asset UI pages.

---

### Developer B — Dashboard & Analytics (Full-Stack)

| Layer    | Files Owned                                                                          |
|----------|--------------------------------------------------------------------------------------|
| Backend  | `server/src/controllers/dashboardController.js`, `server/src/routes/dashboard.js`    |
| Frontend | `client/src/features/dashboard/*` — DashboardPage                                    |

**Branch examples:** `feature/dashboard-charts`, `feature/portfolio-valuation`, `feature/recent-activity-feed`

**What they own:** The dashboard page, summary stats, charts, recent activity feed, and the `/api/dashboard` endpoint.

---

### Developer C — Depreciation Engine (Backend)

| Layer    | Files Owned                                  |
|----------|----------------------------------------------|
| Backend  | `server/src/services/depreciationService.js` |

**Branch examples:** `feature/depreciation-engine`, `fix/salvage-value-calc`, `feature/sum-of-years-method`

**What they own:** All three depreciation methods (Straight-Line, Double Declining Balance, Units of Production), monthly rolling calculations, projected values. Pure business logic — no UI work.

---

### Developer D — Middleware, Validation & Schemas (Backend)

| Layer    | Files Owned                                                                                     |
|----------|-------------------------------------------------------------------------------------------------|
| Backend  | `server/src/middleware/errorHandler.js`, `server/src/middleware/validate.js`, `server/src/utils/schemas.js` |

**Branch examples:** `feature/auth-middleware`, `fix/validation-error-messages`, `feature/rate-limiting`

**What they own:** Error handling, request validation with Zod, request body schemas. Future: authentication middleware (JWT), rate limiting, logging middleware.

---

### Developer E — UI Components, Layout & Theming (Frontend)

| Layer    | Files Owned                                                           |
|----------|-----------------------------------------------------------------------|
| Frontend | `client/src/components/layout/*` — Header, Layout, Sidebar           |
| Frontend | `client/src/components/ui/*` — Modal, Badge, ProgressBar, Skeleton, etc. |
| Frontend | `client/src/hooks/*` — useDebounce, useTheme                         |

**Branch examples:** `feature/sidebar-redesign`, `feature/dark-mode-improvements`, `feature/loading-skeletons`

**What they own:** All shared/reusable UI components, layout structure, theming, and custom hooks. They build the "design system" that other developers consume.

---

## 🔒 Shared Files — Coordination Rules

Files marked with 🔒 are touched by multiple developers. **These need coordination:**

| Shared File             | When It Changes                  | Coordination Rule                                                             |
|-------------------------|----------------------------------|-------------------------------------------------------------------------------|
| `prisma/schema.prisma`  | Adding new models or fields      | **Announce in team channel first.** Only one person modifies at a time.        |
| `prisma/seed.js`        | Adding seed data for new models  | **Coordinate with schema changes.** Bundle in the same PR.                    |
| `server/src/index.js`   | Adding new routes or middleware  | **Small, separate PR.** Don't bundle with feature work.                       |
| `client/src/App.jsx`    | Adding new pages/routes          | **Small, separate PR.** Announce before modifying.                            |
| `client/src/index.css`  | Adding design tokens/globals     | **Developer E owns this.** Others request changes via PR comment.             |
| `client/src/api/client.js` | Adding new API methods        | **Any developer can add methods** but don't modify existing ones without announcing. |
| `client/src/utils/*`    | Adding formatters/constants      | **Append-only.** Don't modify existing functions — add new ones.              |

### When You Need to Touch a Shared File

1. **Announce** in the team channel: "I need to modify `schema.prisma` to add a User model"
2. **Make it a separate, small PR** — don't bundle shared file changes with feature work
3. **Merge it quickly** — shared file PRs should be reviewed and merged within hours, not days
4. **Notify the team** once merged so everyone can rebase

---

## Example Workflow

Here's how Developer A would start working on a new feature:

```bash
# 1. Start from latest develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/asset-bulk-delete

# 3. Work on YOUR files only:
#    - server/src/controllers/assetController.js  (add bulk delete handler)
#    - server/src/routes/assets.js                (add DELETE /api/assets/bulk route)
#    - client/src/features/assets/AssetsPage.jsx  (add bulk select checkboxes + delete button)

# 4. Commit with proper format
git add .
git commit -m "feat: add bulk delete for assets"

# 5. Stay in sync (do this daily)
git fetch origin develop
git rebase origin/develop

# 6. Push and open PR targeting develop
git push origin feature/asset-bulk-delete
```

Then on GitHub:
- Open a PR from `feature/asset-bulk-delete` → `develop`
- Fill in the PR template
- Request review from at least 1 teammate
- After approval, **squash and merge**
- **Delete the branch** after merging

---

## Adding New Features (Future Expansion)

When the project grows, add new domains as **new folders** to stay conflict-free:

### Backend — New Controllers & Routes

```
server/src/controllers/
├── assetController.js          ← existing (Developer A)
├── dashboardController.js      ← existing (Developer B)
├── userController.js           ← NEW: Developer F
├── reportController.js         ← NEW: Developer B
└── notificationController.js   ← NEW: Developer D

server/src/routes/
├── assets.js                   ← existing (Developer A)
├── dashboard.js                ← existing (Developer B)
├── users.js                    ← NEW: Developer F
├── reports.js                  ← NEW: Developer B
└── notifications.js            ← NEW: Developer D
```

### Frontend — New Feature Folders

```
client/src/features/
├── assets/          ← existing (Developer A)
├── dashboard/       ← existing (Developer B)
├── users/           ← NEW: Developer F
├── reports/         ← NEW: Developer B
└── notifications/   ← NEW: Developer D
```

### The Pattern

Every new feature follows the same structure:

```
1 controller  +  1 route file  +  1 feature folder  =  zero conflicts
```

Each developer works in their own folder. No stepping on toes.

---

## Quick Reference

| If you want to...                     | Do this                                              |
|---------------------------------------|------------------------------------------------------|
| Start a new feature                   | `git checkout -b feature/my-feature develop`         |
| Fix a bug                             | `git checkout -b fix/bug-name develop`               |
| Update docs                           | `git checkout -b docs/what-changed develop`          |
| Stay in sync                          | `git fetch origin develop && git rebase origin/develop` |
| Check if your code is clean           | `npm run lint && npm run build`                      |
| See who owns a file                   | Check the codebase map above                         |
| Touch a shared file                   | Announce first → small separate PR → merge fast      |
