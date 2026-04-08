# Glossary

> **Quick reference for technical terms** used across this project and its documentation.

---

## Git & GitHub

| Term | What It Means |
|------|---------------|
| **Branch** | A separate copy of the codebase where you can make changes without affecting anyone else's work. Think of it as your own workspace. |
| **PR (Pull Request)** | A request on GitHub to merge your branch into another branch. Your teammates review your code, leave comments, and approve before it gets merged. Think of it as "asking permission to add your code." |
| **Merge** | Combining the code from one branch into another. After a PR is approved, you merge it. |
| **Rebase** | Replaying your changes on top of the latest code from another branch. Keeps history clean — use this instead of merge when syncing your branch with `develop`. |
| **Squash and Merge** | Combines all your commits into one single commit when merging a PR. Keeps the commit history tidy instead of having 20 "wip" commits. |
| **Commit** | A saved snapshot of your code changes, with a message describing what you did. Like a save point in a game. |
| **Clone** | Downloading a copy of the repo to your computer for the first time. |
| **Push** | Uploading your local commits to GitHub so others can see them. |
| **Pull** | Downloading the latest changes from GitHub to your local machine. |
| **Conflict** | When two people edit the same lines of code in different branches. Git can't decide which version to keep, so you have to pick manually. |
| **CI (Continuous Integration)** | An automated system (GitHub Actions) that runs lint checks and builds your code every time you open a PR. If CI fails, fix your code before merging. |
| **Code Owners** | People automatically assigned to review PRs for specific files. Configured in `.github/CODEOWNERS`. |
| **`.gitignore`** | A file that tells Git which files to skip (like `node_modules/` and `.env`). These files won't be committed or pushed. |

## Frontend (React / Vite)

| Term | What It Means |
|------|---------------|
| **React** | A JavaScript library for building user interfaces. The entire frontend is built with React. |
| **Component** | A reusable piece of UI. For example, `Badge.jsx` is a component that shows a colored status pill. Components are like LEGO blocks — you combine them to build pages. |
| **JSX** | A syntax that lets you write HTML-like code inside JavaScript. That's why our files end in `.jsx`. |
| **Hook** | A special React function that adds features to components. `useState` manages data, `useEffect` runs code on load. Our custom hooks live in `client/src/hooks/`. |
| **State** | Data that a component "remembers" between renders. When state changes, the component re-renders with the new data. |
| **Props** | Data passed from a parent component to a child component. Like function arguments but for UI components. |
| **Vite** | The build tool / dev server for our frontend. It's what `npm run dev` starts. Much faster than older tools like Webpack. |
| **Routing** | How the app decides which page to show based on the URL. `/assets` shows the Assets page, `/reports` shows Reports. Handled by React Router. |
| **Tailwind CSS** | A CSS framework that provides pre-built utility classes like `flex`, `p-4`, `text-sm`. Used alongside our custom CSS design tokens. |
| **Design Tokens** | CSS custom properties (variables) defined in `index.css` that control colors, spacing, and styling across the entire app. Example: `--color-text-primary`. |
| **Recharts** | The charting library we use for bar charts, pie charts, and donut charts on the Dashboard and Reports pages. |
| **Lucide** | The icon library we use. Provides clean, consistent icons like `Monitor`, `Trash2`, `Search`. |
| **react-hot-toast** | Library for showing popup notifications (toasts) at the bottom-right when actions succeed or fail. |

## Backend (Express / Node.js)

| Term | What It Means |
|------|---------------|
| **Express** | A Node.js web framework that handles HTTP requests. It's what runs our API server. |
| **Route** | A URL pattern the server responds to. Example: `GET /api/assets` is a route that returns all assets. Defined in `server/src/routes/`. |
| **Controller** | A function that handles a specific route. It receives the request, talks to the database, and sends back a response. Lives in `server/src/controllers/`. |
| **Middleware** | Code that runs *between* receiving a request and sending a response. Used for validation, error handling, rate limiting. Lives in `server/src/middleware/`. |
| **Service** | Business logic separated from controllers. Our `depreciationService.js` calculates asset values — controllers call it but don't contain the math. |
| **API (Application Programming Interface)** | The set of URLs (endpoints) that the frontend calls to get or send data. Our API lives at `/api/...`. |
| **Endpoint** | A specific URL + HTTP method combination. Example: `POST /api/assets` is the endpoint for creating a new asset. |
| **REST** | An architecture style for APIs. We use REST conventions: GET = read, POST = create, PUT = update, DELETE = remove. |
| **CORS** | Cross-Origin Resource Sharing. A security rule that controls which websites can call our API. We allow `localhost:5173` (the Vite dev server). |
| **Rate Limiting** | Blocking users who send too many requests. We limit to 100 requests per minute per IP address to prevent abuse. |

## Database (PostgreSQL / Prisma)

| Term | What It Means |
|------|---------------|
| **PostgreSQL (Postgres)** | The relational database where all our data is stored. Tables, rows, columns — like a spreadsheet. |
| **Prisma** | An ORM (Object-Relational Mapping) that lets us talk to PostgreSQL using JavaScript instead of writing raw SQL. |
| **Schema** | The definition of our database structure — what tables exist, what columns they have, and how they relate. Defined in `prisma/schema.prisma`. |
| **Migration** | A version-controlled change to the database schema. When you add a column, Prisma creates a migration file so everyone's database stays in sync. |
| **Seed** | Pre-loading the database with sample data for development. Our `seed.js` creates 7 demo assets so you have data to work with immediately. |
| **Model** | A database table defined in the Prisma schema. We have two models: `Asset` and `AuditLog`. |
| **FK (Foreign Key)** | A column that references another table's ID. `AuditLog.assetId` references `Asset.id`. |
| **Cascade Delete** | When you delete an Asset, all its AuditLog entries are also automatically deleted. |

## Validation (Zod)

| Term | What It Means |
|------|---------------|
| **Zod** | A TypeScript-first validation library. We use it to check that incoming API data has the right shape and types before processing it. |
| **Schema (Zod)** | A set of rules defining what valid data looks like. Example: "name must be a string, purchasePrice must be a positive number." Defined in `server/src/utils/schemas.js`. |
| **Validated Body** | After Zod checks the request body, the clean data is stored in `req.validatedBody` so controllers can trust it. |

## Infrastructure (Docker / Nginx)

| Term | What It Means |
|------|---------------|
| **Docker** | A tool that packages the app into containers — self-contained units that run the same everywhere (your laptop, the server, the cloud). |
| **Container** | A lightweight, isolated environment that runs one piece of the app. We have containers for Postgres, Express, and Nginx. |
| **Docker Compose** | A tool to run multiple Docker containers together with one command. `docker-compose up` starts the whole stack. |
| **Nginx** | A web server / reverse proxy. In production, it serves the React frontend and forwards `/api/` requests to the Express backend. |
| **Reverse Proxy** | Nginx sits in front of Express and routes requests. Users talk to Nginx → Nginx talks to Express. This adds security and performance. |
| **Dockerfile** | A recipe that tells Docker how to build a container image. We have one for the server and one for nginx (which also builds the React app). |

## Project-Specific Terms

| Term | What It Means |
|------|---------------|
| **Asset** | An IT equipment item tracked in the system (laptop, monitor, server, phone, etc.). The core entity of the entire app. |
| **Asset Tag** | A unique identifier auto-generated for each asset (format: `IT-ASSET-0001`). |
| **Depreciation** | The decrease in an asset's value over time. A ₱50,000 laptop might be worth ₱30,000 after 2 years. |
| **Salvage Value** | The estimated value of an asset at the end of its useful life. The asset never depreciates below this amount. |
| **Useful Life** | How many years an asset is expected to be usable before it needs to be replaced. |
| **Audit Log** | A history of everything that happened to an asset — created, assigned, updated, deleted. Used for accountability. |
| **Enrichment** | Adding computed depreciation fields (currentValue, monthlyDepreciation, percentRemaining, etc.) to raw asset data before sending it to the frontend. |
