---
last_mapped_commit: 69a60581989600e6a61780065108474cfbf1c25f
last_mapped_at: 2026-09-21
---
# External Integrations

**Analysis Date:** 2026-09-21

## APIs & External Services

**Payment Processing:**

- Paystack (`react-paystack`) - Digital payments for tithes, offerings, welfare, and building funds in Ghana Cedis (GHS).
  - SDK/Client: `react-paystack` via [`src/components/DigitalGivingDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/DigitalGivingDialog.jsx).
  - Auth: `VITE_PAYSTACK_PUBLIC_KEY`

**SMS & Communications:**

- Termii Gateway (`https://api.ng.termii.com/api`) - SMS dispatch to congregants, automated reminders, and bulk broadcast messaging.
  - SDK/Client: `axios` wrapper in [`src/utils/communicationApi.js`](file:///home/admin/Projects/ricgcw/src/utils/communicationApi.js).
  - Auth: `VITE_TERMII_API_KEY`, sender ID `VITE_TERMII_SENDER_ID` (defaulting to `RICGCW`). Automatically normalizes Ghana (+233) phone formats.

**Email Communications:**

- EmailJS (`@emailjs/browser`) - Client-triggered transactional email notifications for attendance receipts and member notices.
  - SDK/Client: `@emailjs/browser`.
  - Auth: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`.

**Scripture & Theological Services:**

- API.Bible (`https://rest.api.bible/v1`) - KJV, NKJV, NIV, and AMP scripture querying with local session caching and Gen Z contextual translations.
  - SDK/Client: `axios` client in [`src/utils/bibleApi.js`](file:///home/admin/Projects/ricgcw/src/utils/bibleApi.js).
  - Auth: Hardcoded API key in client (`loPsbJCaWjl5ITSeS4WWD`).

## Data Storage

**Databases:**

- Google Cloud Firestore (Firebase) - Primary document database for real-time church operational data.
  - Connection: Web client config in [`src/firebase.js`](file:///home/admin/Projects/ricgcw/src/firebase.js).
  - Collections:
    - `users` — Administrator profiles, branch associations, and RBAC roles.
    - `members` — Church member directory, demographics, age, departments, and attendance metrics.
    - `attendance` — Service attendance logs, check-ins, security tokens.
    - `financials` — Income and expenditure ledger, tithes, offerings, dual-custody audit records.
    - `events` — Calendar events, volunteer rosters, and check-in schedules.
    - `bibleStudies` — Study guides, sermon notes, and curriculum materials.
    - `settings` — System settings including `settings/maintenance` mode toggle.
- Appwrite Database (Cloud) - Supplementary identity preferences and user metadata.
  - Client: `Databases` in [`src/appwrite.js`](file:///home/admin/Projects/ricgcw/src/appwrite.js).

**File Storage:**

- Hugging Face Datasets (LFS) - Distributed file and media repository used for gallery images and church media assets.
  - Client: `@huggingface/hub` in [`src/utils/huggingFaceApi.js`](file:///home/admin/Projects/ricgcw/src/utils/huggingFaceApi.js).
  - Auth: `VITE_HF_TOKEN` / `VITE_HF_WRITE_TOKEN`, target repository `VITE_HF_REPO_ID` (default `1mos-droid/church-media`).
- Firebase Cloud Storage - Auxiliary cloud storage bucket (`thegatheringplace-app.appspot.com`) initialized in [`src/firebase.js`](file:///home/admin/Projects/ricgcw/src/firebase.js).

**Caching:**

- Browser `sessionStorage` - API.Bible chapter responses and book metadata are cached in session storage to minimize external requests ([`src/utils/bibleApi.js`](file:///home/admin/Projects/ricgcw/src/utils/bibleApi.js#L26)).
- Browser `localStorage` - Active workspace (`main`, `youth`, `children`), user session tokens, mimicry status, and cookie consent flags ([`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx), [`src/components/CookieConsent.jsx`](file:///home/admin/Projects/ricgcw/src/components/CookieConsent.jsx)).
- Service Worker Cache (Workbox) - Static asset caching and NetworkFirst strategy for Cloud Functions `/api` calls ([`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L50)).

## Authentication & Identity

**Auth Provider:**

- Appwrite Cloud (`https://nyc.cloud.appwrite.io/v1`) - Provides core authentication, session management, email verification, and security labels.
  - Implementation: Initialized in [`src/appwrite.js`](file:///home/admin/Projects/ricgcw/src/appwrite.js) and wrapped by [`src/context/AuthContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/AuthContext.jsx).
  - Roles & Permissions: Handled in hybrid mode:
    - Appwrite user labels (`developer`, `admin`) serve as authoritative master permission grants.
    - Firestore `users/{email}` documents store granular application permissions (`developer`, `admin`, `branch_admin`, `minister`, `member`, `guest`).
    - Administrative identity mimicry (`startMimicking`) allows developers and admins to simulate other roles without altering backend credentials ([`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx#L59)).

## Monitoring & Observability

**Error Tracking:**

- Sentry (`@sentry/react`) - Error boundary capture and performance tracing initialized in [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx).
- Local Error Boundary: React fallback UI in [`src/components/ErrorBoundary.jsx`](file:///home/admin/Projects/ricgcw/src/components/ErrorBoundary.jsx).

**Logs:**

- Console logging across frontend modules.
- Firestore audit trail: Dual custody financial deposit audits logged in `financials` collection with double-signatory verification.
- Firebase Cloud Functions runtime logs (`functions/index.js`).

## CI/CD & Deployment

**Hosting:**

- Google Firebase Hosting - Hosts production build artifacts from `dist/` directory ([`firebase.json`](file:///home/admin/Projects/ricgcw/firebase.json)).
- GitHub Actions: Automated workflows configured in [`.github/`](file:///home/admin/Projects/ricgcw/.github).

**CI Pipeline:**

- Vitest test suite and ESLint run on commit/PR.

## Environment Configuration

**Required env vars:**

- `VITE_APPWRITE_ENDPOINT` - Appwrite cloud or self-hosted endpoint URL.
- `VITE_APPWRITE_PROJECT_ID` - Appwrite application project identifier.
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key for payment modal checkout.
- `VITE_HF_TOKEN` - Hugging Face API access token with repository write permissions.
- `VITE_HF_REPO_ID` - Hugging Face target dataset repository identifier.
- `VITE_TERMII_API_KEY` - Termii SMS API key.
- `VITE_TERMII_SENDER_ID` - Approved SMS sender ID.
- `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` - EmailJS configuration.

**Secrets location:**

- Stored in local [`.env`](file:///home/admin/Projects/ricgcw/.env) and deployment environment variables (Firebase/GitHub Secrets).
- Never committed to git; [`.env.example`](file:///home/admin/Projects/ricgcw/.env.example) maintains variable reference.

## Webhooks & Callbacks

**Incoming:**

- Paystack Webhook Handler: Implemented in Firebase Cloud Functions (`functions/index.js`) to verify successful payment references asynchronously and update Firestore contribution records.
- Firebase Auth / Appwrite webhooks: Capable of triggering Cloud Functions.

**Outgoing:**

- Termii SMS API outbound calls triggered upon event registration or manual broadcast.
- Paystack client redirect/callback on transaction success.

---

*Integration audit: 2026-09-21*
