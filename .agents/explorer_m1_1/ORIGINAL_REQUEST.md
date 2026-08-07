## 2026-07-03T17:02:09Z

You are Explorer 1. Your task is to perform a deep security and logic audit of the Authentication, Session, and Role-Based Access Control (RBAC) implementation.
Working directory: e:\LMS\.agents\explorer_m1_1

Investigate:
1. `src/auth.ts`: Check the credentials provider, bcrypt hash checks, JWT callback, and session callback. Are roles, branchIds, and permissions correctly augmented and typed?
2. `src/middleware.ts`: Inspect the route guards. Can permissions be bypassed? Are there any logical edge cases where a user could access another branch's data, or super-admin paths?
3. `types/next-auth.d.ts`: Verify that type declarations match the callbacks.
4. Any other authentication or session logic.

Identify any existing bugs, security issues, or potential compilation errors. Report your findings in detail in `handoff.md` inside your working directory.
Your completion criteria: A detailed report analyzing the auth/RBAC security, naming any bugs or potential vulnerabilities, and outlining recommended remediation strategies.
