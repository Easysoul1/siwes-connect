# SIWES Connect — Setup, Fixes & Deployment Guide

## Overview

SIWES Connect is a full-stack monorepo for managing SIWES (Students Industrial Work Experience Scheme) placements. It connects students, organizations, and coordinators.

**Stack:**
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, GSAP animations
- **Backend:** Express.js, TypeScript, Prisma ORM, PostgreSQL, Socket.IO
- **Infra:** Docker (PostgreSQL + Redis)

---

## Quick Start (Development)

### 1. Prerequisites
- Node.js 18+
- Docker Desktop (for PostgreSQL + Redis)
- npm (workspaces)

### 2. Start Infrastructure
```bash
docker-compose up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables

**Backend** — Copy and edit `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your actual values. For local dev, the defaults work.

**Frontend** — Copy and edit `frontend/.env.local`:
```bash
cp frontend/.env.local.example frontend/.env.local
```
Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`.

### 5. Seed the Database
```bash
npm run seed --workspace @siwes/backend
```
Then regenerate password hashes (if needed):
```bash
npx tsx backend/src/scripts/fixPasswordHashes.ts
```

### 6. Start Dev Servers
```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 3001)
npm run dev:frontend
```

Open http://localhost:3001

---

## Test Accounts

All accounts use password: `Password123!`

| Email | Role | Company/Name |
|---|---|---|
| `admin@agroplus.ng` | ORGANIZATION | AgroPlus Integrated Farms |
| `contact@medcare.ng` | ORGANIZATION | MedCare Health Services |
| `info@techinnovate.ng` | ORGANIZATION | TechInnovate Nigeria Ltd |
| `hr@greenfield.ng` | ORGANIZATION | Greenfield Engineering Ltd |
| `hello@primebank.ng` | ORGANIZATION | Prime Bank & Financial Services |
| `coordinator@siwes.edu` | COORDINATOR | Dr. Funke Adebayo |
| `student@siwes.edu` | STUDENT | Michael Okonkwo |

---

## What Was Fixed (This Session)

### Bug Fixes

1. **Organization Placements/Applications pages showing empty data**
   - **Root cause:** `PlacementsManagerClient` and `ApplicationsManagerClient` used `useState(initialProp)` which only captured the initial empty array. When the parent page fetched data and re-rendered with new props, the child component's state didn't update.
   - **Fix:** Added `useEffect` to sync local state with incoming props in:
     - `frontend/src/components/organization/PlacementsManagerClient.tsx`
     - `frontend/src/components/organization/ApplicationsManagerClient.tsx`
     - `frontend/src/components/organization/DashboardClient.tsx` (for robustness)

### Production Hardening

2. **CORS allows localhost in production** (`backend/src/app.ts`)
   - Localhost origins now only added when `NODE_ENV === "development"`

3. **JWT secrets use placeholder defaults** (`backend/src/config/env.ts`)
   - In production, server now refuses to start without explicit `JWT_SECRET` and `JWT_REFRESH_SECRET`

4. **No graceful shutdown** (`backend/src/server.ts`)
   - Added `SIGTERM`/`SIGINT` handlers with `prisma.$disconnect()`
   - Added `unhandledRejection` and `uncaughtException` handlers

5. **Incomplete `.gitignore`**
   - Added: `dist/`, `.env`, `.env.local`, `*.log`, `temp_*.sql`, `temp_login.json`, `_to_delete/`

6. **Temp files with credentials removed**
   - Deleted: `temp_query.sql`, `temp_query2.sql`, `temp_query3.sql`, `backend/temp_login.json`, `backend/test-org-api.ts`, `_to_delete/`

7. **Docker-compose hardened** (`docker-compose.yml`)
   - Added health checks for PostgreSQL and Redis
   - Added `restart: unless-stopped`
   - Made passwords configurable via environment variables
   - Redis now requires authentication

8. **Frontend `.env.local` created** with `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`

9. **`next.config.mjs`** — TypeScript errors now block builds (`ignoreBuildErrors: false`). ESLint still skipped (needs `eslint-config-next` installed).

10. **`.env.example` fixed** — Corrected `FRONTEND_URL` to port 3001, added production warnings

---

## Building for Production

### Backend
```bash
cd backend
npm run build    # prisma generate + tsc
npm start        # node dist/server.js
```

### Frontend
```bash
cd frontend
npm run build    # next build
npm start        # next start -p 3001
```

### Full Build (from root)
```bash
npm run build    # builds both workspaces
```

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Set to `production` for prod |
| `PORT` | No | `5000` | Server port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **Yes (prod)** | dev placeholder | Min 32 chars, used for access tokens |
| `JWT_REFRESH_SECRET` | **Yes (prod)** | dev placeholder | Min 32 chars, used for refresh tokens |
| `JWT_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `FRONTEND_URL` | **Yes** | `http://localhost:3001` | For CORS origin |
| `COORDINATOR_INVITE_CODE` | No | `coord_2024_invite` | Invite code for coordinator registration |
| `SENDGRID_API_KEY` | No | — | For sending emails |
| `FROM_EMAIL` | No | `noreply@siwesconnect.ng` | Sender email |
| `CLOUDINARY_CLOUD_NAME` | No | — | For file uploads |
| `CLOUDINARY_API_KEY` | No | — | For file uploads |
| `CLOUDINARY_API_SECRET` | No | — | For file uploads |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API URL (e.g., `http://localhost:5000/api/v1`) |

---

## Project Structure

```
siwes-connect/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app setup (CORS, helmet, routes)
│   │   ├── server.ts           # HTTP server + graceful shutdown
│   │   ├── config/
│   │   │   ├── database.ts     # Prisma client
│   │   │   └── env.ts          # Zod-validated env vars
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/          # Auth, rate limiting, error handling
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic (auth, notifications, upload)
│   │   ├── jobs/               # Cron jobs
│   │   ├── sockets/            # Socket.IO setup
│   │   └── scripts/            # Seed, getAllUsers
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (349 lines)
│   │   └── migrations/         # 3 migrations
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── organization/   # DashboardClient, PlacementsManagerClient, etc.
│   │   │   ├── student/        # PlacementSearchClient, ApplicationsClient, etc.
│   │   │   ├── shared/         # Toast, NotificationBell, Skeleton, etc.
│   │   │   ├── coordinator/    # Coordinator portal components
│   │   │   └── providers/      # AuthProvider
│   │   └── lib/
│   │       ├── api.ts          # API client functions
│   │       ├── types.ts        # TypeScript types
│   │       └── session.ts      # localStorage session management
│   ├── .env.local
│   └── package.json
├── docker-compose.yml          # PostgreSQL + Redis
├── package.json                # Root workspace config
└── .gitignore
```

---

## Known Issues & TODOs

### Must Address Before Production Deploy

1. **Install `eslint-config-next`** — Run `npm install --save-dev eslint-config-next` in the frontend to enable ESLint during builds.

2. **Generate strong secrets** — Replace placeholder JWT secrets with cryptographically random strings:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Create Dockerfiles** — The current `docker-compose.yml` only has infrastructure (PostgreSQL + Redis). You need to add Dockerfiles for the backend and frontend.

4. **Set up a reverse proxy** — Use Nginx or Caddy in front of the Node.js server for HTTPS, static file serving, and request buffering.

5. **Database indexes** — Consider adding indexes on frequently queried columns:
   ```prisma
   @@index([organizationId])
   @@index([status])
   ```

6. **`@types/*` packages** — Move `@types/bcrypt`, `@types/cors`, `@types/express`, `@types/jsonwebtoken`, `@types/node` from `dependencies` to `devDependencies` in `backend/package.json`.

7. **Enable `trust proxy`** in Express if deploying behind a reverse proxy (for rate limiting to use real client IPs).

### Optional Improvements

8. **Connection pooling** — Add `?connection_limit=10` to `DATABASE_URL` or use PgBouncer.

9. **LogbookEntry.status** — Currently uses `String` instead of a Prisma enum. Consider migrating.

10. **HTTPS/HSTS** — Add Helmet HSTS configuration for production.

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Generate and set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set `DATABASE_URL` to production PostgreSQL
- [ ] Set `FRONTEND_URL` to production frontend domain
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend API URL
- [ ] Run `npx prisma migrate deploy` to apply database migrations
- [ ] Run `npm run build` for both backend and frontend
- [ ] Start backend with `npm start` (or PM2/systemd)
- [ ] Start frontend with `npm start` (or standalone mode)
- [ ] Configure Nginx/Caddy reverse proxy with HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring (e.g., Sentry, Prometheus)

---

## Useful Commands

```bash
# Database
npx prisma migrate dev          # Create migration
npx prisma migrate deploy      # Apply migrations
npx prisma studio              # Visual database browser
npx prisma generate            # Regenerate Prisma client

# Seed data
npm run seed --workspace @siwes/backend

# List all users
npm run users --workspace @siwes/backend

# Kill stuck dev servers
Get-Process node | Stop-Process -Force    # PowerShell
```
