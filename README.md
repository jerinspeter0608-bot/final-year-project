# Small Business Inventory Monitor System

A role-based MERN stack web application for small businesses to manage inventory, record sales, track suppliers, and monitor stock levels.

## Tech Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose

## Prerequisites

- Node.js (v18 or later)
- MongoDB (local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster)

## Setup & Run

### 1. Backend (Server)

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder with:

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your_secret_key_here
```

For MongoDB Atlas, use your connection string as `MONGO_URI`.

**Seed the database** (creates demo users and sample data):

```bash
npm run seed
```

**Start the server:**

```bash
npm run dev
```

Server runs at `http://localhost:5001`.

### 2. Frontend (Client)

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173` and proxies API requests to the backend.

## Demo Login Credentials

After running `npm run seed` in the server folder:

| Role     | Email              | Password  |
|----------|--------------------|-----------|
| Admin    | admin@test.com     | admin123  |
| Inventory| inventory@test.com | demo123   |
| Sales    | sales@test.com     | demo123   |
| Supplier | supplier@test.com  | demo123   |

Use **Admin** to access Dashboard, User Management, and Reports. Use other accounts to test role-specific features (Products, Sales, Suppliers, Restock).

## Features

- **Admin:** Dashboard stats, user management (add/edit/delete), reports (sales & restock summary)
- **Inventory Controller:** Add/edit/delete products, set min stock threshold, view low-stock highlights
- **Sales Staff:** Record sales (auto stock reduction), view daily sales history, generate bill
- **Supplier Manager:** Manage suppliers, record restock entries, view restock history

## Project Structure

```
final_year_project/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── config/      # DB connection
│   ├── middleware/  # Auth, role check
│   ├── models/      # User, Product, Sale, Supplier, Restock
│   ├── routes/      # API routes
│   └── scripts/     # seed.js
├── project_spec.txt
└── README.md
```

## API Base

- Base URL (dev): `http://localhost:5001/api`
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Products: `GET/POST /products`, `PUT/DELETE /products/:id`, `GET /products/low-stock`
- Sales: `POST/GET /sales`
- Suppliers: `GET/POST /suppliers`, `PUT/DELETE /suppliers/:id`
- Restock: `POST/GET /restock`
- Users (admin): `GET /users`, `PUT/DELETE /users/:id`
- Dashboard: `GET /dashboard/stats`

All protected routes require header: `Authorization: Bearer <token>`.
