# Codebase Discovery & Mapping Handoff

## 1. Observation

This read-only investigation analyzed the LMS ERP system codebase at `e:/LMS` to map its architecture, database models, authentication, settings, staff tracking, and project configuration.

### Project Directory Structure
The application follows a Next.js App Router layout structure within the `src/` directory:
- **Root-level config**:
  - `package.json`: Configures dependencies, scripts, and Turbopack builds.
  - `prisma/schema.prisma` & `prisma/seed.mjs`: Database schema and seeding script.
  - `src/auth.ts`: NextAuth configuration (handlers, callbacks, providers).
  - `src/middleware.ts` (Next.js middleware/proxy for session checks and routing protection).
  - `types/next-auth.d.ts`: Type overrides/augmentations for NextAuth sessions and users.
- **`src/components/`**:
  - `Header.tsx`: Server component rendering notification counts and user avatar details.
  - `Sidebar.tsx`: Navigation bar dynamically rendered based on user role and permissions.
- **`src/app/`**:
  - `layout.tsx`: Root Layout.
  - `page.tsx`: Redirects to `/login`.
  - `login/page.tsx`: Login credentials page using NextAuth's `signIn`.
  - `(dashboard)/`: Route group containing shared layout and branch portal views:
    - `layout.tsx`: Configures sidebar/header split screen.
    - `dashboard/page.tsx`: System overview displaying metrics (Active Students, Total Staff, Pending Fees).
    - `admin/branches/page.tsx` & `BranchTable.tsx`: Super Admin branch management.
    - `courses/`: List of courses (`page.tsx`, `CourseTable.tsx`) and curriculum builder (`[id]/builder/page.tsx` & `BuilderUI.tsx`).
    - `finance/`: Wallet, fee invoices, and payroll checks (`page.tsx`, `FinanceTable.tsx`).
    - `hr/employees/page.tsx` & `EmployeeTable.tsx`: HR panel managing employee records, roles, and permissions.
    - `hr/leaves/page.tsx` & `LeaveTable.tsx`: HR panel to submit, list, and approve/reject leave requests.
    - `learn/`: Student lesson/quiz player (`page.tsx`, `[courseId]/page.tsx` & `PlayerUI.tsx`).
    - `reports/page.tsx`: Financial collection and recent attendance logs.
    - `settings/page.tsx` & `SettingsForm.tsx`: User profile and password updates.
    - `students/page.tsx` & `StudentTable.tsx`: Student registration, batch enrollment, and student attendance logs.
  - `actions/`: Next.js Server Actions for operations:
    - `branches.ts`: Create/update branch entries.
    - `content.ts`: Curriculum builder actions (modules/lessons/questions).
    - `courses.ts`: Course management.
    - `finance.ts`: Invoicing, payments, and payroll.
    - `leaves.ts`: Submit/resolve leave requests.
    - `progress.ts`: Complete lessons and submit quiz scores.
    - `settings.ts`: Update user profile details and passwords.
    - `students.ts`: Enroll students and mark attendance.
    - `users.ts`: Add employee profiles.
  - `api/auth/[...nextauth]/route.ts`: Exposes NextAuth GET and POST handlers.

---

### Prisma Database Schema (`prisma/schema.prisma`)
The SQLite database schema defines the following models:
- **`Branch`**: Represents a specific franchise or headquarters location. Contains name, address, currency, timezone, and relations to `User`, `Course`, `Attendance`, and `Invoice`.
- **`User`**: Core account model. Contains fields: `id`, `branchId` (null for global), `name`, `email`, `password`, `role` (default `"STUDENT"`; options: `"SUPER_ADMIN"`, `"BRANCH_ADMIN"`, `"HR"`, `"FINANCE"`, `"INSTRUCTOR"`, `"STUDENT"`), `permissions` (JSON string for fine-grained permissions), `joinedAt`, `updatedAt`.
- **`Course`**: Relates to `Branch`. Contains course settings (`title`, `description`, `baseFee`) and relations to `Batch` and `Module`.
- **`Batch`**: Specific instance of a course. Contains `courseId`, `instructorId`, `name`, `capacity`.
- **`Enrollment`**: Links a student (`User`) to a `Batch`. Tracks `status` (`"ACTIVE"`, `"COMPLETED"`, `"DROPPED"`), `startDate`, and `endDate`.
- **`Attendance`**: Tracks physical/digital attendance. Contains `branchId`, `userId`, `type` (`"STUDENT"` or `"EMPLOYEE"`), `date`, `status` (`"PRESENT"`, `"ABSENT"`, `"LEAVE"`).
- **`LeaveRequest`**: Employee/Student leave submissions. Tracks `userId`, `startDate`, `endDate`, `reason`, `status` (`"PENDING"`, `"APPROVED"`, `"REJECTED"`).
- **`Invoice`**: Billed fee or salary. Contains `branchId`, `userId`, `amount`, `type` (`"FEE"` or `"PAYROLL"`), `status` (`"PENDING"`, `"PAID"`, `"CANCELLED"`), `dueDate`.
- **`Payment`**: Realized payments linked to an `Invoice` with `invoiceId`, `amount`, `paidAt`.
- **`Module`**: Section under a course. Tracks `title` and sequence `order`.
- **`Lesson`**: Course content within a module. Contains `title`, `content`, `videoUrl`, `type` (`"VIDEO"`, `"TEXT"`, `"QUIZ"`), sequence `order`.
- **`Question`**: Assessment query associated with a quiz-type `Lesson`. Contains `text`, `options` (JSON string), and `answer`.
- **`Progress`**: Connects `User` and `Lesson` to mark course completion and quiz scores. Has a unique constraint `@@unique([userId, lessonId])`.
- **`Notification`**: Broadcast messages/alerts for a specific `User`. Tracks `title`, `message`, and `read` status.

---

### Authentication and Session Setup
- **Config file**: `src/auth.ts`
- **Session Framework**: NextAuth v5 beta (`next-auth` version `^5.0.0-beta.31`).
- **Provider**: Credentials provider. Authorizes users using:
  ```typescript
  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string }
  });
  if (user && await bcrypt.compare(credentials.password as string, user.password)) {
    return { id: user.id, email: user.email, name: user.name, role: user.role, branchId: user.branchId, permissions: user.permissions };
  }
  ```
- **Callbacks**:
  - `jwt`: Encodes `role`, `branchId`, and `permissions` metadata into the token.
  - `session`: Attaches JWT metadata (`role`, `branchId`, `permissions`) to the `session.user` object.
- **Custom Sign In Page**: `/login` (declared in `pages: { signIn: '/login' }` inside `auth.ts`).
- **Route Authorization & Branch Scoping (`src/middleware.ts`)**:
  - Middleware intercepts requests matching `/((?!api|_next/static|_next/image|favicon.ico).*)`.
  - Redirects unauthenticated sessions to `/login`.
  - Restricts access to `/super-admin/*` routes to users with `role === "SUPER_ADMIN"`.
  - Scopes access to `/branch/[branchId]/*` routes. If a user is not `SUPER_ADMIN` and attempts to access a branchId distinct from their assigned `user.branchId`, they are redirected to `/branch/${user.branchId}/dashboard`.

---

### Settings Configuration
- **Routes**: `/settings` (handled in `src/app/(dashboard)/settings/page.tsx` and rendering `SettingsForm.tsx`).
- **Data Action**: Updates are processed via Server Actions defined in `src/app/actions/settings.ts`:
  - `updateProfile(formData)`: Verifies session, validates input, ensures the target email is not claimed by another account, updates `name` and `email` fields in the `User` model, and calls `revalidatePath` for `/settings` and `/dashboard`.
  - `updatePassword(formData)`: Validates that the new password meets a minimum length (6 characters), checks the correct current password using `bcrypt.compare`, hashes the new password using `bcrypt.hash` (10 rounds), saves it, and calls `revalidatePath("/settings")`.

---

### Staff Tracking Code and Integration Points
1. **Roles Available**: Non-student roles include `"SUPER_ADMIN"`, `"BRANCH_ADMIN"`, `"HR"`, `"FINANCE"`, `"INSTRUCTOR"`, and `"STAFF"`.
2. **Attendance Model**: In `prisma/schema.prisma`, `Attendance` model holds records of both `"STUDENT"` and `"EMPLOYEE"` types:
   ```prisma
   model Attendance {
     id        String   @id @default(cuid())
     branchId  String
     userId    String
     type      String   // STUDENT, EMPLOYEE
     date      DateTime
     status    String   // PRESENT, ABSENT, LEAVE
     // ...
   }
   ```
3. **Record Attendance Server Action**: Located in `src/app/actions/students.ts`:
   - `recordAttendance(formData: FormData)` extracts `userId`, `status`, `type` (`STUDENT` or `EMPLOYEE`), and `branchId`.
   - Inserts the log into the `Attendance` table.
   - For employees, it calls `revalidatePath("/hr/employees")`.
4. **Leave Management**: Located in `src/app/actions/leaves.ts`:
   - `requestLeave(formData)` inserts a `LeaveRequest` with `"PENDING"` status.
   - `resolveLeave(formData)` allows `SUPER_ADMIN`, `BRANCH_ADMIN`, or `HR` to update status to `"APPROVED"` or `"REJECTED"`.
5. **Dashboard Staff Metrics**: Inside `src/app/(dashboard)/dashboard/page.tsx`, line 28 states:
   ```typescript
   // Simplified "Staff Present" logic: For now, just count staff who joined (or later we query Attendance).
   ```
6. **Navigation Constraints**: In `src/components/Sidebar.tsx`, the `STAFF` role is only permitted to view the `"Settings"` link (line 41). The `"Overview"` (dashboard) link does not list `"STAFF"` under its `roles` array (line 33).
7. **Staff Integration Points**:
   - Geolocation or check-in tracking could be integrated by updating `Attendance` (adding `latitude`, `longitude`, `checkInTime`, `checkOutTime` fields) or by introducing a `StaffTrack` table in the database schema.
   - A dedicated server action `src/app/actions/staff.ts` can be introduced to handle geolocation checks.
   - A staff check-in panel can be built under `src/app/(dashboard)/staff/` or integrated within `/dashboard` once the role list is expanded.

---

### Package Configuration (`package.json`)
- **App Name**: `tmp-app`
- **Core Dependencies**:
  - `next`: `16.2.10`
  - `react`/`react-dom`: `19.2.4`
  - `@prisma/client`/`prisma`: `^5.22.0`
  - `next-auth`: `^5.0.0-beta.31`
  - `bcryptjs`/`@types/bcryptjs`: `^3.0.3` / `^2.4.6`
  - `lucide-react`: `^1.23.0`
- **Dev Dependencies**:
  - `tailwindcss`/`@tailwindcss/postcss`: `^4` (Tailwind v4)
  - `typescript`: `^5`
  - `eslint`/`eslint-config-next`: `^9` / `16.2.10`
- **Scripts**:
  - `"dev"`: `"next dev"`
  - `"build"`: `"next build"`
  - `"start"`: `"next start"`
  - `"lint"`: `"eslint"`
- **Deprecations observed during build**:
  - Turbopack warning during next build: `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy`

---

## 2. Logic Chain

The conclusions drawn in this report follow directly from these steps:
1. Checked `package.json` to identify scripts, React 19, Next.js 16, and NextAuth v5 beta (`5.0.0-beta.31`).
2. Examined `prisma/schema.prisma` which directly outlines all database relations and data structures, showing the roles supported and relationships among students, staff, classes, and financial metrics.
3. Examined `src/auth.ts` and `src/middleware.ts` to trace auth authorization logic, identifying the custom JWT credentials flow, branch restriction redirect rules, and role constraints.
4. Traced `src/app/actions/settings.ts` and `src/app/(dashboard)/settings/page.tsx` to understand the settings flow (profile modification and password hash validation).
5. Queried references to "staff" and "attendance" across all files, revealing that staff tracking currently falls back to `Attendance` of type `"EMPLOYEE"`, leave request resolutions, and placeholder counts in the dashboard.
6. Conducted a Next.js compilation step (`npm run build`) which verified that all files are syntactically and structurally correct, confirming that standard next build warnings appear for deprecated middleware files.

---

## 3. Caveats

- We did not write or modify any code.
- We did not connect to external endpoints or check database runtime states outside of static configuration and static schema definitions.
- The `DATABASE_URL` is configured through a `.env` file referencing a local SQLite db (`file:./dev.db`). No external database drivers were evaluated.
- No other search or documentation tool was utilized besides reading files locally via `view_file` and searching paths via `find_by_name` and Powershell searches.

---

## 4. Conclusion

The LMS ERP codebase is a Next.js 16 (App Router) and React 19 web application backed by SQLite (Prisma). It implements full role-based access control (RBAC) via NextAuth v5, with page guards routing regular users to their specific branches and limiting administration dashboards to branch admins, HR, finance, instructors, and super admins. Staff tracking features are partially implemented through common attendance logs and leave requests, but require schema expansion and UI views (like a staff check-in dashboard) to track real-time geolocation and check-in timelines.

---

## 5. Verification Method

To verify the codebase setup and compilation:
1. Ensure node packages are installed and run:
   ```bash
   npm run build
   ```
   The build must compile successfully, yielding Turbopack output and route lists.
2. Confirm the database migration is in place by running:
   ```bash
   npx prisma db pull
   ```
   or viewing `prisma/schema.prisma` directly.
3. Validate session schema structure inside `src/auth.ts` and session type safety in `types/next-auth.d.ts`.
