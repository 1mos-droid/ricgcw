# Phase 1: Workflow Audit, Foundation & Feedback System - Research

**Researched:** 2026-09-21
**Domain:** Enterprise React 19 Architecture, Firestore Service Facades, and Global Feedback Systems
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Comprehensive audit matrix across all 12+ primary views (`Members`, `Attendance`, `Financials`, `Events`, `BibleStudies`, `LiveBible`, `Gallery`, `UserManagement`, `QuickSwitch`, `Settings`, `SelfCheckIn`, `Join`).
- **D-02:** Trace full end-to-end user journeys (Create → Read → Update → Delete / Complete) and catalog disconnected state, missing validation, or orphaned Firestore records.
- **D-03:** Create dedicated domain service modules under `src/services/` (`memberService.js`, `attendanceService.js`, `financialService.js`, `eventService.js`).
- **D-04:** UI components MUST NOT call `addDoc`, `updateDoc`, `deleteDoc`, or direct Firestore primitives inline; they must call dedicated service layer methods.
- **D-05:** Standardize on `WorkspaceContext` `showNotification(message, severity)` for all user-facing success, error, info, and warning banners.
- **D-06:** Implement standardized reusable MUI skeletons for loading states across all tables, cards, and detail dialogs.
- **D-07:** Implement meaningful empty states with clear iconography and call-to-action buttons when collections contain no records.
- **D-08:** Destructive operations (revoking members, deleting transactions, clearing rosters) MUST trigger `ConfirmationDialog` before executing.

### the agent's Discretion
- Exact layout and animation parameters of loading skeletons and empty-state illustrations.
- Helper function signatures within individual service modules.
- Error formatting and Sentry event tag tagging.

### Deferred Ideas (OUT OF SCOPE)
- Refactoring monolithic `MemberDetailsDialog.jsx` sub-tabs — Phase 2
- Automated volunteer auto-rostering algorithms and Termii SMS integration — Phase 5
- Dual-custody multi-signature UI approval modal — Phase 4
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Workflow Audit Matrix | Planning & Docs | UI Verification | Systematically documents gaps and broken data flows across views |
| Service Layer Facade (`src/services/`) | Service / Client API | Firestore Client | Centralizes collection names, schema formatting, and error handling |
| Global Notification & Toasts | Client Context (`WorkspaceContext`) | MUI Presentation | Decouples notification trigger from visual component render |
| Loading Skeletons & Empty States | Presentation Layer | Atomic Molecules | Ensures consistent visual feedback and avoids layout shifts |
| Error Boundary & Sentry Logging | Client Shell | Observability API | Traps component rendering crashes without white-screening the app |
</architectural_responsibility_map>

<research_summary>
## Summary

This phase establishes the operational foundation for the RICGCW Church Management System. Currently, the application has rich UI views but suffers from architectural anti-patterns: components invoke Firestore SDK methods (`addDoc`, `updateDoc`, `getDocs`) inline with inconsistent error handling, user notifications are scattered or omitted during failures, and loading states frequently produce visual layout shifts.

The standard architectural pattern for production-ready React applications backed by Firebase is a **Service Repository Facade**. By introducing `src/services/` (`memberService.js`, `attendanceService.js`, `financialService.js`, `eventService.js`), all database interactions become pure asynchronous functions returning standardized response contracts `{ success, data, error }`. This isolates Firestore dependencies, simplifies testing, and prevents schema divergence.

Simultaneously, a unified feedback architecture leverages the existing `WorkspaceContext` to provide non-blocking toasts, coupled with reusable MUI Skeleton molecules for loading states and high-contrast empty states with action triggers.

**Primary recommendation:** Build a dedicated `src/services/` layer with standardized `{ success, data, error }` contracts first, wire existing views to call these services with global `showNotification` feedback, and document all workflow disconnects in a structured audit artifact.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | `^19.0.0-rc` | Component architecture | Declarative UI and concurrent rendering |
| Material UI (MUI) | `^7.3.7` | UI Component library | Production design system with comprehensive feedback components |
| Firebase Firestore | `^12.8.0` | Real-time document database | High-throughput operational church state |
| Vitest | `^4.0.18` | Unit & integration test runner | Co-located fast headless browser testing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@sentry/react` | `^10.56.0` | Crash reporting | Captures unhandled client runtime exceptions |
| `framer-motion` | `^11.3.19` | Micro-interactions | Polished page transitions and toast entrances |
| `lucide-react` | `^0.417.0` | Modern iconography | Clear, legible empty-state visual markers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline Firestore writes | Centralized Service Layer | Services add a small layer of indirection but eliminate duplication and bug recurrence |
| Ad-hoc local alert state | Centralized `WorkspaceContext` | Single notification queue prevents multiple colliding snackbars and inconsistent styles |
| Custom alert manager | Material UI `Snackbar` + `Alert` | Native MUI integration seamlessly inherits theme dark/light tokens |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Service Layer Facade
**What:** Encapsulate Firestore queries, document references, and batch writes inside domain-specific service files in `src/services/`. Every service function returns a predictable contract `{ success: boolean, data?: any, error?: string }`.
**When to use:** For all database reads and writes. Components never import `db` directly for mutations.
**Example:**
```javascript
// src/services/memberService.js
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';

export const createMember = async (memberData) => {
  try {
    const docRef = await addDoc(collection(db, 'members'), {
      ...memberData,
      createdAt: new Date().toISOString(),
      status: memberData.status || 'active'
    });
    return { success: true, data: { id: docRef.id, ...memberData } };
  } catch (error) {
    console.error('memberService.createMember error:', error);
    return { success: false, error: error.message || 'Failed to create member record' };
  }
};
```

### Pattern 2: Centralized Feedback Flow
**What:** Standardized UI feedback triggering `showNotification` from `WorkspaceContext` after every asynchronous action, while rendering skeletons during initial query resolution.
**When to use:** In form submit handlers, button clicks, and destructive confirmation flows.
**Example:**
```javascript
const handleSave = async () => {
  setLoading(true);
  const result = await memberService.createMember(formData);
  setLoading(false);
  
  if (result.success) {
    showNotification('Member profile created successfully', 'success');
    onClose();
  } else {
    showNotification(result.error, 'error');
  }
};
```

### Anti-Patterns to Avoid
- **Inline Firestore Mutations in JSX Components:** Calling `await addDoc(...)` directly in UI click handlers duplicates collection schemas and scatters try/catch blocks.
- **Silent Failures:** Catching an error with `console.error` without alerting the user via `showNotification`.
- **Layout Shift During Loading:** Showing a plain spinner centered in an empty screen rather than skeleton placeholders that match the table or card layout.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Notification Queue | Custom toast manager | `WorkspaceContext` + MUI `Snackbar` | Handles stacking, auto-dismiss timers, and theme alignment out of the box |
| Confirmation Flow | Bespoke confirmation state in every page | `src/components/ConfirmationDialog.jsx` | Reusable modal with standard warning styling and keyboard accessibility |
| Loading Indicators | Blank pages with circular spinners | MUI `<Skeleton variant="rectangular">` | Reduces perceived latency and prevents jarring layout jumps |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Unhandled Firestore Network Exceptions
**What goes wrong:** User clicks submit, the network hangs or rejects, and the button remains disabled with no feedback.
**Why it happens:** Missing `finally { setLoading(false); }` block or unhandled rejection.
**How to avoid:** Ensure all service wrappers catch errors cleanly and return `{ success: false, error }`, and components always reset loading state in `finally`.

### Pitfall 2: Race Conditions in Optimistic State
**What goes wrong:** Local UI state updates before Firestore confirms the write; if write fails, UI displays stale or phantom data.
**How to avoid:** Rely on real-time `onSnapshot` listeners or only mutate local state upon confirmed service success.
</common_pitfalls>

<sources>
## Sources

### Primary (HIGH confidence)
- Codebase audit of `src/firebase.js`, `src/context/WorkspaceContext.jsx`, `src/components/Layout.jsx`.
- Material UI v7 documentation on Snackbar, Alert, and Skeleton.
- Existing passing test suite in `src/utils/*.test.js`.
</sources>

<metadata>
**Research scope:** Core React 19 architecture, Firestore service facades, UI feedback.
**Research date:** 2026-09-21
**Valid until:** 2026-10-21
</metadata>

---
*Phase: 01-workflow-audit-foundation-feedback-system*
*Research completed: 2026-09-21*
*Ready for planning: yes*
