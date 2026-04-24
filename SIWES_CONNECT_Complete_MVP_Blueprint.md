# SIWES CONNECT — Complete MVP Blueprint
### Full-Stack Senior Engineering Specification
> Every detail. Nothing left out.

---

## TABLE OF CONTENTS

1. [Project Identity & Vision](#1-project-identity--vision)
2. [Tech Stack — Full Decision](#2-tech-stack--full-decision-with-reasons)
3. [Color System & Design Tokens](#3-color-system--design-tokens)
4. [Typography System](#4-typography-system)
5. [System Architecture](#5-system-architecture)
6. [Database Schema — Complete](#6-database-schema--complete)
7. [Folder Structure](#7-folder-structure)
8. [API Design — All Endpoints](#8-api-design--all-endpoints)
9. [Authentication & Authorization Flow](#9-authentication--authorization-flow)
10. [Matching Algorithm](#10-matching-algorithm)
11. [Step-by-Step Build Guide](#11-step-by-step-build-guide)
12. [Feature Breakdown — Every Screen](#12-feature-breakdown--every-screen)
13. [Notification System](#13-notification-system)
14. [File Upload Strategy](#14-file-upload-strategy)
15. [Email System](#15-email-system)
16. [Environment Variables](#16-environment-variables)
17. [Testing Strategy](#17-testing-strategy)
18. [Deployment Strategy](#18-deployment-strategy)
19. [MVP Launch Checklist](#19-mvp-launch-checklist)
20. [Post-MVP Roadmap](#20-post-mvp-roadmap)

---

## 1. PROJECT IDENTITY & VISION

**Platform Name:** SIWES Connect  
**Tagline:** *"Find Your Place. Build Your Future."*  
**Core Purpose:** A digital marketplace that connects Nigerian students seeking SIWES placement with organizations and provides institutional coordinators with full program oversight.

**Three User Types (Roles):**
| Role | What they do |
|---|---|
| `STUDENT` | Search, filter, apply, track placement applications |
| `ORGANIZATION` | Register, post placements, review applications, confirm students |
| `COORDINATOR` | Approve orgs, monitor students, view analytics, broadcast announcements |

---

## 2. TECH STACK — FULL DECISION WITH REASONS

### Frontend

| Technology | Version | Why |
|---|---|---|
| **Next.js** | 14 (App Router) | SSR + SSG hybrid, file-based routing, great DX, SEO-ready, API routes available |
| **TypeScript** | 5.x | Type safety across the whole codebase, catches bugs at compile time |
| **Tailwind CSS** | 3.x | Utility-first, fast to prototype, easily maintainable, purges unused CSS |
| **shadcn/ui** | Latest | Accessible, unstyled by default, copy-paste components you own |
| **React Hook Form** | 7.x | Performant forms, uncontrolled components, minimal re-renders |
| **Zod** | 3.x | Schema-first validation, shared between frontend and backend |
| **TanStack Query** | 5.x | Server state management, caching, refetching, background sync |
| **Zustand** | 4.x | Lightweight client state (auth session, filters, UI state) |
| **Framer Motion** | 11.x | Micro-animations, page transitions, smooth UX |
| **Recharts** | Latest | Charts for the coordinator analytics dashboard |
| **Sonner** | Latest | Beautiful toast notifications |
| **Lucide React** | Latest | Icon library, consistent and clean |
| **date-fns** | Latest | Date manipulation for deadlines, durations |

### Backend

| Technology | Version | Why |
|---|---|---|
| **Node.js** | 20 LTS | Battle-tested runtime, massive ecosystem |
| **Express.js** | 4.x | Minimal, flexible, well-understood REST API framework |
| **TypeScript** | 5.x | End-to-end type safety with shared Zod schemas |
| **Prisma** | 5.x | Type-safe ORM, auto-generates types from schema, handles migrations |
| **PostgreSQL** | 16 | Relational, ACID compliant, perfect for complex queries (matching algorithm) |
| **Redis** | 7.x | Session store, rate limiting, notification queue, caching |
| **JWT** | (jsonwebtoken) | Stateless auth, access + refresh token pattern |
| **bcrypt** | Latest | Password hashing |
| **Nodemailer** | Latest | Email sending via SMTP/SendGrid |
| **Multer** | Latest | File upload middleware |
| **Cloudinary** | Latest | Cloud file storage for org documents, student resumes |
| **Socket.io** | 4.x | Real-time notifications (application status updates) |
| **node-cron** | Latest | Scheduled jobs (deadline reminders, daily digest emails) |
| **helmet** | Latest | HTTP security headers |
| **cors** | Latest | Cross-origin requests |
| **express-rate-limit** | Latest | Rate limiting to prevent abuse |
| **winston** | Latest | Logging |
| **joi** / **Zod** | Latest | Backend request validation |

### Infrastructure & Services

| Service | Purpose |
|---|---|
| **Vercel** | Frontend deployment (Next.js native, automatic CI/CD from GitHub) |
| **Railway** | Backend Node.js API + Redis deployment |
| **Supabase** | PostgreSQL database (managed, auto-backups, dashboard) |
| **Cloudinary** | Image and document storage |
| **SendGrid** | Transactional emails (free tier: 100 emails/day) |
| **GitHub** | Version control |
| **GitHub Actions** | CI/CD pipeline |

### Development Tools

| Tool | Purpose |
|---|---|
| **ESLint + Prettier** | Code quality and formatting |
| **Husky + lint-staged** | Pre-commit hooks |
| **Turbo** (optional) | Monorepo build system |
| **Docker Compose** | Local dev environment (PG + Redis) |
| **Postman / Thunder Client** | API testing |
| **Prisma Studio** | Database GUI |

---

## 3. COLOR SYSTEM & DESIGN TOKENS

The palette is designed around **trust, growth, and professionalism** — aligned with Nigeria's national identity (green) and modern tech (navy blue + gold).

### Primary Palette

```css
/* === SIWES CONNECT DESIGN TOKENS === */

:root {
  /* Brand Colors */
  --color-primary-50:  #ECFDF5;
  --color-primary-100: #D1FAE5;
  --color-primary-200: #A7F3D0;
  --color-primary-400: #34D399;
  --color-primary-500: #10B981;
  --color-primary-600: #059669;   /* Main CTAs, links */
  --color-primary-700: #047857;   /* Hover states */
  --color-primary-800: #065F46;   /* Active states */
  --color-primary-900: #064E3B;   /* Dark headers */

  /* Secondary — Deep Navy */
  --color-secondary-500: #3B82F6;
  --color-secondary-600: #2563EB;
  --color-secondary-700: #1D4ED8;
  --color-secondary-800: #1E40AF;
  --color-secondary-900: #1E3A8A;  /* Sidebar, nav */

  /* Accent — Warm Amber/Gold */
  --color-accent-400: #FBBF24;
  --color-accent-500: #F59E0B;    /* CTAs, badges, highlights */
  --color-accent-600: #D97706;    /* Hover */
  --color-accent-700: #B45309;

  /* Neutrals */
  --color-gray-50:  #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* Semantic */
  --color-success:  #16A34A;
  --color-warning:  #D97706;
  --color-error:    #DC2626;
  --color-info:     #0284C7;

  /* Surfaces */
  --bg-base:    #F0FDF4;           /* App background (light green tint) */
  --bg-surface: #FFFFFF;           /* Cards, modals */
  --bg-overlay: rgba(0,0,0,0.5);  /* Modal overlays */

  /* Borders */
  --border-default: #E5E7EB;
  --border-focus:   #059669;

  /* Text */
  --text-primary:   #111827;
  --text-secondary: #4B5563;
  --text-muted:     #9CA3AF;
  --text-inverse:   #FFFFFF;
}
```

### Usage Rules

| Context | Color |
|---|---|
| Primary CTA buttons | `primary-600` (#059669) |
| Destructive actions | `error` (#DC2626) |
| Sidebar/Nav background | `secondary-900` (#1E3A8A) |
| Nav text/icons | White |
| Status: Pending | Amber `accent-500` |
| Status: Accepted | Green `primary-600` |
| Status: Rejected | Red `error` |
| Status: Under Review | Blue `secondary-600` |
| Student badge | Green gradient |
| Organization badge | Navy gradient |
| Coordinator badge | Amber gradient |
| Page background | `bg-base` (#F0FDF4) |
| Card background | `bg-surface` (#FFFFFF) |

---

## 4. TYPOGRAPHY SYSTEM

```css
/* Import in globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700&display=swap');

:root {
  /* Display / Headings */
  --font-display: 'Bricolage Grotesque', sans-serif;

  /* Body / UI */
  --font-body: 'Plus Jakarta Sans', sans-serif;

  /* Type Scale */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  1.875rem;  /* 30px */
  --text-4xl:  2.25rem;   /* 36px */
  --text-5xl:  3rem;      /* 48px */

  /* Weights */
  --font-light:     300;
  --font-regular:   400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;
  --font-extrabold: 800;
}
```

**Why these fonts:**
- **Bricolage Grotesque** — Modern, slightly geometric, feels authoritative and fresh. Perfect for headings on a Nigerian institutional platform. Not overused.
- **Plus Jakarta Sans** — Clean, readable, professional. Excellent for body text and UI labels. Supports West African context well.

---

## 5. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Next.js 14 Frontend (Vercel)                    │  │
│  │   Student Portal | Organization Portal | Coordinator Portal  │  │
│  │         TanStack Query | Zustand | Socket.io Client          │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ HTTPS / WSS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API (Railway)                          │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  Auth Layer │  │  Rate Limit  │  │      Helmet (Security)    │  │
│  │  JWT Verify │  │  (Redis)     │  │      CORS                 │  │
│  └──────┬──────┘  └──────────────┘  └───────────────────────────┘  │
│         │                                                           │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │                    Route Controllers                         │   │
│  │  /auth  /students  /organizations  /placements              │   │
│  │  /applications  /institutions  /notifications  /admin       │   │
│  └──────┬──────────────────────────────────────────────────────┘   │
│         │                                                           │
│  ┌──────▼──────────────────────────────────────────────────────┐   │
│  │                    Service Layer                             │   │
│  │  AuthService | MatchingService | NotificationService        │   │
│  │  EmailService | FileService | AnalyticsService              │   │
│  └──────┬──────────────────┬──────────────────────────────────┘   │
│         │                  │                                       │
│  ┌──────▼──────┐   ┌───────▼────────┐                             │
│  │   Prisma    │   │   Socket.io    │                             │
│  │     ORM     │   │   Server       │                             │
│  └──────┬──────┘   └────────────────┘                             │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────┐    ┌────────────────────────────┐
│    PostgreSQL (Supabase)        │    │     Redis (Railway)         │
│    - Users, Orgs, Placements    │    │     - Sessions              │
│    - Applications, Institutions │    │     - Rate limits           │
│    - Notifications, Logs        │    │     - Notification queue    │
└─────────────────────────────────┘    └────────────────────────────┘

External Services:
├── Cloudinary   (Document & image storage)
├── SendGrid     (Transactional emails)
└── node-cron   (Scheduled jobs)
```

### Three-Tier Architecture
1. **Presentation Layer** — Next.js (3 portals in one app, route-gated by role)
2. **Application Layer** — Express.js (business logic, matching, notifications)
3. **Data Layer** — PostgreSQL + Redis

---

## 6. DATABASE SCHEMA — COMPLETE

### Prisma Schema (schema.prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// ENUMS
// ============================================================

enum UserRole {
  STUDENT
  ORGANIZATION
  COORDINATOR
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum ApplicationStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  ACCEPTED
  REJECTED
  WITHDRAWN
  PLACEMENT_CONFIRMED
}

enum PlacementStatus {
  DRAFT
  ACTIVE
  CLOSED
  EXPIRED
  FILLED
}

enum NotificationType {
  APPLICATION_SUBMITTED
  APPLICATION_REVIEWED
  APPLICATION_ACCEPTED
  APPLICATION_REJECTED
  PLACEMENT_POSTED
  ORGANIZATION_APPROVED
  ORGANIZATION_REJECTED
  ANNOUNCEMENT
  DEADLINE_REMINDER
  PLACEMENT_CONFIRMED
}

enum StudyField {
  COMPUTER_SCIENCE
  ELECTRICAL_ENGINEERING
  MECHANICAL_ENGINEERING
  CIVIL_ENGINEERING
  CHEMICAL_ENGINEERING
  ACCOUNTING
  BUSINESS_ADMINISTRATION
  MEDICINE
  PHARMACY
  AGRICULTURE
  ARCHITECTURE
  LAW
  MASS_COMMUNICATION
  ECONOMICS
  MICROBIOLOGY
  BIOCHEMISTRY
  STATISTICS
  MATHEMATICS
  PHYSICS
  CHEMISTRY
  GEOLOGY
  PETROLEUM_ENGINEERING
  OTHER
}

enum NigerianState {
  ABIA
  ADAMAWA
  AKWA_IBOM
  ANAMBRA
  BAUCHI
  BAYELSA
  BENUE
  BORNO
  CROSS_RIVER
  DELTA
  EBONYI
  EDO
  EKITI
  ENUGU
  FCT
  GOMBE
  IMO
  JIGAWA
  KADUNA
  KANO
  KATSINA
  KEBBI
  KOGI
  KWARA
  LAGOS
  NASARAWA
  NIGER
  OGUN
  ONDO
  OSUN
  OYO
  PLATEAU
  RIVERS
  SOKOTO
  TARABA
  YOBE
  ZAMFARA
}

// ============================================================
// CORE MODELS
// ============================================================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  role          UserRole
  isEmailVerified Boolean @default(false)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  student       Student?
  organization  Organization?
  coordinator   Coordinator?
  notifications Notification[]
  refreshTokens RefreshToken[]
  passwordResets PasswordReset[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}

model PasswordReset {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("password_resets")
}

// ============================================================
// STUDENT
// ============================================================

model Student {
  id               String      @id @default(cuid())
  userId           String      @unique
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  institutionId    String
  institution      Institution @relation(fields: [institutionId], references: [id])

  // Personal Info
  firstName        String
  lastName         String
  phone            String?
  profilePhoto     String?     // Cloudinary URL
  dateOfBirth      DateTime?
  gender           String?
  
  // Academic Info
  matricNumber     String      @unique
  department       String
  faculty          String
  studyField       StudyField
  level            String      // 200, 300, 400 etc.
  cgpa             Decimal?    @db.Decimal(3, 2)
  
  // SIWES Info
  siwesYear        String?     // e.g., "2024/2025"
  preferredDuration Int?       // weeks
  
  // Location Preferences (can select multiple)
  preferredStates  String[]    // Array of NigerianState values
  currentState     NigerianState
  currentAddress   String?
  
  // Documents
  resumeUrl        String?     // Cloudinary URL
  
  // Timestamps
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  // Relations
  applications     Application[]

  @@map("students")
}

// ============================================================
// ORGANIZATION
// ============================================================

model Organization {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Company Info
  companyName         String
  slug                String             @unique
  description         String             @db.Text
  industry            String
  companySize         String             // "1-10", "11-50", "51-200", "201-500", "500+"
  website             String?
  
  // Contact Info
  contactPersonName   String
  contactPersonTitle  String
  contactEmail        String
  contactPhone        String
  
  // Location
  state               NigerianState
  lga                 String
  address             String
  
  // Verification
  rcNumber            String?            // RC/CAC Number
  itfNumber           String?            // ITF registration number
  verificationStatus  VerificationStatus @default(PENDING)
  verifiedAt          DateTime?
  verifiedBy          String?            // Coordinator ID
  rejectionReason     String?
  
  // Documents
  cacDocumentUrl      String?
  itfDocumentUrl      String?
  logoUrl             String?
  
  // Meta
  fields              StudyField[]       // Fields they can host
  totalSlotsHosted    Int                @default(0)
  rating              Decimal?           @db.Decimal(2, 1)
  
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Relations
  placements          Placement[]
  applications        Application[]

  @@map("organizations")
}

// ============================================================
// INSTITUTION / COORDINATOR
// ============================================================

model Institution {
  id           String      @id @default(cuid())
  name         String
  shortName    String      // e.g., "FUTA", "UNILAG"
  state        NigerianState
  address      String
  website      String?
  logoUrl      String?
  isActive     Boolean     @default(true)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relations
  students     Student[]
  coordinators Coordinator[]

  @@map("institutions")
}

model Coordinator {
  id            String      @id @default(cuid())
  userId        String      @unique
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  institutionId String
  institution   Institution @relation(fields: [institutionId], references: [id])

  firstName     String
  lastName      String
  phone         String?
  title         String?     // "SIWES Coordinator", "HOD", etc.
  department    String?
  staffId       String?

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("coordinators")
}

// ============================================================
// PLACEMENTS
// ============================================================

model Placement {
  id                String         @id @default(cuid())
  organizationId    String
  organization      Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Position Details
  title             String
  description       String         @db.Text
  responsibilities  String[]       // Array of responsibilities
  requirements      String[]       // Array of requirements
  
  // Requirements
  requiredFields    StudyField[]   // Which study fields qualify
  minimumLevel      String?        // e.g., "200 Level"
  minimumCGPA       Decimal?       @db.Decimal(3, 2)
  
  // Slot Info
  totalSlots        Int
  filledSlots       Int            @default(0)
  
  // Duration
  durationWeeks     Int
  startDate         DateTime?
  endDate           DateTime?
  applicationDeadline DateTime
  
  // Location
  state             NigerianState
  lga               String?
  isRemote          Boolean        @default(false)
  
  // Compensation
  stipendAmount     Decimal?       @db.Decimal(10, 2)
  stipendCurrency   String         @default("NGN")
  hasStipend        Boolean        @default(false)
  
  // Additional Info
  selectionProcess  String?        @db.Text
  benefits          String[]
  
  // Status
  status            PlacementStatus @default(DRAFT)
  
  // Matching Score Fields (computed/cached)
  // These help with filtering

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  // Relations
  applications      Application[]

  @@map("placements")
}

// ============================================================
// APPLICATIONS
// ============================================================

model Application {
  id               String            @id @default(cuid())
  studentId        String
  student          Student           @relation(fields: [studentId], references: [id], onDelete: Cascade)
  placementId      String
  placement        Placement         @relation(fields: [placementId], references: [id], onDelete: Cascade)
  organizationId   String
  organization     Organization      @relation(fields: [organizationId], references: [id])

  // Application Data
  coverLetter      String?           @db.Text
  resumeUrl        String?           // Can use student's default or upload new
  additionalDocs   String[]          // Additional Cloudinary URLs

  // Status Tracking
  status           ApplicationStatus @default(DRAFT)
  statusHistory    Json              @default("[]") // Array of {status, timestamp, note}
  
  // Coordinator Tracking
  institutionApproved Boolean        @default(false)
  institutionNote  String?
  
  // Organization Response
  orgNote          String?           // Message from org when accepting/rejecting
  interviewDate    DateTime?
  
  // Placement Confirmation
  confirmedAt      DateTime?
  placementStartDate DateTime?
  supervisorName   String?
  supervisorContact String?

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@unique([studentId, placementId]) // One application per student per placement
  @@map("applications")
}

// ============================================================
// NOTIFICATIONS
// ============================================================

model Notification {
  id         String           @id @default(cuid())
  userId     String
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type       NotificationType
  title      String
  message    String
  data       Json?            // Additional context data (application ID, placement ID etc.)
  isRead     Boolean          @default(false)
  readAt     DateTime?
  
  createdAt  DateTime         @default(now())

  @@map("notifications")
}

// ============================================================
// ANNOUNCEMENTS (from Coordinators to Students/Orgs)
// ============================================================

model Announcement {
  id              String      @id @default(cuid())
  institutionId   String
  createdBy       String      // Coordinator user ID
  
  title           String
  content         String      @db.Text
  targetAudience  String[]    // ["STUDENT", "ORGANIZATION", "ALL"]
  isPinned        Boolean     @default(false)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@map("announcements")
}

// ============================================================
// AUDIT LOG
// ============================================================

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entityType String
  entityId   String?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@map("audit_logs")
}
```

---

## 7. FOLDER STRUCTURE

### Complete Monorepo

```
siwes-connect/
├── .github/
│   └── workflows/
│       ├── frontend.yml         # Vercel deploy on push to main
│       └── backend.yml          # Railway deploy on push to main
├── apps/
│   ├── frontend/                # Next.js 14 App
│   │   ├── public/
│   │   │   ├── logo.svg
│   │   │   ├── og-image.png
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   │   ├── (auth)/      # Public routes group
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── register/
│   │   │   │   │   │   ├── student/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── organization/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── page.tsx   # Choose role
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── reset-password/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── verify-email/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (student)/   # Student routes (role-gated)
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── placements/
│   │   │   │   │   │   ├── page.tsx       # Search & list
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx   # Placement detail
│   │   │   │   │   ├── applications/
│   │   │   │   │   │   ├── page.tsx       # My applications
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx   # Application detail
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── notifications/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (organization)/        # Org routes (role-gated)
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── placements/
│   │   │   │   │   │   ├── page.tsx       # My placements list
│   │   │   │   │   │   ├── new/
│   │   │   │   │   │   │   └── page.tsx   # Create placement
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx   # Placement detail
│   │   │   │   │   │       └── edit/
│   │   │   │   │   │           └── page.tsx
│   │   │   │   │   ├── applications/
│   │   │   │   │   │   ├── page.tsx       # All applicants
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx   # Applicant detail
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── notifications/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (coordinator)/         # Coordinator routes
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── students/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── organizations/
│   │   │   │   │   │   ├── page.tsx       # All orgs + pending approval
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── placements/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── applications/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── analytics/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── announcements/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── new/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── settings/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (landing)/
│   │   │   │   │   └── page.tsx           # Landing page
│   │   │   │   ├── layout.tsx             # Root layout
│   │   │   │   ├── globals.css
│   │   │   │   └── not-found.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/                    # shadcn/ui components
│   │   │   │   ├── layout/
│   │   │   │   │   ├── StudentSidebar.tsx
│   │   │   │   │   ├── OrgSidebar.tsx
│   │   │   │   │   ├── CoordinatorSidebar.tsx
│   │   │   │   │   ├── TopNav.tsx
│   │   │   │   │   └── Footer.tsx
│   │   │   │   ├── shared/
│   │   │   │   │   ├── PlacementCard.tsx
│   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   ├── NotificationBell.tsx
│   │   │   │   │   ├── EmptyState.tsx
│   │   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   │   ├── ConfirmModal.tsx
│   │   │   │   │   ├── FileUploader.tsx
│   │   │   │   │   └── Pagination.tsx
│   │   │   │   ├── student/
│   │   │   │   │   ├── PlacementSearch.tsx
│   │   │   │   │   ├── PlacementFilters.tsx
│   │   │   │   │   ├── ApplicationCard.tsx
│   │   │   │   │   ├── ProfileForm.tsx
│   │   │   │   │   └── ApplyModal.tsx
│   │   │   │   ├── organization/
│   │   │   │   │   ├── PlacementForm.tsx
│   │   │   │   │   ├── ApplicantTable.tsx
│   │   │   │   │   └── OrgProfileForm.tsx
│   │   │   │   └── coordinator/
│   │   │   │       ├── AnalyticsDashboard.tsx
│   │   │   │       ├── OrgApprovalCard.tsx
│   │   │   │       ├── StudentTable.tsx
│   │   │   │       └── AnnouncementForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── usePlacements.ts
│   │   │   │   ├── useApplications.ts
│   │   │   │   ├── useNotifications.ts
│   │   │   │   ├── useSocket.ts
│   │   │   │   └── useDebounce.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts             # Axios instance with interceptors
│   │   │   │   ├── auth.ts            # Auth helpers
│   │   │   │   ├── socket.ts          # Socket.io client setup
│   │   │   │   ├── utils.ts           # cn(), formatters
│   │   │   │   ├── constants.ts       # Study fields, states
│   │   │   │   └── validations.ts     # Zod schemas (shared)
│   │   │   ├── providers/
│   │   │   │   ├── QueryProvider.tsx  # TanStack Query
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   └── SocketProvider.tsx
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts       # Zustand auth state
│   │   │   │   └── filterStore.ts     # Placement filter state
│   │   │   └── types/
│   │   │       ├── api.types.ts
│   │   │       ├── auth.types.ts
│   │   │       └── placement.types.ts
│   │   ├── .env.local
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                # Express.js API
│       ├── src/
│       │   ├── app.ts           # Express app setup
│       │   ├── server.ts        # Server entry point
│       │   ├── config/
│       │   │   ├── env.ts       # Environment config
│       │   │   ├── database.ts  # Prisma client
│       │   │   ├── redis.ts     # Redis client
│       │   │   └── cloudinary.ts
│       │   ├── routes/
│       │   │   ├── index.ts
│       │   │   ├── auth.routes.ts
│       │   │   ├── student.routes.ts
│       │   │   ├── organization.routes.ts
│       │   │   ├── placement.routes.ts
│       │   │   ├── application.routes.ts
│       │   │   ├── coordinator.routes.ts
│       │   │   ├── notification.routes.ts
│       │   │   └── upload.routes.ts
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── student.controller.ts
│       │   │   ├── organization.controller.ts
│       │   │   ├── placement.controller.ts
│       │   │   ├── application.controller.ts
│       │   │   ├── coordinator.controller.ts
│       │   │   └── notification.controller.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── student.service.ts
│       │   │   ├── organization.service.ts
│       │   │   ├── placement.service.ts
│       │   │   ├── application.service.ts
│       │   │   ├── matching.service.ts   # Core matching algorithm
│       │   │   ├── notification.service.ts
│       │   │   ├── email.service.ts
│       │   │   ├── upload.service.ts
│       │   │   └── analytics.service.ts
│       │   ├── middleware/
│       │   │   ├── authenticate.ts    # JWT verification
│       │   │   ├── authorize.ts       # Role-based access
│       │   │   ├── validate.ts        # Zod request validation
│       │   │   ├── rateLimiter.ts
│       │   │   ├── errorHandler.ts
│       │   │   └── auditLog.ts
│       │   ├── utils/
│       │   │   ├── logger.ts          # Winston
│       │   │   ├── helpers.ts
│       │   │   ├── tokens.ts          # JWT helpers
│       │   │   └── errors.ts          # Custom error classes
│       │   ├── jobs/
│       │   │   ├── scheduler.ts       # node-cron setup
│       │   │   ├── deadlineReminder.job.ts
│       │   │   └── digestEmail.job.ts
│       │   ├── sockets/
│       │   │   ├── index.ts           # Socket.io setup
│       │   │   └── notification.socket.ts
│       │   └── validations/
│       │       ├── auth.validation.ts
│       │       ├── placement.validation.ts
│       │       └── application.validation.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── .env
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                  # Shared types & constants
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── validations/     # Zod schemas used by both
│       └── package.json
│
├── docker-compose.yml           # Local PG + Redis
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## 8. API DESIGN — ALL ENDPOINTS

**Base URL:** `https://api.siwesconnect.ng/v1`

### Auth Routes — `/api/v1/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register/student` | Student registration | Public |
| POST | `/register/organization` | Org registration | Public |
| POST | `/register/coordinator` | Coordinator registration | Coordinator invite code |
| POST | `/login` | Login (all roles) | Public |
| POST | `/logout` | Logout + invalidate refresh token | Authenticated |
| POST | `/refresh` | Get new access token | Authenticated |
| POST | `/forgot-password` | Send reset email | Public |
| POST | `/reset-password` | Reset password with token | Public |
| POST | `/verify-email` | Verify email with token | Public |
| GET  | `/me` | Get current user profile | Authenticated |

### Student Routes — `/api/v1/students`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/profile` | Get student profile | Student |
| PUT | `/profile` | Update student profile | Student |
| PUT | `/profile/preferences` | Update location/field prefs | Student |
| POST | `/profile/resume` | Upload/update resume | Student |
| GET | `/placements` | Get matching placements (with filters) | Student |
| GET | `/placements/recommended` | Top recommended placements | Student |
| GET | `/applications` | Get student's applications | Student |
| POST | `/applications` | Submit application | Student |
| GET | `/applications/:id` | Get application detail | Student |
| DELETE | `/applications/:id` | Withdraw application | Student |
| GET | `/dashboard/stats` | Dashboard statistics | Student |

### Organization Routes — `/api/v1/organizations`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/profile` | Get org profile | Organization |
| PUT | `/profile` | Update org profile | Organization |
| POST | `/profile/documents` | Upload CAC/ITF docs | Organization |
| GET | `/placements` | Get org's placements | Organization |
| POST | `/placements` | Create new placement | Organization |
| GET | `/placements/:id` | Get placement detail | Organization |
| PUT | `/placements/:id` | Update placement | Organization |
| PATCH | `/placements/:id/status` | Change placement status | Organization |
| DELETE | `/placements/:id` | Delete placement (if DRAFT) | Organization |
| GET | `/applications` | Get all applications to org | Organization |
| GET | `/applications/:id` | Get application detail | Organization |
| PATCH | `/applications/:id/status` | Accept/reject application | Organization |
| POST | `/applications/:id/confirm` | Confirm placement | Organization |
| GET | `/dashboard/stats` | Dashboard statistics | Organization |

### Placement Routes — `/api/v1/placements` (Public read)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Search all active placements | Public |
| GET | `/:id` | Get placement detail | Public |
| GET | `/:id/organization` | Get org details for placement | Public |

### Coordinator Routes — `/api/v1/coordinator`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/dashboard/stats` | Overview stats | Coordinator |
| GET | `/organizations` | All orgs (with filter) | Coordinator |
| GET | `/organizations/pending` | Pending approval list | Coordinator |
| GET | `/organizations/:id` | Org detail | Coordinator |
| PATCH | `/organizations/:id/approve` | Approve org | Coordinator |
| PATCH | `/organizations/:id/reject` | Reject org | Coordinator |
| PATCH | `/organizations/:id/suspend` | Suspend org | Coordinator |
| GET | `/students` | All students | Coordinator |
| GET | `/students/:id` | Student detail | Coordinator |
| GET | `/placements` | All placements | Coordinator |
| GET | `/applications` | All applications | Coordinator |
| GET | `/analytics` | Full analytics data | Coordinator |
| GET | `/analytics/export` | Export CSV/Excel | Coordinator |
| POST | `/announcements` | Create announcement | Coordinator |
| GET | `/announcements` | List announcements | Coordinator |
| DELETE | `/announcements/:id` | Delete announcement | Coordinator |

### Notification Routes — `/api/v1/notifications`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Get user notifications | Authenticated |
| PATCH | `/:id/read` | Mark as read | Authenticated |
| PATCH | `/read-all` | Mark all as read | Authenticated |
| DELETE | `/:id` | Delete notification | Authenticated |
| GET | `/unread-count` | Get unread count | Authenticated |

### Upload Routes — `/api/v1/uploads`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/resume` | Upload student resume | Student |
| POST | `/document` | Upload org document | Organization |
| POST | `/avatar` | Upload profile photo | Authenticated |

---

## 9. AUTHENTICATION & AUTHORIZATION FLOW

### Token Strategy
- **Access Token:** JWT, expires in **15 minutes**
- **Refresh Token:** Stored in HTTP-only cookie, stored in DB, expires in **7 days**
- **Email Verification Token:** UUID, expires in **24 hours**
- **Password Reset Token:** UUID, expires in **1 hour**

### Auth Middleware

```typescript
// authenticate.ts
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: true,
        organization: true,
        coordinator: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// authorize.ts
export const authorize = (...roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
```

### Registration Flow

```
Student/Org fills form
         │
         ▼
POST /auth/register/[role]
         │
         ▼
Validate input (Zod)
         │
         ▼
Hash password (bcrypt, 12 rounds)
         │
         ▼
Create User + Student/Org record (transaction)
         │
         ▼
Generate email verification token
         │
         ▼
Send verification email (SendGrid)
         │
         ▼
Return 201 + user data (no token yet)
         │
         ▼
User clicks verify link → POST /auth/verify-email
         │
         ▼
isEmailVerified = true
         │
         ▼
Generate Access Token + Refresh Token
         │
         ▼
Store refresh token in DB
         │
         ▼
Return tokens → user is logged in
```

---

## 10. MATCHING ALGORITHM

The matching algorithm ranks placements for a student based on multiple weighted criteria.

```typescript
// matching.service.ts

interface MatchScore {
  placementId: string;
  score: number;           // 0 - 100
  breakdown: {
    locationScore: number;   // 0-40 points
    fieldScore: number;      // 0-30 points
    levelScore: number;      // 0-15 points
    cgpaScore: number;       // 0-10 points
    availabilityScore: number; // 0-5 points
  };
}

export class MatchingService {
  calculateMatchScore(student: Student, placement: Placement): MatchScore {
    let score = 0;
    const breakdown = {
      locationScore: 0,
      fieldScore: 0,
      levelScore: 0,
      cgpaScore: 0,
      availabilityScore: 0
    };

    // ── LOCATION SCORE (40 points) ──────────────────────────
    // Perfect match: student preferred state === placement state
    if (student.preferredStates.includes(placement.state)) {
      breakdown.locationScore = 40;
    } else if (placement.isRemote) {
      // Remote placements get 30 points for anyone
      breakdown.locationScore = 30;
    } else if (student.currentState === placement.state) {
      // Student's current state matches
      breakdown.locationScore = 25;
    } else {
      // Geopolitical zone match (e.g., both Southwest)
      const sameZone = isSameGeopoliticalZone(student.preferredStates[0], placement.state);
      breakdown.locationScore = sameZone ? 10 : 0;
    }

    // ── FIELD OF STUDY SCORE (30 points) ────────────────────
    if (placement.requiredFields.includes(student.studyField)) {
      breakdown.fieldScore = 30; // Exact match
    } else if (placement.requiredFields.length === 0) {
      breakdown.fieldScore = 15; // Open to all fields
    } else {
      // Related field check
      const isRelated = areFieldsRelated(student.studyField, placement.requiredFields);
      breakdown.fieldScore = isRelated ? 10 : 0;
    }

    // ── LEVEL SCORE (15 points) ──────────────────────────────
    const studentLevel = parseInt(student.level);
    const minLevel = parseInt(placement.minimumLevel || '100');
    if (studentLevel >= minLevel) {
      breakdown.levelScore = 15;
    } else if (studentLevel === minLevel - 100) {
      breakdown.levelScore = 5; // Close
    }

    // ── CGPA SCORE (10 points) ───────────────────────────────
    if (!placement.minimumCGPA) {
      breakdown.cgpaScore = 10; // No requirement = all get full score
    } else if (student.cgpa && student.cgpa >= placement.minimumCGPA) {
      breakdown.cgpaScore = 10;
    } else if (student.cgpa && student.cgpa >= placement.minimumCGPA - 0.5) {
      breakdown.cgpaScore = 5; // Close
    }

    // ── AVAILABILITY SCORE (5 points) ───────────────────────
    const slotsRemaining = placement.totalSlots - placement.filledSlots;
    if (slotsRemaining > 5) {
      breakdown.availabilityScore = 5;
    } else if (slotsRemaining > 0) {
      breakdown.availabilityScore = 3;
    }

    score = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { placementId: placement.id, score, breakdown };
  }

  async getMatchedPlacements(studentId: string, filters?: FilterOptions) {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    const placements = await prisma.placement.findMany({
      where: {
        status: 'ACTIVE',
        applicationDeadline: { gte: new Date() },
        organization: { verificationStatus: 'APPROVED' },
        // Apply filters if provided
        ...(filters?.state && { state: filters.state }),
        ...(filters?.field && { requiredFields: { has: filters.field } }),
        ...(filters?.hasStipend !== undefined && { hasStipend: filters.hasStipend }),
      },
      include: { organization: true }
    });

    const scored = placements
      .map(p => ({
        placement: p,
        matchScore: this.calculateMatchScore(student, p)
      }))
      .filter(item => item.matchScore.score > 0)  // Minimum threshold
      .sort((a, b) => b.matchScore.score - a.matchScore.score);

    return scored;
  }
}
```

---

## 11. STEP-BY-STEP BUILD GUIDE

### PHASE 0: Project Setup (Day 1)

**Step 1: Initialize the monorepo**
```bash
mkdir siwes-connect && cd siwes-connect
git init
mkdir -p apps/frontend apps/backend packages/shared
```

**Step 2: Set up the backend**
```bash
cd apps/backend
npm init -y
npm install express typescript ts-node @types/express @types/node
npm install prisma @prisma/client
npm install jsonwebtoken bcrypt nodemailer multer
npm install helmet cors express-rate-limit
npm install redis ioredis
npm install winston uuid zod
npm install socket.io node-cron
npm install cloudinary multer-storage-cloudinary
npm install -D @types/jsonwebtoken @types/bcrypt @types/multer @types/uuid @types/cors nodemon
npx prisma init
```

**Step 3: Set up the frontend**
```bash
cd apps/frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install @tanstack/react-query axios zustand
npm install react-hook-form @hookform/resolvers zod
npm install framer-motion lucide-react sonner
npm install recharts date-fns
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npx shadcn@latest init
npx shadcn@latest add button card input label select badge avatar
npx shadcn@latest add dialog dropdown-menu table tabs toast
npx shadcn@latest add sheet separator skeleton progress
```

**Step 4: Docker Compose for local dev**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: siwes
      POSTGRES_PASSWORD: siwes123
      POSTGRES_DB: siwes_connect
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

### PHASE 1: Backend Foundation (Days 2-4)

**Step 5: Configure Express app**
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { router } from './routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', router);
app.use(errorHandler);

export { app };
```

**Step 6: Set up Prisma + run migrations**
```bash
# Copy schema from section 6 into prisma/schema.prisma
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed  # Create default institution + coordinator
```

**Step 7: Build Auth Service (most critical)**

Build these in order:
1. `tokens.ts` — generateAccessToken, generateRefreshToken
2. `auth.service.ts` — register, login, logout, refresh, forgotPassword, resetPassword
3. `auth.controller.ts` — Express handlers calling the service
4. `auth.routes.ts` — Wire routes to controller
5. `authenticate.ts` middleware
6. `authorize.ts` middleware
7. Test with Postman — register a student, org, coordinator

**Step 8: Build Email Service**
```typescript
// email.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: '"SIWES Connect" <noreply@siwesconnect.ng>',
    to: email,
    subject: 'Verify your SIWES Connect account',
    html: getVerifyEmailTemplate(verifyUrl) // HTML email template
  });
};
```

---

### PHASE 2: Core CRUD Features (Days 5-10)

Build in this order:

**Step 9: Organization Module**
1. `organization.service.ts` — getProfile, updateProfile, uploadDocuments
2. `organization.controller.ts`
3. `organization.routes.ts`
4. Test all org endpoints

**Step 10: Placement Module**
1. `placement.service.ts` — createPlacement, updatePlacement, getMyPlacements, getById, changeStatus
2. `placement.controller.ts`
3. `placement.routes.ts`
4. Add validation schemas
5. Test all placement endpoints

**Step 11: Student Module**
1. `student.service.ts` — getProfile, updateProfile, updatePreferences, uploadResume
2. `student.controller.ts`
3. `student.routes.ts`

**Step 12: Matching Service**
1. Implement `matching.service.ts` from section 10
2. Connect to `GET /students/placements` endpoint
3. Add query params for filtering: `?state=LAGOS&field=COMPUTER_SCIENCE&hasStipend=true&page=1&limit=20`

**Step 13: Application Module**
1. `application.service.ts`:
   - `submitApplication` — validate student hasn't already applied, check slots, create record, notify org
   - `withdrawApplication` — update status, notify org
   - `getStudentApplications` — with pagination
   - `updateApplicationStatus` — org accepts/rejects, notify student
   - `confirmPlacement` — org confirms, fills slot, notify coordinator
2. `application.controller.ts` + routes
3. Status history tracking (JSON field updates on every status change)

**Step 14: Coordinator Module**
1. `coordinator.service.ts`:
   - `approveOrganization` — verificationStatus = APPROVED, notify org
   - `rejectOrganization` — with reason
   - `getDashboardStats` — counts, placement stats
   - `getAnalytics` — breakdown by field, state, org
2. `analytics.service.ts`:
   - Total students, placed students, unplaced students
   - Top organizations by placements
   - Placements by state (for map)
   - Placements by field of study
   - Weekly application trend

---

### PHASE 3: Notifications & Real-time (Days 11-12)

**Step 15: Socket.io Setup**
```typescript
// sockets/index.ts
import { Server } from 'socket.io';
import { authenticate } from './middleware/authenticate';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true }
  });

  io.use(async (socket, next) => {
    // Authenticate socket connection via token in handshake
    const token = socket.handshake.auth.token;
    // verify JWT, attach user to socket
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`); // Join personal room

    socket.on('disconnect', () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
};

// To send notification from anywhere:
// io.to(`user:${userId}`).emit('notification', { ...notificationData });
```

**Step 16: Notification Service**
```typescript
// notification.service.ts
export class NotificationService {
  constructor(private io: Server) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedData?: object;
  }) {
    const notification = await prisma.notification.create({ data });
    // Emit real-time notification
    this.io.to(`user:${data.userId}`).emit('notification', notification);
    return notification;
  }

  async notifyApplicationSubmitted(application: Application) {
    // Notify organization
    await this.create({
      userId: application.organization.userId,
      type: 'APPLICATION_SUBMITTED',
      title: 'New Application Received',
      message: `${application.student.firstName} applied for ${application.placement.title}`,
      relatedData: { applicationId: application.id }
    });
  }
  // ... more notification methods
}
```

**Step 17: Scheduled Jobs**
```typescript
// jobs/deadlineReminder.job.ts
import cron from 'node-cron';

// Run every day at 8 AM Nigeria time
cron.schedule('0 8 * * *', async () => {
  // Find placements with deadline in 3 days
  const expiringSoon = await prisma.placement.findMany({
    where: {
      applicationDeadline: {
        gte: new Date(),
        lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      status: 'ACTIVE'
    }
  });
  // Send emails to relevant students
});
```

---

### PHASE 4: Frontend Build (Days 13-25)

**Step 18: Global Setup**
1. Configure `next.config.js` with API URL
2. Set up `globals.css` with color tokens and fonts
3. Create `lib/api.ts` with Axios instance + interceptors (auto-attach token, handle 401 → refresh)
4. Set up QueryProvider, AuthProvider
5. Create auth store with Zustand

**Step 19: Landing Page**
Build a professional landing page with:
- Hero section (headline + CTA buttons for each role)
- How it works section (3 steps for students, 3 for orgs)
- Statistics section (placeholder numbers)
- Feature highlights
- Footer with links

**Step 20: Auth Pages**
- `/login` — Email/password form, remember role indicator, loading state
- `/register` — Role selection page first (3 cards)
- `/register/student` — Multi-step form:
  - Step 1: Email, password, confirm password
  - Step 2: Personal info (name, phone, DOB)
  - Step 3: Academic info (matric, department, field, level)
  - Step 4: Location preferences (current state + preferred states)
- `/register/organization` — Multi-step form:
  - Step 1: Email, password
  - Step 2: Company info (name, industry, size, description)
  - Step 3: Contact info
  - Step 4: Location (state, LGA, address)
  - Step 5: Documents upload (CAC, ITF)
- `/forgot-password` + `/reset-password`
- `/verify-email`

**Step 21: Student Portal**

*Student Dashboard (`/dashboard`):*
- Welcome card with student name
- Application stats (total, pending, accepted, rejected)
- Quick action buttons (Search Placements, My Applications)
- Recent applications list (last 5)
- Recommended placements (top 3 matches)
- Announcements from institution

*Placement Search (`/placements`):*
- Search bar with debounce
- Sidebar filters:
  - State (multi-select)
  - Field of study (multi-select)
  - Duration (slider)
  - Has stipend (toggle)
  - Available slots (toggle: has slots)
  - Sort by: Match score, Deadline (soonest), Date posted
- Results grid with PlacementCard:
  - Company logo + name
  - Position title
  - Location badge + field badge
  - Slots remaining
  - Deadline countdown
  - Match score percentage bar
  - Apply button
- Pagination

*Placement Detail (`/placements/[id]`):*
- Back button
- Organization info section (logo, name, industry, verified badge, website)
- Position details (title, description, responsibilities list, requirements list)
- Key info badges (location, field, level, CGPA)
- Slots & Timeline (total slots, remaining, start date, deadline)
- Stipend info
- Apply button (opens modal)
- Related placements sidebar

*Apply Modal:*
- Cover letter textarea
- Resume upload (or use profile resume)
- Additional documents
- Submit button with loading state

*My Applications (`/applications`):*
- Tabs: All | Pending | Under Review | Accepted | Rejected
- ApplicationCard per item:
  - Company logo + name
  - Position applied for
  - Date applied
  - Status badge (color-coded)
  - Action buttons (Withdraw if pending, View Detail)
- Empty state for each tab

*Application Detail (`/applications/[id]`):*
- Full application summary
- Status timeline (visual stepper showing history)
- Organization's message/note
- Documents submitted
- If accepted: Supervisor info, start date, next steps

*Profile Page (`/profile`):*
- Edit personal info
- Edit academic info
- Update location preferences (interactive multi-state selector)
- Upload/change resume
- Change password

**Step 22: Organization Portal**

*Org Dashboard (`/dashboard`):*
- Verification status banner (pending/approved/rejected)
- Stats: Total placements, Total applications, Accepted students, Active slots
- Pending applications count + quick view
- Recent placements list
- Quick post placement button

*Placement Management (`/placements`):*
- My placements list with status badges
- Filter by status
- Create New Placement button (takes to form)
- Each card: title, slots info, applications count, deadline, quick actions

*Create/Edit Placement Form (`/placements/new` or `/placements/[id]/edit`):*
Multi-step form:
- Step 1: Basic info (title, description)
- Step 2: Requirements (fields, level, CGPA, responsibilities, requirements)
- Step 3: Slot & Duration (total slots, start date, duration, deadline)
- Step 4: Location (state, LGA, remote toggle)
- Step 5: Compensation (stipend toggle, amount)
- Step 6: Review & Publish

*Applications Manager (`/applications`):*
- Table view: Applicant name, field, institution, applied date, status, actions
- Filter by placement, status, institution
- Click row to expand details
- Accept/Reject buttons with reason modal
- Confirm Placement button (after acceptance)

*Org Profile (`/profile`):*
- Edit all company details
- Update documents
- Re-upload for re-verification

**Step 23: Coordinator Portal**

*Coordinator Dashboard:*
- Key metrics (total students, placed, unplaced, pending org approvals)
- Alert banner if there are pending org approvals
- Quick links

*Organization Management (`/organizations`):*
- Tabs: All | Pending | Approved | Rejected
- OrgCard with verification status
- Pending tab shows details + Approve/Reject buttons
- View org detail page with all documents

*Student Monitoring (`/students`):*
- Table: Student, Field, Level, Institution, Application Status, Actions
- Filter by field, level, placement status
- View student detail (profile + applications)

*Analytics Dashboard (`/analytics`):*
- Total students vs placed students (donut chart)
- Applications by status (bar chart)
- Top 5 organizations by placements (horizontal bar)
- Placements by state (map visualization or sorted list)
- Placements by field of study (pie chart)
- Weekly application trend (line chart)
- Export as CSV button

*Announcements (`/announcements`):*
- List of past announcements
- Create new announcement (title, content, audience, pin toggle)

---

### PHASE 5: Polish & Security (Days 26-28)

**Step 24: Security Hardening**
- Add rate limiting (15 req/min on auth endpoints, 100 req/min elsewhere)
- Input sanitization (trim all strings, check for XSS)
- SQL injection prevention (Prisma handles this via parameterized queries)
- File upload validation (check MIME type, max 5MB)
- CORS whitelist (only your frontend domain)
- Audit logging for sensitive actions

**Step 25: Error Handling**

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Log unexpected errors
  logger.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
```

**Step 26: Loading States & Error States**
- Skeleton loaders for all data-fetching components
- Error boundaries for each portal section
- Empty states with helpful CTAs
- Toast notifications for all user actions
- Form validation messages

---

## 12. FEATURE BREAKDOWN — EVERY SCREEN

### Status Flows

**Application Status Flow:**
```
DRAFT → SUBMITTED → UNDER_REVIEW → ACCEPTED → PLACEMENT_CONFIRMED
                              └──→ REJECTED
SUBMITTED → WITHDRAWN (by student)
```

**Organization Verification Flow:**
```
PENDING → APPROVED → (active, can post placements)
       └─→ REJECTED → (can fix and resubmit)
APPROVED → SUSPENDED → (coordinator action)
```

**Placement Status Flow:**
```
DRAFT → ACTIVE → CLOSED (manually or deadline passed)
             └─→ FILLED (all slots taken)
             └─→ EXPIRED (past end date)
```

### Notification Matrix

| Event | Who Gets Notified | Channel |
|---|---|---|
| Student submits application | Organization | In-app + Email |
| Org reviews application | Student | In-app + Email |
| Org accepts application | Student + Coordinator | In-app + Email |
| Org rejects application | Student | In-app + Email |
| Org confirms placement | Student + Coordinator | In-app + Email |
| Student withdraws | Organization | In-app |
| New placement posted | Students (by matching) | In-app (batch) |
| Org registered | Coordinator | In-app + Email |
| Org approved | Organization | In-app + Email |
| Org rejected | Organization | In-app + Email |
| Coordinator announcement | Target audience | In-app + Email |
| Deadline in 3 days | Students with saved placement | Email (cron job) |

---

## 13. NOTIFICATION SYSTEM

### In-app notifications (via Socket.io)
- Stored in PostgreSQL `notifications` table
- Emitted in real-time to connected user via Socket.io
- Unread count badge in navbar
- Bell icon dropdown shows latest 5
- Full notifications page with pagination and mark all read

### Email notifications (via SendGrid)
- All critical events (acceptance, rejection, confirmation)
- Use HTML email templates (not plain text)
- Include SIWES Connect branding
- One-click action links where appropriate

### Push to batch (cron jobs):
- Daily: Deadline reminders (3-day warning)
- Weekly: Activity digest for coordinators (Sunday 9 PM)

---

## 14. FILE UPLOAD STRATEGY

### Cloudinary Configuration
```typescript
// config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload presets
export const UPLOAD_PRESETS = {
  RESUME: { folder: 'siwes/resumes', allowed_formats: ['pdf'], max_bytes: 5_000_000 },
  DOCUMENT: { folder: 'siwes/documents', allowed_formats: ['pdf', 'jpg', 'png'], max_bytes: 10_000_000 },
  AVATAR: { folder: 'siwes/avatars', allowed_formats: ['jpg', 'png', 'webp'], max_bytes: 2_000_000 },
  LOGO: { folder: 'siwes/logos', allowed_formats: ['jpg', 'png', 'webp', 'svg'], max_bytes: 2_000_000 }
};
```

### File Types & Limits
| File Type | Allowed Formats | Max Size |
|---|---|---|
| Student Resume | PDF | 5 MB |
| Student Photo | JPG, PNG, WEBP | 2 MB |
| CAC Document | PDF, JPG, PNG | 10 MB |
| ITF Document | PDF, JPG, PNG | 10 MB |
| Org Logo | JPG, PNG, WEBP, SVG | 2 MB |

---

## 15. EMAIL SYSTEM

### Email Templates (HTML)
Build these 8 templates with consistent SIWES Connect branding:

1. **Welcome / Verify Email** — Verification button + welcome message
2. **Password Reset** — Reset link with 1-hour expiry warning
3. **Application Received** (to org) — Student details + link to review
4. **Application Status Update** (to student) — Status + org message
5. **Placement Confirmed** (to student) — Full details, supervisor, start date
6. **Organization Approved** (to org) — Welcome + link to post placements
7. **Organization Rejected** (to org) — Reason + resubmit instructions
8. **Deadline Reminder** (to student) — Upcoming placement deadlines

### Template Base Structure
All emails share:
- SIWES Connect header with logo
- Green top border (#059669)
- Clean white body
- Body text in Plus Jakarta Sans
- Primary action button in brand green
- Footer with unsubscribe link + social links

---

## 16. ENVIRONMENT VARIABLES

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://siwes:siwes123@localhost:5432/siwes_connect

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-token-secret-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@siwesconnect.ng
FROM_NAME=SIWES Connect

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-api-secret

# App
APP_NAME=SIWES Connect
COORDINATOR_INVITE_CODE=coord_2024_invite
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=SIWES Connect
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 17. TESTING STRATEGY

### Backend Testing

**Unit Tests (Jest):**
- `matching.service.test.ts` — Test all score combinations
- `auth.service.test.ts` — Registration, login, token validation
- `application.service.test.ts` — Status transitions

**Integration Tests (Supertest):**
- Full API endpoint tests with test database
- Auth flow end-to-end
- Application submission flow

**Run:**
```bash
npm test               # Unit tests
npm run test:coverage  # With coverage report
npm run test:e2e       # Integration tests
```

### Frontend Testing

**Unit Tests (Vitest + React Testing Library):**
- Component rendering tests
- Form validation tests
- Utility function tests

**E2E Tests (Playwright):**
- Student registration flow
- Submit application flow
- Coordinator approve org flow

---

## 18. DEPLOYMENT STRATEGY

### Database (Supabase) — Free Tier
1. Create Supabase project at supabase.com
2. Get `DATABASE_URL` from project settings
3. `npx prisma migrate deploy` (runs migrations against prod DB)
4. `npx prisma db seed` (seed initial data)

### Backend (Railway) — $5/month
1. Create Railway project
2. Connect GitHub repo, select `apps/backend`
3. Add all environment variables from section 16
4. Set start command: `npm run build && npm start`
5. Railway auto-deploys on every push to `main`

**Dockerfile for backend:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Frontend (Vercel) — Free Tier
1. Import GitHub repo at vercel.com
2. Set root directory to `apps/frontend`
3. Add environment variables from `.env.local`
4. Deploy — Vercel handles everything

### Redis (Railway) — Add Plugin
1. In Railway project, add Redis plugin
2. Copy `REDIS_URL` to backend environment

### Domain Setup (Optional)
- Register `siwesconnect.ng` at a Nigerian registrar
- Point to Vercel (frontend)
- Set up API subdomain `api.siwesconnect.ng` pointing to Railway

### CI/CD Pipeline (.github/workflows/backend.yml)
```yaml
name: Backend CI/CD
on:
  push:
    branches: [main]
    paths: ['apps/backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd apps/backend && npm ci
      - run: cd apps/backend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 19. MVP LAUNCH CHECKLIST

### Pre-Launch
- [ ] All Prisma migrations run on production DB
- [ ] Seed data: at least 1 institution + 1 coordinator account
- [ ] Email sending tested in production (SendGrid)
- [ ] File uploads tested in production (Cloudinary)
- [ ] SSL certificates active on all domains
- [ ] Environment variables set for production
- [ ] Rate limiting configured
- [ ] Error monitoring set up (Sentry - free tier)
- [ ] Winston logs flowing to file/service

### Feature Completeness
- [ ] Auth: Register, Login, Forgot Password, Email Verify
- [ ] Student: Full profile + preferences
- [ ] Student: Search + filter placements
- [ ] Student: Submit + withdraw application
- [ ] Student: Track application status
- [ ] Organization: Multi-step registration
- [ ] Organization: Verification flow (pending state UI)
- [ ] Organization: Create/edit/close placements
- [ ] Organization: Review + accept/reject applications
- [ ] Organization: Confirm placement
- [ ] Coordinator: Approve/reject organizations (with documents)
- [ ] Coordinator: View all students, filter by status
- [ ] Coordinator: Analytics dashboard
- [ ] Coordinator: Post announcements
- [ ] Notifications: Real-time + email
- [ ] Mobile responsive (all pages work on mobile)

### Performance
- [ ] Images optimized via Cloudinary transformations
- [ ] API responses < 500ms for common queries
- [ ] Pagination on all list endpoints
- [ ] Lazy loading on heavy pages
- [ ] Next.js Image component used throughout

### Security
- [ ] Passwords hashed (bcrypt, 12 rounds)
- [ ] JWT secrets are long and random
- [ ] File upload type/size validated
- [ ] Rate limiting on auth endpoints
- [ ] Input validated on both frontend and backend
- [ ] No sensitive data in frontend env vars (no secrets)

---

## 20. POST-MVP ROADMAP

### Version 1.1 — Enhanced Matching
- Machine learning-based recommendations (based on successful placements)
- "Save" placement to wishlist
- Follow organizations
- Placement view analytics for orgs (how many students viewed)

### Version 1.2 — Communication
- In-app messaging between students and organizations
- Video interview scheduling integration (Calendly embed)
- Application notes/comments thread

### Version 1.3 — Monitoring
- SIWES logbook submission (digital weekly logs)
- Supervisor feedback forms
- Mid-placement check-ins
- Completion certificates

### Version 2.0 — National Scale
- Multi-institution support (one platform, many schools)
- ITF national dashboard
- National analytics across all institutions
- API for ITF integration
- Mobile apps (React Native)

---

## QUICK REFERENCE — Development Order

| Week | Focus | Deliverable |
|---|---|---|
| Week 1 | Backend foundation | Auth, DB, core APIs |
| Week 2 | Feature APIs | All CRUD, matching, notifications |
| Week 3 | Frontend auth + landing | Login, register flows, landing page |
| Week 4 | Student portal | Dashboard, search, applications |
| Week 5 | Org portal | Dashboard, placement form, applicant mgmt |
| Week 6 | Coordinator portal | Dashboard, org approval, analytics |
| Week 7 | Polish + security | Animations, loading states, hardening |
| Week 8 | Testing + deployment | Tests, Vercel + Railway deploy |

---

*Built for Nigeria. Scalable for Africa.*
*SIWES Connect — Bridging Students, Organizations, and Institutions.*
