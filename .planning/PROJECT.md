# RICGCW Church Management System

## What This Is

A unified, production-ready Church Management System (CMS) that serves as the operational backbone for the Redeemed Christian Church of God, Word Assembly (RICGCW). Designed for administrators, pastors, department leaders, workers, and members, it connects registry governance, real-time attendance, dual-custody financial controls, volunteer rostering, communications, and spiritual resources into an integrated SaaS-grade platform.

## Core Value

A unified, auditable operational backbone where every major church workflow—from member registry and attendance to financial custody and volunteer coordination—flows reliably, securely, and cohesively across desktop and mobile.

## Requirements

### Validated

- ✓ Multi-role authentication & session handling via Appwrite Cloud and Firestore — existing
- ✓ Basic member directory management and age-based department categorization (<13 Children's Court, 13-35 Youth) — existing
- ✓ Basic attendance recording and QR code generation/scanning — existing
- ✓ Basic financial transactions recording and Paystack payment modal for digital giving — existing
- ✓ Event management with volunteer slot definition and availability conflict checking — existing
- ✓ Live Bible viewer with multi-version scripture search and Gen Z translation engine — existing
- ✓ Multi-tenant workspace switching (`main` Sanctuary, `youth`, `children`) — existing
- ✓ Core domain algorithms (dual-custody math check, safety pairing tokens, churn risk detection) with 100% passing tests — existing

### Active

- [ ] Comprehensive workflow audit identifying all broken, disconnected, and incomplete user journeys across existing modules
- [ ] Centralized service and data-access layer to replace direct, duplicated inline Firestore writes in UI components
- [ ] End-to-end Member & Registry Management completion (profile editing, family linkages, membership status lifecycle, advanced search/filtering, exports)
- [ ] End-to-end Attendance Management hardening (QR self-check-in validation, manual logging, duplicate prevention, real-time sync, attendance trend analytics)
- [ ] End-to-end Treasury & Financial Controls (dual-custody sign-off workflow, immutable transaction history, Paystack server-side verification, separation of recording/verification/approval, financial reports)
- [ ] End-to-end Events & Volunteer Management (event registration, automated volunteer rostering, conflict prevention, attendance linking, post-event reporting)
- [ ] Unified Communications & System Feedback (Termii SMS notifications, automated member follow-ups, centralized global toast/notification system, comprehensive empty states and loading skeletons)
- [ ] Live Bible and Spiritual Experience refinement (fast scripture search, intuitive book/chapter navigation, polished reading typography for church services)
- [ ] Security hardening & data integrity (audited Firestore security rules, client-to-server trust boundaries, audit logging for critical administrative writes, input validation)
- [ ] UI/UX polish & responsive design (smooth Framer Motion page transitions, micro-interactions, mobile-first responsive layout optimization, confirmation modals for destructive actions)

### Out of Scope

- Multi-church SaaS tenancy / White-labeling for external church organizations — built specifically for RICGCW campuses and ministries
- Custom offline SQLite sync engine — online-first PWA with Workbox caching and Firestore local persistence is sufficient
- Building an internal custom payment processor — rely strictly on Paystack integration for Ghana Cedis (GHS)
- Complex payroll or staff accounting HR system — focus remains on church treasury, tithes, offerings, and operational expense tracking

## Context

- **Brownfield Codebase**: Built with React 19 (RC), Material UI v7, Framer Motion, Vite 7, and Node 22 Firebase Cloud Functions.
- **Backend Architecture**: Hybrid cloud environment utilizing Appwrite Cloud for authenticated accounts and session tokens, combined with Google Cloud Firestore for real-time document sync.
- **Current State**: Rich set of functional modules and 103 passing domain unit tests, but with monolithic UI components (e.g. `MemberDetailsDialog.jsx` >1,500 lines), direct inline Firestore mutations, and disconnected multi-step workflows.
- **Product Focus**: Integration, reliability, security, and UX quality before adding new feature breadth.

## Constraints

- **Tech Stack**: React 19, Vite, Material UI (MUI v7), Cloud Firestore, Appwrite Cloud, Termii SMS, Paystack.
- **Security & Authorization**: Authorization must be strictly enforced via Firestore security rules and backend validation—never rely on UI element visibility alone.
- **Financial Compliance**: Dual-custody approval workflows require two distinct administrative signatures and reconciled math before ledger finalization.
- **Mobile Usability**: Primary church workers and congregants interact via mobile devices; touch ergonomics, PWA performance, and responsive layouts are mandatory.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Integration Before Expansion | Existing modules have fragmented workflows; hardening core functionality delivers immediate operational value | ✓ Good |
| Centralized Service Layer | Eliminate duplicated inline Firestore `addDoc`/`updateDoc` calls scattered across UI components | — Pending |
| Multi-Workspace Segmentation | Isolate data views between Sanctuary, Youth Ministry, and Children's Court without separate database instances | ✓ Good |
| Dual-Custody Deposit Controls | Prevent financial fraud and discrepancies in physical cash counting via dual digital signatures | ✓ Good |
| Appwrite Auth + Firestore Data | Appwrite handles user accounts and session tokens; Firestore provides fast real-time synchronization for active modules | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-21 after initialization*
