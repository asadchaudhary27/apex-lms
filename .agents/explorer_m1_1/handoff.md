# Security and Logic Audit Report: Authentication, Session, and RBAC

This report presents the findings of a deep security and logic audit of the Authentication, Session, and Role-Based Access Control (RBAC) implementation in the Learning Management System (LMS) codebase.

---

## 1. Observations

Below are the exact file paths, line numbers, and code snippets of the vulnerabilities, logic issues, and compilation/typing concerns identified.

### Observation A: Critical Route-Level Guard Bypass in Middleware
- **File**: `src/middleware.ts` (Lines 27-30, 32-45)
- **Code**:
  ```typescript
  28:   if (nextUrl.pathname.startsWith('/super-admin') && user?.role !== 'SUPER_ADMIN') {
  29:     return NextResponse.redirect(new URL('/dashboard', nextUrl));
  30:   }
  31: 
  32:   // Branch routing boundary
  33:   // Example: /branch/[branchId]/...
  34:   if (nextUrl.pathname.startsWith('/branch/')) {
  ```
- **Context**: 
  - The middleware protects `/super-admin` paths. However, there are no routes starting with `/super-admin` in the application structure.
  - The folder for branch management is named `admin` (e.g. `src/app/(dashboard)/admin/branches/page.tsx`), so the pathname is `/admin/branches`, which completely bypasses the `/super-admin` check.
  - Furthermore, the `/branch/` boundary check is dead code because there are no `/branch/...` routes in the application router.
  - No check exists in middleware to enforce roles/permissions for `/admin/...`, `/hr/...`, `/finance/...`, `/students/...`, or `/reports/...`.

### Observation B: No RBAC Enforcements in Server Pages (Data Leakage)
- **Files**: 
  - `src/app/(dashboard)/admin/branches/page.tsx` (Lines 6-12)
  - `src/app/(dashboard)/hr/employees/page.tsx` (Lines 7-24)
  - `src/app/(dashboard)/finance/page.tsx` (Lines 7-25)
  - `src/app/(dashboard)/reports/page.tsx` (Lines 6-30)
  - `src/app/(dashboard)/students/page.tsx` (Lines 7-27)
  - `src/app/(dashboard)/courses/page.tsx` (Lines 7-27)
- **Code Examples**:
  - `src/app/(dashboard)/admin/branches/page.tsx`:
    ```typescript
    6: export default async function BranchesPage() {
    7:   const branches = await prisma.branch.findMany({
    8:     orderBy: { createdAt: "desc" }
    9:   });
    10: 
    11:   return <BranchTable branches={branches} />;
    12: }
    ```
  - `src/app/(dashboard)/finance/page.tsx`:
    ```typescript
    7: export default async function FinancePage() {
    8:   const session = await auth();
    9:   
    10:   const whereClause = session?.user?.role === "SUPER_ADMIN" 
    11:     ? {} 
    12:     : { branchId: session?.user?.branchId };
    ```
- **Context**: None of these Page Components check if the user possesses the required role or fine-grained permissions. For example, a user with the `STUDENT` role can visit `/admin/branches` (viewing all branches), `/hr/employees` (viewing all branch employees and all system branches), `/finance` (viewing all branch invoices, student fees, and staff payrolls), and `/reports` (viewing total fees collected and total payroll).

### Observation C: Missing Branch-Scope Enforcement in Server Actions (Cross-Branch Manipulation)
- **Files**: 
  - `src/app/actions/courses.ts` (Lines 36-57)
  - `src/app/actions/finance.ts` (Lines 9-77)
  - `src/app/actions/leaves.ts` (Lines 30-45)
  - `src/app/actions/students.ts` (Lines 9-73)
  - `src/app/actions/content.ts` (Lines 9-64)
- **Code Examples**:
  - `createBatch` in `src/app/actions/courses.ts`:
    ```typescript
    36: export async function createBatch(formData: FormData) {
    37:   const session = await auth();
    ...
    47:   await prisma.batch.create({
    48:     data: {
    49:       name,
    50:       courseId,
    ```
  - `processPayment` in `src/app/actions/finance.ts`:
    ```typescript
    48: export async function processPayment(formData: FormData) {
    49:   const session = await auth();
    ...
    56:   const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    ```
- **Context**: In actions like `createBatch`, `generateInvoice`, `processPayment`, `resolveLeave`, `enrollStudent`, and `createModule/Lesson`, non-SUPER_ADMIN actors (like `BRANCH_ADMIN`, `HR`, `INSTRUCTOR`, `FINANCE`) can pass arbitrary IDs (e.g., of courses, users, invoices, leave requests) belonging to other branches. The actions execute without verifying that the referenced entities belong to the actor's branch.

### Observation D: Privilege Escalation via User Creation Form
- **File**: `src/app/actions/users.ts` (Lines 10-38)
- **Code**:
  ```typescript
  10: export async function createUser(formData: FormData) {
  11:   const session = await auth();
  12:   if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "BRANCH_ADMIN" && session.user.role !== "HR")) {
  13:     throw new Error("Unauthorized to create users");
  14:   }
  15: 
  16:   const name = formData.get("name") as string;
  17:   const email = formData.get("email") as string;
  18:   const role = formData.get("role") as string;
  19:   let branchId = formData.get("branchId") as string;
  20:   const permissions = formData.get("permissions") as string || "[]";
  ```
- **Context**: `createUser` allows a `BRANCH_ADMIN` or `HR` user to create new users. However, the action does not validate the `role` or `permissions` fields passed in `formData`. Consequently, a branch admin or HR user can create a `SUPER_ADMIN` user or grant themselves/others elevated fine-grained permissions.

### Observation E: LMS Quiz Correct Answer Leaked in Page Payloads
- **File**: `src/app/(dashboard)/learn/[courseId]/page.tsx` (Lines 8-36)
- **Code**:
  ```typescript
  14:   const course = await prisma.course.findUnique({
  15:     where: { id: params.courseId },
  16:     include: {
  17:       modules: {
  ...
  20:           lessons: {
  ...
  22:             include: { questions: true }
  ```
- **Context**: The `Question` model database schema contains the `answer` field (storing the correct option). By querying `questions: true` in Server Components and passing the whole `course` object to the Client Component `PlayerUI`, the correct answers are sent down to the client's browser inside the page's initial JSON state payload (visible in DevTools Network tab or page source), enabling students to bypass the quiz logic.

### Observation F: Cross-Branch Data Leak via Undefined/Null Branch ID
- **File**: `src/app/(dashboard)/dashboard/page.tsx` (Lines 17-26)
- **Code**:
  ```typescript
  17:   const whereClause = session?.user?.role === "SUPER_ADMIN" ? {} : { branchId: branchId || undefined };
  ```
- **Context**: In Prisma, passing a field value of `undefined` inside a `where` object causes Prisma to omit the filter constraint entirely. If a non-SUPER_ADMIN user has `branchId` as null or undefined (e.g. they are unassigned), `whereClause` becomes `{ branchId: undefined }`, which translates to `{}`. Consequently, they see student, staff, and financial aggregate data across the entire system. Similar issues occur in `/hr/employees/page.tsx` and `/finance/page.tsx`.

### Observation G: Unauthorized Course Content Access (Enrollment Bypass)
- **File**: `src/app/(dashboard)/learn/[courseId]/page.tsx` (Lines 8-36)
- **Context**: This route does not verify if the logged-in student is actually enrolled in the course batch. Any student can access all video/text content and quiz questions for any course by typing the URL.

### Observation H: Multiple Prisma Client Instances (Resource Exhaustion)
- **Files**: 21+ files in `src/app` and `src/app/actions`
- **Code**: `const prisma = new PrismaClient();` declared globally in each file.
- **Context**: Declaring `new PrismaClient()` in every page and action file exhausts database connection limits during Next.js hot-reloads and concurrent user requests.

### Observation I: Next-Auth Augmentation and Typing Gaps
- **File**: `types/next-auth.d.ts` (Lines 1-16)
- **Context**: The file omits `permissions` property from both `Session["user"]` and `User` interface extensions, forcing casting like `(session.user as any).permissions`. Additionally, the `JWT` interface in the `next-auth/jwt` module is not extended, resulting in un-typed token object properties.

### Observation J: Deprecated Middleware File Convention
- **File**: `src/middleware.ts`
- **Context**: In Next.js 16, the `middleware.ts` file convention is deprecated and replaced by `proxy.ts`. Building the project generates a warning.

---

## 2. Logic Chain

1. **Observations A & B** demonstrate that route guards in `middleware.ts` do not match the `/admin/...` pathname, and that Server Page components do not verify roles or permissions.
2. From this, it follows that **any logged-in user can visit admin-only routes** (such as `/admin/branches`, `/finance`, `/hr/employees`, `/reports`) by entering the path in their browser.
3. Once on those pages, as shown in **Observations B & F**, if their `branchId` is `undefined`/`null`, the Prisma queries omit the `branchId` constraint entirely because of how `undefined` is treated.
4. From this, it follows that **an unassigned or non-scoped user gets full access to database records across all branches** on those pages, exposing sensitive branch financial details and employee directories.
5. In the database schema, the `Question` model has an `answer` field containing the correct quiz option. **Observation E** shows that the query includes all question fields (`questions: true`) and passes the results directly to the client's `PlayerUI`.
6. Therefore, **the correct answers are transmitted to the client's browser**, making it trivial to extract them.
7. **Observation C** shows that Server Actions (e.g. `createBatch`, `resolveLeave`, `processPayment`) receive target resource IDs directly from client forms without validating that those target resources belong to the acting user's branch.
8. Therefore, **any Branch Administrator or Staff can manipulate data belonging to other branches** (horizontal privilege escalation).
9. **Observation D** shows that `createUser` allows user creation by `BRANCH_ADMIN` or `HR` without checking the role or permissions being assigned.
10. Therefore, **any HR or Branch Admin can create a new Super Admin account**, representing a direct route to vertical privilege escalation.

---

## 3. Caveats

- We assumed that `branchId` can be `null` or `undefined` for some users (e.g. Super Admins, unassigned staff). This is supported by the SQLite schema (`branchId String?`) but could differ based on application initialization scripts.
- We did not audit frontend-only views for UX logic since the backend data leak is of significantly higher impact.
- No other auth libraries or external providers were configured; the findings are strictly focused on `next-auth` + credentials provider.

---

## 4. Conclusion

The current auth and RBAC implementation contains multiple **critical security vulnerabilities**:
1. **Total Bypass of Admin/Staff Page Access Guards**: The middleware does not protect `/admin/...` paths (it protects `/super-admin` which is unused), and pages lack any server-side role/permission validation.
2. **Cross-Branch Privilege Escalation**: Branch Admins can create/delete/modify resources in other branches because Server Actions lack branch boundary checks.
3. **Vertical Privilege Escalation**: Any Branch Admin or HR employee can create a new Super Admin account.
4. **Quiz Answer Leakage**: Quiz answers are sent in clear text to the client page payload.
5. **Lack of Enrollment Validation**: Students can access course player pages and submit progress without being enrolled.

### Recommended Remediation Strategies

1. **Fix Middleware Route Guard (Rename & Path Matching)**:
   - Rename `src/middleware.ts` to `src/proxy.ts` (Next.js 16 convention) to resolve build warnings.
   - Restructure path matching in the proxy to guard `/admin/:path*`, `/hr/:path*`, `/finance/:path*`, and `/reports/:path*` based on `role` or `permissions` (or redirect to `/dashboard`).
2. **Implement Server-Side Helpers for Route/Action Authorization**:
   - Create an authorization helper, e.g. `assertUserHasRoleOrPermission(session, requiredRoles, requiredPermission)`.
   - Call this helper inside every protected Server Page and Server Action.
3. **Enforce Branch Scope in Database Queries**:
   - In all queries and updates inside Server Pages and Server Actions, verify that `resource.branchId === session.user.branchId` if the actor is not a `SUPER_ADMIN`.
   - Prevent Prisma `undefined` omissions by explicitly checking `if (!branchId) throw new Error("Branch ID is required for non-super-admins");` before querying.
4. **Prevent Privilege Escalation in `createUser`**:
   - Modify `createUser` to ensure that a user can only create accounts with roles less than or equal to their own (e.g., HR/Branch Admins can only create `STUDENT`, `INSTRUCTOR`, or `FINANCE` / `HR` roles, never `SUPER_ADMIN`).
   - Validate fine-grained permission arrays.
5. **Secure LMS Quiz Answers**:
   - In `/learn/[courseId]/page.tsx`, select only non-sensitive columns for questions (e.g., omit the `answer` field in Prisma `select`).
   - Update `submitQuiz` to evaluate the answer on the server side by querying the correct answer directly from the DB inside the action, rather than relying on client-side state.
6. **Create a Prisma Client Singleton**:
   - Implement `src/lib/db.ts` as a global PrismaClient singleton and use it across all files to prevent connection pool exhaustion.
7. **Fix Types/Next-Auth Augmentation**:
   - Update `types/next-auth.d.ts` to fully declare `permissions` on `Session["user"]` and `User`.
   - Extend `JWT` module from `next-auth/jwt` to include typing for `role`, `branchId`, and `permissions`.

---

## 5. Verification Method

To verify these issues independently:

1. **Verify Route Guard Bypasses**:
   - Run the development server: `npm run dev`.
   - Log in as a user with `STUDENT` role (or create a temporary one).
   - Manually navigate to `/admin/branches`, `/finance`, `/reports`, or `/hr/employees`. Observe that you can access the pages and view data.
2. **Verify Correct Answer Leak**:
   - Navigate to `/learn/[courseId]` as a student.
   - Open Chrome DevTools -> Network -> Select the Document request (or look at the page's JSON payload in the Next.js `__NEXT_DATA__` script or Turbopack equivalent).
   - Search for `"answer"` and see that the correct option is visible.
3. **Verify Compilation & Warning**:
   - Run `npm run build` and check for the warning:
     `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
