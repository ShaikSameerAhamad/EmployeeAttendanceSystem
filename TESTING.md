# Testing & Quality Status

## Current Coverage
- There are **no automated unit, integration, or end-to-end tests** in this repository today.
- Manual verification happens through local runs (`npm run dev` on the frontend and `npm start` in `/backend`).
- Critical modules such as authentication, attendance calculations, and reporting rely purely on manual QA, which increases regression risk.

## Recommended Next Steps
1. **Backend API tests (Jest + Supertest)**
   - Cover auth flows (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`).
   - Exercise attendance mutations (`/api/attendance/checkin`, `/api/attendance/checkout`).
   - Validate manager reports endpoints including the CSV exporter.
2. **Frontend component tests (Vitest + React Testing Library)**
   - Test key containers (`AttendancePage`, `HistoryPage`, `ReportsPage`) to ensure API payloads render correctly.
   - Mock the Redux store to validate role-based guards and sidebar navigation.
3. **Utility unit tests**
   - Add lightweight coverage for `utils/calculateStatus` and `utils/generateToken` to guard business rules.
4. **End-to-end smoke tests (Playwright or Cypress)**
   - Automate login + mark attendance + export CSV to guarantee the golden path each deploy.

## Getting Started Checklist
- Install suggested tooling:
  - Frontend: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
  - Backend: `cd backend && npm install -D jest supertest`
- Add npm scripts (`"test": "vitest"`, backend `"test": "NODE_ENV=test jest"`).
- Seed a slim MongoDB dataset for repeatable API tests (the existing `backend/scripts/seedData.js` can be reused with a test database URI).

Documenting this gap ensures future contributors have clear marching orders for bringing automated quality into the stack.
