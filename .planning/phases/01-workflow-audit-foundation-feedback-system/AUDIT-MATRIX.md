# RICGCW Workflow Audit & Technical Defect Matrix

**Date:** 2026-09-21  
**Phase:** Phase 1: Workflow Audit, Foundation & Feedback System  
**Decisions Covered:** `D-01` (Comprehensive audit matrix across all 12+ primary views), `D-02` (Trace end-to-end user journeys)  
**Status:** Complete  

---

## Executive Summary

This empirical audit analyzes the 12+ primary user views and their underlying components in the RICGCW Church Management System. The objective is to establish an unvarnished baseline of direct Firestore mutations, broken/disconnected states, missing error recovery, and feedback gaps across the application.

### Key Global Findings
1. **Pervasive UI-Layer Mutations:** React views directly import and call `addDoc`, `setDoc`, `updateDoc`, and `deleteDoc` from `firebase/firestore`, violating separation of concerns and preventing uniform audit logging, validation, or schema migration.
2. **Disconnected Async Feedback:** Creation dialogs and table actions exhibit inconsistent loading state representations (some use full-page spinners, some lack any indicator, none use row/column table skeletons).
3. **Silent Error Swallowing:** Multiple components catch errors with `console.error` without alerting the user via `showNotification` or providing recovery paths in `ErrorBoundary`.
4. **Console Warning Root Cause:** `src/components/organisms/TrendChartCard.jsx` invokes an MUI `Select` with `value={filterValue}` where `filterValue` is passed as `undefined` from `src/pages/Dashboard.jsx:911`, causing persistent out-of-range warnings in development and testing.

---

## 1. Primary Views Audit Summary

| View / Module | Route | File Path | Direct Firestore Calls | Missing States | Severity |
|---|---|---|---|---|---|
| **Members** | `/members` | [`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx) | `getDocs` (L167, L214), `setDoc` (L231, L330), `addDoc` (L311), `deleteDoc` (L345, L366) | Skeletons missing; empty state missing call-to-action button | High |
| **Member Onboarding** | Modal | [`src/components/AddMemberDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/AddMemberDialog.jsx) | `getDocs` (L73) | Inline validation errors don't scroll into view; family member lookups lack debounce | Medium |
| **Member Inspection** | Modal | [`src/components/MemberDetailsDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/MemberDetailsDialog.jsx) | `getDocs` (L185, L234), `addDoc` (L291) | Monolithic 1,542-line component; silent transaction write failures | High |
| **Attendance** | `/attendance` | [`src/pages/Attendance.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Attendance.jsx) | `getDocs` (L130, L131), `setDoc` (L239, L265), `deleteDoc` (L288) | Missing table skeleton during date change; lacks duplicate check-in alert | High |
| **Self Check-In** | `/self-check-in` | [`src/pages/SelfCheckIn.jsx`](file:///home/admin/Projects/ricgcw/src/pages/SelfCheckIn.jsx) | `getDocs` (L69), `setDoc` (L129), `updateDoc` (L137) | Camera permission rejection has no fallback retry; race condition on simultaneous check-in | Medium |
| **Financials** | `/financials` | [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx) | `getDocs` (L156), `setDoc` (L210), `addDoc` (L213), `deleteDoc` (L256) | Lacks visual dual-custody verification modal; manual math reconciliation | Critical |
| **Digital Giving** | Modal | [`src/components/DigitalGivingDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/DigitalGivingDialog.jsx) | `addDoc` (L62) | Currency hardcoded to GHS; fails silently if network drops after Paystack success | High |
| **Events & Volunteers** | `/events` | [`src/pages/Events.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Events.jsx) | `getDocs` (L74), `addDoc` (L164), `deleteDoc` (L188), `setDoc` (L201) | Roster conflict warnings are purely cosmetic; delete event does not remove assignments | Medium |
| **Dashboard** | `/` | [`src/pages/Dashboard.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.jsx) | `addDoc` (L173), `getDocs` (L209-L212) | MUI Select warning on timeframe filter; fetches full collections without pagination | Medium |
| **Live Bible** | `/bible` | [`src/pages/LiveBible.jsx`](file:///home/admin/Projects/ricgcw/src/pages/LiveBible.jsx) | Third-party REST API | Hardcoded API key in `bibleApi.js`; chapter fetch errors lack offline cache fallback | Medium |
| **Bible Studies** | `/studies` | [`src/pages/BibleStudies.jsx`](file:///home/admin/Projects/ricgcw/src/pages/BibleStudies.jsx) | `getDocs` (L90, L91), `deleteDoc` (L137, L153) | Resource download does not check authentication headers; missing empty state CTA | Low |
| **Gallery** | `/gallery` | [`src/pages/Gallery.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Gallery.jsx) | `getDocs` (L61), `addDoc` (L115), `deleteDoc` (L142) | Image upload progress bar missing; no confirmation before image deletion | Medium |
| **User Management** | `/users` | [`src/pages/UserManagement.jsx`](file:///home/admin/Projects/ricgcw/src/pages/UserManagement.jsx) | `getDocs` (L59), `deleteDoc` (L102) | Role escalation not validated backend-side; user delete leaves orphaned member record | Critical |
| **Developer Console** | `/developer` | [`src/pages/Developer.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Developer.jsx) | `getDocs` (L71) | Mimicry mode does not indicate which session token is active | Low |
| **Public Visitor Join** | `/join` | [`src/pages/Join.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Join.jsx) | `addDoc` (L129) | Public registration creates unvetted member record with default status 'active' | High |

---

## 2. Detailed Findings by Domain

## Member & Registry Workflows

### 1. Member Onboarding & Registration
- **Files:** [`src/pages/Members.jsx:307-322`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx#L307-L322), [`src/components/AddMemberDialog.jsx:135-165`](file:///home/admin/Projects/ricgcw/src/components/AddMemberDialog.jsx#L135-L165), [`src/pages/Join.jsx:120-135`](file:///home/admin/Projects/ricgcw/src/pages/Join.jsx#L120-L135)
- **Current Behavior:** 
  - `AddMemberDialog` gathers member inputs, validates `name` and `branch`, then calls `onAddMember(payload)` passed from `Members.jsx`.
  - `Members.jsx` invokes `addDoc(collection(db, "members"), ...)` directly inline.
  - Public visitors submitting the form at `/join` directly call `addDoc(collection(db, "members"), ...)` with no rate limiting or verification.
- **Defects & Disconnections:**
  - Duplicate email, phone, or name checks are nonexistent during onboarding.
  - Auto-generated `memberId` (e.g. `RICG-0012`) is computed on the client via `generateBulkMemberIds` rather than atomically assigned upon record creation.
  - Public registrations via `/join` bypass approval workflows and immediately become `status: 'active'`.
- **Required Remediation (Plan 01-02):**
  - Implement `createMember(memberData)` in `src/services/memberService.js` enforcing schema validation, duplicate detection, and automated `memberId` sequence creation.
  - Migrate `Members.jsx`, `AddMemberDialog.jsx`, and `Join.jsx` to consume `memberService.createMember()`.

### 2. Member Profile Inspection & Lifecycle Mutations
- **Files:** [`src/components/MemberDetailsDialog.jsx:180-350`](file:///home/admin/Projects/ricgcw/src/components/MemberDetailsDialog.jsx#L180-L350), [`src/pages/Members.jsx:325-375`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx#L325-L375)
- **Current Behavior:**
  - `MemberDetailsDialog` mixes 6 distinct tabs (Profile, Attendance, Giving, Family, Ministry, Counseling Notes).
  - Editing member profile triggers `handleUpdateMember` which executes `setDoc(doc(db, "members", id), updatedMember, { merge: true })`.
  - Adding a financial transaction directly from the member detail dialog calls `addDoc(collection(db, "transactions"), payload)` on line 291 without treasury dual-custody approval.
- **Defects & Disconnections:**
  - Pastoral counseling notes encryption in `src/utils/noteEncryption.js` relies on a session key that defaults to insecure memory state if unconfigured.
  - Deleting a member via `handleDeleteMember` (`deleteDoc`) permanently purges the Firestore record instead of soft-deleting (`status: 'archived'` or `'inactive'`), risking orphaned attendance and financial transactions.
- **Required Remediation (Plan 01-02 & Phase 2):**
  - Implement `updateMember` and `deleteMember` (soft delete) in `src/services/memberService.js`.
  - Enforce confirmation modal via `showConfirmation` before any member archiving or deletion.

### 3. Attendance Logging & Self Check-In
- **Files:** [`src/pages/Attendance.jsx:220-295`](file:///home/admin/Projects/ricgcw/src/pages/Attendance.jsx#L220-L295), [`src/pages/SelfCheckIn.jsx:110-150`](file:///home/admin/Projects/ricgcw/src/pages/SelfCheckIn.jsx#L110-L150)
- **Current Behavior:**
  - Manual check-in writes directly to `attendance` collection via `setDoc(doc(db, "attendance", recordId), recordData, { merge: true })`.
  - `SelfCheckIn.jsx` decodes QR codes, queries member list, and updates Firestore with `updateDoc(recordRef, { attendees: arrayUnion(attendeeData) })`.
- **Defects & Disconnections:**
  - Simultaneous check-ins at peak service times race on the same document if attendees array updates collide.
  - Token expiration for child check-in safety tokens (`safetyTokens.js`) is verified client-side without backend invalidation.
- **Required Remediation (Plan 01-02 & Phase 3):**
  - Encapsulate attendance writes in `src/services/attendanceService.js` (`recordAttendance`, `getAttendanceByDate`).

---

## Treasury & Financial Workflows

### 1. General Ledger & Cash Deposits
- **Files:** [`src/pages/Financials.jsx:150-265`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx#L150-L265), [`src/utils/dualCustody.js:1-50`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js#L1-L50)
- **Current Behavior:**
  - Transactions are fetched via `getDocs(collection(db, "transactions"))` and held in state.
  - Adding or editing a ledger transaction executes `setDoc` or `addDoc` directly in `Financials.jsx:210-213`.
  - Deleting a transaction (`Financials.jsx:256`) uses `deleteDoc` directly without requiring secondary administrative approval.
- **Defects & Disconnections:**
  - Dual-custody verification rules defined in `src/utils/dualCustody.js` (`validateBatchDeposit`) are implemented as pure functions but are NOT enforced before persisting manual transactions in `Financials.jsx`.
  - Currency conversion and decimal calculations have minor floating-point precision hazards (e.g. `Number(amount)` rather than integer pesewas).
- **Required Remediation (Plan 01-02 & Phase 4):**
  - Implement `src/services/financialService.js` with `recordTransaction`, `recordBatchDeposit`, and `deleteTransaction`.
  - Integrate `validateBatchDeposit` guard in `financialService.js` to reject un-countersigned batch deposits before Firestore commit.

### 2. Digital Giving via Paystack
- **Files:** [`src/components/DigitalGivingDialog.jsx:45-75`](file:///home/admin/Projects/ricgcw/src/components/DigitalGivingDialog.jsx#L45-L75)
- **Current Behavior:**
  - Invokes Paystack popup with `config.publicKey`.
  - On Paystack `onSuccess(reference)`, constructs a payload and executes `await addDoc(collection(db, "transactions"), payload)` on line 62.
- **Defects & Disconnections:**
  - If the client's network disconnects immediately after Paystack charges the user's card/momo, the Firestore `addDoc` fails, leaving the payment unrecorded in the church ledger with only an unhandled error notification.
  - No webhook verification handshake with Cloud Functions (`functions/index.js`) occurs for client-initiated transactions.
- **Required Remediation (Plan 01-02):**
  - Refactor `DigitalGivingDialog.jsx` to call `financialService.recordTransaction()`.
  - Standardize error fallback and transaction reference indexing.

### 3. Events & Volunteer Rostering
- **Files:** [`src/pages/Events.jsx:155-215`](file:///home/admin/Projects/ricgcw/src/pages/Events.jsx#L155-L215), [`src/utils/autoRoster.js`](file:///home/admin/Projects/ricgcw/src/utils/autoRoster.js), [`src/utils/conflictChecker.js`](file:///home/admin/Projects/ricgcw/src/utils/conflictChecker.js)
- **Current Behavior:**
  - Events are created via `addDoc(collection(db, "events"), eventData)` on line 164.
  - Updating volunteer slots executes `setDoc` on line 201.
- **Defects & Disconnections:**
  - Deleting an event (`deleteDoc` on line 188) leaves volunteer assignments intact in member activity histories.
  - Roster conflict checking (`conflictChecker.js`) is only run during manual modal assignment, not during event modification.
- **Required Remediation (Plan 01-02 & Phase 5):**
  - Implement `src/services/eventService.js` with `createEvent`, `updateVolunteerSlots`, and `deleteEvent`.

---

## Governance, Feedback & Error Boundary

### 1. Dashboard Select Warning & Full Collection Fetches
- **Files:** [`src/pages/Dashboard.jsx:911`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.jsx#L911), [`src/components/organisms/TrendChartCard.jsx:38`](file:///home/admin/Projects/ricgcw/src/components/organisms/TrendChartCard.jsx#L38)
- **Defect:**
  - In `src/pages/Dashboard.jsx:911`: `<TrendChartCard title="Revenue Overview" ... />` fails to pass `filterValue`.
  - In `src/components/organisms/TrendChartCard.jsx:38`: `<Select value={filterValue} ...>` receives `undefined`.
  - Result: Runtime console warning: `MUI: You have provided an out-of-range value 'undefined' for the select component`.
- **Remediation (Plan 01-03):**
  - Provide a default filter prop (`filterValue = '30d'`) in `TrendChartCard.jsx` and pass explicit filter state from `Dashboard.jsx`.

### 2. Error Boundary Resilience & Sentry Instrumentation
- **Files:** [`src/components/ErrorBoundary.jsx:33-45`](file:///home/admin/Projects/ricgcw/src/components/ErrorBoundary.jsx#L33-L45), [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx)
- **Defect:**
  - `componentDidCatch(error, errorInfo)` in `ErrorBoundary.jsx` outputs only to `console.error` and lacks an explicit Sentry capture call (`Sentry.captureException(error, { extra: errorInfo })`).
  - Error fallback UI lacks a "Copy Error Details" button, making remote user troubleshooting difficult.
- **Remediation (Plan 01-02):**
  - Harden `ErrorBoundary.jsx` with explicit Sentry logging, reset handlers, and error detail diagnostics.

### 3. Loading Skeletons & Visual Empty States
- **Files:** [`src/pages/Members.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Members.jsx), [`src/pages/Financials.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Financials.jsx), [`src/pages/Attendance.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Attendance.jsx)
- **Defect:**
  - While fetching records, pages render blank cards or indeterminate circular spinners that cause massive layout shifts when data resolves.
  - When tables or filtered searches return 0 records, views display blank containers or generic text without icons or actionable "Add Record" buttons.
- **Remediation (Plan 01-03):**
  - Build reusable `TableSkeleton` molecule (`src/components/molecules/TableSkeleton.jsx`).
  - Build reusable `EmptyState` molecule (`src/components/molecules/EmptyState.jsx`).
  - Integrate both molecules into `Members.jsx`, `Financials.jsx`, and `Attendance.jsx`.

### 4. Global Destructive Confirmations
- **Files:** [`src/context/WorkspaceContext.jsx`](file:///home/admin/Projects/ricgcw/src/context/WorkspaceContext.jsx), [`src/components/ConfirmationDialog.jsx`](file:///home/admin/Projects/ricgcw/src/components/ConfirmationDialog.jsx)
- **Defect:**
  - While `WorkspaceContext` exports `showConfirmation`, several pages still use native `window.confirm()` or invoke `deleteDoc` without secondary confirmation.
- **Remediation (Plan 01-03):**
  - Enforce `showConfirmation` across all row deletion actions in `Members.jsx`, `Financials.jsx`, and `Attendance.jsx`.

---

## 3. Remediation Action Plan

### Plan 01-02: Centralized Service Layer (`src/services/`)
1. Create `src/services/memberService.js` and `memberService.test.js`
2. Create `src/services/attendanceService.js` and `attendanceService.test.js`
3. Create `src/services/financialService.js` and `financialService.test.js`
4. Create `src/services/eventService.js` and `eventService.test.js`
5. Refactor `AddMemberDialog.jsx` and `DigitalGivingDialog.jsx` to use service layer
6. Harden `ErrorBoundary.jsx` with Sentry integration

### Plan 01-03: Visual Feedback & Guardrails
1. Create `src/components/molecules/TableSkeleton.jsx`
2. Create `src/components/molecules/EmptyState.jsx`
3. Fix MUI Select `undefined` warning in `TrendChartCard.jsx`
4. Integrate `TableSkeleton` and `EmptyState` in `Members.jsx`, `Financials.jsx`, `Attendance.jsx`
5. Wire destructive actions through `showConfirmation` in `WorkspaceContext`

---
*Audit completed: 2026-09-21*
