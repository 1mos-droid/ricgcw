# Roadmap: RICGCW Church Management System

## Overview

A phased journey to transform the existing RICGCW application into a cohesive, production-ready, SaaS-grade church operational backbone. Each phase delivers a complete end-to-end slice: from workflow audits and centralized services, through hardened member management, attendance, and treasury dual-custody controls, to automated volunteer rostering, spiritual Bible reading, and rigorous security governance.

## Phases

- [x] **Phase 1: Workflow Audit, Foundation & Feedback System** - Catalog broken user journeys, decouple direct Firestore UI calls into services, and establish global feedback.
- [ ] **Phase 2: Member & Registry Management End-to-End** - Connect onboarding, profile lifecycle, family relations, age-based department sync, and exports.
- [ ] **Phase 3: Attendance, QR Check-In & Churn Risk Engine** - Harden mobile QR self-check-in, duplicate prevention, child-guardian security tokens, and live attendance metrics.
- [ ] **Phase 4: Treasury, Dual-Custody Controls & Paystack Integration** - Implement two-person digital deposit approvals, reconciliation checks, Paystack giving, and financial reporting.
- [ ] **Phase 5: Events, Volunteer Rostering & Communications** - Connect event scheduling with automated volunteer rostering, conflict prevention, and Termii SMS messaging.
- [ ] **Phase 6: Live Bible & Spiritual Experience** - Polish scripture reader with multi-version support, Gen Z translation engine, fast navigation, and church service typography.
- [ ] **Phase 7: Security Hardening, RBAC & SaaS Production Readiness** - Audit Firestore security rules, enforce backend trust boundaries, encrypt pastoral notes, and ensure mobile ergonomics.

## Phase Details

### Phase 1: Workflow Audit, Foundation & Feedback System

**Goal:** Catalog broken user journeys, decouple direct Firestore UI calls into a centralized service layer, and establish global notification feedback and error boundaries.
**Mode:** mvp
**Depends on:** Nothing (initial phase)
**Requirements:** [ARCH-01, ARCH-02, ARCH-04, COMM-01, COMM-02, COMM-04]
**Success Criteria:**

  1. Complete workflow audit matrix catalogs all broken, disconnected, and incomplete user journeys across existing modules.
  2. Centralized service layer (`src/services/`) encapsulates Firestore mutations away from React UI components.
  3. Global snackbar/toast feedback provides consistent notification across every create, edit, and delete action.
  4. Skeleton loaders and empty states render gracefully across all dashboard views.

**Plans:** 3 plans

Plans:
**Wave 1**

- [x] 01-01: Workflow audit and cataloging of incomplete UI-data journeys

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02: Centralized Firestore service layer abstraction and UI decoupling

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03: Global notification toasts, loading skeletons, and destructive confirmation modals

### Phase 2: Member & Registry Management End-to-End

**Goal:** Connect member onboarding, profile lifecycle, family relations, age-based department sync, and exports into an integrated workflow.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** [ARCH-03, MEMB-01, MEMB-02, MEMB-03, MEMB-04, MEMB-05, MEMB-06]
**Success Criteria:**

  1. User can onboard new members and edit profiles with full validation and immediate UI synchronization.
  2. Monolithic `MemberDetailsDialog` refactored into modular sub-tabs with clean separation of concerns.
  3. Automated age-based department migration transitions members accurately across Children's Court and Youth Ministry.
  4. Filtered member lists export reliably to Excel and PDF formats.

**Plans:** 3 plans

Plans:

- [ ] 02-01: Refactor MemberDetailsDialog into modular components and harden profile editing
- [ ] 02-02: Family relationships linking and automated age-based department migration
- [ ] 02-03: Member filtering, advanced search, churn risk flags, and Excel/PDF export

### Phase 3: Attendance, QR Check-In & Churn Risk Engine

**Goal:** Harden mobile QR self-check-in, duplicate prevention, child-guardian pairing security tokens, and real-time dashboard analytics.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** [ATTN-01, ATTN-02, ATTN-03, ATTN-04]
**Success Criteria:**

  1. Congregants can scan and check in via dynamic QR codes with immediate confirmation.
  2. Manual attendance entry enforces duplicate prevention and validates service date constraints.
  3. Guardian and child pairing tokens generate and validate with enforced 12-hour TTL security.
  4. Dashboard attendance counters and trends update live via Firestore real-time subscriptions.

**Plans:** 2 plans

Plans:

- [ ] 03-01: Mobile QR self-check-in validation, camera scanning, and duplicate entry prevention
- [ ] 03-02: Guardian-child pairing token verification, real-time analytics, and dashboard sync

### Phase 4: Treasury, Dual-Custody Controls & Paystack Integration

**Goal:** Implement two-person digital deposit sign-offs, reconciliation checks, Paystack digital giving, and financial reporting.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** [FIN-01, FIN-02, FIN-03, FIN-04, FIN-05]
**Success Criteria:**

  1. Physical batch deposits require two distinct administrative signatures before ledger commitment.
  2. System rejects and blocks any deposit where individual entries do not sum exactly to the batch total.
  3. Digital tithes and offerings process through Paystack in GHS with verifiable payment references.
  4. Financial ledger exports generate clean, auditor-ready Excel and PDF statements.

**Plans:** 3 plans

Plans:

- [ ] 04-01: Income and expense ledger entry with strict schema validation
- [ ] 04-02: Dual-custody two-person sign-off approval workflow and math reconciliation guard
- [ ] 04-03: Paystack payment verification and financial statement PDF/Excel exports

### Phase 5: Events, Volunteer Rostering & Communications

**Goal:** Connect event scheduling with automated volunteer rostering, conflict prevention, and Termii SMS messaging.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** [EVNT-01, EVNT-02, EVNT-03, EVNT-04, EVNT-05, COMM-03]
**Success Criteria:**

  1. Administrators can create events and define volunteer ministry slots.
  2. Auto-roster assigns volunteers matching role skills, availability days, and rest-gap limits without conflicts.
  3. Automated and manual SMS notifications dispatch successfully to congregant numbers via Termii gateway.
  4. Event attendance data seamlessly feeds into the central attendance repository.

**Plans:** 3 plans

Plans:

- [ ] 05-01: Event creation, registration, and attendance integration
- [ ] 05-02: Automated volunteer rostering with rest-gap and availability conflict detection
- [ ] 05-03: Termii SMS notification integration for event alerts and member follow-ups

### Phase 6: Live Bible & Spiritual Experience

**Goal:** Polish scripture reader with multi-version support, Gen Z translation engine, fast navigation, and church service typography.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** [BIBLE-01, BIBLE-02, BIBLE-03]
**Success Criteria:**

  1. User can smoothly switch between KJV, NKJV, NIV, AMP, and Gen Z translations with cached chapters.
  2. Fast scripture search and verse navigation responds instantaneously without network lag.
  3. Reader layout offers high-contrast, distraction-free reading typography suitable for church sanctuary services.

**Plans:** 2 plans

Plans:

- [ ] 06-01: Scripture search, chapter navigation, and session caching optimization
- [ ] 06-02: Gen Z translation display and high-contrast church service reading typography

### Phase 7: Security Hardening, RBAC & SaaS Production Readiness

**Goal:** Audit Firestore security rules, enforce backend trust boundaries, encrypt pastoral notes, and ensure mobile ergonomics.
**Mode:** mvp
**Depends on:** Phase 2, Phase 3, Phase 4, Phase 5
**Requirements:** [SEC-01, SEC-02, SEC-03, SEC-04]
**Success Criteria:**

  1. Cloud Firestore security rules reject all unauthorized client writes and respect role hierarchies.
  2. Confidential pastoral counseling notes are encrypted with AES-256 and never leak in plaintext.
  3. Administrative action audit log records sensitive operations immutably.
  4. Full mobile responsive audit confirms touch ergonomics and PWA reliability across devices.

**Plans:** 2 plans

Plans:

- [ ] 07-01: Cloud Firestore security rules audit, RBAC enforcement, and audit trail logging
- [ ] 07-02: Field-level pastoral note encryption hardening and mobile PWA ergonomics audit

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Workflow Audit, Foundation & Feedback System | 0/3 | Not started | - |
| 2. Member & Registry Management End-to-End | 0/3 | Not started | - |
| 3. Attendance, QR Check-In & Churn Risk Engine | 0/2 | Not started | - |
| 4. Treasury, Dual-Custody Controls & Paystack Integration | 0/3 | Not started | - |
| 5. Events, Volunteer Rostering & Communications | 0/3 | Not started | - |
| 6. Live Bible & Spiritual Experience | 0/2 | Not started | - |
| 7. Security Hardening, RBAC & SaaS Production Readiness | 0/2 | Not started | - |
