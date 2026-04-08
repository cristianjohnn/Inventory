# API Reference

> **Who is this for?** Backend developers building endpoints, and frontend developers calling them.

---

## API Routes

All endpoints are prefixed with `/api`. The server runs on port `3001` in development.

| Method | Path | Description | Request Body / Query | Zod Schema |
|--------|------|-------------|---------------------|------------|
| GET | `/api/health` | Server + database health check | — | — |
| GET | `/api/dashboard` | Aggregate stats, portfolio values, activity feed | — | — |
| GET | `/api/assets` | List assets with depreciation (paginated, filterable) | `?search, status, category, page, pageSize` | — |
| GET | `/api/assets/:id` | Single asset with full depreciation details | — | — |
| POST | `/api/assets` | Create a new asset (auto-generates asset tag) | Asset fields (JSON) | `createAssetSchema` |
| PUT | `/api/assets/:id` | Update an existing asset | Partial asset fields (JSON) | `updateAssetSchema` |
| DELETE | `/api/assets/:id` | Delete asset + cascade delete audit logs | — | — |
| POST | `/api/assets/:id/assign` | Assign employee to asset, set status to IN_USE | `{ employeeName }` | `assignEmployeeSchema` |
| POST | `/api/assets/:id/unassign` | Remove employee, set status to AVAILABLE | — | — |
| GET | `/api/assets/:id/history` | Get audit log entries for an asset | — | — |

### Rate Limiting

All `/api/` routes are rate-limited to **100 requests per minute per IP**. Exceeding this returns:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again in a minute."
  }
}
```

### Response Format

All successful responses follow this shape:

```json
{
  "success": true,
  "data": { ... }
}
```

List endpoints include pagination metadata:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset not found.",
    "details": []
  }
}
```

---

## Data Models

### Asset

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Int (PK) | Auto | Auto-increment |
| name | String | ✅ | e.g. "MacBook Pro 16" |
| assetTag | String (unique) | Auto | Auto-generated: `IT-ASSET-0001` |
| category | Enum | ✅ | LAPTOP, MONITOR, SERVER, PHONE, PRINTER, NETWORKING, PERIPHERAL |
| serialNumber | String (unique) | ✅ | Manufacturer serial number |
| purchaseDate | DateTime | ✅ | When the asset was purchased |
| purchasePrice | Float | ✅ | Original cost in PHP (₱) |
| salvageValue | Float | ✅ | Residual value at end of useful life |
| usefulLifeYears | Int | ✅ | Expected useful life in years |
| depreciationMethod | Enum | ✅ | STRAIGHT_LINE, DOUBLE_DECLINING, UNITS_OF_PRODUCTION |
| totalUnits | Int? | Only for UOP | Total unit capacity (e.g. pages for a printer) |
| unitsUsed | Int? | Only for UOP | How many units have been consumed |
| assignedEmployee | String? | Optional | Full name of the person using this asset |
| status | Enum | ✅ | IN_USE, AVAILABLE, UNDER_REPAIR, RETIRED |
| department | String? | Optional | Department assignment (e.g. IT_DEPARTMENT, MARKETING) |
| location | String? | Optional | Physical location (building, room, floor) |
| warrantyExpiry | DateTime? | Optional | When the warranty expires |
| notes | String? | Optional | Free-text notes |
| createdAt | DateTime | Auto | Set on creation |
| updatedAt | DateTime | Auto | Updated on every modification |

### AuditLog

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Int (PK) | Auto | Auto-increment |
| assetId | Int (FK) | ✅ | References Asset.id — cascade deletes with asset |
| action | String | ✅ | ASSIGNED, UNASSIGNED, REASSIGNED, CREATED, UPDATED, STATUS_CHANGED |
| employeeName | String? | Optional | Employee involved (null for non-assignment actions) |
| details | String? | Optional | Human-readable description of what happened |
| performedBy | String | Auto | Defaults to "System" |
| timestamp | DateTime | Auto | When the action occurred |

### Relationships

```
Asset ──(1:N)──→ AuditLog
  └── On delete Asset → cascade delete all AuditLog entries
```

---

## Depreciation Formulas

The `depreciationService.js` file computes asset values using one of three methods. All calculations happen on the **server** — the frontend just displays the results.

### 1. Straight-Line (most common)

```
Annual Depreciation = (Purchase Price - Salvage Value) / Useful Life (years)
Monthly Depreciation = Annual Depreciation / 12
Current Value = max(Salvage Value, Purchase Price - (Monthly Depreciation × Months Elapsed))
```

Months elapsed is capped at `Useful Life × 12` — the asset never drops below salvage value.

**Example:** A ₱50,000 laptop with ₱5,000 salvage value and 5-year useful life:
- Annual: (50,000 - 5,000) / 5 = ₱9,000/year
- Monthly: 9,000 / 12 = ₱750/month
- After 2 years: max(5,000, 50,000 - (750 × 24)) = ₱32,000

### 2. Double Declining Balance (accelerated)

```
Monthly Rate = (2 / Useful Life in years) / 12

For each month from purchase date to today:
  Depreciation = Current Book Value × Monthly Rate
  If (Current Book Value - Depreciation) < Salvage Value:
    Depreciation = Current Book Value - Salvage Value
  Current Book Value -= Depreciation
```

Depreciation is **highest in early months** and decreases over time. Good for tech assets that lose value quickly.

### 3. Units of Production (usage-based)

```
Per-Unit Depreciation = (Purchase Price - Salvage Value) / Total Units
Total Depreciation = Per-Unit Depreciation × Units Used
Current Value = max(Salvage Value, Purchase Price - Total Depreciation)
```

Used for assets where **usage (not time)** determines wear, like printers (pages printed) or vehicles (miles driven).

### Computed Fields (added by `enrichAsset()`)

Every asset response from the API includes these **calculated values** alongside the raw data:

| Field | What It Is | Formula |
|-------|-----------|---------|
| `originalValue` | Purchase price (alias) | `purchasePrice` |
| `currentValue` | What the asset is worth today | Depends on depreciation method |
| `projectedNextMonth` | Predicted value in 30 days | Same formula, +1 month |
| `monthlyDepreciation` | How much value is lost per month | `currentValue - projectedNextMonth` |
| `totalDepreciated` | Total value lost since purchase | `purchasePrice - currentValue` |
| `percentRemaining` | Health percentage | `(currentValue / purchasePrice) × 100` |
| `monthsRemaining` | Time until fully depreciated | Months until value = salvage value |
| `fullyDepreciatedDate` | When the asset reaches salvage value | Calculated date |

---

## Client-Side Routing

| Path | Component | Layout | Notes |
|------|-----------|--------|-------|
| `/login` | LoginPage | None (full-screen) | Mock auth UI — no backend yet |
| `/` | DashboardPage | Sidebar + Header | Default route (index) |
| `/assets` | AssetsPage | Sidebar + Header | Paginated table view |
| `/assets/:id` | AssetDetailPage | Sidebar + Header | Single asset deep-dive |
| `/reports` | ReportsPage | Sidebar + Header | Financial reports & charts |
| `/profile` | ProfilePage | Sidebar + Header | 4 sub-tabs (General, Preferences, Security, Roles) |
| `/notifications` | NotificationsPage | Sidebar + Header | Notification history |
