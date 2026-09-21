---
last_mapped_commit: 69a60581989600e6a61780065108474cfbf1c25f
last_mapped_at: 2026-09-21
---
# Technology Stack

**Analysis Date:** 2026-09-21

## Languages

**Primary:**

- JavaScript (ES2020+ / JSX) - Entire frontend application in [`src/`](file:///home/admin/Projects/ricgcw/src/) and root config files.
- Node.js JavaScript (CommonJS / ES Module) - Cloud Functions backend in [`functions/`](file:///home/admin/Projects/ricgcw/functions/).

**Secondary:**

- HTML5 / CSS3 - Base markup in [`index.html`](file:///home/admin/Projects/ricgcw/index.html), global styles and resets in [`src/index.css`](file:///home/admin/Projects/ricgcw/src/index.css) and [`src/pages/Dashboard.css`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.css).

## Runtime

**Environment:**

- Node.js: Recommended >= 18.0.0 (Cloud Functions targets Node 22 per [`functions/package.json`](file:///home/admin/Projects/ricgcw/functions/package.json#L13)).
- Browser: Modern evergreen browsers (Chrome, Safari, Firefox, Edge) supporting ES2020 and PWA standards.

**Package Manager:**

- npm
- Lockfile: Present ([`package-lock.json`](file:///home/admin/Projects/ricgcw/package-lock.json) and [`functions/package-lock.json`](file:///home/admin/Projects/ricgcw/functions/package-lock.json)).
- Note: Installs typically require `--legacy-peer-deps` due to React 19 release candidate peer dependency constraints.

## Frameworks

**Core:**

- React `^19.0.0-rc-f994737d14-20240522` - Component UI architecture ([`package.json`](file:///home/admin/Projects/ricgcw/package.json#L32)).
- React DOM `^19.0.0-rc-f994737d14-20240522` - DOM rendering ([`package.json`](file:///home/admin/Projects/ricgcw/package.json#L33)).
- React Router DOM `^6.25.1` - Client-side single page app routing with nested guards in [`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx).
- Material UI (MUI v7) `^7.3.7` (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`) - Design system & UI components ([`src/theme.jsx`](file:///home/admin/Projects/ricgcw/src/theme.jsx)).
- Framer Motion `^11.3.19` - Micro-interactions and route transition animations ([`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx#L45)).

**Testing:**

- Vitest `^4.0.18` - Unit & component test runner ([`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L121)).
- `@testing-library/react` `^16.3.2` & `@testing-library/jest-dom` `^6.9.1` - React DOM component assertions.
- `jsdom` `^28.1.0` - Browser simulation environment for headless testing.
- `@vitest/coverage-v8` `^4.0.18` - V8 code coverage reporter.

**Build/Dev:**

- Vite `^7.2.4` - Development server with HMR, fast Rollup-based production bundler ([`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js)).
- `@vitejs/plugin-react` `^5.1.1` - React Fast Refresh integration.
- `vite-plugin-pwa` `^1.2.0` - Progressive Web App service worker generation and Web App Manifest management ([`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L9)).
- ESLint `^9.39.1` - Flat configuration linting ([`eslint.config.js`](file:///home/admin/Projects/ricgcw/eslint.config.js)).

## Key Dependencies

**Critical:**

- `firebase` `^12.8.0` - Firestore real-time database and Cloud Storage client ([`src/firebase.js`](file:///home/admin/Projects/ricgcw/src/firebase.js)).
- `appwrite` `^23.0.0` - Authentication, sessions, user accounts, and server-side preferences ([`src/appwrite.js`](file:///home/admin/Projects/ricgcw/src/appwrite.js)).
- `react-paystack` `^6.0.0` - Payment gateway integration for digital tithes and offerings in GHS ([`src/components/DigitalGivingDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/DigitalGivingDialog.jsx)).
- `@huggingface/hub` `^2.12.0` - LFS media upload and storage via Hugging Face dataset commits ([`src/utils/huggingFaceApi.js`](file:///home/admin/Projects/ricgcw/src/utils/huggingFaceApi.js)).
- `date-fns` `^3.6.0` - Date arithmetic, age calculations, and ISO formatting ([`src/utils/dateUtils.js`](file:///home/admin/Projects/ricgcw/src/utils/dateUtils.js)).
- `crypto-js` `^4.2.0` - AES-256 encryption for confidential pastoral counseling notes ([`src/utils/noteEncryption.js`](file:///home/admin/Projects/ricgcw/src/utils/noteEncryption.js)).

**Infrastructure & Utilities:**

- `axios` `^1.7.2` - HTTP client for Termii SMS and Bible API calls ([`src/utils/communicationApi.js`](file:///home/admin/Projects/ricgcw/src/utils/communicationApi.js), [`src/utils/bibleApi.js`](file:///home/admin/Projects/ricgcw/src/utils/bibleApi.js)).
- `recharts` `^3.7.0` - Composable SVG charts for financial metrics and attendance trends ([`src/components/FinancialChart.jsx`](file:///home/admin/Projects/ricgcw/src/components/FinancialChart.jsx)).
- `jspdf` `^4.2.0` & `jspdf-autotable` `^5.0.7` - PDF generation for reports and financial statements ([`src/pages/Reports.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Reports.jsx)).
- `xlsx` `^0.18.5` - Spreadsheet data import/export ([`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx), [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx)).
- `html5-qrcode` `^2.3.8` & `react-qr-code` `^2.0.21` - QR code generation and live camera scanner for attendance ([`src/pages/Attendance.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Attendance.jsx), [`src/pages/SelfCheckIn.jsx`](file:///home/admin/Projects/ricgcw/src/pages/SelfCheckIn.jsx)).
- `@emailjs/browser` `^4.4.1` - Client-side transactional email delivery.
- `@sentry/react` `^10.56.0` - Frontend error reporting and performance tracking ([`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx)).

## Configuration

**Environment:**

- Configured via Vite environment variables (`import.meta.env.VITE_*`).
- Template defined in [`.env.example`](file:///home/admin/Projects/ricgcw/.env.example).
- Local environment in [`.env`](file:///home/admin/Projects/ricgcw/.env) and production settings in [`.env.production`](file:///home/admin/Projects/ricgcw/.env.production).
- Key variables:
  - `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`
  - `VITE_PAYSTACK_PUBLIC_KEY`
  - `VITE_HF_TOKEN`, `VITE_HF_REPO_ID`
  - `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
  - `VITE_TERMII_API_KEY`, `VITE_TERMII_SENDER_ID`

**Build:**

- [`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js): Rollup manual vendor chunking (`vendor-xlsx`, `vendor-jspdf`, `vendor-recharts`, `vendor-mui`, `vendor-firebase`, `vendor-appwrite`), PWA cache rules, Vitest setup, and proxy to Firebase Cloud Functions `/api`.
- [`firebase.json`](file:///home/admin/Projects/ricgcw/firebase.json): Configures Firebase Hosting (public `dist`, SPA rewrites) and Cloud Functions deployment.
- [`firestore.rules`](file:///home/admin/Projects/ricgcw/firestore.rules): Security rules for Cloud Firestore collections.

## Platform Requirements

**Development:**

- Node.js 18+ (Node 22 recommended).
- npm 9+ with `--legacy-peer-deps`.
- Port 4000 (Vite dev server default per [`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L113)).

**Production:**

- Google Firebase Hosting (global CDN distribution for Vite static output).
- Google Firebase Cloud Functions (Node.js 22 runtime in `us-central1`).
- Appwrite Cloud (`nyc.cloud.appwrite.io`) for identity and session management.

---

*Stack analysis: 2026-09-21*
