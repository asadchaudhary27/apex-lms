# M1 Frontend Layout & UI/UX Audit Report

## 1. Observation

A detailed audit of the layout files, navigation components, middleware, route views, and server actions under `src/` revealed several critical security, runtime, compilation, and UI/UX issues.

### 1.1 `src/auth.ts`
- **Verbatim Code (Lines 52-59):**
  ```typescript
      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.role as string;
          session.user.branchId = token.branchId as string;
          (session.user as any).permissions = token.permissions as string;
        }
        return session;
      }
  ```
- **Finding:** The `session` callback copies `role`, `branchId`, and `permissions` from the JWT token to `session.user`, but completely omits the user's database `id` (contained in `token.sub` or `token.id`). Consequently, `session.user.id` is `undefined` at runtime.

### 1.2 `src/middleware.ts`
- **Verbatim Code (Lines 28-30):**
  ```typescript
    // Enforce Super Admin paths
    if (nextUrl.pathname.startsWith('/super-admin') && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  ```
- **Finding:** The middleware checks for paths starting with `/super-admin`, but the branch management route is configured as `/admin/branches` (see `src/components/Sidebar.tsx` line 34). The path `/admin/` is not covered by any middleware guards.

### 1.3 `src/app/(dashboard)/admin/branches/page.tsx`
- **Verbatim Code (Lines 6-12):**
  ```typescript
  export default async function BranchesPage() {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" }
    });

    return <BranchTable branches={branches} />;
  }
  ```
- **Finding:** There is no server-side role check or authorization guard at the page level.

### 1.4 Route Views under `src/app/(dashboard)/`
- **Finding:** The following route view pages fetch data and render administrative components without checking the user's role or permissions at runtime:
  - `src/app/(dashboard)/finance/page.tsx` (exposes all fee & payroll invoices of the branch to any logged-in user, including students and instructors).
  - `src/app/(dashboard)/students/page.tsx` (exposes student roster and emails to any user, including students).
  - `src/app/(dashboard)/hr/employees/page.tsx` (exposes all staff profiles, names, and emails).
  - `src/app/(dashboard)/courses/page.tsx` (exposes course catalog management to any user, including students).
  - `src/app/(dashboard)/courses/[id]/builder/page.tsx` (exposes course builder modules/lessons list and loaded questions to any user).

### 1.5 Course Builder Questions Query (`src/app/(dashboard)/courses/[id]/builder/page.tsx`)
- **Verbatim Code (Lines 14-17):**
  ```typescript
            lessons: {
              orderBy: { order: 'asc' },
              include: { questions: true }
            }
  ```
- **Finding:** Since the builder page is accessible to anyone and queries lessons including `questions` (which contains the correct `answer` field in the schema), the raw answers are transmitted to the browser in the React Server Component (RSC) payload. Any student can inspect these props in DevTools and obtain all correct answers.

### 1.6 Course Player Enrollment Guard (`src/app/(dashboard)/learn/[courseId]/page.tsx`)
- **Verbatim Code (Lines 8-27):**
  ```typescript
  export default async function CoursePlayerPage({ params }: { params: { courseId: string } }) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      ...
  ```
- **Finding:** The player page does not check if the user is enrolled in the course. Any logged-in user can access the full course content by visiting `/learn/[courseId]`.

### 1.7 `src/app/actions/students.ts`
- **Verbatim Code (Lines 9-38):**
  ```typescript
  export async function enrollStudent(formData: FormData) {
    ...
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;
    ...
    await prisma.enrollment.create({
      data: {
        userId,
        batchId,
        status: "ACTIVE"
      }
    });
  ```
- **Finding:** The `startDate` and `endDate` parsed from form data are never saved in the database during `prisma.enrollment.create`, leading to data loss. They are flagged as unused variables by ESLint.

### 1.8 `src/app/(dashboard)/dashboard/page.tsx`
- **Verbatim Code (Line 41):**
  ```typescript
  <p className="text-gray-500 mt-1">Here is what's happening at {branchName} today.</p>
  ```
- **Finding:** The unescaped single quote in `what's` causes a build-blocking ESLint error under standard Next.js build constraints.
- **Metrics Visibility:** The dashboard queries and returns branch-wide financial statistics (`pendingFees`) to all users, including students.

### 1.9 `src/components/Sidebar.tsx`
- **Verbatim Code (Line 30):**
  ```typescript
  const userPermissions = user.permissions ? JSON.parse(user.permissions) : [];
  ```
- **Finding:** `JSON.parse` is performed directly on `user.permissions` without a `try-catch` wrapper. If the database record contains a malformed JSON string, the entire layout crashes, rendering the app unusable.
- **Navigation Menu Filter:**
  ```typescript
  const visibleNav = navigation.filter(item => 
    item.roles.includes(role) || (item.perm && userPermissions.includes(item.perm))
  );
  ```
  This is an `OR` check. If a user matches the role list, they can see the menu item even if they lack the required granular permission, making granular permission checks redundant for those roles.
- **Link Missing:** The student learning portal route (`/learn`) is completely omitted from the sidebar, giving students no visual navigation entry point.

---

## 2. Logic Chain

1. **Missing `session.user.id`**:
   - `src/auth.ts` does not assign `session.user.id = token.sub` in its `session` callback (Observation 1.1).
   - This results in `session.user.id` being `undefined` in all server/client components.
   - Database queries that rely on `userId: session.user.id` (such as `/learn` for fetching active student enrollments, Header notifications count, and progress mutations) will query for `undefined` or fail.
   - Therefore, students are met with a blank page on `/learn`, unread notifications display as 0, and completing lessons or submitting quizzes throws database errors at runtime.

2. **Access Control Bypass**:
   - The route `/admin/branches` is designed for Super Admins (Observation 1.9).
   - The middleware checks for `/super-admin`, completely bypassing `/admin/branches` (Observation 1.2).
   - The route view page itself does not perform any role check (Observation 1.3).
   - Consequently, any authenticated user can bypass the UI and type `/admin/branches` in the browser to view the branch management table.
   - This same page-level security gap applies to `/finance`, `/students`, `/hr/employees`, `/courses`, and `/courses/[id]/builder` (Observation 1.4).

3. **Answer Leak & Enrollment Bypass**:
   - The Course Builder page (`/courses/[id]/builder`) includes quiz questions with their answers and is fully accessible to any user (Observation 1.5).
   - The Course Player page (`/learn/[courseId]`) serves complete course contents to any authenticated user without validating their enrollment (Observation 1.6).
   - This allows any student to view un-enrolled course contents and extract quiz answers directly from the client data payload.

4. **Ignored Variables & Build Blocks**:
   - `enrollStudent` parses but fails to persist `startDate` and `endDate` fields in `prisma.enrollment.create` (Observation 1.7).
   - `src/app/(dashboard)/dashboard/page.tsx` contains an unescaped single quote in `what's` (Observation 1.8), causing ESLint to fail and blocking production build compiles.

---

## 3. Caveats

- **Mock/Real Authentication**: We assume the Next-Auth provider configuration relies on the database for user record extraction. If credentials are mock or external, the schema/user details mapping in `auth.ts` might require adjustment.
- **Role Permissions Design**: It is assumed that granular permissions (e.g. `MANAGE_COURSES`) should be checked on top of roles at the server action and page levels. If the design intent was strictly role-based, the granular permissions column in the database and the checks in the sidebar should be deprecated.

---

## 4. Conclusion

The application has multiple severe security vulnerabilities (broken access control, information disclosure/quiz answer leak, lack of enrollment verification) and critical functional defects (missing user ID in session, ignored enrollment dates, and crash-prone JSON parsing).

We recommend implementing the following remediation patches to ensure secure access control, robust data persistence, and compile-ready status.

### 4.1 Proposed Diff Patches

#### Patch 1: Fix `session.user.id` mapping in `src/auth.ts`
```diff
--- src/auth.ts
+++ src/auth.ts
@@ -53,3 +53,4 @@
       if (session.user) {
+        session.user.id = token.sub as string;
         session.user.role = token.role as string;
         session.user.branchId = token.branchId as string;
```

#### Patch 2: Correct middleware route boundaries in `src/middleware.ts`
```diff
--- src/middleware.ts
+++ src/middleware.ts
@@ -27,4 +27,4 @@
   // Enforce Super Admin paths
-  if (nextUrl.pathname.startsWith('/super-admin') && user?.role !== 'SUPER_ADMIN') {
+  if (nextUrl.pathname.startsWith('/admin') && user?.role !== 'SUPER_ADMIN') {
     return NextResponse.redirect(new URL('/dashboard', nextUrl));
   }
```

#### Patch 3: Secure Page Routes via Server-side Role Check
Add role and session checks at the top of these page views:
- `src/app/(dashboard)/admin/branches/page.tsx`
- `src/app/(dashboard)/finance/page.tsx`
- `src/app/(dashboard)/hr/employees/page.tsx`
- `src/app/(dashboard)/students/page.tsx`
- `src/app/(dashboard)/courses/page.tsx`
- `src/app/(dashboard)/courses/[id]/builder/page.tsx`

*Example Patch for `src/app/(dashboard)/courses/[id]/builder/page.tsx`:*
```diff
--- src/app/(dashboard)/courses/[id]/builder/page.tsx
+++ src/app/(dashboard)/courses/[id]/builder/page.tsx
@@ -2,3 +2,5 @@
 import { PrismaClient } from "@prisma/client";
 import { notFound } from "next/navigation";
+import { auth } from "@/auth";
+import { redirect } from "next/navigation";
 import BuilderUI from "./BuilderUI";
@@ -7,2 +9,7 @@
 export default async function CourseBuilderPage({ params }: { params: { id: string } }) {
+  const session = await auth();
+  if (!session?.user || !["SUPER_ADMIN", "BRANCH_ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
+    redirect("/courses");
+  }
   const course = await prisma.course.findUnique({
```

#### Patch 4: Enforce Course Enrollment Verification in `src/app/(dashboard)/learn/[courseId]/page.tsx`
```diff
--- src/app/(dashboard)/learn/[courseId]/page.tsx
+++ src/app/(dashboard)/learn/[courseId]/page.tsx
@@ -12,2 +12,12 @@
   if (!userId) return null;
+
+  const enrollment = await prisma.enrollment.findFirst({
+    where: {
+      userId,
+      batch: { courseId: params.courseId },
+      status: "ACTIVE"
+    }
+  });
+  const isStaff = ["SUPER_ADMIN", "BRANCH_ADMIN", "INSTRUCTOR"].includes(session?.user?.role || "");
+  if (!enrollment && !isStaff) {
+    redirect("/learn");
+  }
```

#### Patch 5: Save Enrollment Start and End Dates in `src/app/actions/students.ts`
```diff
--- src/app/actions/students.ts
+++ src/app/actions/students.ts
@@ -34,3 +34,5 @@
       userId,
       batchId,
+      startDate,
+      endDate,
       status: "ACTIVE"
```

#### Patch 6: Escape Quote in `src/app/(dashboard)/dashboard/page.tsx`
```diff
--- src/app/(dashboard)/dashboard/page.tsx
+++ src/app/(dashboard)/dashboard/page.tsx
@@ -41,3 +41,3 @@
-        <p className="text-gray-500 mt-1">Here is what's happening at {branchName} today.</p>
+        <p className="text-gray-500 mt-1">Here is what&apos;s happening at {branchName} today.</p>
```

#### Patch 7: Add Student Portal Navigation Link and Safe JSON Parsing in `src/components/Sidebar.tsx`
```diff
--- src/components/Sidebar.tsx
+++ src/components/Sidebar.tsx
@@ -30,3 +30,11 @@
-  const userPermissions = user.permissions ? JSON.parse(user.permissions) : [];
+  let userPermissions = [];
+  if (user.permissions) {
+    try {
+      userPermissions = JSON.parse(user.permissions);
+    } catch (e) {
+      console.error("Malformed permissions in user profile:", e);
+    }
+  }
 
   const navigation = [
     { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "BRANCH_ADMIN", "HR", "FINANCE", "INSTRUCTOR", "STUDENT"] },
+    { name: "My Learning", href: "/learn", icon: BookOpen, roles: ["STUDENT", "INSTRUCTOR", "SUPER_ADMIN", "BRANCH_ADMIN"] },
     { name: "Branches", href: "/admin/branches", icon: Building2, roles: ["SUPER_ADMIN"] },
```

---

## 5. Verification Method

To independently verify these issues and their remediation, run the following:

1. **Verify Compilation & ESLint Rules**:
   - Command: `npx eslint .`
   - Initial Result: Displays `react/no-unescaped-entities` build blocker in `dashboard/page.tsx`, and warnings for unused `startDate`/`endDate` variables in `src/app/actions/students.ts` (proving they are ignored by the enrollment mutation).
   - Post-remediation: Command should pass with 0 errors.

2. **Inspect RSC Payloads (DevTools)**:
   - Login as a student.
   - Navigate directly to `/courses/1/builder` (where `1` is a valid course ID).
   - Inspect network request/RSC payload. You will see full quiz question objects, including the `answer` string, proving the answers leak.
   - Verify that adding role restrictions on `/courses/[id]/builder` correctly triggers a redirect back to `/courses` and blocks rendering.

3. **Verify Session User ID Presence**:
   - Access the dashboard or learn catalog as any logged-in user.
   - Check if `/learn` displays an empty catalog due to `userId` being `undefined` (which evaluates `!userId` to true and returns `null`).
   - Confirm that the `session.user.id` mapping fix restores catalog visibility.
