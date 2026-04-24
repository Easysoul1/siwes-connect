# SIWES Connect MVP

Production-grade monorepo for the SIWES Connect MVP platform.

## Structure

- `frontend`: Next.js 14 app (landing + role portals)
- `backend`: Express + Prisma API (auth, student, organization, coordinator, placements, notifications)
- Shared constants/types are duplicated under each app at `frontend/src/shared` and `backend/src/shared`

## Quick Start

1. Install dependencies:
   - `npm install`
2. Start local infrastructure:
   - `docker compose up -d`
3. Backend env:
   - create `backend/.env` from blueprint values
4. Apply Prisma migrations:
   - `cd backend && npx prisma migrate dev`
5. Frontend env:
   - create `frontend/.env.local`
6. Run:
   - `npm run dev:backend`
   - `npm run dev:frontend`

## Current Build Scope

- Branded design system and animated landing page
- Full backend role-based API surface from the MVP endpoint matrix
- Student flows: profile, matched/recommended placements, apply/withdraw, dashboard stats
- Organization flows: placement CRUD/status, application review, placement confirmation, dashboard stats
- Coordinator flows: org moderation, student/application/placement monitoring, analytics, announcements
- Public placements and notifications endpoints
- Frontend role portals at:
  - `/student/*`
  - `/organization/*`
  - `/coordinator/*`

## Next Build Milestones

- Add persistent file uploads (Cloudinary) and email delivery (SendGrid)
- Add Socket.io real-time notification delivery
- Add automated backend/frontend tests and CI workflows
