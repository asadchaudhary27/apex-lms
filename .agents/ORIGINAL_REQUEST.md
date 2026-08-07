# Original User Request

## Initial Request — 2026-07-03T16:58:46Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

An automated comprehensive full-stack audit and completion pass on the LMS ERP System. The team will resolve UI and deep logic bugs, and implement missing features including advanced user settings and comprehensive staff tracking.

Working directory: e:/LMS
Integrity mode: development

## Requirements

### R1. Comprehensive Full-Stack Audit & Bug Fixes
The team must perform a deep logic and UI/UX audit of the entire codebase (permissions, auth, database edge cases, frontend visibility) and resolve any identified issues.

### R2. Settings Module Expansion
Expand the settings functionality for admin and normal users to encompass comprehensive platform and profile configuration.

### R3. Staff Attendance & Bio-Data Tracking
Implement a robust staff management feature that tracks staff attendance, name, contact numbers, detailed bio-data, and educational background.

## Acceptance Criteria

### Verification & Testing
- [ ] **R1 (Audit):** The codebase must compile successfully (`npm run build`) with zero TypeScript, Next.js routing, or Prisma schema validation errors.
- [ ] **R2 (Settings):** A test script must successfully update a user's settings in the database and verify the changes persist across NextAuth session logic.
- [ ] **R3 (Staff Tracking):** The Prisma database schema must be updated with `Attendance` and staff bio-data fields, successfully migrated (`npx prisma db push`), and a seeded script must insert test staff data without throwing foreign key or relational constraint errors.
- [ ] **General UI:** All new pages (Settings, Staff Attendance) must render successfully on the local Next.js dev server without throwing 500 Server Errors or React Hydration mismatches.
