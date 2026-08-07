# Scope: E2E Testing Track

## Architecture
- Opaque-box E2E testing of the LMS ERP System.
- Test scenarios cover Authentication & RBAC, Settings profile and password management, and HR/Staff attendance/leave logs.
- Tests will target the Next.js server directly.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Exploration | Determine test execution strategy, offline capability, package availability | None | DONE |
| 2 | Test Setup & Infra | Write TEST_INFRA.md, install dependencies, configure test script runner | M1 | IN_PROGRESS |
| 3 | Tier 1 Implementation | Write >=5 Feature Coverage test cases per major feature | M2 | PLANNED |
| 4 | Tier 2 Implementation | Write >=5 Boundary & Corner test cases per major feature | M3 | PLANNED |
| 5 | Tiers 3 & 4 Implementation | Write Pairwise Feature combinations and Real-World Scenarios | M4 | PLANNED |
| 6 | Verification & Publish | Execute all tests, publish TEST_READY.md, send success message | M5 | PLANNED |

## Interface Contracts
- The test suite will execute via `npm run test:e2e` or similar command.
- The test suite must not depend on internal implementation details, only public APIs, endpoints, and database state checking where needed.
