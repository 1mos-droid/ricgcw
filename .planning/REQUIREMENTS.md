# Requirements: RICGCW Church Management System

**Defined:** 2026-09-21
**Core Value:** A unified, auditable operational backbone where every major church workflow—from member registry and attendance to financial custody and volunteer coordination—flows reliably, securely, and cohesively across desktop and mobile.

## v1 Requirements

Requirements for production readiness and full workflow integration. Each maps to roadmap phases.

### Architecture & Service Layer (ARCH)

- [ ] **ARCH-01**: Application audit completed across all views to catalog broken, disconnected, and incomplete workflows.
- [ ] **ARCH-02**: Centralized service layer implemented (`src/services/`) isolating Firestore mutations from React UI components.
- [ ] **ARCH-03**: Monolithic dialogs refactored into modular components (e.g. `MemberDetailsDialog` sub-tabs decomposed).
- [ ] **ARCH-04**: Global error handling with Sentry and React ErrorBoundary configured with recovery fallbacks.

### Member & Registry Management (MEMB)

- [ ] **MEMB-01**: User can complete full member onboarding and profile editing with validation and error feedback.
- [ ] **MEMB-02**: User can link family relationships (guardians, spouses, children) with dual-custody references.
- [ ] **MEMB-03**: System automatically synchronizes member departments based on age thresholds (<13 Children's Court, 13-35 Youth).
- [ ] **MEMB-04**: User can filter, search, and segment member directory with fast perceived performance.
- [ ] **MEMB-05**: User can export filtered member rosters to Excel and PDF formats.
- [ ] **MEMB-06**: System tracks member lifecycle events and flags at-risk congregants via churn prediction.

### Attendance & Check-In (ATTN)

- [ ] **ATTN-01**: Congregant/guardian can complete self-check-in via generated QR codes on mobile devices.
- [ ] **ATTN-02**: Administrator can manually record service attendance with duplicate entry prevention.
- [ ] **ATTN-03**: System generates and validates guardian-child pairing security tokens with 12-hour TTLs.
- [ ] **ATTN-04**: Attendance metrics and historical trends update in real time on administrative dashboards.

### Treasury & Financial Controls (FIN)

- [ ] **FIN-01**: User can record physical income (tithes, offerings, donations) and operational expenditures.
- [ ] **FIN-02**: System enforces dual-custody verification requiring two distinct administrative sign-offs on physical batch deposits.
- [ ] **FIN-03**: System prevents ledger finalization when entry sums do not match logged batch totals.
- [ ] **FIN-04**: User can give digitally in GHS via Paystack with asynchronous payment verification.
- [ ] **FIN-05**: User can generate and export reconciled financial ledgers and statements to Excel and PDF.

### Events & Volunteer Coordination (EVNT)

- [ ] **EVNT-01**: Administrator can create and manage church events, services, and ministry sessions.
- [ ] **EVNT-02**: Congregants can register for open church events with confirmation feedback.
- [ ] **EVNT-03**: System automatically assigns eligible volunteers to ministry slots matching role and availability preferences.
- [ ] **EVNT-04**: System prevents double-booking and enforces volunteer rest-gap intervals.
- [ ] **EVNT-05**: Event attendance seamlessly integrates into global attendance reporting.

### Communication & Feedback (COMM)

- [ ] **COMM-01**: System provides centralized toast and notification feedback for every create, update, and delete action.
- [ ] **COMM-02**: System displays skeleton placeholders during data loading and meaningful empty states when lists are empty.
- [ ] **COMM-03**: System sends automated and manual SMS alerts to congregants via Termii gateway.
- [ ] **COMM-04**: Destructive actions (deletions, member revocations, batch voids) require explicit confirmation dialogs.

### Bible & Spiritual Experience (BIBLE)

- [ ] **BIBLE-01**: User can read scriptures across multiple translations (KJV, NKJV, NIV, AMP) with session-cached chapters.
- [ ] **BIBLE-02**: User can view scriptures translated into contextual Gen Z phrasing.
- [ ] **BIBLE-03**: User can search verses and navigate books and chapters with service-ready typography and contrast.

### Security & Governance (SEC)

- [ ] **SEC-01**: Cloud Firestore security rules audited and enforced for all collections to prevent unauthorized client writes.
- [ ] **SEC-02**: Multi-tier RBAC (`developer`, `admin`, `branch_admin`, `minister`, `member`) enforced on routes and backend rules.
- [ ] **SEC-03**: Administrative actions, dual-custody approvals, and maintenance toggles recorded in an immutable audit trail.
- [ ] **SEC-04**: Confidential pastoral counseling notes encrypted at field level using AES-256 cipher encryption.

## v2 Requirements

Deferred to future releases. Tracked but not in current initial milestone.

### Advanced Automation

- **AUTO-01**: Google Cloud Scheduler cron triggers for autonomous daily department migration without admin login.
- **AUTO-02**: Automated WhatsApp notification integration alongside Termii SMS.
- **AUTO-03**: Biometric / Face-ID check-in kiosk mode for high-volume church campuses.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-Church SaaS Tenancy | Built specifically for RICGCW campuses and ministries |
| Custom Offline SQLite Sync | Online-first PWA with Workbox caching and Firestore local persistence is sufficient |
| Custom Internal Payment Gateway | Rely strictly on Paystack integration for Ghana Cedis (GHS) |
| Comprehensive Payroll & HR System | Focus remains on church treasury, tithes, offerings, and operational expense tracking |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Pending |
| ARCH-02 | Phase 1 | Pending |
| ARCH-03 | Phase 2 | Pending |
| ARCH-04 | Phase 1 | Pending |
| MEMB-01 | Phase 2 | Pending |
| MEMB-02 | Phase 2 | Pending |
| MEMB-03 | Phase 2 | Pending |
| MEMB-04 | Phase 2 | Pending |
| MEMB-05 | Phase 2 | Pending |
| MEMB-06 | Phase 2 | Pending |
| ATTN-01 | Phase 3 | Pending |
| ATTN-02 | Phase 3 | Pending |
| ATTN-03 | Phase 3 | Pending |
| ATTN-04 | Phase 3 | Pending |
| FIN-01 | Phase 4 | Pending |
| FIN-02 | Phase 4 | Pending |
| FIN-03 | Phase 4 | Pending |
| FIN-04 | Phase 4 | Pending |
| FIN-05 | Phase 4 | Pending |
| EVNT-01 | Phase 5 | Pending |
| EVNT-02 | Phase 5 | Pending |
| EVNT-03 | Phase 5 | Pending |
| EVNT-04 | Phase 5 | Pending |
| EVNT-05 | Phase 5 | Pending |
| COMM-01 | Phase 1 | Pending |
| COMM-02 | Phase 1 | Pending |
| COMM-03 | Phase 5 | Pending |
| COMM-04 | Phase 1 | Pending |
| BIBLE-01 | Phase 6 | Pending |
| BIBLE-02 | Phase 6 | Pending |
| BIBLE-03 | Phase 6 | Pending |
| SEC-01 | Phase 7 | Pending |
| SEC-02 | Phase 7 | Pending |
| SEC-03 | Phase 7 | Pending |
| SEC-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-21*
*Last updated: 2026-09-21 after initial definition*
