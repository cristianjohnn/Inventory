# Architecture

Technical overview of the IT Inventory Monitoring System.

> 📚 **Not sure which doc to read?** See the [Documentation Guide](README.md) for a quick navigation table.
> 
> 📖 **Don't know a term?** Check the [Glossary](GLOSSARY.md).

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React 18 + Vite, React Router, Recharts, Lucide Icons |
| Styling     | Tailwind CSS + CSS custom properties (design tokens in `index.css`) |
| Backend     | Node.js + Express                              |
| Database    | PostgreSQL + Prisma ORM                        |
| Infra       | Docker, Docker Compose, Nginx reverse proxy    |
| Linting     | ESLint + Prettier                              |
| CI          | GitHub Actions (`ci.yml` — lint + build on PRs)|

## Why So Many Files in the Root?

If you open the project root and feel overwhelmed — that's normal. Most of these files are **configuration files** that you set up once and rarely touch again. Here's what every root file does, grouped by purpose:

### 📁 The 4 Main Folders (where actual code lives)

| Folder | What's Inside | Who Works Here |
|--------|---------------|----------------|
| `client/` | React frontend — all the UI you see in the browser | Frontend devs (A, B, E) |
| `server/` | Express backend — API, database, business logic | Backend devs (A, B, C, D) |
| `nginx/` | Reverse proxy config — only used in production Docker deployment | Tech Lead only |
| `docs/` | Project documentation (this file, branch strategy, etc.) | Anyone |

> **As a developer, 95% of your time will be spent in `client/` or `server/`.** Everything else below is config you can mostly ignore.

### 🐳 Docker Files (production deployment)

| File | Purpose | Do I Touch It? |
|------|---------|----------------|
| `docker-compose.yml` | Spins up PostgreSQL for local development | Rarely — only if DB config changes |
| `docker-compose.prod.yml` | Spins up the full production stack (Postgres + Express + Nginx) | No — Tech Lead only |
| `.dockerignore` | Tells Docker which files to skip when building images (like `.gitignore` but for Docker) | No |

### ⚙️ Code Quality & Formatting

| File | Purpose | Do I Touch It? |
|------|---------|----------------|
| `.eslintrc.json` | ESLint rules — catches bugs and enforces code style automatically | Rarely |
| `.prettierrc` | Prettier rules — auto-formats your code (indentation, quotes, semicolons) | Rarely |

### 🔐 Environment & Secrets

| File | Purpose | Do I Touch It? |
|------|---------|----------------|
| `.env` | Your local environment variables (database password, ports). **Never commit this.** | Yes — your local copy |
| `.env.example` | Template showing which env vars are needed (safe to commit, no real secrets) | Rarely — only when adding new env vars |

### 📦 Node.js / npm

| File | Purpose | Do I Touch It? |
|------|---------|----------------|
| `package.json` | Root-level scripts (`npm run dev`, `npm run lint`) and shared dependencies | Rarely |
| `package-lock.json` | Auto-generated exact dependency versions. **Never edit manually.** | No — npm manages it |
| `node_modules/` | Downloaded dependencies. **Never commit this.** Git ignores it automatically. | No |
| `.nvmrc` | Pins the Node.js version so everyone uses the same one | No |

### 📝 Documentation

| File | Purpose | Do I Touch It? |
|------|---------|----------------|
| `README.md` | Project overview + setup guide — the first thing people read | When setup steps change |
| `CONTRIBUTING.md` | Rules for contributing — commit format, PR process, code standards | Rarely |
| `CHANGELOG.md` | Release history — what changed in each version | When releasing |
| `LICENSE` | MIT open-source license | No |

### 🔧 Git & GitHub

| File | Purpose | Do I Touch It? |
|------|---------|----------------|
| `.gitignore` | Tells Git which files to skip (node_modules, .env, build outputs) | Rarely |
| `.github/` | GitHub-specific config: PR template, CI workflow, CODEOWNERS | Rarely |

### 🧹 Utility Scripts (one-off tools)

| File | Purpose | Do I Touch It? |
|------|---------|----------------|
| `clean.js` | Utility to clean build artifacts and caches | No — just run it if needed |
| `refactor-theme.js` | One-off migration script used during the Tailwind → CSS variable refactor | No — this is legacy, can be deleted |

### TL;DR

> **You only need to care about `client/` and `server/`.** Everything else is project configuration that the tech lead set up. If you're not sure about a root file — don't touch it.

---

## How Frontend Connects to Backend

> **Full guide:** [FRONTEND_BACKEND_MAP.md](FRONTEND_BACKEND_MAP.md)

Quick summary of which page talks to which backend:

| Page | Frontend File | Backend Endpoint | What Data Flows |
|------|--------------|------------------|-----------------|
| Dashboard | `DashboardPage.jsx` | `GET /api/dashboard` | KPI stats, portfolio values, charts, activity feed |
| Assets List | `AssetsPage.jsx` | `GET /api/assets`, `POST /api/assets` | Paginated asset list, create new asset |
| Asset Detail | `AssetDetailPage.jsx` | 6 endpoints: get, update, delete, assign, unassign, history | Full asset data, depreciation, audit timeline |
| Reports | `ReportsPage.jsx` | `GET /api/dashboard`, `GET /api/assets` | Financial summaries, category/dept analysis |
| Login | `LoginPage.jsx` | *(none yet)* | Mock UI — needs auth backend |
| Profile | `ProfilePage.jsx` + 4 views | *(none yet)* | Mock UI — needs user API |
| Notifications | `NotificationsPage.jsx` | *(none yet)* | Mock UI — uses hardcoded data |

---

## Folder Structure

```
Inventory System/
├── .github/                              # GitHub configuration
│   ├── CODEOWNERS                        # Auto-assign PR reviewers by file path
│   ├── PULL_REQUEST_TEMPLATE.md          # PR checklist template
│   └── workflows/
│       └── ci.yml                        # Lint + build on every PR
│
├── docs/                                 # Project documentation
│   ├── README.md                         # 📚 Start here — doc navigation guide
│   ├── ARCHITECTURE.md                   # This file — structure & overview
│   ├── FRONTEND_BACKEND_MAP.md           # Which frontend page talks to which backend
│   ├── API_REFERENCE.md                  # API routes, data models, depreciation formulas
│   ├── WORK_SPLIT.md                     # Developer assignments, file ownership
│   ├── BRANCH_STRATEGY.md               # Git branching rules & flow
│   ├── COLLABORATORS.md                  # Adding team members & permissions
│   └── GLOSSARY.md                       # Technical term definitions
│
├── server/                               # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma                 # Database schema (Asset, AuditLog models + enums)
│   │   ├── seed.js                       # Sample data seeder (7 demo assets)
│   │   └── migrations/                   # Auto-generated Prisma migration files
│   ├── src/
│   │   ├── index.js                      # Express entry point — CORS, morgan, rate-limit, routes
│   │   ├── controllers/
│   │   │   ├── assetController.js        # Asset CRUD + assign/unassign/history handlers (7 exports)
│   │   │   └── dashboardController.js    # Dashboard aggregation — totals, portfolio, activity feed
│   │   ├── routes/
│   │   │   ├── assets.js                 # /api/assets route definitions + Zod validation wiring
│   │   │   └── dashboard.js              # /api/dashboard route (single GET)
│   │   ├── services/
│   │   │   └── depreciationService.js    # Straight-line, Double Declining, Units of Production calculations
│   │   ├── middleware/
│   │   │   ├── errorHandler.js           # Global error handler — Prisma/Zod/generic error formatting
│   │   │   └── validate.js              # Zod schema validation middleware factory
│   │   └── utils/
│   │       └── schemas.js               # Zod schemas: createAsset, updateAsset, assignEmployee
│   ├── Dockerfile                        # Multi-stage production build
│   └── package.json
│
├── client/                               # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx                      # React DOM entry — BrowserRouter + App mount
│   │   ├── App.jsx                       # Router config + Layout wrapper + Toaster (react-hot-toast)
│   │   ├── index.css                     # Tailwind directives + full design token system (light/dark)
│   │   │
│   │   ├── api/
│   │   │   └── client.js                 # Centralized fetch wrapper + assetsApi + dashboardApi exports
│   │   │
│   │   ├── assets/                       # Static assets (images, SVGs)
│   │   │   ├── hero.png                  # Login page hero image
│   │   │   ├── typescript.svg            # Vite template leftover
│   │   │   └── vite.svg                  # Vite template leftover
│   │   │
│   │   ├── features/                     # Feature-based modules (isolated domains)
│   │   │   ├── assets/                   # Asset management (4 files)
│   │   │   │   ├── AssetsPage.jsx        # Asset list table + search/filters + status tabs + pagination
│   │   │   │   ├── AssetDetailPage.jsx   # Single asset view — depreciation gauge, specs, assignment, audit history
│   │   │   │   ├── AssetFormModal.jsx    # Create/edit asset form (4 sections: general, financial, depreciation, additional)
│   │   │   │   └── AssignModal.jsx       # Employee assignment modal (simple name input)
│   │   │   │
│   │   │   ├── auth/                     # Authentication UI (1 file)
│   │   │   │   └── LoginPage.jsx         # Branded login page with hero image (mock — no real auth yet)
│   │   │   │
│   │   │   ├── dashboard/                # Dashboard & analytics (1 file)
│   │   │   │   └── DashboardPage.jsx     # KPI stat cards, bar/pie charts, depreciation forecast, activity feed
│   │   │   │
│   │   │   ├── notifications/            # Notifications hub (1 file)
│   │   │   │   └── NotificationsPage.jsx # Full-page notification list with mock data
│   │   │   │
│   │   │   ├── profile/                  # Profile settings (5 files, modular tabs)
│   │   │   │   ├── ProfilePage.jsx       # Tab container — switches between 4 sub-views
│   │   │   │   ├── GeneralInfo.jsx       # Editable name, email, avatar placeholder
│   │   │   │   ├── PreferencesView.jsx   # Theme, language, notification toggles
│   │   │   │   ├── SecurityView.jsx      # Password change form, 2FA toggle
│   │   │   │   └── RolePermissionsView.jsx # Role display and permission matrix
│   │   │   │
│   │   │   └── reports/                  # Reports & analytics (1 file)
│   │   │       └── ReportsPage.jsx       # Financial summary cards, category/dept charts, depreciation schedule table
│   │   │
│   │   ├── components/                   # Shared, reusable components
│   │   │   ├── layout/                   # App shell (5 files)
│   │   │   │   ├── Layout.jsx            # Sidebar + Header + main content outlet
│   │   │   │   ├── Sidebar.jsx           # Collapsible nav with route links + branding
│   │   │   │   ├── Header.jsx            # Top bar — global search, notification bell, theme toggle, profile avatar
│   │   │   │   ├── HeaderNotifications.jsx # Notification bell dropdown with mock notification items
│   │   │   │   └── HeaderProfile.jsx     # Profile avatar dropdown — links to profile/preferences, sign out
│   │   │   │
│   │   │   └── ui/                       # UI primitives (11 files)
│   │   │       ├── ActionMenu.jsx        # 3-dot dropdown menu for table row actions (edit/assign/delete)
│   │   │       ├── Badge.jsx             # Colored status badge (IN_USE/AVAILABLE/UNDER_REPAIR/RETIRED)
│   │   │       ├── ConfirmDialog.jsx     # Danger confirmation modal (uses Modal) — delete warnings
│   │   │       ├── DepreciationGauge.jsx # Animated SVG circular gauge — green→amber→red by percentage
│   │   │       ├── EmptyState.jsx        # Centered icon + title + message for empty data states
│   │   │       ├── ErrorBoundary.jsx     # React class error boundary — catches render crashes
│   │   │       ├── Modal.jsx             # Reusable modal overlay with backdrop, close button, size variants
│   │   │       ├── ProgressBar.jsx       # Horizontal bar with dynamic color (green→amber→red)
│   │   │       ├── Skeleton.jsx          # Loading placeholder — exports Skeleton, SkeletonCard, SkeletonRow
│   │   │       ├── StatusTabs.jsx        # Horizontal tab bar with counts (used on Assets page)
│   │   │       └── ThemeToggle.jsx       # Sun/Moon icon button with rotate animation for dark mode toggle
│   │   │
│   │   ├── hooks/                        # Shared custom hooks (2 files)
│   │   │   ├── useDebounce.js            # Delays value updates (default 300ms) — used for search input
│   │   │   └── useTheme.js              # Dark/light mode state — persists to localStorage, toggles .dark class
│   │   │
│   │   └── utils/                        # Shared utility functions (3 files)
│   │       ├── constants.js              # STATUS_OPTIONS, CATEGORY_OPTIONS, DEPARTMENT_OPTIONS, DEPRECIATION_METHODS + helpers
│   │       ├── formatters.js             # formatCurrency (PHP), formatDate, formatPercent, formatNumber, timeAgo
│   │       └── exportCsv.js             # exportToCsv() — generates CSV blob and triggers download
│   │
│   ├── vite.config.js                    # Vite config with API proxy to :3001
│   └── package.json
│
├── nginx/                                # Nginx reverse proxy (production only)
│   ├── Dockerfile                        # Multi-stage: build React → serve with Nginx
│   └── nginx.conf                        # Reverse proxy API to Express + SPA routing + static caching
│
├── docker-compose.yml                    # Dev: PostgreSQL only
├── docker-compose.prod.yml              # Prod: Postgres + Express + Nginx (full stack)
├── .dockerignore                         # Exclude files from Docker builds
├── .env.example                          # Environment variable template
├── .gitignore                            # Git ignore rules
├── .nvmrc                                # Pin Node.js version
├── .eslintrc.json                        # ESLint configuration
├── .prettierrc                           # Prettier configuration
├── clean.js                              # Utility script to clean build artifacts
├── refactor-theme.js                     # One-off migration script (Tailwind → CSS variable refactor)
├── package.json                          # Root scripts (concurrently, db, lint, format)
├── README.md                             # Project overview + setup guide
├── CONTRIBUTING.md                       # Contribution rules + workflow
├── CHANGELOG.md                          # Release history
└── LICENSE                               # MIT license
```

---

## Further Reading

- **API routes, data models, depreciation formulas** → [API_REFERENCE.md](API_REFERENCE.md)
- **Frontend ↔ backend connection details** → [FRONTEND_BACKEND_MAP.md](FRONTEND_BACKEND_MAP.md)
- **Developer assignments & file ownership** → [WORK_SPLIT.md](WORK_SPLIT.md)
- **Git branching workflow** → [BRANCH_STRATEGY.md](BRANCH_STRATEGY.md)
- **Technical term definitions** → [GLOSSARY.md](GLOSSARY.md)
