---
last_mapped_commit: 69a60581989600e6a61780065108474cfbf1c25f
last_mapped_at: 2026-09-21
---
# Codebase Concerns

**Analysis Date:** 2026-09-21

## Tech Debt

**Monolithic UI Components:**

- Issue: Several key pages and dialog components have grown into massive files exceeding 900–1,500 lines of code, mixing UI rendering, state management, validation, and direct Firestore calls in a single file.
- Files:
  - [`src/components/MemberDetailsDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/MemberDetailsDialog.jsx) (1,542 lines)
  - [`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx) (986 lines)
  - [`src/pages/Dashboard.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.jsx) (959 lines)
  - [`src/pages/LiveBible.jsx`](file:///home/admin/Projects/ricgcw/src/pages/LiveBible.jsx) (934 lines)
  - [`src/pages/Login.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Login.jsx) (933 lines)
  - [`src/pages/Attendance.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Attendance.jsx) (930 lines)
  - [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx) (786 lines)
- Impact: High cognitive overhead, fragile manual edits, difficulty in writing isolated unit tests, and increased likelihood of regressions.
- Fix approach: Refactor monolithic dialogs and pages into smaller sub-components using Atomic Design (e.g. split `MemberDetailsDialog` tabs into `MemberProfileTab`, `MemberAttendanceTab`, `MemberEngagementTab`, `MemberNotesTab`).

**Direct Firestore Mutations from UI Layer:**

- Issue: Components directly construct Firestore query batches and call `addDoc` / `updateDoc` / `setDoc` inline without an intermediary repository or data service layer.
- Files: [`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx), [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx), [`src/components/DigitalGivingDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/DigitalGivingDialog.jsx).
- Impact: Inconsistent document schemas, duplicated error handling, and tight coupling of React components to Firestore internals.
- Fix approach: Implement centralized domain service modules (e.g., `src/services/memberService.js`, `src/services/financialService.js`).

**Hardcoded Third-Party API Key:**

- Issue: API.Bible access key is hardcoded directly in client code.
- Files: [`src/utils/bibleApi.js`](file:///home/admin/Projects/ricgcw/src/utils/bibleApi.js#L3) (`const API_KEY = 'loPsbJCaWjl5ITSeS4WWD';`).
- Impact: Exposure of the API key in client bundles; inability to rotate keys without code redeployment.
- Fix approach: Move `VITE_BIBLE_API_KEY` into environment variables (`.env.example` and `.env`).

## Known Bugs & Console Warnings

**MUI Out-of-Range Select Warning in Dashboard:**

- Symptoms: `MUI: You have provided an out-of-range value 'undefined' for the select component. The available values are '7d', '30d', '90d'` logged during test runs and dashboard mount.
- Files: [`src/pages/Dashboard.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.jsx).
- Trigger: Initializing the timeframe filter without a fallback default string before state resolution.
- Workaround: Default select state to `'30d'` or `''` explicitly in `useState`.

**React Router v6 to v7 Deprecation Flags:**

- Symptoms: Console warnings regarding `v7_startTransition` and `v7_relativeSplatPath` during navigation.
- Files: [`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx), [`src/App.jsx`](file:///home/admin/Projects/ricgcw/src/App.jsx).
- Trigger: React Router DOM v6.25+ flags changes planned for v7 upgrade.
- Workaround: Pass future flags `{ v7_startTransition: true, v7_relativeSplatPath: true }` to `<BrowserRouter>`.

## Security Considerations

**Client-Side Exposure of Sensitive API Keys:**

- Risk: `VITE_HF_TOKEN` (Hugging Face write token) and `VITE_PAYSTACK_PUBLIC_KEY` are prefixed with `VITE_`, compiling into the browser bundle. If the Hugging Face token possesses broad write permissions beyond the specific dataset repository, malicious clients could inspect the bundle and compromise assets.
- Files: [`src/utils/huggingFaceApi.js`](file:///home/admin/Projects/ricgcw/src/utils/huggingFaceApi.js), [`.env.example`](file:///home/admin/Projects/ricgcw/.env.example).
- Current mitigation: Token is scoped specifically to dataset repository.
- Recommendations: Delegate media uploads to Firebase Cloud Functions (`functions/index.js`) using server-side service account credentials rather than shipping write tokens to client browsers.

**Pastoral Note Encryption Key Retention:**

- Risk: [`src/utils/noteEncryption.js`](file:///home/admin/Projects/ricgcw/src/utils/noteEncryption.js) uses AES-256 for counseling notes. If the secret key is stored in browser `localStorage` or session memory unencrypted, local machine compromise could reveal confidential pastoral data.
- Current mitigation: Keys are passed per-session by authorized ministerial personnel.
- Recommendations: Enforce strict session expiry and avoid persisting raw pastoral encryption passphrases in persistent browser storage.

## Performance Bottlenecks

**Unbounded In-Memory Data Collections:**

- Problem: [`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx) and [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx) fetch full collections into client memory using `getDocs` and perform sorting and filtering client-side.
- Files: [`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx), [`src/utils/syncDepartments.js`](file:///home/admin/Projects/ricgcw/src/utils/syncDepartments.js).
- Cause: Lack of server-side pagination with Firestore cursors (`limit`, `startAfter`).
- Improvement path: Implement cursor-based infinite scroll or server-paginated data grids using Firestore pagination queries.

**Heavy Vendor Bundle Chunks:**

- Problem: Large dependencies including `xlsx` (SheetJS), `jspdf`, `html2canvas`, and `@mui/material` can impact initial page load time on slow mobile networks.
- Files: [`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L75).
- Improvement path: Ensure all heavy export utilities (`xlsx`, `jspdf`) are strictly dynamically imported (`await import('xlsx')`) only when the user clicks the Export button.

## Fragile Areas

**Dual Identity State Synchronization:**

- Files: [`src/context/AuthContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/AuthContext.jsx).
- Why fragile: User identity is managed across two independent backends: Appwrite Cloud (session token, email verification, master labels) and Firebase Firestore (`users` document containing church branch and fine-grained role).
- Safe modification: If modifying user roles or branch permissions, ensure atomic updates or retry mechanisms handle partial network failure between Appwrite and Firestore.
- Test coverage: Covered in part by [`src/components/RBACMatrix.test.jsx`](file:///home/admin/Projects/ricgcw/src/components/RBACMatrix.test.jsx) and auth unit tests.

**React 19 Release Candidate (`^19.0.0-rc-f994737d14-20240522`):**

- Files: [`package.json`](file:///home/admin/Projects/ricgcw/package.json#L32).
- Why fragile: Using a pre-release version of React 19 requires `--legacy-peer-deps` during `npm install` because several third-party libraries declare peer dependencies for React 18.
- Safe modification: Upgrade to the official stable React 19 release once ecosystem dependencies publish stable peer definitions.

## Scaling Limits

**Full Member Department Re-Sync:**

- Current capacity: Works efficiently up to ~1,000 member records.
- Limit: `syncMemberDepartments` loads the entire `members` collection into memory on admin dashboard access and commits batched updates (Firestore batches have a hard ceiling of 500 operations per batch).
- Scaling path: Migrate department age calculation to a scheduled Firebase Cloud Function running daily, using chunked batches of 400 writes.

## Dependencies at Risk

**`xlsx` (SheetJS):**

- Risk: Version `^0.18.5` has historical vulnerabilities reported by security scanners; public npm package is no longer maintained by original authors (moved to CDN distribution).
- Impact: Build security warnings during CI audit.
- Migration plan: Migrate to modern alternatives such as `exceljs` or parse CSV directly for simpler requirements.

## Missing Critical Features

**Server-Side Scheduled Jobs:**

- Problem: Department age progression and member churn evaluation currently depend on an administrator logging into the dashboard.
- Blocks: Congregants who age up or become at-risk during periods of low admin activity do not update until an admin visits the portal.
- Fix approach: Add Google Cloud Scheduler cron triggers calling Firebase Cloud Functions to execute background syncing.

## Test Coverage Gaps

**Monolithic Dialog Unit Coverage:**

- What's not tested: While [`src/components/MemberDetailsDialog.test.jsx`](file:///home/admin/Projects/ricgcw/src/components/MemberDetailsDialog.test.jsx) verifies basic open/close and member data display, complex interactions such as family linkages, counseling note decryption, and custom milestone additions lack dedicated edge-case tests.
- Files: [`src/components/MemberDetailsDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/MemberDetailsDialog.jsx).
- Risk: High probability of regressions during profile management changes.
- Priority: Medium

**Cloud Functions Backend Tests:**

- What's not tested: [`functions/index.js`](file:///home/admin/Projects/ricgcw/functions/index.js) has no automated integration tests verifying Paystack webhook signatures and payment reconciliation.
- Files: [`functions/index.js`](file:///home/admin/Projects/ricgcw/functions/index.js).
- Risk: Webhook handling failures could cause digital giving records to become out of sync with Paystack transactions.
- Priority: High

---

*Concerns audit: 2026-09-21*
