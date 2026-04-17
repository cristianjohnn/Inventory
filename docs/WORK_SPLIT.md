# Work Split Guide

> **Who is this for?** Every developer on the team. Read this before writing your first line of code.

---

## Table of Contents

- [New Developer Onboarding](#new-developer-onboarding)
- [How We Use Git](#how-we-use-git)
- [Developer Assignments](#developer-assignments)
- [Codebase Map](#codebase-map)
- [What Each File Does](#what-each-file-does)
- [Containers That Can Be Split](#containers-that-can-be-split)
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

| Role | Team | Domain | Scope |
|------|------|--------|-------|
| **A** | Frontend | Asset Management UI | Asset lists, filters, detail pages, forms, assignment modals |
| **B** | Frontend | Analytics UI | Dashboards, Recharts mapping, reports, export utilities |
| **C** | Frontend | Core UI Component System | App layouts, UI primitives, CSS theming, auth/profile |
| **D** | Backend | Core API & Data | Express routers, controller business logic, Prisma queries |
| **E** | Backend | Services & Infrastructure | Depreciation mathematics, global error handling, Zod |

### Developer A — Frontend: Asset Management
**Frontend Scope:**
- `client/src/features/assets/AssetsPage.jsx`
- `client/src/features/assets/AssetDetailPage.jsx`
- `client/src/features/assets/AssetFormModal.jsx`
- `client/src/features/assets/AssignModal.jsx`
- **Example branches:** `feature/ui-asset-search`, `feature/ui-assign-modals`

---

### Developer B — Frontend: Analytics
**Frontend Scope:**
- `client/src/features/dashboard/DashboardPage.jsx`
- `client/src/features/reports/ReportsPage.jsx`
- `client/src/utils/exportCsv.js`, `exportPdf.js`
- **Example branches:** `feature/ui-dashboard-tiles`, `feature/pdf-export`

---

### Developer C — Frontend: UI Foundation
**Frontend Scope:**
- `client/src/components/layout/` & `client/src/components/ui/`
- `client/src/features/profile/`, `features/auth/`, `features/notifications/`
- `client/src/index.css` (Theming logic)
- **Example branches:** `feature/dark-mode`, `feature/modal-portals`

---

### Developer D — Backend: Core API
**Backend Scope:**
- `server/src/controllers/assetController.js` (+ `dashboardController.js`)
- `server/src/routes/assets.js` (+ `dashboard.js`)
- **Example branches:** `feature/api-asset-filtering`, `feature/api-bulk-delete`

---

### Developer E — Backend: Services
**Backend Scope:**
- `server/src/services/depreciationService.js`
- `server/src/middleware/` (errorHandler, validation)
- `server/src/utils/schemas.js` (Zod validation schemas)
- **Example branches:** `feature/depreciation-engine`, `feature/schema-val`

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
│   ├── src/
│   │   ├── index.js                   🔒 SHARED
│   │   ├── controllers/               → Dev D 
│   │   ├── routes/                    → Dev D
│   │   ├── services/                  → Dev E
│   │   ├── middleware/                → Dev E
│   │   └── utils/                     → Dev E
│   └── Dockerfile                     → Tech Lead
│
├── client/src/
│   ├── App.jsx                        🔒 SHARED
│   ├── main.jsx                       🔒 SHARED
│   ├── index.css                      → Dev C
│   ├── api/
│   │   └── client.js                  🔒 SHARED
│   ├── assets/                        
│   ├── features/
│   │   ├── assets/                    → Dev A  (Assets components & modals)
│   │   ├── auth/                      → Dev C  
│   │   ├── dashboard/                 → Dev B  (Dashboard components)
│   │   ├── notifications/             → Dev C  
│   │   ├── profile/                   → Dev C  
│   │   └── reports/                   → Dev B  (Reports & charting)
│   ├── components/
│   │   ├── layout/                    → Dev C  
│   │   └── ui/                        → Dev C  
│   ├── hooks/                         → Dev C  
│   └── utils/                         → Dev B  (Export utilities)
│
├── nginx/                             → Tech Lead
│   ├── Dockerfile                     → Tech Lead
│   └── nginx.conf                     → Tech Lead
├── docker-compose.yml                 → Tech Lead
├── docker-compose.prod.yml            → Tech Lead
├── .dockerignore                      → Tech Lead
└── docs/                              → Anyone
```

---

## What Each File Does

### Server Files

| File | What It Does |
|------|-------------|
| `server/src/index.js` | Express entry point. Sets up CORS, morgan logging, JSON parsing, rate limiting (100 req/min), health check endpoint, mounts `/api/assets` and `/api/dashboard` routes, global error handler, graceful shutdown. |
| `server/src/controllers/assetController.js` | 7 exported handlers: `listAssets` (paginated, filterable), `getAsset`, `createAsset` (auto-generates IT-ASSET-XXXX tag), `updateAsset`, `deleteAsset`, `assignEmployee`, `unassignEmployee`, `getAssetHistory`. Each mutation writes an AuditLog. |
| `server/src/controllers/dashboardController.js` | Single `getDashboard` handler. Aggregates status counts, portfolio values (original/current/projected), category-level breakdowns, and 20 most recent audit log entries. |
| `server/src/routes/assets.js` | Wires up Express routes to asset controller functions. Applies Zod validation middleware on POST/PUT endpoints. |
| `server/src/routes/dashboard.js` | Single `GET /api/dashboard` route. |
| `server/src/services/depreciationService.js` | Pure calculation service. Implements 3 depreciation methods. `enrichAsset()` computes 8 derived fields (currentValue, projectedNextMonth, monthlyDepreciation, totalDepreciated, percentRemaining, monthsRemaining, fullyDepreciatedDate, originalValue). `enrichAssets()` maps over arrays. |
| `server/src/middleware/errorHandler.js` | Catches errors thrown by controllers. Formats Prisma validation/constraint errors, Zod validation errors, and generic errors into a consistent `{ success, error: { code, message, details } }` JSON response. |
| `server/src/middleware/validate.js` | Factory function: `validate(schema)` returns Express middleware that parses `req.body` with Zod and attaches validated data to `req.validatedBody`. |
| `server/src/utils/schemas.js` | 3 Zod schemas: `createAssetSchema` (all required fields), `updateAssetSchema` (all optional), `assignEmployeeSchema` (just `employeeName`). |
| `server/prisma/schema.prisma` | Defines `Asset` and `AuditLog` models, enums (`Status`, `Category`, `DepreciationMethod`), indexes, cascade-delete relationship. |
| `server/prisma/seed.js` | Seeds database with 7 sample assets across different categories, statuses, and depreciation methods for development. |

### Client Files

| File | What It Does |
|------|-------------|
| `client/src/main.jsx` | Mounts React app into DOM with `BrowserRouter`. |
| `client/src/App.jsx` | Defines all routes. LoginPage is full-screen (no layout). All other routes render inside `<Layout>` (sidebar + header). Configures `react-hot-toast` Toaster with theme-aware styling. |
| `client/src/index.css` | Tailwind directives + comprehensive CSS custom property design system. Defines light/dark mode color tokens, card styles, button variants (btn-primary, btn-secondary, btn-danger, btn-ghost), form inputs, data table styles, status tabs, filter bar, and keyframe animations (fade-in, slide-in, scale-in, count-up, pulse-dot). |
| `client/src/api/client.js` | Centralized `request()` wrapper over `fetch`. Handles JSON serialization, error extraction into typed Error objects. Exports `assetsApi` (list/get/create/update/delete/assign/unassign/history) and `dashboardApi` (get). |

### Feature Files

| File | What It Does |
|------|-------------|
| `features/assets/AssetsPage.jsx` | **379 lines.** Paginated asset table with: search input (debounced), category dropdown filter, status tabs with live counts (5 API calls on mount), data table with category icon/asset info/status badge/department/assignee/current value/depreciation progress bar, pagination controls, CSV export button, add-asset modal trigger. |
| `features/assets/AssetDetailPage.jsx` | **482 lines.** Single asset deep-dive: hero header (icon + name + tag + serial), depreciation card (circular gauge + 4 metric boxes + progress bar + method/months/EOL tags), identity & specs card (location, dates, salvage value, department, units), assignment card (assign/unassign/reassign buttons), audit timeline (color-coded dots), edit/delete modals. |
| `features/assets/AssetFormModal.jsx` | **274 lines.** Multi-section create/edit form inside a Modal. Sections: General (name, category datalist, serial, status, department), Financial (dates, prices, useful life), Depreciation (method select, conditional units fields), Additional (location, warranty, notes). Auto-fills when editing. Shows per-field Zod validation errors via toast. |
| `features/assets/AssignModal.jsx` | Small modal with single employee name text input. |
| `features/auth/LoginPage.jsx` | Branded login page with hero image, email/password form, "Remember me" checkbox, and "Forgot password" link. Currently mock UI — no backend auth. |
| `features/dashboard/DashboardPage.jsx` | **452 lines.** Contains inline `StatCard` and `ChartTooltip` components. Renders: 5 KPI cards (total, portfolio value, monthly depreciation, in use, under repair), bar chart (category value comparison using Recharts), donut chart (status distribution), depreciation forecast panel, scrollable activity feed. |
| `features/notifications/NotificationsPage.jsx` | Full-page notification list with mock notification items and category badges. |
| `features/profile/ProfilePage.jsx` | Tab container with sidebar navigation. Routes to 4 sub-views based on `activeTab` state. Supports deep-linking via `location.state.tab`. |
| `features/profile/GeneralInfo.jsx` | Editable profile fields: avatar initial, display name, email, role display. |
| `features/profile/PreferencesView.jsx` | Toggle switches for theme, language, notification preferences. |
| `features/profile/SecurityView.jsx` | Password change form with current/new/confirm fields, 2FA toggle. |
| `features/profile/RolePermissionsView.jsx` | Displays current role and permission matrix grid. |
| `features/reports/ReportsPage.jsx` | **334 lines.** Financial summary: 3 top cards (original investment, total depreciated, net book value), bar chart (value by category), horizontal bar chart (department distribution), pie chart (depreciation method mix), depreciaton schedule table (top 15 assets by monthly cost) with CSV export. |

### UI Components

| File | What It Does |
|------|-------------|
| `components/layout/Layout.jsx` | Flex container: `<Sidebar>` on the left, `<Header>` + scrollable `<main>` on the right. Uses `<Outlet>` for nested routes. |
| `components/layout/Sidebar.jsx` | Collapsible navigation sidebar with app branding, nav links (Dashboard, Assets, Reports, Notifications, Profile), active-route highlighting, collapse toggle. |
| `components/layout/Header.jsx` | Top bar with: global search input (⌘K shortcut badge), `<HeaderNotifications>`, `<ThemeToggle>`, `<HeaderProfile>`. Sticky, backdrop-blur, theme-aware. |
| `components/layout/HeaderNotifications.jsx` | Bell icon button. On click, shows dropdown with mock notification items (warranty expiring, asset assigned, etc.). Links to full notifications page. |
| `components/layout/HeaderProfile.jsx` | Avatar circle button. On click, shows dropdown with user info, links to Profile and Preferences pages (passes tab state), and Sign Out button. |
| `components/ui/ActionMenu.jsx` | 3-dot (`MoreVertical`) button that opens a positioned dropdown. Accepts `items` array (label, icon, action, danger flag). Closes on click-outside or Escape. Used in asset table rows. |
| `components/ui/Badge.jsx` | Renders a colored pill badge based on asset status. Maps status to color/background from `STATUS_OPTIONS`. |
| `components/ui/ConfirmDialog.jsx` | Wraps `<Modal>` with a warning triangle icon, message text, Cancel + Delete buttons. Used for delete confirmations. |
| `components/ui/DepreciationGauge.jsx` | Animated SVG circular gauge. Renders two circles (background + value arc). Color transitions from green (>50%) → amber (>25%) → orange (>10%) → red. Mount animation via CSS transition on `strokeDashoffset`. |
| `components/ui/EmptyState.jsx` | Centered layout: icon in rounded box + title + optional message. Used when data lists are empty (no assets found, failed to load, etc.). |
| `components/ui/ErrorBoundary.jsx` | React class component error boundary. Catches render errors, shows error message with "Try again" button that resets state. |
| `components/ui/Modal.jsx` | Reusable modal with backdrop overlay, content container, close (X) button, title slot. Supports `sm`/`md`/`lg` size variants. Closes on backdrop click or Escape. |
| `components/ui/ProgressBar.jsx` | Thin horizontal bar with dynamic fill color (green→amber→red based on percentage). Configurable height. Used for depreciation remaining in tables and detail pages. |
| `components/ui/Skeleton.jsx` | Animated loading placeholders. Exports: `Skeleton` (base shimmer box), `SkeletonCard` (card-shaped), `SkeletonRow` (table row-shaped). |
| `components/ui/StatusTabs.jsx` | Horizontal row of filter buttons with counts. Active tab shows accent color. Used on Assets page for status filtering (All/In Use/Available/Repair/Retired). |
| `components/ui/ThemeToggle.jsx` | Sun/Moon icon button. 180° rotation animation on toggle. Renders Sun icon in dark mode, Moon in light mode. |

### Hooks

| Hook | What It Does |
|------|-------------|
| `useDebounce(value, delay)` | Returns a delayed version of `value`. Updates only after `delay` ms of inactivity. Default: 300ms. Used for search inputs to avoid API calls on every keystroke. |
| `useTheme()` | Manages dark/light mode. Reads initial state from `localStorage.theme`, defaults to dark. Returns `{ isDark, toggleTheme }`. Toggles `.dark` class on `<html>` and persists to localStorage. |

### Utils

| Util | What It Does |
|------|-------------|
| `constants.js` | Exports: `STATUS_OPTIONS` (value, label, color, bg for 4 statuses), `CATEGORY_OPTIONS` (10 categories with icons + emojis), `DEPARTMENT_OPTIONS` (12 departments), `DEPRECIATION_METHODS` (3 methods with descriptions), `getStatusConfig()`, `getCategoryConfig()`. |
| `formatters.js` | Exports: `formatCurrency(value)` → PHP format (₱), `formatDate(dateString)` → "Apr 8, 2026", `formatPercent(value)` → "75.3%", `formatNumber(value)` → locale string, `timeAgo(dateString)` → "3m ago" / "2d ago". |
| `exportCsv.js` | `exportToCsv(assets, filename)` — generates CSV string from asset array with 14 columns, creates Blob, triggers browser download. |

---

## Containers That Can Be Split

These are large files that contain multiple logical sections and could be broken into smaller components for better maintainability and reduced merge conflicts.

### 🔴 High Priority — Would Reduce Merge Conflicts

| File | Lines | What Can Be Extracted |
|------|-------|-----------------------|
| **`DashboardPage.jsx`** | 452 | `StatCard` → `components/ui/StatCard.jsx` · `ChartTooltip` → `components/ui/ChartTooltip.jsx` (already duplicated in ReportsPage) · `StatusDonutChart` → `features/dashboard/StatusDonutChart.jsx` · `CategoryBarChart` → `features/dashboard/CategoryBarChart.jsx` · `DepreciationForecast` → `features/dashboard/DepreciationForecast.jsx` · `ActivityFeed` → `features/dashboard/ActivityFeed.jsx` |
| **`AssetDetailPage.jsx`** | 482 | `InfoRow` → `components/ui/InfoRow.jsx` · `DepreciationCard` → `features/assets/DepreciationCard.jsx` · `SpecificationsCard` → `features/assets/SpecificationsCard.jsx` · `AssignmentCard` → `features/assets/AssignmentCard.jsx` · `AuditTimeline` → `features/assets/AuditTimeline.jsx` |
| **`AssetsPage.jsx`** | 379 | `AssetTableRow` → `features/assets/AssetTableRow.jsx` · `AssetFilters` → `features/assets/AssetFilters.jsx` · `Pagination` → `components/ui/Pagination.jsx` (reusable) |
| **`ReportsPage.jsx`** | 334 | `ChartTooltip` → shared with DashboardPage as `components/ui/ChartTooltip.jsx` · `DepreciationScheduleTable` → `features/reports/DepreciationScheduleTable.jsx` · `MethodDistributionChart` → `features/reports/MethodDistributionChart.jsx` · `DepartmentChart` → `features/reports/DepartmentChart.jsx` |

### 🟡 Medium Priority — Improves Reusability

| File | Lines | What Can Be Extracted |
|------|-------|-----------------------|
| **`AssetFormModal.jsx`** | 274 | Each form section could become its own component: `GeneralInfoSection`, `FinancialSection`, `DepreciationSection`, `AdditionalInfoSection`. This would make the form easier to extend without touching the whole file. |
| **`assetController.js`** | 357 | Assignment handlers (`assignEmployee`, `unassignEmployee`) could move to a separate `assignmentController.js`. This separates CRUD from assignment logic. |
| **`Sidebar.jsx`** | 165 | Navigation items array could move to a config file. Mobile hamburger logic could extract into a `useSidebar` hook. |

### 🟢 Low Priority — Already Well-Structured

| File | Lines | Status |
|------|-------|--------|
| `ProfilePage.jsx` | 108 | ✅ Already split into 4 sub-views (GeneralInfo, Preferences, Security, RolePermissions) |
| `Header.jsx` | 47 | ✅ Already split — notifications and profile are separate components |
| `Layout.jsx` | 18 | ✅ Minimal, composes Sidebar + Header |

### Shared Duplicates Worth Extracting

These components are **duplicated** across files and should become shared:

| Component | Found In | Extract To |
|-----------|----------|------------|
| `ChartTooltip` | DashboardPage, ReportsPage | `components/ui/ChartTooltip.jsx` |
| `StatCard`-like components | DashboardPage, ReportsPage | `components/ui/StatCard.jsx` |
| Status color-to-dot mapping | DashboardPage, AssetDetailPage | `utils/constants.js` (add `getActionColor()`) |

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
| `client/src/api/client.js` | Anyone can **add** new API methods. Don't modify existing ones without asking. |
| `client/src/utils/*` | **Append-only.** Add new functions, don't change existing ones. |
| `docker-compose.*`, `Dockerfile`s | Tech Lead handles production infrastructure. Request changes via PR. |

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
