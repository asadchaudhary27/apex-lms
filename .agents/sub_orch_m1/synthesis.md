# Synthesized Audit & Fix Plan: Milestone 1

Based on the three parallel explorer audits, we have identified critical issues in the LMS ERP system across security, database consistency, Next.js build compilation, and UI/UX. Below is the consolidated list of issues and the exact plan of action for remediation.

---

## 1. Identified Issues & Severity

### A. Authentication & Session Setup (Critical)
1. **Missing `session.user.id`**: The NextAuth session callback in `src/auth.ts` fails to assign `session.user.id = token.sub`, resulting in `id` being `undefined` at runtime for all users. This breaks user progress, notifications, and student course access.
2. **Next-Auth Type Augmentations**: The `types/next-auth.d.ts` file is missing `permissions` on `Session["user"]` and `User` models, and is missing the `JWT` interface augmentation in `next-auth/jwt`.

### B. Access Control & Authorization (Critical)
3. **Route Guard Bypass in Middleware**: `src/middleware.ts` protects `/super-admin`, which is not used. The actual branches administrative page is at `/admin/branches`, and routes like `/hr`, `/finance`, and `/reports` are completely unguarded.
4. **No Server-Side Role/Permission Check in Pages**: Protected pages (e.g., `/admin/branches`, `/finance`, `/hr/employees`, `/students`, `/courses`, `/courses/[id]/builder`) do not verify roles on the server side, allowing any student to access them by manually typing the URL.
5. **No Scoping Check in Server Actions (BOLA)**: Server Actions like `createBatch`, `resolveLeave`, `processPayment`, `enrollStudent`, and course content creations accept IDs from client forms without validating that they belong to the actor's branch.
6. **Privilege Escalation in User Creation**: `createUser` in `src/app/actions/users.ts` allows any HR/Branch Admin to create users with arbitrary roles (like `SUPER_ADMIN`) and permissions.
7. **No Course Enrollment Check**: Students can access the course player page `/learn/[courseId]` directly by typing the URL without being enrolled in that course.

### C. Information Disclosure (High)
8. **Quiz Answer Leak**: In `/courses/[id]/builder/page.tsx` and `/learn/[courseId]/page.tsx`, querying questions with `questions: true` includes the correct `answer` field and sends it in plaintext to the client payload, enabling cheating.

### D. Data Consistency & Code Bugs (High)
9. **Ignored Enrollment Dates**: In `enrollStudent` (`src/app/actions/students.ts`), the parsed `startDate` and `endDate` fields are never passed to the `prisma.enrollment.create` function, resulting in data loss.
10. **Division by Zero**: In `submitQuiz` (`src/app/actions/progress.ts`), if `lesson.questions.length` is 0, the code calculates `correctCount / 0`, producing `NaN` and crashing.
11. **Missing Transactions**: `processPayment` and `generateInvoice` in `src/app/actions/finance.ts` execute multiple database writes outside of transactional boundaries.
12. **Prisma Client Multi-Instantiation**: In 15+ actions and page files, `const prisma = new PrismaClient();` is declared globally, risking connection pool exhaustion and SQLite locking.
13. **Unfiltered Query Mismatch**: `whereClause` in `dashboard/page.tsx`, `hr/employees/page.tsx`, etc., uses `branchId || undefined`. If `branchId` is null/undefined, this evaluates to `{}` (omitted filter), returning data for all branches to unauthorized users.

### E. Next.js 16 Build & Lint Errors (High)
14. **Unescaped Quote Build Blocker**: `src/app/(dashboard)/dashboard/page.tsx` uses `what's` instead of `what&apos;s`, triggering an ESLint rule that blocks the production build.
15. **Deprecated Middleware**: Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`, which raises a warning on build.
16. **Linting Errors (50 problems)**: Multiple instances of implicit `any` usage, unused variables, and type safety issues across files.

---

## 2. Step-by-Step Remediation Plan

### Step 1: Create Prisma Client Singleton
- Implement `src/lib/db.ts` to export a single instance of `PrismaClient`.
- Search-and-replace all instances of `const prisma = new PrismaClient();` with imports of the singleton database client (`import { db } from "@/lib/db"`).

### Step 2: Fix Auth Types & Session Mapping
- Update `types/next-auth.d.ts` to extend the NextAuth models and `JWT` token module:
  - Add `permissions: string` to `User` and `Session["user"]`.
  - Augment `next-auth/jwt` to include `role`, `branchId`, and `permissions` keys on the `JWT` interface.
- Update the `session` callback in `src/auth.ts` to set `session.user.id = token.sub as string;`.

### Step 3: Implement Auth Helpers & Security Checks
- Create a utility file `src/lib/auth-helpers.ts` (or similar) containing:
  - `verifyBranchAccess(sessionUser, targetBranchId)`: Throws if user is not `SUPER_ADMIN` and `targetBranchId !== user.branchId`.
  - An assertion helper to check roles and permissions.
- Validate and secure `createUser` in `src/app/actions/users.ts`:
  - Ensure HR or Branch Admins cannot assign roles higher than or equal to their own. Specifically, reject any attempt to assign `SUPER_ADMIN`.
  - Validate that the target user's `branchId` matches the creator's `branchId` if the creator is not a `SUPER_ADMIN`.

### Step 4: Enforce Page-Level guards
- Add server-side role and session checks at the top of all administrative page views to redirect unauthorized sessions:
  - `/admin/branches/page.tsx`
  - `/finance/page.tsx`
  - `/hr/employees/page.tsx`
  - `/students/page.tsx`
  - `/courses/page.tsx`
  - `/courses/[id]/builder/page.tsx`

### Step 5: Secure Server Actions (BOLA & Transactions)
- Update actions under `src/app/actions/`:
  - For all database writes and reads referencing a `branchId` or specific entity (e.g. course, invoice, leave, student, batch, module, lesson, question), ensure the actor is either `SUPER_ADMIN` or that the entity's `branchId` matches `session.user.branchId`.
  - Wrap database operations in `db.$transaction` for payment processing and invoice installment loops.
  - Fix the enrollment date bug in `students.ts` by saving `startDate` and `endDate` in the DB.
  - Guard `submitQuiz` against `lesson.questions.length === 0`.

### Step 6: Next.js 16 Proxy Compliance
- Rename `src/middleware.ts` to `src/proxy.ts`.
- Adjust imports and structure inside `src/proxy.ts` to match Next.js 16 conventions:
  - Correct the route-level guards to cover `/admin` and other protected dashboard subpaths, preventing access if role is not allowed.

### Step 7: Resolve ESLint and Formatting Blocker
- Escape the single quote in `dashboard/page.tsx` to resolve the ESLint build blocker.
- Go through lint errors and fix `any` casts, unused variables, and other formatting warnings.
- Run `npm run build` to verify successful compilation with zero warnings or errors.
