# LMS & College Management Platform - Brain

## Project Purpose
A comprehensive, production-grade Learning Management System (LMS) and College Management Platform. It serves as a unified system to manage student academics, faculty operations, HR workflows (leaves, attendance), financial records (fees, invoices), and institutional governance. The primary users include Head Admins, Branch Admins, HODs, Teachers, Students, and Parents.

## High-Level Architecture
- **Frontend & Backend Framework:** Next.js (App Router, Server Actions).
- **Authentication:** NextAuth.js (v5 Beta) using Credentials and JWT strategy.
- **Database ORM:** Prisma ORM.
- **Database Engine:** SQLite (`dev.db`).
- **Styling:** Tailwind CSS (v4) with Lucide React for iconography.
- **Routing & RBAC:** Handled via Next.js Middleware (`src/proxy.ts`).

## Folder Responsibilities
- `prisma/`: Contains `schema.prisma` (the single source of truth for DB schema) and the local SQLite database.
- `public/`: Static assets, including local file uploads (e.g., `public/uploads` for leave attachments).
- `src/app/`: Next.js App Router root.
  - `src/app/(dashboard)/`: Protected routes separated by role-based subdirectories (e.g., `/admin`, `/hod`, `/teacher`, `/student`, `/hr`, `/finance`).
  - `src/app/actions/`: Next.js Server Actions containing core business logic and database mutations.
  - `src/app/api/`: Next.js API Routes (if any).
  - `src/app/login/`: Authentication entry point.
- `src/components/`: Reusable React Client and Server components (e.g., `ModalShell`, `DashboardStats`).
- `src/lib/`: Utilities, helpers, and configurations (e.g., `rbac.ts`).

## Technology Stack
- **Framework:** Next.js 16.2.10
- **Language:** TypeScript 5+
- **UI/Styling:** React 19, Tailwind CSS 4, Lucide React
- **Database:** SQLite
- **ORM:** Prisma 5.22.0
- **Auth:** NextAuth.js 5.0.0-beta.31, bcryptjs
- **Testing:** Playwright (E2E)
- **Linting:** ESLint 9

## Dependency Graph
- **Client Components** depend on **Server Actions** (`src/app/actions/*`) for data mutation.
- **Server Actions** depend on **Prisma Client** and **NextAuth session** (`src/auth.ts`) for database access and authorization.
- **Next.js Pages** depend on **Prisma Client** for initial server-side data fetching.

## Execution Flow
1. **Entry:** User visits `/`.
2. **Middleware:** `src/proxy.ts` intercepts the request. Unauthenticated users are sent to `/login`.
3. **Authentication:** User logs in via NextAuth Credentials Provider (`src/auth.ts`). Password is verified via `bcryptjs`.
4. **RBAC Redirection:** Middleware dynamically redirects the user to their designated dashboard (`/dashboard`, `/hod`, `/teacher`, etc.) based on their role (`session.user.role`).
5. **Data Fetching:** Page Server Components fetch initial data via Prisma.
6. **Interaction:** Client Components invoke Server Actions for mutations (e.g., marking attendance, requesting leave).

## Request Lifecycle (Server Actions)
1. **Invocation:** Client calls an async function imported from `src/app/actions/*`.
2. **Authorization Check:** Action verifies the user's session and role using `await auth()`.
3. **Validation & Business Logic:** Action processes input data.
4. **Database Operation:** Action executes Prisma queries within a transaction (if applicable).
5. **Revalidation:** Action calls `revalidatePath()` to purge Next.js router cache and update the UI.

## Database Design
- **Core Entities:**
  - `User`: Extended profile with roles (HEAD_ADMIN, ADMIN, HOD, TEACHER, STUDENT, PARENT), demographic data, and relations to all academic/finance modules. Soft-deletes are supported via `deletedAt`.
  - `Branch`: Multi-campus support.
  - `ParentStudent`: Links parent accounts to student accounts.
- **Academics:**
  - `Course`, `Section`, `Department`, `Class`.
  - `Gradebook`, `TestResult`, `Attendance`.
- **HR & Governance:**
  - `LeaveRequest`: Tracks staff leave applications and attachments.
  - `AuditTicket`: Centralized governance model holding proposed JSON mutations. Prevents direct historical modifications by non-Head-Admins.
- **Finance:**
  - `Invoice`, `FeeInvoice`, `Payment`, `Concession`.

## API Contracts
All major API interactions are abstracted as Next.js Server Actions.
- **Authentication:** Standard NextAuth credential flow.
- **Mutations:** Accept `FormData` or primitive types. Strict authorization checks are performed at the top of every action.

## Key Algorithms & Business Logic
- **Audit Governance:** When a teacher or sub-admin attempts to modify/delete historical data (Grades, Attendance, Invoices, Profiles), the operation is intercepted by `requestAuditAction()`. An `AuditTicket` is generated with `status: "PENDING_HEAD_ADMIN_APPROVAL"`. The Head Admin resolves the ticket, dynamically applying the `proposedData` JSON payload via `resolveAuditTicket()`.
- **Bulk Attendance:** Uses Prisma `$transaction` and nested upserts to atomically mark bulk student attendance and prevent duplicate entries for a specific `courseId`, `sectionId`, and `date`.

## Configuration
- `next.config.ts`: Next.js config.
- `prisma/schema.prisma`: Database definition.
- `src/auth.ts`: NextAuth configuration, credentials provider setup, and JWT/Session callbacks for attaching roles.
- `src/proxy.ts`: Middleware for RBAC.

## Environment Variables
- `DATABASE_URL`: Connection string for Prisma (e.g., `"file:./dev.db"`).
- `AUTH_SECRET`: Secret key used by NextAuth for encrypting JWTs.

## Coding Standards
- **Styling:** Tailwind utility classes.
- **Data Fetching:** Server Components for initial load, Server Actions for mutations. Avoid `useEffect` API fetching where possible.
- **Error Handling:** Server Actions throw standard Errors which are caught in `try/catch` blocks on the client and displayed via alerts or toast notifications.

## Security Practices
- **Authentication:** NextAuth JWT stored in HTTP-only cookies.
- **Passwords:** Hashed with `bcryptjs`.
- **RBAC:** Multi-layered access control.
  - *Layer 1 (Routing):* Middleware (`src/proxy.ts`) restricts URL paths based on user role.
  - *Layer 2 (Actions):* Every Server Action validates the session role before proceeding.
- **Governance:** Critical data modifications are deferred to `AuditTickets` requiring dual-authorization.

## Performance Considerations
- Next.js App Router aggressive caching is utilized (`revalidatePath` handles cache invalidation).
- Relational queries use Prisma `include` to fetch joined data efficiently.

## External Integrations
- Local File System: Currently used for `LeaveRequest` attachments (`public/uploads`).

## Testing Strategy
- **Framework:** Playwright for E2E testing (`tests/`, `test-results/`).
- **Commands:** `npm run test:e2e`

## Common Commands
- `npm run dev`: Start dev server.
- `npx prisma db push`: Sync Prisma schema to SQLite database.
- `npx prisma format`: Format Prisma schema.

## Known Limitations
- File uploads are currently saved to the local filesystem (`public/uploads`), which is not scalable for serverless deployments (Vercel). Should be migrated to a Cloud Provider (S3/Cloudinary).
- No email provider is configured yet; password resets and magic links only log to the server console.

## Assumptions & Unknowns
- [Unknown] Whether the system will be deployed to a stateful server (VPS) or serverless (Vercel). This impacts the SQLite DB and local file upload implementation.
- [Assumption] `HEAD_ADMIN` equates to `SUPER_ADMIN` in legacy DB references.

## Maintenance Guidelines
- Always use `src/app/actions/audit.ts` (`requestAuditAction`) when implementing edit/delete functionality for historical records.
- When adding a new role or protected route, update the `ROLE_ROUTES` and `ROLE_HOME` matrices in `src/proxy.ts`.
- Run `npx prisma db push` after any `schema.prisma` modifications.
