# SIWES Connect MVP

Production-grade monorepo for the SIWES Connect MVP platform with complete auth lifecycle, file uploads, email delivery, real-time notifications, and comprehensive API hardening.

## Architecture

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with GSAP animations
- **Auth**: JWT-based with email verification and password reset flows
- **Routing**: Role-based portals (Student, Organization, Coordinator)
- **UI State**: React hooks with SWR for data fetching

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (separate secrets for access/refresh tokens)
- **File Uploads**: Cloudinary (resumes, documents, avatars)
- **Email**: SendGrid with HTML templates
- **Real-time**: Socket.io with JWT authentication
- **Jobs**: Node-cron (daily/weekly scheduled tasks)
- **Security**: Rate limiting, audit logging, helmet, CORS

## Structure

```
.
├── frontend/              # Next.js 14 app
│   ├── src/app/          # Route handlers and pages
│   ├── src/lib/          # API client, utilities
│   └── src/shared/       # Enums, types (duplicated from backend)
├── backend/              # Express API
│   ├── src/controllers/  # Request handlers
│   ├── src/services/     # Business logic (auth, email, upload, notification)
│   ├── src/middleware/   # Auth, rate limiting, audit logging
│   ├── src/sockets/      # Socket.io server
│   ├── src/jobs/         # Cron jobs
│   └── prisma/           # Database schema and migrations
├── docker-compose.yml    # PostgreSQL + optional services
└── .github/workflows/    # GitHub Actions CI pipeline
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start infrastructure**:
   ```bash
   docker compose up -d
   ```

3. **Backend environment**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and fill in required values
   ```

4. **Apply database migrations**:
   ```bash
   cd backend && npx prisma migrate dev
   ```

5. **Frontend environment**:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   # Update API URLs if needed
   ```

6. **Run development servers**:
   ```bash
   npm run dev:backend    # Terminal 1
   npm run dev:frontend   # Terminal 2
   ```

## Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/siwes

# JWT
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@siwes.com

# File Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
COORDINATOR_INVITE_CODE=INVITE_CODE_123

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000
```

## Features Implemented

### Authentication & Authorization
- ✅ User registration with email verification
- ✅ Login with JWT access + refresh tokens
- ✅ Token refresh with persistence (RefreshToken model)
- ✅ Logout with token invalidation
- ✅ Forgot password and reset flow
- ✅ Coordinator invite code gate for registration
- ✅ Role-based access control (Student, Organization, Coordinator)

### File Management
- ✅ Resume uploads (PDF, max 5MB)
- ✅ Organization documents (CAC/ITF, max 10MB)
- ✅ User avatars (images, max 2MB)
- ✅ Cloudinary integration with organized folders
- ✅ File validation and error handling

### Email Delivery
- ✅ SendGrid integration with HTML templates
- ✅ Email verification flow
- ✅ Password reset emails
- ✅ Optional mode (graceful degradation when API key missing)

### Real-time Notifications
- ✅ Socket.io server with JWT authentication
- ✅ User-targeted notifications (room-based routing)
- ✅ Notification types: APPLICATION_RECEIVED, APPLICATION_ACCEPTED, APPLICATION_REJECTED, PLACEMENT_CONFIRMED, ORGANIZATION_APPROVED, ORGANIZATION_SUSPENDED, ANNOUNCEMENT, DEADLINE_REMINDER
- ✅ Persistent notification records in database
- ✅ Pagination support for notification history

### Scheduled Jobs
- ✅ Daily deadline reminders (8am UTC)
- ✅ Weekly coordinator digest (9pm Sunday UTC)
- ✅ Automatic cron job initialization

### API Hardening
- ✅ Pagination on all list endpoints (default 20, max 100 items/page)
- ✅ Rate limiting (15/min auth endpoints, 100/min general)
- ✅ Audit logging (logs all POST/PUT/PATCH/DELETE with user/IP/duration)
- ✅ Request/response validation with Zod
- ✅ HELMET security headers
- ✅ CORS configuration

### Data Model
- ✅ 10 new models: RefreshToken, PasswordReset, EmailVerificationToken, Institution, Announcement, AuditLog, + expanded existing models
- ✅ 3 new enums: NotificationType, StudyField, NigerianState
- ✅ Relationships and constraints aligned with blueprint
- ✅ Database migrations tested

## API Endpoints

### Auth
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/verify-email` - Verify email token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Complete password reset
- `POST /auth/logout` - Invalidate tokens

### Students
- `GET /students/:id` - Get student profile
- `PUT /students/:id` - Update student profile
- `GET /students/:id/placements` - Get student's placements
- `POST /students/:id/resume` - Upload resume
- `GET /students/:id/applications` - Get applications
- `POST /placements/:id/apply` - Apply to placement

### Organizations
- `GET /organizations/:id` - Get org profile
- `PUT /organizations/:id` - Update org profile
- `POST /organizations/:id/document` - Upload CAC/ITF
- `GET /organizations/:id/placements` - Get org's placements
- `POST /organizations/:id/placements` - Create placement
- `GET /organizations/:id/applications` - Get received applications

### Placements
- `GET /placements` - List placements (paginated)
- `GET /placements/:id` - Get placement details
- `GET /placements/:id/organization` - Get placement's organization
- `PUT /placements/:id` - Update placement (org only)
- `DELETE /placements/:id` - Delete placement (org only)

### Notifications
- `GET /notifications` - List user notifications (paginated)
- `PUT /notifications/:id` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

### Coordinator
- `GET /coordinator/organizations` - List organizations for review
- `POST /coordinator/organizations/:id/approve` - Approve organization
- `POST /coordinator/organizations/:id/suspend` - Suspend organization
- `GET /coordinator/announcements` - List announcements
- `POST /coordinator/announcements` - Create announcement

## Testing

Currently, test infrastructure is configured but not yet implemented:

```bash
npm --workspace @siwes/backend run test
npm --workspace @siwes/frontend run test
```

### Planned Tests
- Backend unit tests for auth, email, uploads, notifications
- Backend integration tests for API flows
- Frontend component tests for auth pages, upload forms
- E2E tests for critical user journeys

## Linting & Quality

```bash
# Backend
npm --workspace @siwes/backend run lint

# Frontend
npm --workspace @siwes/frontend run lint
```

ESLint is configured for both frontend (Next.js recommended) and backend (TypeScript strict).

## Deployment

### Environment Setup
1. Configure PostgreSQL with a production database
2. Set all required environment variables (see Configuration section)
3. Generate Prisma client: `npx prisma generate`
4. Apply migrations: `npx prisma migrate deploy`

### Building
```bash
npm run build              # Build both frontend and backend
npm --workspace @siwes/backend run build
npm --workspace @siwes/frontend run build
```

### Running Production Server
```bash
# Backend
npm --workspace @siwes/backend run start

# Frontend
npm --workspace @siwes/frontend run start
```

### Docker Deployment
Create a Dockerfile with Node 20 base, install dependencies, build, and run the apps.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
- Runs on push to main/develop and PRs
- Lints both frontend and backend
- Builds both applications
- Runs test suites
- Validates against PostgreSQL database

## Known Limitations & Future Work

- **Rate Limiting**: Currently in-memory; use Redis for distributed deployments
- **Cron Jobs**: Run in API process; use external job queue for distributed systems
- **Audit Logs**: No retention/archival strategy yet
- **Tests**: Infrastructure in place, tests to be implemented
- **Notifications UI**: Socket.io connection configured, frontend UI components pending
- **Role Guards**: Frontend layout guards to be implemented

## Development Notes

### Decimal Handling
Prisma Decimal types require explicit `Number()` conversion before numeric comparisons.

### Email Delivery
Gracefully degrades when SENDGRID_API_KEY is not set; logs to console instead.

### Socket.io CORS
CORS is hardcoded to FRONTEND_URL from environment variables. Must match for browser connections.

### Refresh Token Rotation
Old refresh tokens are deleted from DB when new ones are issued. Ensures only one active token per user.

### JWT Secrets
- `JWT_SECRET`: Used for access tokens (15min expiry)
- `JWT_REFRESH_SECRET`: Used for refresh tokens (7day expiry)

## Contributing

This is a professional MVP implementation. Follow the established patterns for:
- Error handling (try-catch with typed errors)
- API responses (consistent status + data structure)
- Database operations (via Prisma with type safety)
- File uploads (validated + organized by type)
- Notifications (typed events via Socket.io)
