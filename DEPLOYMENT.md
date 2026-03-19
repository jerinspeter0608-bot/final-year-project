# Deployment Guide (Free) — Vercel (Frontend) + Render (Backend) + MongoDB Atlas (DB)

This project is a MERN app:
- **Frontend**: `client/` (Vite + React)
- **Backend**: `server/` (Express)
- **Database**: MongoDB (local in dev, Atlas in production)

This guide deploys:
- Frontend to **Vercel**
- Backend to **Render**
- Database to **MongoDB Atlas**

---

## Prerequisites

- A GitHub repository with this project pushed
- A MongoDB Atlas account
- A Render account
- A Vercel account

---

## 1) MongoDB Atlas setup (Cloud Database)

### Create the database

- Create a new Atlas **project**
- Create a **free cluster** (M0)
- Create a **database user** (username + password)

### Allow access (important)

Atlas blocks connections unless you allow them.

- Go to **Network Access**
- Add an IP access rule:
  - For easiest setup: `0.0.0.0/0` (Allow access from anywhere)
  - More secure later: restrict to Render outbound IPs (harder on free tiers)

### Get the connection string

- Go to **Database → Connect → Drivers**
- Copy the URI that looks like:

`mongodb+srv://<username>:<password>@<cluster-host>/<dbName>?retryWrites=true&w=majority`

Replace:
- `<username>` and `<password>` with your Atlas DB user
- `<dbName>` e.g. `inventory_db`

This full string becomes your **Render** `MONGO_URI`.

#### If you see `querySrv ECONNREFUSED _mongodb._tcp...`

That usually means one of these:
- **Network access not allowed** in Atlas (fix: add IP rule)
- **Local DNS/network issue** (try again on a different network)
- **Wrong connection string** (use the `mongodb+srv://...` URI from Atlas)

---

## 2) Render setup (Backend API)

### Create a new Web Service

- In Render: **New + → Web Service**
- Connect your GitHub repo
- Choose the repo + branch

### Root directory

Set the **Root Directory** to:
- `server`

### Build and start commands

- **Build Command**:

```bash
npm install
```

- **Start Command**:

```bash
npm start
```

### Environment variables (Render → Environment)

Add these:

- **PORT**: `5001` (Render will still inject its own port; your server uses `process.env.PORT`)
- **MONGO_URI**: your MongoDB Atlas connection string (`mongodb+srv://...`)
- **JWT_SECRET**: a long random string (keep it private)
- **FRONTEND_URL**: your Vercel site URL (you’ll set this after deploying frontend), e.g.
  - `https://your-app.vercel.app`

### Deploy

After deploy, you’ll get a backend URL like:
- `https://your-backend.onrender.com`

Sanity check:
- Open `https://your-backend.onrender.com/` → should return:
  - `{ "message": "API is running" }`

---

## 3) Vercel setup (Frontend)

### Create a new Vercel project

- Import your GitHub repo into Vercel

### Project settings

Set:
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment variables (Vercel → Project → Settings → Environment Variables)

Add:

- **VITE_API_BASE_URL**: your Render backend API base URL, including `/api`

Example:
- `https://your-backend.onrender.com/api`

Deploy.

---

## 4) Final CORS configuration (Render)

Your backend is configured like this:

```js
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
```

So you do **not** need to change code when your Vercel URL changes.

Just update **Render → Environment → `FRONTEND_URL`** to your current Vercel URL:
- `https://your-app.vercel.app`

Then redeploy (or “Restart Service”).

---

## 5) Quick test checklist

- **Backend works**:
  - `GET https://your-backend.onrender.com/` returns “API is running”
- **Frontend calls backend**:
  - Open your Vercel site
  - Try Register/Login
  - Load products, record sale, etc.

If frontend shows API errors:
- Confirm Vercel env var `VITE_API_BASE_URL` is correct (must include `/api`)
- Confirm Render env var `FRONTEND_URL` matches your Vercel domain exactly
- Confirm Atlas Network Access allows connections

---

## Notes (recommended later)

- **HTTPS only**: Vercel + Render use HTTPS, which is good.
- **0.0.0.0/0** on Atlas is convenient for projects, but reduce it later if you can.
- If you ever serve cookies cross-site, you’ll also need `SameSite=None; Secure` cookie settings. Your app currently uses JWT in `localStorage` (Authorization header), so cookies aren’t required.

