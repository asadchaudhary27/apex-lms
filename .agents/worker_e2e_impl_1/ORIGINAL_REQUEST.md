## 2026-07-03T17:09:55Z

You are worker_e2e_impl_1, an E2E Test Suite Implementer.
Your Working Directory is e:\LMS\.agents\worker_e2e_impl_1.

Objective:
Implement the comprehensive E2E test suite.
1. Write e:\LMS\TEST_INFRA.md following GSD requirements (Test Philosophy, Feature Inventory, Test Architecture, Real-World Application Scenarios, and Coverage Thresholds).
2. Create e:\LMS\tests\auth-helpers.ts which exposes a function "loginAs" that signs a session JWT cookie programmatically using the "encode" function from "next-auth/jwt" with secret="supersecret123" and salt="authjs.session-token", and injects it into the browser context. This allows bypassing UI login.
3. Create e:\LMS\tests\rbac.spec.ts:
   - Tier 1: Access Control feature coverage (Super Admin accessing /admin/branches, Branch Admin on dashboard, HR on hr panels, Student on /learn, Staff only on settings).
   - Tier 2: Access Control boundary/error cases (Unauthenticated redirect, wrong credentials login, empty inputs, unauthorized path redirects, direct server action rejection).
4. Create e:\LMS\tests\settings.spec.ts:
   - Tier 1: Settings feature coverage (pre-filled fields on settings page, profile updates for name/email/phone/bio/education, theme toggle, notifications toggle).
   - Tier 2: Settings boundary/error cases (duplicate email collision, invalid email format, password min length, wrong current password, empty fields handling).
5. Create e:\LMS\tests\hr.spec.ts:
   - Tier 1: HR & Staff feature coverage (employee list view, employee creation form, record staff attendance, submit leave request, approve/reject leave request).
   - Tier 2: HR boundary/error cases (create employee duplicate email, invalid role, duplicate attendance, submit leave invalid date range, double leave resolution).
6. Create e:\LMS\tests\scenarios.spec.ts:
   - Tier 3: Cross-Feature combinations (password change session updates, theme change immediate reflection on pages, attendance logs updating dashboard count).
   - Tier 4: Real-world workloads (Role Lifecycle verification, User Onboarding settings flow, Employee leave/attendance/finance process cycle, Student course progress tracking, Branch admin scoping).
7. Execute "npm run test:e2e" and verify that all test files compile and execute. Note: some tests for settings fields and staff features will fail because the implementation track has not built them yet. This is expected. Just confirm they execute.

Scope boundaries:
- DO NOT modify any files in src/ (application code). You only write code in tests/ and markdown/configuration files in the root.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When done, write a handoff report in e:\LMS\.agents\worker_e2e_impl_1\handoff.md describing your changes, test cases, and the test run execution results. Message your parent (conv ID: 17758b7f-a8d8-4a3e-8110-3b1d5aea801f).
