# Project: LMS ERP System Completion & Audit

## Architecture
The application is a Next.js 16 (App Router) and React 19 web application backed by a SQLite database via Prisma.
Key modules:
- **Authentication & RBAC**: NextAuth v5 beta with Credentials provider. JWT session callbacks encode role, branchId, and permissions. Middleware/proxy secures paths based on role and branch scoping.
- **Settings Module**: Profiles (name, email, password) and platform configurations updated via server actions.
- **HR & Staff Management**: Employee creation (roles other than STUDENT), leave management, and staff attendance log tracking.
- **Finance Module**: Payroll and course fee invoicing.

## Code Layout
- `prisma/schema.prisma` - Database schema defining User, Branch, Attendance, etc.
- `src/auth.ts` - NextAuth configuration & callbacks.
- `src/middleware.ts` - Middleware rules for route security and branch checks.
- `src/app/actions/` - Server actions executing business logic.
- `src/app/(dashboard)/settings/` - Profile management pages.
- `src/app/(dashboard)/hr/` - Staff profiles, leaves, and attendance management.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Audit & Core Compilation Fixes | Perform deep logic & UI/UX audit, ensure zero TypeScript, Next.js routing, and Prisma errors. Codebase must compile. | None | IN_PROGRESS (Conv: 5be63874-ad9e-4930-83b3-5ad6efd01ec2) |
| M2 | Settings Module Expansion | Support platform & profile settings for normal users and admin. Integrate updates to persist across session logic. | M1 | PLANNED |
| M3 | Staff Bio-Data & Attendance | Update Prisma schema with bio-data and attendance tracking. Push migrations, seed database, build staff pages. | M2 | PLANNED |
| M4 | Final Integration & E2E Verification | Pass all E2E tests (Tiers 1-4) and run adversarial coverage testing (Tier 5). | M3, E2E_READY | PLANNED |

## Interface Contracts
### Settings Schema Update
- `User` model extended with:
  - `phone`: String? (contact numbers)
  - `bio`: String? (detailed bio-data)
  - `education`: String? (educational background)
  - `theme`: String @default("light") (profile/platform settings configuration)
  - `notificationsEnabled`: Boolean @default(true) (profile/platform settings configuration)

### Settings Server Action Update (`src/app/actions/settings.ts`)
- `updateProfile(formData: FormData)` must validate and save:
  - `name`, `email`, `phone`, `bio`, `education`, `theme`, `notificationsEnabled`.
- Must trigger session/token updates to persist settings updates.

### Staff Attendance Server Action & Views
- `recordAttendance` in `src/app/actions/students.ts` handles employee types correctly.
- Add `/hr/attendance` page or similar UI for recording employee attendance.
