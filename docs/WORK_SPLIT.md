# Work Split Guide

> **Who is this for?** Every developer on the team. Read this before writing your first line of code.

---

## Table of Contents

- [New Developer Onboarding](#new-developer-onboarding)
- [How We Use Git](#how-we-use-git)
- [Developer Assignments](#developer-assignments)
- [Codebase Map](#codebase-map)
- [Shared Files](#shared-files)
- [Expanding the Project](#expanding-the-project)

---

## New Developer Onboarding

### 1. Set up the project

Follow the [README.md](../README.md) setup guide. It covers cloning, installing, database setup, and running the dev servers.

### 2. Switch to `develop`

After cloning, you'll land on `main`. Switch to `develop` immediately — this is where all work starts:

```bash
git checkout develop
git pull origin develop
```

### 3. Get your assignment

Ask the tech lead which role you have (Developer A–E). See [Developer Assignments](#developer-assignments) below for what each role owns.

### 4. Start working

```bash
# Create your branch from develop
git checkout -b feature/your-feature-name

# ... do your work ...

# Commit
git add .
git commit -m "feat: describe what you did"

# Push your branch
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

1. Go to the repo on GitHub
2. Click **"Compare & pull request"**
3. Set target branch to **`develop`** (not main)
4. Fill in the PR template
5. Request review → get approval → **squash and merge** → delete branch

---

## How We Use Git

### Branches

```
feature/your-feature  →  develop  →  staging  →  main
   (your work)        (integration)  (testing)  (production)
```

| Branch      | Purpose              | Can I push directly? |
|-------------|----------------------|----------------------|
| `main`      | Production           | ❌ No. PR only.       |
| `staging`   | Testing              | ❌ No. PR only.       |
| `develop`   | Integration          | ❌ No. PR only.       |
| `feature/*` | Your feature work    | ✅ Yes, your branch.  |
| `fix/*`     | Your bug fix         | ✅ Yes, your branch.  |
| `docs/*`    | Your docs change     | ✅ Yes, your branch.  |

### Branch naming

```
feature/asset-bulk-delete       ← new feature
fix/salvage-value-calc          ← bug fix
docs/update-api-routes          ← documentation
```

### Staying in sync

Do this **every day** before you start coding:

```bash
git fetch origin develop
git rebase origin/develop
```

### Commit messages

```
feat: add depreciation engine
fix: correct salvage value formula
docs: update branch strategy
refactor: extract depreciation utils
chore: update dependencies
test: add asset CRUD tests
```

> For the full contributing guide, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Developer Assignments

| Role | Domain | Scope |
|------|--------|-------|
| **A** | Asset Management | Full-stack. Asset CRUD, search, filters, assignment. |
| **B** | Dashboard & Analytics | Full-stack. Stats, charts, activity feed. |
| **C** | Depreciation Engine | Backend only. All 3 depreciation methods. |
| **D** | Middleware & Validation | Backend only. Error handling, Zod schemas, auth. |
| **E** | UI Components & Layout | Frontend only. Design system, layout, theming. |

### Developer A — Asset Management

**Backend:**
- `server/src/controllers/assetController.js`
- `server/src/routes/assets.js`

**Frontend:**
- `client/src/features/assets/AssetsPage.jsx`
- `client/src/features/assets/AssetDetailPage.jsx`
- `client/src/features/assets/AssetFormModal.jsx`
- `client/src/features/assets/AssignModal.jsx`

**Example branches:** `feature/asset-bulk-delete`, `feature/asset-search-filters`

---

### Developer B — Dashboard & Analytics

**Backend:**
- `server/src/controllers/dashboardController.js`
- `server/src/routes/dashboard.js`

**Frontend:**
- `client/src/features/dashboard/DashboardPage.jsx`

**Example branches:** `feature/dashboard-charts`, `feature/portfolio-valuation`

---

### Developer C — Depreciation Engine

**Backend:**
- `server/src/services/depreciationService.js`

**Example branches:** `feature/depreciation-engine`, `fix/salvage-value-calc`

---

### Developer D — Middleware & Validation

**Backend:**
- `server/src/middleware/errorHandler.js`
- `server/src/middleware/validate.js`
- `server/src/utils/schemas.js`

**Example branches:** `feature/auth-middleware`, `feature/rate-limiting`

---

### Developer E — UI Components & Layout

**Frontend:**
- `client/src/components/layout/` — Header, Layout, Sidebar
- `client/src/components/ui/` — Modal, Badge, ProgressBar, Skeleton, etc.
- `client/src/hooks/` — useDebounce, useTheme

**Example branches:** `feature/sidebar-redesign`, `feature/dark-mode-improvements`

---

## Codebase Map

Files marked with 🔒 are shared — see [Shared Files](#shared-files) for rules.

```
Inventory/
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma              🔒 SHARED
│   │   └── seed.js                    🔒 SHARED
│   └── src/
│       ├── index.js                   🔒 SHARED
│       ├── controllers/
│       │   ├── assetController.js     → Dev A
│       │   └── dashboardController.js → Dev B
│       ├── routes/
│       │   ├── assets.js              → Dev A
│       │   └── dashboard.js           → Dev B
│       ├── services/
│       │   └── depreciationService.js → Dev C
│       ├── middleware/
│       │   ├── errorHandler.js        → Dev D
│       │   └── validate.js            → Dev D
│       └── utils/
│           └── schemas.js             → Dev D
│
├── client/src/
│   ├── App.jsx                        🔒 SHARED
│   ├── main.jsx                       🔒 SHARED
│   ├── index.css                      🔒 SHARED
│   ├── api/
│   │   └── client.js                  🔒 SHARED
│   ├── features/
│   │   ├── assets/                    → Dev A
│   │   └── dashboard/                 → Dev B
│   ├── components/
│   │   ├── layout/                    → Dev E
│   │   └── ui/                        → Dev E
│   ├── hooks/                         → Dev E
│   └── utils/                         🔒 SHARED
│
├── nginx/                             → Tech Lead
├── docker-compose.yml                 → Tech Lead
└── docs/                              → Anyone
```

---

## Shared Files

These files are used by multiple developers. **Don't edit them without coordinating first.**

| File | Rule |
|------|------|
| `prisma/schema.prisma` | Announce in team channel before modifying. One person at a time. |
| `prisma/seed.js` | Coordinate with schema changes. Bundle in the same PR. |
| `server/src/index.js` | Small, separate PR. Don't bundle with feature work. |
| `client/src/App.jsx` | Small, separate PR. Announce before modifying. |
| `client/src/index.css` | Developer E owns this. Others request changes via PR. |
| `client/src/api/client.js` | Anyone can **add** methods. Don't modify existing ones without asking. |
| `client/src/utils/*` | **Append-only.** Add new functions, don't change existing ones. |

### How to edit a shared file

1. Announce in the team channel
2. Make it a **separate, small PR** — don't bundle with feature work
3. Get it merged **quickly** (within hours, not days)
4. Notify the team so everyone can rebase

---

## Expanding the Project

When the project grows, follow this pattern to stay conflict-free:

### Adding a new feature (e.g. User Management)

```
1 controller  +  1 route  +  1 feature folder  =  0 conflicts
```

**Backend:**
```
server/src/controllers/userController.js     ← NEW
server/src/routes/users.js                   ← NEW
```

**Frontend:**
```
client/src/features/users/                   ← NEW folder
├── UsersPage.jsx
├── UserDetailPage.jsx
└── UserFormModal.jsx
```

**Then update shared files** (as a separate PR):
- `server/src/index.js` — register the new route
- `client/src/App.jsx` — add the new page route
- `prisma/schema.prisma` — add the User model

Each new feature gets its own folder. No stepping on toes.
