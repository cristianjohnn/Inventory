# IT Inventory Monitoring System

A full-stack web application for tracking, managing, and depreciating IT assets across your organization. Built for teams — any developer can clone this repo and be productive in under 10 minutes.

## Tech Stack

| Layer      | Technology                          | Version |
|------------|-------------------------------------|---------|
| Frontend   | React (with hooks)                  | 19.x    |
| Bundler    | Vite                                | 6.x     |
| Styling    | Tailwind CSS                        | 4.x     |
| Backend    | Node.js + Express                   | 24.x / 5.x |
| Database   | PostgreSQL                          | 16.x    |
| ORM        | Prisma                              | 6.x     |
| Charts     | Recharts                            | 2.x     |
| Containers | Docker + Docker Compose             | Latest  |

## Features

- **Asset Management** — Add, edit, delete IT assets (laptops, monitors, servers, phones, printers, networking gear, peripherals)
- **Depreciation Engine** — Automatic, rolling monthly depreciation with 3 methods: Straight-Line, Double Declining Balance, Units of Production
- **Employee Assignment** — Assign, reassign, and unassign assets to employees with full audit trail
- **Dashboard** — Summary cards, portfolio valuation, charts (status distribution, value by category), recent activity
- **Search & Filter** — Search by name, serial number, or employee. Filter by status and category
- **CSV Export** — Export filtered asset data to CSV
- **Dark/Light Mode** — System-preference-aware with manual toggle

## Prerequisites

Before you start, make sure you have these installed:

- **Node.js** ≥ 20.0.0 — [Download](https://nodejs.org/) (we use v24, see `.nvmrc`)
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- **Git** — [Download](https://git-scm.com/)

## Local Setup (Step by Step)

### 1. Clone the repository

```bash
git clone git@github.com:cristianjohnn/Inventory.git
cd Inventory
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs root, server, and client dependencies in one command.

### 3. Set up environment variables

```bash
cp .env.example .env
```

For local development, fill in these values in `.env`:

```env
DATABASE_URL=postgresql://inventory_user:inventory_pass@localhost:5432/it_inventory
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=inventory_pass
POSTGRES_DB=it_inventory
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Start the database

```bash
npm run docker:dev
```

This starts PostgreSQL in a Docker container on port 5432.

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed the database

```bash
npm run db:seed
```

This populates the database with 7 sample assets using different depreciation methods.

### 7. Start the dev servers

```bash
npm run dev
```

This starts both the Express API (port 3001) and the React app (port 5173) simultaneously.

🎉 **Open [http://localhost:5173](http://localhost:5173) and you're ready to go!**

## Branch Strategy

| Branch      | Purpose                                | Who Creates It      | PR Required |
|-------------|----------------------------------------|----------------------|-------------|
| `main`      | Production-ready code only             | Repo owner           | ✅ Yes       |
| `staging`   | Pre-production testing                 | Tech lead            | ✅ Yes       |
| `develop`   | Active integration branch              | Tech lead            | ✅ Yes       |
| `feature/*` | Individual feature work                | Any developer        | ✅ Into develop |
| `fix/*`     | Bug fixes                              | Any developer        | ✅ Into develop |
| `docs/*`    | Documentation-only changes             | Any developer        | ✅ Into develop |

> **Rule**: Never push directly to `main` or `staging`. Always create a branch and open a PR.

See [docs/BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md) for the full branching guide with diagrams.

## Useful Commands

| Command              | What it does                                |
|----------------------|---------------------------------------------|
| `npm run dev`        | Starts server + client with hot reload      |
| `npm run docker:dev` | Starts PostgreSQL in Docker                 |
| `npm run db:migrate` | Runs Prisma migrations                      |
| `npm run db:seed`    | Seeds database with sample data             |
| `npm run db:studio`  | Opens Prisma Studio (visual DB browser)     |
| `npm run lint`       | Runs ESLint                                 |
| `npm run format`     | Formats code with Prettier                  |
| `npm run build`      | Builds the React app for production         |

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming rules, commit message format, PR process, and code style guidelines.

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Folder structure, data models, API routes, depreciation formulas
- [BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md) — Branch flow diagram, rules, and hotfix procedure
- [WORK_SPLIT.md](docs/WORK_SPLIT.md) — How to divide work among developers (who owns which files)
- [COLLABORATORS.md](docs/COLLABORATORS.md) — How to add team members and set permissions

## License

[MIT](LICENSE)
