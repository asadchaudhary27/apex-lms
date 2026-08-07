# E2E Testing Feasibility Analysis - LMS ERP System

This report outlines the feasibility, tool availability, and programmatic strategies for implementing End-to-End (E2E) testing for the LMS ERP system.

---

## 1. Installed Testing Libraries

An inspection of `package.json` and `node_modules` reveals the following:
- **No E2E or Integration Testing frameworks** (such as Playwright, Cypress, Vitest, or Jest) are listed in `dependencies` or `devDependencies` in `package.json`.
- A check of local node modules confirms that no testing engine packages are currently installed in the project directory.

---

## 2. Machine Environment & Runtimes

We investigated the available system runtimes and cached binaries on the host Windows machine:
- **Node.js**: `v24.15.0`
- **npm**: `11.12.1`
- **Google Chrome**: Installed at `C:\Program Files\Google\Chrome\Application\chrome.exe` (Version `149.0.7827.201`).
- **Microsoft Edge**: Installed at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (Version `149.0.4022.98`).
- **Playwright**:
  - `npx playwright --version` resolved successfully to `Version 1.61.1`.
  - **Browser Cache**: Playwright's browser binary cache is fully populated in `C:\Users\Alpha\AppData\Local\ms-playwright` with Chromium (v1223), Chromium Headless Shell (v1223), ffmpeg, and winldd.
- **Cypress**:
  - The Cypress cache directory in `%USERPROFILE%\AppData\Local\Cypress\Cache` is empty.
  - Installing Cypress in an offline/restricted network environment requires a manual download of the Cypress zip binary and setting `CYPRESS_INSTALL_BINARY`, which represents significant overhead.

### Recommendation
**Playwright** is highly recommended because:
1. It already has pre-cached Chromium runtimes in the system directory, bypassing the need to download large browser binaries in a CODE_ONLY (offline) environment.
2. It can directly utilize the host's Chrome or Edge browsers by configuring the `channel: 'chrome'` or `channel: 'msedge'` property.

---

## 3. NextAuth v5 Programmatic Authentication

The application uses NextAuth v5 (Auth.js) in `src/auth.ts` with the `Credentials` provider and standard JWT session strategy (no database adapter). The middleware `src/middleware.ts` enforces authentication for all routes except static assets and `/api` endpoints, redirecting unauthenticated sessions to `/login`.

For E2E tests, we can authenticate using three different methods:

### Method A: Programmatic JWT Cookie Injection (Fastest & Recommended)
Since the environment specifies `AUTH_SECRET="supersecret123"` inside `.env`, we can programmatically construct and sign a valid session JWT token in the test execution context using the `encode` function from `next-auth/jwt`.

We verified this programmatically with the following proof of concept:
```javascript
import { encode, decode } from 'next-auth/jwt';

const secret = 'supersecret123';
const salt = 'authjs.session-token'; // matches the cookie name

const token = await encode({
  token: {
    name: 'Super Admin',
    email: 'superadmin@lms.com',
    role: 'SUPER_ADMIN',
    branchId: 'hq-001',
    permissions: JSON.stringify({ allAccess: true }),
    sub: 'superadmin-id', // User's ID in database
  },
  secret,
  salt,
});

// Set this string as a cookie 'authjs.session-token' in the browser context
```
*Benefits*: Bypasses the UI login page entirely, avoids running expensive bcrypt hashing (10 rounds) on the server, and takes <5ms to authenticate a browser context.

### Method B: REST API Auth Request
We can simulate the login request by mimicking the browser behavior programmatically:
1. Make a GET request to `/api/auth/csrf` to retrieve the CSRF token and `authjs.csrf-token` cookie.
2. Make a POST request to `/api/auth/callback/credentials` with:
   - Header: `Content-Type: application/x-www-form-urlencoded`
   - Body: `email=superadmin@lms.com&password=admin123&csrfToken=<token>&redirect=false`
3. Extract the `authjs.session-token` cookie from the `Set-Cookie` response headers and set it on the test context.

### Method C: UI Login Flow (Standard)
1. Navigate to `/login`.
2. Fill in the email (`superadmin@lms.com`) and password (`admin123`).
3. Click "Sign In" and await navigation to `/dashboard`.
*Note*: This should be used for testing the login page itself, but skipped for other tests to save execution time.

---

## 4. Database Schema, Migration & Seeding

- **Database Engine**: SQLite (`prisma/dev.db` by default).
- **Migrations**: There are no migrations created (no `prisma/migrations` folder). Schema synchronization is handled directly via `npx prisma db push`.
- **Seeding**: The script `prisma/seed.mjs` handles default data seeding (creates branch `hq-001` and `superadmin@lms.com`).

### Programmatic DB Reset & Seeding for Tests
To ensure test isolation without polluting the development database:
1. Run E2E tests with a dedicated environment variable `DATABASE_URL="file:./test.db"`.
2. Before running tests, initialize and seed the test database using:
   ```powershell
   $env:DATABASE_URL="file:./test.db"
   npx prisma db push --skip-generate --accept-data-loss
   node prisma/seed.mjs
   ```
3. To reset the database between tests, simply delete `prisma/test.db` and re-run the push/seed commands. This process is extremely lightweight and takes approximately 2.5 seconds to complete.
