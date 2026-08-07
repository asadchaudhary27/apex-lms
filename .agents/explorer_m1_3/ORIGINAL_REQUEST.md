## 2026-07-03T17:02:09Z

You are Explorer 3. Your task is to perform a deep code-quality and schema audit of database actions, server actions, and build configuration.
Working directory: e:\LMS\.agents\explorer_m1_3

Investigate:
1. `prisma/schema.prisma`: Look for schema inconsistency, missing fields, or incorrect relations. Check for model constraints.
2. Server Actions under `src/app/actions/`: Check all prisma queries. Look for unhandled errors, transaction safety, missing input validation, or null pointer edge cases.
3. TypeScript errors: Scan for type mismatches, implicit any, or configuration issues in `tsconfig.json` that might prevent compilation.

Identify any existing bugs, data-integrity issues, or potential compilation errors. Report your findings in detail in `handoff.md` inside your working directory.
Your completion criteria: A detailed report analyzing server actions, database schema safety, type-checking issues, and outlining recommended remediation strategies.
