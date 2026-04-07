# Architecture

Technical overview of the IT Inventory Monitoring System.

## Folder Structure

```
Inventory System/
├── .github/                          # GitHub configuration
│   ├── CODEOWNERS                    # Auto-assign PR reviewers by file path
│   ├── PULL_REQUEST_TEMPLATE.md      # PR checklist template
│   └── workflows/
│       └── ci.yml                    # Lint + build on every PR
│
├── docs/                             # Project documentation
│   ├── ARCHITECTURE.md               # This file — project structure & design
│   ├── BRANCH_STRATEGY.md            # Git branching rules & flow diagram
│   └── COLLABORATORS.md              # How to add team members & set permissions
│
├── server/                           # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (models, enums, indexes)
│   │   ├── seed.js                   # Sample data seeder (7 assets)
│   │   └── migrations/              # Auto-generated migration files
│   ├── src/
│   │   ├── index.js                  # Express entry point + middleware stack
│   │   ├── routes/
│   │   │   ├── assets.js             # /api/assets route definitions
│   │   │   └── dashboard.js          # /api/dashboard route
│   │   ├── controllers/
│   │   │   ├── assetController.js    # Asset CRUD + assign/unassign handlers
│   │   │   └── dashboardController.js # Dashboard aggregation logic
│   │   ├── services/
│   │   │   └── depreciationService.js # All 3 depreciation calculation methods
│   │   ├── middleware/
│   │   │   ├── errorHandler.js       # Global error handling middleware
│   │   │   └── validate.js           # Zod schema validation middleware
│   │   └── utils/
│   │       └── schemas.js            # Zod request body schemas
│   ├── Dockerfile                    # Multi-stage production build
│   └── package.json
│
├── client/                           # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Router + layout + theme provider
│   │   ├── index.css                 # Tailwind directives + design tokens
│   │   ├── api/
│   │   │   └── client.js             # Fetch wrapper with error handling
│   │   ├── features/                 # Feature-based modules (isolated domains)
│   │   │   ├── dashboard/            # Dashboard page + components + hooks
│   │   │   ├── assets/               # Assets page + CRUD + detail + search
│   │   │   └── assignment/           # Employee assignment modal + logic
│   │   ├── components/               # Shared, reusable components
│   │   │   ├── layout/               # Sidebar, Header, Layout wrapper
│   │   │   └── ui/                   # Modal, Badge, ProgressBar, etc.
│   │   ├── hooks/                    # Shared hooks (useDebounce, useTheme)
│   │   └── utils/                    # Formatters, CSV export, constants
│   ├── vite.config.js                # Vite config with API proxy
│   └── package.json
│
├── nginx/                            # Nginx reverse proxy (production)
│   ├── Dockerfile                    # Multi-stage: build React → serve with Nginx
│   └── nginx.conf                    # Reverse proxy + SPA routing + caching
│
├── docker-compose.yml                # Dev: PostgreSQL only
├── docker-compose.prod.yml           # Prod: Postgres + Express + Nginx
├── .dockerignore                     # Exclude files from Docker builds
├── .env.example                      # Environment variable template
├── .gitignore                        # Git ignore rules
├── .nvmrc                            # Pin Node.js version
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── package.json                      # Root scripts (concurrently, db, lint)
├── README.md                         # Project overview + setup guide
├── CONTRIBUTING.md                   # Contribution rules + workflow
├── CHANGELOG.md                      # Release history
└── LICENSE                           # MIT license
```

## Data Models

### Asset

| Field              | Type             | Notes                                    |
|--------------------|------------------|------------------------------------------|
| id                 | Int (PK)         | Auto-increment                           |
| name               | String           | e.g. "MacBook Pro 16"                    |
| assetTag           | String (unique)  | Auto-generated: IT-ASSET-0001            |
| category           | Enum             | LAPTOP, MONITOR, SERVER, PHONE, PRINTER, NETWORKING, PERIPHERAL |
| serialNumber       | String (unique)  | Manufacturer serial number               |
| purchaseDate       | DateTime         | When the asset was purchased             |
| purchasePrice      | Float            | Original cost in USD                     |
| salvageValue       | Float            | Residual value at end of useful life     |
| usefulLifeYears    | Int              | Expected useful life in years            |
| depreciationMethod | Enum             | STRAIGHT_LINE, DOUBLE_DECLINING, UNITS_OF_PRODUCTION |
| totalUnits         | Int?             | Only for UNITS_OF_PRODUCTION method      |
| unitsUsed          | Int?             | Only for UNITS_OF_PRODUCTION method      |
| assignedEmployee   | String?          | Full name of assigned employee           |
| status             | Enum             | IN_USE, AVAILABLE, UNDER_REPAIR, RETIRED |
| location           | String?          | Physical location (building, room)       |
| warrantyExpiry     | DateTime?        | Warranty expiration date                 |
| notes              | String?          | Free-text notes                          |
| createdAt          | DateTime         | Auto-generated on creation               |
| updatedAt          | DateTime         | Auto-updated on modification             |

### AuditLog

| Field        | Type         | Notes                                    |
|--------------|--------------|------------------------------------------|
| id           | Int (PK)     | Auto-increment                           |
| assetId      | Int (FK)     | References Asset.id (cascade delete)     |
| action       | String       | ASSIGNED, UNASSIGNED, REASSIGNED, CREATED, UPDATED, STATUS_CHANGED |
| employeeName | String?      | Employee involved (nullable for non-assignment actions) |
| details      | String?      | Extra context about the action           |
| performedBy  | String       | Defaults to "System"                     |
| timestamp    | DateTime     | Auto-generated                           |

### Relationships

```
Asset ──(1:N)──→ AuditLog
  └── On delete Asset → cascade delete all AuditLog entries
```

## API Routes

| Method | Path                     | Description                                           | Body / Query            |
|--------|--------------------------|-------------------------------------------------------|-------------------------|
| GET    | /api/health              | Server + database health check                        | —                       |
| GET    | /api/dashboard           | Aggregate stats (totals, portfolio values, activity)  | —                       |
| GET    | /api/assets              | List assets with computed depreciation (paginated)    | `?search, status, category, page, pageSize` |
| GET    | /api/assets/:id          | Single asset with full depreciation details           | —                       |
| POST   | /api/assets              | Create a new asset                                    | Asset fields (JSON)     |
| PUT    | /api/assets/:id          | Update an existing asset                              | Partial asset fields    |
| DELETE | /api/assets/:id          | Delete asset + cascade audit logs                     | —                       |
| POST   | /api/assets/:id/assign   | Assign employee to asset                              | `{ employeeName }`      |
| POST   | /api/assets/:id/unassign | Remove employee, set status to Available              | —                       |
| GET    | /api/assets/:id/history  | Get audit log entries for an asset                    | —                       |

## Depreciation Formulas

### 1. Straight-Line

```
Annual Depreciation = (Purchase Price - Salvage Value) / Useful Life (years)
Monthly Depreciation = Annual Depreciation / 12
Current Value = max(Salvage Value, Purchase Price - (Monthly Depreciation × Months Elapsed))
```

Months elapsed is capped at `Useful Life × 12` — the asset never drops below salvage value.

### 2. Double Declining Balance

```
Monthly Rate = (2 / Useful Life in years) / 12

For each month from purchase date to today:
  Depreciation = Current Book Value × Monthly Rate
  If (Current Book Value - Depreciation) < Salvage Value:
    Depreciation = Current Book Value - Salvage Value
  Current Book Value -= Depreciation
```

This is an accelerated method — depreciation is highest in early months and decreases over time.

### 3. Units of Production

```
Per-Unit Depreciation = (Purchase Price - Salvage Value) / Total Units
Total Depreciation = Per-Unit Depreciation × Units Used
Current Value = max(Salvage Value, Purchase Price - Total Depreciation)
```

Used for assets where usage (not time) determines wear, like printers (pages printed).

### Computed Fields (returned in API responses)

Every asset response includes these calculated values:

| Field                | Formula                                          |
|----------------------|--------------------------------------------------|
| `originalValue`      | `purchasePrice`                                  |
| `currentValue`       | Depreciated value as of today                    |
| `projectedNextMonth` | Depreciated value one month from today           |
| `monthlyDepreciation`| `currentValue - projectedNextMonth`              |
| `totalDepreciated`   | `purchasePrice - currentValue`                   |
| `percentRemaining`   | `(currentValue / purchasePrice) × 100`           |
| `monthsRemaining`    | Months until fully depreciated to salvage value  |
| `fullyDepreciatedDate`| Date when asset reaches salvage value           |
