---
last_mapped_commit: 69a60581989600e6a61780065108474cfbf1c25f
last_mapped_at: 2026-09-21
---
<!-- refreshed: 2026-09-21 -->

# Architecture

**Analysis Date:** 2026-09-21

## System Overview

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER                                     │
│  React 19 + Material UI (MUI v7) + Framer Motion                                       │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│       Atomic Components  │           Layout            │             Pages             │
│  `src/components/atoms`  │   `src/components/Layout`   │  `src/pages/Dashboard.jsx`    │
│  `src/components/molec`  │   `src/components/layout/`  │  `src/pages/Members.jsx`      │
│  `src/components/organ`  │   `src/routes/Router.jsx`   │  `src/pages/Financials.jsx`   │
└────────────┬─────────────┴──────────────┬──────────────┴───────────────┬────────────────┘
             │                            │                              │
             ▼                            ▼                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE & ORCHESTRATION LAYER                               │
│  Context Providers & Client Lifecycle Hooks                                            │
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│  Authentication & RBAC (`AuthContext`)  │  Multi-Workspace Governance (`WorkspaceCtx`) │
│  `src/context/AuthContext.jsx`          │  `src/context/WorkspaceContext.jsx`          │
├─────────────────────────────────────────┴──────────────────────────────────────────────┤
│  Domain Utilities & Security Engines                                                   │
│  `src/utils/dualCustody.js`   `src/utils/safetyTokens.js`   `src/utils/churnAlert.js`  │
│  `src/utils/autoRoster.js`    `src/utils/fuzzyMatch.js`     `src/utils/dateUtils.js`   │
└────────────┬────────────────────────────┬──────────────────────────────┬───────────────┘
             │                            │                              │
             ▼                            ▼                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA & EXTERNAL SERVICE LAYER                             │
├──────────────────────┬──────────────────────────┬──────────────────────┬───────────────┤
│  Firebase Firestore  │  Appwrite Cloud          │  Paystack / Termii   │ Hugging Face  │
│  `src/firebase.js`   │  `src/appwrite.js`       │  `src/utils/comm...` │ `src/utils/hf`│
└──────────────────────┴──────────────────────────┴──────────────────────┴───────────────┘
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

**Overall:** Hybrid Serverless Single Page Application (SPA) with Atomic Component architecture and Multi-tenant Workspace segmentation.

**Key Characteristics:**

- **Hybrid Cloud Architecture:** Leverages Appwrite Cloud for authenticated identity sessions and user labels, combined with Google Cloud Firestore for high-throughput real-time database subscriptions and synchronization.
- **Hierarchical Role-Based Access Control (RBAC):** Strict 5-tier permission model (`developer` > `admin` > `branch_admin` > `minister` > `member`/`guest`) enforced at route transitions and UI component renders.
- **Domain Guardrails & Data Auditing:** Financial compliance enforced through dual-custody verification algorithms ([`src/utils/dualCustody.js`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js)); child safety secured via paired guardian-child pairing tokens with 12-hour TTLs ([`src/utils/safetyTokens.js`](file:///home/admin/Projects/ricgcw/src/utils/safetyTokens.js)).
- **Automated Self-Healing Data:** Age-based member classification automatically transitions members between Children's Court (<13), Youth Ministry (13–35), and Main Sanctuary upon administrative dashboard access ([`src/utils/syncDepartments.js`](file:///home/admin/Projects/ricgcw/src/utils/syncDepartments.js)).

## Layers

**Presentation Layer:**

- Purpose: Render user interfaces, handle responsive layouts, and orchestrate user interactions.
- Location: [`src/pages/`](file:///home/admin/Projects/ricgcw/src/pages/), [`src/components/`](file:///home/admin/Projects/ricgcw/src/components/).
- Contains: React JSX pages, atomic UI components (atoms, molecules, organisms), layout bars, and modals.
- Depends on: Material UI, Framer Motion, React Router, Context hooks.
- Used by: End users (administrators, ministers, church members).

**Application State & Context Layer:**

- Purpose: Manage shared application state, auth sessions, current workspace, notifications, and theme modes.
- Location: [`src/context/`](file:///home/admin/Projects/ricgcw/src/context/), [`src/hooks/`](file:///home/admin/Projects/ricgcw/src/hooks/).
- Contains: `AuthContext.jsx`, `WorkspaceContext.jsx`, `useSessionTimeout.js`.
- Depends on: `src/appwrite.js`, `src/firebase.js`, browser Web Storage APIs.
- Used by: All components across the presentation layer.

**Business Logic & Domain Layer:**

- Purpose: Pure functional logic for domain rules, calculations, formatting, and cryptography.
- Location: [`src/utils/`](file:///home/admin/Projects/ricgcw/src/utils/).
- Contains: Audit checks, volunteer roster scheduling, churn prediction, Levenshtein fuzzy matching, and AES-256 pastoral note encryption.
- Depends on: `date-fns`, `crypto-js`, `axios`.
- Used by: Pages and dialogs executing operational workflows.

**Backend Services Layer:**

- Purpose: Cloud functions and external provider APIs.
- Location: [`functions/`](file:///home/admin/Projects/ricgcw/functions/), external cloud endpoints.
- Contains: Express app running on Firebase Cloud Functions, Paystack webhooks, Appwrite, and Firestore.

## Data Flow

### Primary Request Path

1. **User Interaction:** User updates a record or initiates an action (e.g., adding a member in [`src/components/AddMemberDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/AddMemberDialog.jsx)).
2. **Client Validation & Transformation:** Input validated client-side; age categorized via [`src/utils/dateUtils.js`](file:///home/admin/Projects/ricgcw/src/utils/dateUtils.js#L14).
3. **Firestore Mutation:** Document written directly to Firestore collection (`members`) using Firestore SDK.
4. **Real-time Listener Update:** `onSnapshot` subscriptions in active views ([`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx)) automatically refresh the UI state.
5. **Notification:** Global feedback banner rendered via `showNotification` in [`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx#L85).

### Secondary Flow: Identity Mimicry (Dev Governance)

1. Developer navigates to Developer panel ([`src/pages/Developer.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Developer.jsx)) and selects target user to impersonate.
2. `startMimicking` saves override metadata into `localStorage('mimicData')` without modifying cloud credentials.
3. `WorkspaceContext` emits computed `userRole` and `userBranch`.
4. Navigation bars and route guards reactively restrict or grant access matching the mimicked role.

**State Management:**

- Application state is predominantly maintained via React Context (`AuthContext`, `WorkspaceContext`, `ColorModeContext`), supplemented by localized component `useState` and Firestore real-time snapshots (`onSnapshot`).

## Key Abstractions

**Multi-Workspace Context:**

- Purpose: Isolates data views between church campuses/departments (Sanctuary, Youth, Children's Court).
- Examples: [`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx), [`src/pages/QuickSwitch.jsx`](file:///home/admin/Projects/ricgcw/src/pages/QuickSwitch.jsx).
- Pattern: React Context Provider with persistent `localStorage` synchronization.

**Field-Level Pastoral Note Encryption:**

- Purpose: Protects confidential counseling notes from unauthenticated database viewing.
- Examples: [`src/utils/noteEncryption.js`](file:///home/admin/Projects/ricgcw/src/utils/noteEncryption.js).
- Pattern: AES-256 symmetric cipher encryption with custom secret key requirement.

**Dual Custody Ledger Verification:**

- Purpose: Prevents financial fraud by requiring two separate administrative signatures on physical batch deposits.
- Examples: [`src/utils/dualCustody.js`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js), [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx).
- Pattern: Pure validator function enforcing signature distinctness and mathematical sum parity.

## Entry Points

**Web Application Entry:**

- Location: [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx)
- Triggers: Browser page load of `index.html`.
- Responsibilities: Sentry instrumentation, mounting React DOM tree to `#root`.

**App Component Entry:**

- Location: [`src/App.jsx`](file:///home/admin/Projects/ricgcw/src/App.jsx)
- Triggers: Rendered by `main.jsx`.
- Responsibilities: Mounts `ColorModeProvider`, MUI `ThemeProvider`, `CssBaseline`, `BrowserRouter`, `AuthProvider`, `WorkspaceProvider`, and `Layout`.

**Backend Cloud Functions Entry:**

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

**Strategy:** Multi-tiered defense using Sentry error tracking, top-level React ErrorBoundary, and inline user notifications.

**Patterns:**

- Global Unhandled Exception Capture: Sentry SDK initialized in [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx).
- Component Error Boundaries: [`src/components/ErrorBoundary.jsx`](file:///home/admin/Projects/ricgcw/src/components/ErrorBoundary.jsx) wraps views to prevent white-screen crashes.
- User-Facing Notifications: Centralized `showNotification(message, severity)` in [`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx).

## Cross-Cutting Concerns

- **Logging:** Structured console messaging and Firestore audit logging for sensitive financial and member actions.
- **Validation:** Pure utility functions for domain data validation (`src/utils/*`) before persistence.
- **Authentication & Authorization:** Guard components `RequireAuth` and `RequireRole` in [`src/routes/Router.jsx`](file:///home/admin/Projects/ricgcw/src/routes/Router.jsx).

---

*Architecture analysis: 2026-09-21*
