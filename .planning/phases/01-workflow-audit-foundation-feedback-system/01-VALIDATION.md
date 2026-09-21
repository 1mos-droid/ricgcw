---
phase: "1"
slug: "workflow-audit-foundation-feedback-system"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-21"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| **Config file** | `vite.config.js` |
| **Quick run command** | `npm test -- --run src/services/` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run src/services/`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green (103+ tests passing)
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | ARCH-01 | — | N/A | audit | `test -f .planning/phases/01-workflow-audit-foundation-feedback-system/AUDIT-MATRIX.md` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | ARCH-02 | T-01-01 | Firestore errors handled cleanly without throwing | unit | `npm test -- --run src/services/memberService.test.js` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | ARCH-02 | T-01-02 | Attendance mutations validate payload before write | unit | `npm test -- --run src/services/attendanceService.test.js` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | ARCH-02 | T-01-03 | Financial service ensures numeric amount sanitization | unit | `npm test -- --run src/services/financialService.test.js` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | COMM-01 | — | Notifications dispatch without crashing when provider wraps tree | component | `npm test -- --run src/context/WorkspaceContext.test.jsx` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | COMM-02 | — | Empty states render accessible CTA | component | `npm test -- --run src/components/atoms/StatusBadge.test.jsx` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | COMM-04 | T-01-04 | Destructive actions require user confirmation | component | `npm test -- --run src/components/ConfirmationDialog.test.jsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/memberService.test.js` — Service test stubs for ARCH-02
- [ ] `src/services/attendanceService.test.js` — Service test stubs for ARCH-02
- [ ] `src/services/financialService.test.js` — Service test stubs for ARCH-02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual Toast Timing | COMM-01 | Evaluates human ergonomics of snackbar duration | Trigger action, verify auto-dismisses after 5 seconds |
| Layout Shift Check | COMM-02 | Verifies skeleton dimensions match table rows | Load dashboard on throttled network, observe zero jump |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-21
