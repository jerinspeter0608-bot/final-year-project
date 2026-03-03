# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Small Business Inventory Monitor System — a role-based MERN stack app for managing inventory, sales, suppliers, and stock levels. Four user roles (admin, inventory, sales, supplier) with distinct permissions control all functionality.

## Development Commands

### Server (Express backend, CommonJS)

```bash
cd server
npm install
npm run dev          # Start with nodemon on port 5001
npm run seed         # Seed DB with demo users and sample data (destructive — wipes all collections first)
```

Requires a `server/.env` file (see `server/.env.example`):
- `PORT` — server port (default 5001)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for JWT signing

### Client (React frontend, Vite, ESM)

```bash
cd client
npm install
npm run dev          # Vite dev server on port 5173, proxies /api to localhost:5001
npm run build        # Production build to client/dist
npm run lint         # ESLint (flat config)
```

### Running Both

Start the server first (needs MongoDB running), then the client. No top-level package.json or workspace config exists — dependencies are managed separately in `server/` and `client/`.

## Architecture

### Backend (`server/`)

- **Entry point:** `server.js` — sets up Express, mounts all route modules under `/api/*`.
- **`config/db.js`** — Mongoose connection using `MONGO_URI` env var. Called at startup before Express listens.
- **`middleware/auth.js`** — exports `auth` (JWT verification, attaches `req.user`) and `requireRole(...roles)` (role-based access guard). All protected routes use `auth` first, then `requireRole` as needed.
- **`models/`** — Mongoose schemas: User, Product, Sale, Supplier, Restock, Request. All use `timestamps: true`. Passwords are hashed with bcryptjs at the route level (not via schema hooks).
- **`routes/`** — One file per resource. Each exports an Express router. Route files handle validation, business logic, and DB operations inline (no separate service/controller layer).
- **`scripts/seed.js`** — Standalone script that wipes all collections, then creates demo users, products, suppliers, sales, and restocks.

### Frontend (`client/src/`)

- **`main.jsx`** — Renders `<App>` inside `<BrowserRouter>` and `<StrictMode>`.
- **`App.jsx`** — All routes defined here. Public routes: `/login`, `/register`. Protected routes wrapped in `<ProtectedRoute>` with `<Layout>` (sidebar + outlet).
- **`context/AuthContext.jsx`** — Provides `user`, `login`, `register`, `logout` via React context. Token stored in `localStorage`. On mount, validates token via `GET /api/auth/me`.
- **`api.js`** — Thin fetch wrapper. Auto-attaches JWT from localStorage. All API calls go through `api(endpoint, options)`. Throws on non-OK responses with `err.status` and `err.data`.
- **`components/`** — `Layout.jsx` (sidebar nav + role-based menu items), `ProtectedRoute.jsx` (redirects to `/login` if unauthenticated), `RedirectByRole.jsx` (role → home page mapping).
- **`pages/`** — One file per page. Each page manages its own state and API calls directly using the `api()` helper. UI uses React Bootstrap. No global state management beyond AuthContext.

### Key Patterns

- **Role-based access:** Backend enforces via `requireRole()` middleware. Frontend shows/hides routes and UI elements based on `user.role` from AuthContext.
- **Request workflow:** Inventory staff can create refill or new-product requests. Admin/supplier can fulfill (which triggers restock creation or product creation) or reject with an optional reason. This is the most complex route (`routes/requests.js`).
- **Stock auto-reduction:** Recording a sale in `routes/sales.js` automatically decrements `product.quantity`.
- **Low-stock detection:** `GET /api/products/low-stock` returns products where `quantity < minThreshold`.
- **No test suite currently exists** in either client or server.
