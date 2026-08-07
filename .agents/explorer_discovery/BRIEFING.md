# BRIEFING — 2026-07-03T16:59:28Z

## Mission
Map out the LMS ERP system codebase, including project structure, database schema, authentication, settings, staff tracking, and package config.

## 🔒 My Identity
- Archetype: Codebase Discovery Explorer
- Roles: Explorer, Analyst
- Working directory: e:/LMS/.agents/explorer_discovery
- Original parent: 11df5ad0-a56f-4850-baed-38a483b797b1
- Milestone: Codebase Discovery

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify any source files
- Write findings to e:/LMS/.agents/explorer_discovery/handoff.md following GSD Handoff Protocol
- Network mode: CODE_ONLY (no external connections)

## Current Parent
- Conversation ID: 11df5ad0-a56f-4850-baed-38a483b797b1
- Updated: 2026-07-03T17:00:00Z

## Investigation State
- **Explored paths**:
  - `prisma/schema.prisma` & `prisma/seed.mjs`
  - `package.json`
  - `src/auth.ts` & `src/middleware.ts`
  - `src/app/` (all directories/routes, page.tsx components, server actions)
  - `src/components/` (Header, Sidebar)
  - `types/next-auth.d.ts`
- **Key findings**:
  - Codebase is a Next.js 16 App Router application.
  - The "middleware" convention is deprecated in this version in favor of "proxy".
  - Database schema includes 14 SQLite models managing branches, users, courses, batches, enrollments, attendances, leave requests, finance, content, progress, and notifications.
  - Authentication utilizes NextAuth v5 beta, integrating roles and branchId to restrict user access to their own branches (with Super Admin override).
  - Staff tracking exists via the Attendance model (supports EMPLOYEE and STUDENT types) and LeaveRequests. HR can manage employee profiles.
  - Settings are handled via server actions that update basic profile fields (name, email) and passwords.
- **Unexplored areas**: None.

## Key Decisions Made
- Performed mapping of the whole repository and executed a test build to ensure project compiles properly.

## Artifact Index
- e:/LMS/.agents/explorer_discovery/handoff.md — Codebase discovery handoff report
