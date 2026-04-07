# Work Split Guide

How to divide the codebase among developers so everyone can work in parallel **without merge conflicts**.

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
