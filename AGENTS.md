<!-- GSD:project-start source:PROJECT.md -->

## Project

**RICGCW Church Management System**

A unified, production-ready Church Management System (CMS) that serves as the operational backbone for the Redeemed Christian Church of God, Word Assembly (RICGCW). Designed for administrators, pastors, department leaders, workers, and members, it connects registry governance, real-time attendance, dual-custody financial controls, volunteer rostering, communications, and spiritual resources into an integrated SaaS-grade platform.

**Core Value:** A unified, auditable operational backbone where every major church workflow—from member registry and attendance to financial custody and volunteer coordination—flows reliably, securely, and cohesively across desktop and mobile.

### Constraints

- **Tech Stack**: React 19, Vite, Material UI (MUI v7), Cloud Firestore, Appwrite Cloud, Termii SMS, Paystack.
- **Security & Authorization**: Authorization must be strictly enforced via Firestore security rules and backend validation—never rely on UI element visibility alone.
- **Financial Compliance**: Dual-custody approval workflows require two distinct administrative signatures and reconciled math before ledger finalization.
- **Mobile Usability**: Primary church workers and congregants interact via mobile devices; touch ergonomics, PWA performance, and responsive layouts are mandatory.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- JavaScript (ES2020+ / JSX) - Entire frontend application in [`src/`](file:///home/admin/Projects/ricgcw/src/) and root config files.
- Node.js JavaScript (CommonJS / ES Module) - Cloud Functions backend in [`functions/`](file:///home/admin/Projects/ricgcw/functions/).
- HTML5 / CSS3 - Base markup in [`index.html`](file:///home/admin/Projects/ricgcw/index.html), global styles and resets in [`src/index.css`](file:///home/admin/Projects/ricgcw/src/index.css) and [`src/pages/Dashboard.css`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.css).

## Runtime

- Node.js: Recommended >= 18.0.0 (Cloud Functions targets Node 22 per [`functions/package.json`](file:///home/admin/Projects/ricgcw/functions/package.json#L13)).
- Browser: Modern evergreen browsers (Chrome, Safari, Firefox, Edge) supporting ES2020 and PWA standards.
- npm
- Lockfile: Present ([`package-lock.json`](file:///home/admin/Projects/ricgcw/package-lock.json) and [`functions/package-lock.json`](file:///home/admin/Projects/ricgcw/functions/package-lock.json)).
- Note: Installs typically require `--legacy-peer-deps` due to React 19 release candidate peer dependency constraints.

## Frameworks

- React `^19.0.0-rc-f994737d14-20240522` - Component UI architecture ([`package.json`](file:///home/admin/Projects/ricgcw/package.json#L32)).
- React DOM `^19.0.0-rc-f994737d14-20240522` - DOM rendering ([`package.json`](file:///home/admin/Projects/ricgcw/package.json#L33)).
- React Router DOM `^6.25.1` - Client-side single page app routing with nested guards in [`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx).
- Material UI (MUI v7) `^7.3.7` (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`) - Design system & UI components ([`src/theme.jsx`](file:///home/admin/Projects/ricgcw/src/theme.jsx)).
- Framer Motion `^11.3.19` - Micro-interactions and route transition animations ([`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx#L45)).
- Vitest `^4.0.18` - Unit & component test runner ([`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L121)).
- `@testing-library/react` `^16.3.2` & `@testing-library/jest-dom` `^6.9.1` - React DOM component assertions.
- `jsdom` `^28.1.0` - Browser simulation environment for headless testing.
- `@vitest/coverage-v8` `^4.0.18` - V8 code coverage reporter.
- Vite `^7.2.4` - Development server with HMR, fast Rollup-based production bundler ([`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js)).
- `@vitejs/plugin-react` `^5.1.1` - React Fast Refresh integration.
- `vite-plugin-pwa` `^1.2.0` - Progressive Web App service worker generation and Web App Manifest management ([`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L9)).
- ESLint `^9.39.1` - Flat configuration linting ([`eslint.config.js`](file:///home/admin/Projects/ricgcw/eslint.config.js)).

## Key Dependencies

- `firebase` `^12.8.0` - Firestore real-time database and Cloud Storage client ([`src/firebase.js`](file:///home/admin/Projects/ricgcw/src/firebase.js)).
- `appwrite` `^23.0.0` - Authentication, sessions, user accounts, and server-side preferences ([`src/appwrite.js`](file:///home/admin/Projects/ricgcw/src/appwrite.js)).
- `react-paystack` `^6.0.0` - Payment gateway integration for digital tithes and offerings in GHS ([`src/components/DigitalGivingDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/DigitalGivingDialog.jsx)).
- `@huggingface/hub` `^2.12.0` - LFS media upload and storage via Hugging Face dataset commits ([`src/utils/huggingFaceApi.js`](file:///home/admin/Projects/ricgcw/src/utils/huggingFaceApi.js)).
- `date-fns` `^3.6.0` - Date arithmetic, age calculations, and ISO formatting ([`src/utils/dateUtils.js`](file:///home/admin/Projects/ricgcw/src/utils/dateUtils.js)).
- `crypto-js` `^4.2.0` - AES-256 encryption for confidential pastoral counseling notes ([`src/utils/noteEncryption.js`](file:///home/admin/Projects/ricgcw/src/utils/noteEncryption.js)).
- `axios` `^1.7.2` - HTTP client for Termii SMS and Bible API calls ([`src/utils/communicationApi.js`](file:///home/admin/Projects/ricgcw/src/utils/communicationApi.js), [`src/utils/bibleApi.js`](file:///home/admin/Projects/ricgcw/src/utils/bibleApi.js)).
- `recharts` `^3.7.0` - Composable SVG charts for financial metrics and attendance trends ([`src/components/FinancialChart.jsx`](file:///home/admin/Projects/ricgcw/src/components/FinancialChart.jsx)).
- `jspdf` `^4.2.0` & `jspdf-autotable` `^5.0.7` - PDF generation for reports and financial statements ([`src/pages/Reports.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Reports.jsx)).
- `xlsx` `^0.18.5` - Spreadsheet data import/export ([`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx), [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx)).
- `html5-qrcode` `^2.3.8` & `react-qr-code` `^2.0.21` - QR code generation and live camera scanner for attendance ([`src/pages/Attendance.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Attendance.jsx), [`src/pages/SelfCheckIn.jsx`](file:///home/admin/Projects/ricgcw/src/pages/SelfCheckIn.jsx)).
- `@emailjs/browser` `^4.4.1` - Client-side transactional email delivery.
- `@sentry/react` `^10.56.0` - Frontend error reporting and performance tracking ([`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx)).

## Configuration

- Configured via Vite environment variables (`import.meta.env.VITE_*`).
- Template defined in [`.env.example`](file:///home/admin/Projects/ricgcw/.env.example).
- Local environment in [`.env`](file:///home/admin/Projects/ricgcw/.env) and production settings in [`.env.production`](file:///home/admin/Projects/ricgcw/.env.production).
- Key variables:
- [`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js): Rollup manual vendor chunking (`vendor-xlsx`, `vendor-jspdf`, `vendor-recharts`, `vendor-mui`, `vendor-firebase`, `vendor-appwrite`), PWA cache rules, Vitest setup, and proxy to Firebase Cloud Functions `/api`.
- [`firebase.json`](file:///home/admin/Projects/ricgcw/firebase.json): Configures Firebase Hosting (public `dist`, SPA rewrites) and Cloud Functions deployment.
- [`firestore.rules`](file:///home/admin/Projects/ricgcw/firestore.rules): Security rules for Cloud Firestore collections.

## Platform Requirements

- Node.js 18+ (Node 22 recommended).
- npm 9+ with `--legacy-peer-deps`.
- Port 4000 (Vite dev server default per [`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L113)).
- Google Firebase Hosting (global CDN distribution for Vite static output).
- Google Firebase Cloud Functions (Node.js 22 runtime in `us-central1`).
- Appwrite Cloud (`nyc.cloud.appwrite.io`) for identity and session management.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- React Components & Pages: PascalCase with `.jsx` extension (e.g., [`src/pages/Dashboard.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.jsx), [`src/components/CommandPalette.jsx`](file:///home/admin/Projects/ricgcw/src/components/CommandPalette.jsx)).
- Utility Functions & Services: camelCase with `.js` extension (e.g., [`src/utils/dualCustody.js`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js), [`src/utils/fuzzyMatch.js`](file:///home/admin/Projects/ricgcw/src/utils/fuzzyMatch.js)).
- Test Files: Co-located with identical base name followed by `.test.js` or `.test.jsx` (e.g., [`src/utils/safetyTokens.test.js`](file:///home/admin/Projects/ricgcw/src/utils/safetyTokens.test.js), [`src/components/Layout.test.jsx`](file:///home/admin/Projects/ricgcw/src/components/Layout.test.jsx)).
- Stylesheets: Matching component name with `.css` (e.g., [`src/pages/Dashboard.css`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.css)) or kebab-case / lowercase for globals ([`src/index.css`](file:///home/admin/Projects/ricgcw/src/index.css)).
- React Functional Components: PascalCase (e.g., `Dashboard`, `TopAppBar`, `RequireAuth`, `DigitalGivingDialog`).
- Custom React Hooks: camelCase with `use` prefix (e.g., `useAuth`, `useWorkspace`, `useColorMode`, `useSessionTimeout`).
- Utility & Algorithm Functions: camelCase verbs (e.g., `calculateSimilarity`, `findDuplicates`, `validateBatchDeposit`, `encryptSensitiveNotes`, `syncMemberDepartments`).
- Local State & Variables: camelCase (e.g., `userRole`, `isLoading`, `memberProfile`, `signedUsers`).
- Module-Level Constants & Configs: UPPER_SNAKE_CASE (e.g., `NAV_ITEMS`, `VERSION_MAP`, `TERMII_BASE_URL`, `MS_IN_4_WEEKS`).
- Boolean Flags: Affirmative prefixes like `is`, `has`, or `can` (e.g., `isAuthenticated`, `isDeveloper`, `hasRole`, `loading`).
- JavaScript with JSDoc type annotations across utility modules (e.g., `@param {string} to`, `@returns {Promise<object>}`).

## Code Style

- 2-space indentation.
- Single quotes for JavaScript strings, double quotes for JSX attributes.
- Semicolons enforced.
- Trailing commas in multi-line object and array literals.
- Configured via ESLint flat configuration in [`eslint.config.js`](file:///home/admin/Projects/ricgcw/eslint.config.js).
- Extends `js.configs.recommended`, `reactHooks.configs.flat.recommended`, and `reactRefresh.configs.vite`.
- Custom rules:
- Global ignores include `dist/`, `dev-dist/`, `functions/`, and `coverage/`.

## Import Organization

- Standard relative imports (`../`, `./`) are used throughout the repository without custom path aliases (e.g., `@/`).

## Error Handling

- Asynchronous API Operations: Wrap all network calls in `try ... catch` blocks; return a standardized response object with `success: false` and `error: string` rather than throwing uncaught exceptions to the UI:
- User Notification: Trigger `showNotification(message, 'error')` from `WorkspaceContext` to provide non-blocking visual snackbars.
- Component-Level Failures: Caught gracefully by [`src/components/ErrorBoundary.jsx`](file:///home/admin/Projects/ricgcw/src/components/ErrorBoundary.jsx).

## Logging

- `console.error` and `console.warn` for runtime error diagnostics.
- Sentry (`@sentry/react`) initialized in [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx) for automated production crash reporting.
- Prefix log messages with domain context (e.g., `console.error('Termii SMS Error:', ...)` or `console.error('Hugging Face commit error:', ...)`).
- Avoid logging sensitive credentials, private keys, or personal member passwords.

## Comments

- Algorithm rationale and business rule logic (e.g., why 12-hour TTL is chosen for child safety tokens or how dual-custody verification calculates ledger parity).
- Section headings in long configuration files (e.g., `// --- PAGE IMPORTS (Lazy Loaded) ---`, `// 🟢 Unified Authentication & Authorization Guards`).
- Required on all public utility functions in [`src/utils/`](file:///home/admin/Projects/ricgcw/src/utils/):

## Function Design

- Utility functions: Short, pure, and focused on a single concern (< 50 lines).
- React components: Prefer decomposing complex sections into child molecules/organisms. Avoid monolithic components exceeding 500 lines.
- Functions with more than 3 parameters should use destructured options objects with defaults.
- Utility validators return structured status objects (e.g., `{ success: true }` or `{ success: false, reason: '...' }`).

## Module Design

- React components and page modules use default exports: `export default Dashboard;`.
- Utilities and helper libraries use named exports: `export const calculateSimilarity = ...`.
- React Context hooks are exported alongside their provider: `export const useWorkspace = ...`.
- Not currently used; components import directly from their specific relative file paths.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` | Root component configuring ThemeProvider, BrowserRouter, AuthProvider, and WorkspaceProvider | [`src/App.jsx`](file:///home/admin/Projects/ricgcw/src/App.jsx) |
| `AppRouter` | Lazy-loaded page route definitions, AnimatePresence transitions, and `RequireAuth`/`RequireRole` guards | [`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx) |
| `AuthContext` | Hybrid authentication lifecycle: Appwrite sessions synchronized with Firestore `users/{email}` profiles | [`src/context/AuthContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/AuthContext.jsx) |
| `WorkspaceContext` | Multi-environment context (`main`, `youth`, `children`), maintenance mode listener, and dev identity mimicry | [`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx) |
| `Layout` | Responsive shell supporting desktop drawer sidebar and mobile glassmorphism bottom navigation | [`src/components/Layout.jsx`](file:///home/admin/Projects/ricgcw/src/components/Layout.jsx) |
| `TopAppBar` | Header navigation bar containing workspace quick switch, command palette shortcut, and user profile menu | [`src/components/layout/TopAppBar.jsx`](file:///home/admin/Projects/ricgcw/src/components/layout/TopAppBar.jsx) |
| `SidebarNav` | Main administrative navigation drawer with collapsible groups and role filtering | [`src/components/layout/SidebarNav.jsx`](file:///home/admin/Projects/ricgcw/src/components/layout/SidebarNav.jsx) |
| `CommandPalette` | Quick action spotlight dialog (Ctrl+K / Cmd+K) for instant route navigation and member lookups | [`src/components/CommandPalette.jsx`](file:///home/admin/Projects/ricgcw/src/components/CommandPalette.jsx) |
| `MemberDetailsDialog` | Deep inspection and management dialog for individual congregant records, milestones, and family linkages | [`src/components/MemberDetailsDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/MemberDetailsDialog.jsx) |
| `MasterDataGrid` | Reusable data table component with column sorting, search filtering, and action menus | [`src/components/molecules/MasterDataGrid.jsx`](file:///home/admin/Projects/ricgcw/src/components/molecules/MasterDataGrid.jsx) |
| `DigitalGivingDialog` | Paystack modal integration facilitating mobile money and card giving transactions | [`src/components/DigitalGivingDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/DigitalGivingDialog.jsx) |

## Pattern Overview

- **Hybrid Cloud Architecture:** Leverages Appwrite Cloud for authenticated identity sessions and user labels, combined with Google Cloud Firestore for high-throughput real-time database subscriptions and synchronization.
- **Hierarchical Role-Based Access Control (RBAC):** Strict 5-tier permission model (`developer` > `admin` > `branch_admin` > `minister` > `member`/`guest`) enforced at route transitions and UI component renders.
- **Domain Guardrails & Data Auditing:** Financial compliance enforced through dual-custody verification algorithms ([`src/utils/dualCustody.js`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js)); child safety secured via paired guardian-child pairing tokens with 12-hour TTLs ([`src/utils/safetyTokens.js`](file:///home/admin/Projects/ricgcw/src/utils/safetyTokens.js)).
- **Automated Self-Healing Data:** Age-based member classification automatically transitions members between Children's Court (<13), Youth Ministry (13–35), and Main Sanctuary upon administrative dashboard access ([`src/utils/syncDepartments.js`](file:///home/admin/Projects/ricgcw/src/utils/syncDepartments.js)).

## Layers

- Purpose: Render user interfaces, handle responsive layouts, and orchestrate user interactions.
- Location: [`src/pages/`](file:///home/admin/Projects/ricgcw/src/pages/), [`src/components/`](file:///home/admin/Projects/ricgcw/src/components/).
- Contains: React JSX pages, atomic UI components (atoms, molecules, organisms), layout bars, and modals.
- Depends on: Material UI, Framer Motion, React Router, Context hooks.
- Used by: End users (administrators, ministers, church members).
- Purpose: Manage shared application state, auth sessions, current workspace, notifications, and theme modes.
- Location: [`src/context/`](file:///home/admin/Projects/ricgcw/src/context/), [`src/hooks/`](file:///home/admin/Projects/ricgcw/src/hooks/).
- Contains: `AuthContext.jsx`, `WorkspaceContext.jsx`, `useSessionTimeout.js`.
- Depends on: `src/appwrite.js`, `src/firebase.js`, browser Web Storage APIs.
- Used by: All components across the presentation layer.
- Purpose: Pure functional logic for domain rules, calculations, formatting, and cryptography.
- Location: [`src/utils/`](file:///home/admin/Projects/ricgcw/src/utils/).
- Contains: Audit checks, volunteer roster scheduling, churn prediction, Levenshtein fuzzy matching, and AES-256 pastoral note encryption.
- Depends on: `date-fns`, `crypto-js`, `axios`.
- Used by: Pages and dialogs executing operational workflows.
- Purpose: Cloud functions and external provider APIs.
- Location: [`functions/`](file:///home/admin/Projects/ricgcw/functions/), external cloud endpoints.
- Contains: Express app running on Firebase Cloud Functions, Paystack webhooks, Appwrite, and Firestore.

## Data Flow

### Primary Request Path

### Secondary Flow: Identity Mimicry (Dev Governance)

- Application state is predominantly maintained via React Context (`AuthContext`, `WorkspaceContext`, `ColorModeContext`), supplemented by localized component `useState` and Firestore real-time snapshots (`onSnapshot`).

## Key Abstractions

- Purpose: Isolates data views between church campuses/departments (Sanctuary, Youth, Children's Court).
- Examples: [`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx), [`src/pages/QuickSwitch.jsx`](file:///home/admin/Projects/ricgcw/src/pages/QuickSwitch.jsx).
- Pattern: React Context Provider with persistent `localStorage` synchronization.
- Purpose: Protects confidential counseling notes from unauthenticated database viewing.
- Examples: [`src/utils/noteEncryption.js`](file:///home/admin/Projects/ricgcw/src/utils/noteEncryption.js).
- Pattern: AES-256 symmetric cipher encryption with custom secret key requirement.
- Purpose: Prevents financial fraud by requiring two separate administrative signatures on physical batch deposits.
- Examples: [`src/utils/dualCustody.js`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js), [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx).
- Pattern: Pure validator function enforcing signature distinctness and mathematical sum parity.

## Entry Points

- Location: [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx)
- Triggers: Browser page load of `index.html`.
- Responsibilities: Sentry instrumentation, mounting React DOM tree to `#root`.
- Location: [`src/App.jsx`](file:///home/admin/Projects/ricgcw/src/App.jsx)
- Triggers: Rendered by `main.jsx`.
- Responsibilities: Mounts `ColorModeProvider`, MUI `ThemeProvider`, `CssBaseline`, `BrowserRouter`, `AuthProvider`, `WorkspaceProvider`, and `Layout`.
- Location: [`functions/index.js`](file:///home/admin/Projects/ricgcw/functions/index.js)
- Triggers: HTTP requests to Cloud Functions endpoint or Firebase event triggers.
- Responsibilities: Express router handling backend API endpoints and webhooks.

## Architectural Constraints

- **Single-Threaded Client Execution:** Complex analytical computations (e.g. churn predictions or multi-slot volunteer auto-rostering) run client-side on the UI thread; datasets must remain partitioned.
- **Client-Side Firestore Direct Access:** Client components interact directly with Firestore. Data safety is governed by Firestore security rules ([`firestore.rules`](file:///home/admin/Projects/ricgcw/firestore.rules)) and client route guards.
- **Storage Limits on Hugging Face Media:** File uploads commit directly via git LFS commits on Hugging Face datasets; requires write-scoped personal access tokens.

## Anti-Patterns

### Monolithic Dialog Components

- **What happens:** Dialogs like [`src/components/MemberDetailsDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/MemberDetailsDialog.jsx) exceed 1,500 lines, bundling tabs, edit modes, attendance logs, and delete actions into one file.
- **Why it's wrong:** High cognitive load, difficult to unit test isolated tabs, risks regression when modifying sub-features.
- **Do this instead:** Break sub-tabs into modular components (e.g., `src/components/member/MemberSpiritualEngagement.jsx`).

### Direct Firestore Writes Inside UI Components

- **What happens:** Multiple pages and dialogs invoke `addDoc(collection(db, ...))` directly inline rather than through dedicated repository service functions.
- **Why it's wrong:** Duplicates collection names, schemas, and error-handling across components.
- **Do this instead:** Centralize collection interactions within dedicated service modules (e.g., `src/services/memberService.js`).

## Error Handling

- Global Unhandled Exception Capture: Sentry SDK initialized in [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx).
- Component Error Boundaries: [`src/components/ErrorBoundary.jsx`](file:///home/admin/Projects/ricgcw/src/components/ErrorBoundary.jsx) wraps views to prevent white-screen crashes.
- User-Facing Notifications: Centralized `showNotification(message, severity)` in [`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx).

## Cross-Cutting Concerns

- **Logging:** Structured console messaging and Firestore audit logging for sensitive financial and member actions.
- **Validation:** Pure utility functions for domain data validation (`src/utils/*`) before persistence.
- **Authentication & Authorization:** Guard components `RequireAuth` and `RequireRole` in [`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx).

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
