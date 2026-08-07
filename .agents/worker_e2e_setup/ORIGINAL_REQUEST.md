## 2026-07-03T17:05:06Z
You are worker_e2e_setup, an E2E Testing Setup Worker.
Your Working Directory is e:\LMS\.agents\worker_e2e_setup.

Objective:
Set up the E2E test infrastructure.
1. Add "@playwright/test": "1.61.1" to devDependencies in package.json.
2. Add a script "test:e2e": "playwright test" to package.json.
3. Run npm install (try to install in offline mode or normally as appropriate on this Windows system).
4. Create a robust playwright.config.ts at the root that:
   - Configures a test environment.
   - Sets the base URL to http://localhost:3001.
   - Spawns a webServer running next dev on port 3001 with environment variables:
     * DATABASE_URL="file:./prisma/test.db"
     * AUTH_SECRET="supersecret123"
     * PORT=3001
   - Uses Chromium browser from local cache or standard.
   - Resets/seeds the SQLite database before running tests. Let's make sure the config has a globalSetup script or setup steps that do:
     * Set DATABASE_URL="file:./prisma/test.db"
     * Run "npx prisma db push --skip-generate"
     * Run "node prisma/seed.mjs"
5. Create a basic sanity test file at e:\LMS\tests\sanity.spec.ts that navigates to the login page and asserts that the login title or heading is visible.
6. Verify you can run the test using "npm run test:e2e" and that it passes.

Scope boundaries:
- DO NOT edit or modify any application source files in src/. Only modify package.json, playwright.config.ts, and files under tests/.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When done, write a handoff report in e:\LMS\.agents\worker_e2e_setup\handoff.md describing your changes, setup, and verification output (command run, pass/fail result). Message your parent (conv ID: 17758b7f-a8d8-4a3e-8110-3b1d5aea801f).
