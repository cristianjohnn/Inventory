# Frontend ↔ Backend Connection Map

> **Who is this for?** Any developer who needs to trace a feature from the browser to the database, or understand which frontend page talks to which backend file.

---

## The Flow (How a Click Becomes Data)

Every user action follows this path:

```
  BROWSER (React)              SERVER (Express)                 DATABASE
  ───────────────              ────────────────                 ────────

  User clicks button
        │
        ▼
  Feature Page          ───→   api/client.js (fetch wrapper)
  (e.g. AssetsPage)              │
                                 ▼
                           /api/assets  ───→  routes/assets.js
                                                    │
                                                    ▼
                                              assetController.js
                                                    │
                                                    ▼
                                            depreciationService.js
                                                    │
                                                    ▼
                                              Prisma ORM  ───→  PostgreSQL
                                                                (schema.prisma)
```

**In plain English:**
1. User does something in the browser (clicks a button, submits a form)
2. The React component calls a method from `api/client.js`
3. `client.js` sends an HTTP request to the Express server
4. Express matches the URL to a route → calls the controller function
5. The controller may call a service (like depreciation calculations)
6. The controller uses Prisma to read/write to the PostgreSQL database
7. The response travels back up the chain to update the UI

---

## Connection Map by Feature

### 🖥️ Dashboard Page

```
FRONTEND                                    BACKEND
────────                                    ───────
features/dashboard/DashboardPage.jsx        
  └── calls: dashboardApi.get()             
        └── GET /api/dashboard      ───→    routes/dashboard.js
                                              └── dashboardController.js
                                                    └── Prisma queries (Asset + AuditLog)
```

**What flows between them:**
- KPI stats (total assets, status counts)
- Portfolio values (original, current, projected next month)
- Category value breakdowns
- 20 most recent audit log activity entries

---

### 📦 Assets Page (List View)

```
FRONTEND                                    BACKEND
────────                                    ───────
features/assets/AssetsPage.jsx              
  ├── calls: assetsApi.list(filters)        
  │     └── GET /api/assets         ───→    routes/assets.js
  │                                           └── assetController.listAssets()
  │                                                 ├── Prisma (search, filter, paginate)
  │                                                 └── depreciationService.enrichAssets()
  │
  └── opens: AssetFormModal.jsx             
        └── calls: assetsApi.create(data)   
              └── POST /api/assets  ───→    routes/assets.js (+ Zod validation)
                                              └── assetController.createAsset()
                                                    ├── Auto-generates IT-ASSET-XXXX tag
                                                    ├── Prisma create
                                                    └── Creates AuditLog entry
```

---

### 📋 Asset Detail Page

This page has the **most backend connections** — 6 different API calls:

```
FRONTEND                                    BACKEND
────────                                    ───────
features/assets/AssetDetailPage.jsx         
  ├── calls: assetsApi.get(id)              
  │     └── GET /api/assets/:id     ───→    assetController.getAsset()
  │                                           └── depreciationService.enrichAsset()
  │
  ├── calls: assetsApi.history(id)          
  │     └── GET /api/assets/:id/history ──→ assetController.getAssetHistory()
  │                                           └── Prisma (AuditLog list)
  │
  ├── opens: AssetFormModal.jsx (edit mode) 
  │     └── calls: assetsApi.update(id)     
  │           └── PUT /api/assets/:id ────→ assetController.updateAsset()
  │
  ├── opens: AssignModal.jsx                
  │     └── calls: assetsApi.assign(id)     
  │           └── POST /api/assets/:id/assign ──→ assetController.assignEmployee()
  │
  ├── button: Unassign                      
  │     └── calls: assetsApi.unassign(id)   
  │           └── POST /api/assets/:id/unassign → assetController.unassignEmployee()
  │
  └── opens: ConfirmDialog.jsx (delete)     
        └── calls: assetsApi.delete(id)     
              └── DELETE /api/assets/:id ──→ assetController.deleteAsset()
                                              └── Cascade deletes AuditLog entries
```

---

### 📊 Reports Page

```
FRONTEND                                    BACKEND
────────                                    ───────
features/reports/ReportsPage.jsx            
  ├── calls: dashboardApi.get()             
  │     └── GET /api/dashboard      ───→    dashboardController (portfolio + category data)
  │
  └── calls: assetsApi.list({pageSize:500}) 
        └── GET /api/assets         ───→    assetController.listAssets()
                                              (fetches all assets for dept/method analysis)
```

---

### 🚫 Pages With NO Backend Connection (Frontend Only)

These pages are currently **mock UI** — they display hardcoded or local data and don't call any API:

| Frontend Page | What It Shows | Backend Needed? |
|---------------|---------------|-----------------|
| `features/auth/LoginPage.jsx` | Branded login form | ⚠️ Not yet — needs auth backend |
| `features/profile/ProfilePage.jsx` | Profile settings (4 tabs) | ⚠️ Not yet — needs user API |
| `features/profile/GeneralInfo.jsx` | Name, email, avatar | ⚠️ Not yet |
| `features/profile/PreferencesView.jsx` | Theme, language toggles | Stores locally (localStorage) |
| `features/profile/SecurityView.jsx` | Password, 2FA | ⚠️ Not yet — needs auth backend |
| `features/profile/RolePermissionsView.jsx` | Role & permissions | ⚠️ Not yet — needs RBAC backend |
| `features/notifications/NotificationsPage.jsx` | Notification list | ⚠️ Not yet — uses mock data |

---

## Quick Reference: API Client → Backend Endpoints

The file `client/src/api/client.js` is the **single point of contact** between frontend and backend. Every API call goes through here:

| Frontend Method | HTTP Request | Backend Handler | Zod Validated? |
|----------------|--------------|-----------------|----------------|
| `assetsApi.list(params)` | `GET /api/assets?...` | `assetController.listAssets` | No (query params) |
| `assetsApi.get(id)` | `GET /api/assets/:id` | `assetController.getAsset` | No |
| `assetsApi.create(data)` | `POST /api/assets` | `assetController.createAsset` | ✅ `createAssetSchema` |
| `assetsApi.update(id, data)` | `PUT /api/assets/:id` | `assetController.updateAsset` | ✅ `updateAssetSchema` |
| `assetsApi.delete(id)` | `DELETE /api/assets/:id` | `assetController.deleteAsset` | No |
| `assetsApi.assign(id, name)` | `POST /api/assets/:id/assign` | `assetController.assignEmployee` | ✅ `assignEmployeeSchema` |
| `assetsApi.unassign(id)` | `POST /api/assets/:id/unassign` | `assetController.unassignEmployee` | No |
| `assetsApi.history(id)` | `GET /api/assets/:id/history` | `assetController.getAssetHistory` | No |
| `dashboardApi.get()` | `GET /api/dashboard` | `dashboardController.getDashboard` | No |

---

## Summary: Which Files Touch Which

| Feature | Frontend Files | Backend Files | Database Tables |
|---------|---------------|---------------|-----------------|
| Dashboard | `DashboardPage.jsx` | `dashboardController.js`, `dashboard.js` | Asset, AuditLog |
| Asset List | `AssetsPage.jsx`, `AssetFormModal.jsx` | `assetController.js`, `assets.js`, `schemas.js` | Asset, AuditLog |
| Asset Detail | `AssetDetailPage.jsx`, `AssetFormModal.jsx`, `AssignModal.jsx` | `assetController.js`, `assets.js`, `depreciationService.js` | Asset, AuditLog |
| Reports | `ReportsPage.jsx` | `dashboardController.js`, `assetController.js` | Asset, AuditLog |
| Login | `LoginPage.jsx` | *(none yet)* | *(none yet)* |
| Profile | `ProfilePage.jsx` + 4 sub-views | *(none yet)* | *(none yet)* |
| Notifications | `NotificationsPage.jsx` | *(none yet)* | *(none yet)* |
