# Scope: Milestone 1 - Audit & Core Compilation Fixes

## Architecture
The application is a Next.js 16 (App Router) and React 19 web application backed by a SQLite database via Prisma.
Key modules:
- **Authentication & RBAC**: NextAuth v5 beta with Credentials provider. JWT session callbacks encode role, branchId, and permissions. Middleware/proxy secures paths based on role and branch scoping.
- **Settings Module**: Profiles (name, email, password) and platform configurations updated via server actions.
- **HR & Staff Management**: Employee creation (roles other than STUDENT), leave management, and staff attendance log tracking.
- **Finance Module**: Payroll and course fee invoicing.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1.1 | Deep Audit | Perform deep logic & UI/UX audit of the entire codebase (permissions, auth, database edge cases, frontend visibility) to identify any existing bugs or security/logic issues. | None | DONE (Handoff reports archived) |
| M1.2 | Core Compilation Fixes | Ensure zero TypeScript, Next.js routing, or Prisma schema validation errors. Codebase must successfully compile (`npm run build`). | M1.1 | IN_PROGRESS (Worker dispatch pending) |

## Interface Contracts
- None defined for Milestone 1.

## Code Layout
- `prisma/schema.prisma` - Database schema defining User, Branch, Attendance, etc.
- `src/auth.ts` - NextAuth configuration & callbacks.
- `src/middleware.ts` - Middleware rules for route security and branch checks.
- `src/app/actions/` - Server actions executing business logic.
- `src/app/` - Application routes and views.
