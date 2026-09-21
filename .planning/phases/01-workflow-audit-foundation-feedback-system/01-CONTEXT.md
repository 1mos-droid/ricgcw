# Phase 1: Workflow Audit, Foundation & Feedback System - Context

**Gathered:** 2026-09-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Catalog and audit all broken, disconnected, and incomplete workflows across existing modules. Decouple direct Firestore UI mutations into a centralized service layer (`src/services/`). Establish a unified global notification/feedback system (toasts, skeletons, empty states, confirmation dialogs) and error boundaries. Feature additions are explicitly prohibited; this phase establishes architectural stability and operational completeness.

</domain>

<decisions>
## Implementation Decisions

### Workflow Audit Strategy
- **D-01:** Comprehensive audit matrix across all 12+ primary views (`Members`, `Attendance`, `Financials`, `Events`, `BibleStudies`, `LiveBible`, `Gallery`, `UserManagement`, `QuickSwitch`, `Settings`, `SelfCheckIn`, `Join`).
- **D-02:** Trace full end-to-end user journeys (Create → Read → Update → Delete / Complete) and catalog disconnected state, missing validation, or orphaned Firestore records.

### Service Layer Architecture
- **D-03:** Create dedicated domain service modules under `src/services/`:
  - `memberService.js`: Member CRUD, profile queries, family linkages, department sync.
  - `attendanceService.js`: Attendance check-in mutations, query filters, token validation.
  - `financialService.js`: Transaction ledger writes, dual-custody verification, balance queries.
  - `eventService.js`: Event scheduling, volunteer assignments, roster queries.
- **D-04:** UI components MUST NOT call `addDoc`, `updateDoc`, `deleteDoc`, or direct Firestore primitives inline; they must call the dedicated service layer methods.

### Global Feedback & Notifications
- **D-05:** Standardize on `WorkspaceContext` `showNotification(message, severity)` for all user-facing success, error, info, and warning banners.
- **D-06:** Implement standardized reusable MUI skeletons for loading states across all tables, cards, and detail dialogs.
- **D-07:** Implement meaningful empty states with clear iconography and call-to-action buttons when collections contain no records.
- **D-08:** Destructive operations (revoking members, deleting transactions, clearing rosters) MUST trigger `ConfirmationDialog` before executing.

### the agent's Discretion
- Exact layout and animation parameters of loading skeletons and empty-state illustrations.
- Helper function signatures within individual service modules.
- Error formatting and Sentry event tag tagging.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Conventions
- `.planning/PROJECT.md` — Project core value, active requirements, and constraints.
- `.planning/codebase/ARCHITECTURE.md` — System overview, layer boundaries, and anti-patterns.
- `.planning/codebase/CONVENTIONS.md` — Coding conventions, error handling standards, and JSDoc guidelines.
- `.planning/codebase/CONCERNS.md` — Identified tech debt, monolithic files, and known warnings.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/context/WorkspaceContext.jsx`: Provides `showNotification` and `showConfirmation` handlers.
- `src/components/ConfirmationDialog.jsx`: Existing reusable confirmation modal.
- `src/components/ErrorBoundary.jsx`: Top-level React error boundary.
- `src/theme.jsx`: Design tokens for background glassmorphism, borders, and typography.

### Established Patterns
- Vitest unit tests co-located next to implementation files (`*.test.js`, `*.test.jsx`).
- Material UI (MUI v7) components styled via sx props and theme tokens.

### Integration Points
- `src/firebase.js`: Primary Firestore client connection (`db`).
- `src/services/`: New destination directory for encapsulated Firestore interactions.

</code_context>

<specifics>
## Specific Ideas

- "Do not simply add more features. First identify broken, incomplete, disconnected or duplicated workflows in the existing system and make the current functionality reliable and coherent."
- "The user should always understand: what is happening, whether an action succeeded, whether something failed, what needs their attention, what they can do next."

</specifics>

<deferred>
## Deferred Ideas

- Refactoring monolithic `MemberDetailsDialog.jsx` sub-tabs — Phase 2
- Automated volunteer auto-rostering algorithms and Termii SMS integration — Phase 5
- Dual-custody multi-signature UI approval modal — Phase 4

</deferred>

---

*Phase: 01-workflow-audit-foundation-feedback-system*
*Context gathered: 2026-09-21*
