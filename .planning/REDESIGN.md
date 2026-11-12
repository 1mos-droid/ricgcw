# Interface redesign

## Member directory refinement

User request: improve pill/grid presentation, alphabetical arrangement, and show all members at once. Continue under existing GSD bypass authorization.

Approach: sort the authorized/filtered result A–Z by displayed name without modifying stored records or member IDs. Remove directory pagination, add compact pills and calm grid cards with keyboard-accessible profile/actions, persistent view preference, result counts, and jump-to-letter navigation that scrolls rather than filters. Keep the administrative list view and its selection/actions. Use native scrolling and CSS offscreen rendering containment for long directories; no per-member entrance delays or concealed result batches.

Validate sorting, complete results beyond old limits, filtering, view changes, selection, profile actions, keyboard use, and responsive component rendering. Existing authorization/workspace filters remain in place.

Added user steering: fix the crowded mobile application header. Use a dedicated 64px identity/search/more/account row; give the administrative campus selector its own 48px row. Move appearance and events/updates into an accessible overflow menu and adjust the content spacer and directory jump offsets to match the real header height, including safe areas. Keep desktop controls and existing campus-change handlers intact.

Delivered: new grouped pill/grid directory with all filtered records mounted, natural A–Z ordering, search over name/email/ID/phone, saved view preference, independent selection/actions, direct contact links on cards, result counts and end-of-directory return link. List mode also displays all records. Existing scoped data filtering and member-ID assignment are unchanged. Mobile header now separates identity/actions from campus selection; search/account remain direct controls, with theme/events in the overflow menu.

Verification: 36 test files / 199 tests pass; lint passes. Local sample-data browser review verified all 32 members in both layouts at 1440px, 390px and 320px, no horizontal overflow, three distinct 44px header targets, working overflow menu and letter navigation retaining all records. Review document: `.planning/members-review.html` (local-only, labeled sample data; not a production entry). Screenshots: `/tmp/ricgcw-members-{pills,grid}-{1440,390,320}.png`. Production build checked before handoff. No live records were modified or deployed.

## Revision requested by user

2026-11-12: Prior design rejected as generic and insufficient use of the named React libraries. Replace the evergreen editorial direction with an ink, ivory and brass workspace with stronger church identity, deliberate composition, and production component integrations. Integrate Sileo notifications and source-based Kokonut UI / SmoothUI / Watermelon components, retaining upstream license notices and documenting adaptations. Verify visible desktop/mobile behavior and key workflows. Earlier GSD bypass authorization remains active.

### Revision delivery

Integrated five requested libraries: Sileo npm notification API and Toaster, Kokonut UI Loader and Slide Text Button, SmoothUI Reveal Text, Watermelon Continuous Tabs, and Rare UI animated password eye / strength algorithm. See `THIRD_PARTY_UI.md` for upstream sources, adaptations and complete license notices.

Rebuilt authentication with locally hosted sanctuary imagery, serif typography and responsive composition. Redesigned dashboard heading and metrics, sidebar and avatars; added consistent page headings for members, treasury and events. Updated primary actions across attendance, members, financials, events and reports. Shared filters, table typography, detail drawers and empty/loading states retain the established MUI focus/keyboard system.

Fixed table sorting (previously indicator-only), keyboard row access and disappearing-page pagination. Added regression coverage. Consolidated animation imports onto `motion/react` and aligned the installed version with Sileo.

Verification: full suite 35 files / 191 tests passed; affected member, attendance, auth, toast and table checks rerun successfully after follow-up changes. Local browser review covered login and a labeled sample workspace at 1440×1000 and 390×844, with registry, chart, loader and Sileo notifications. No horizontal overflow in those views. The review fixture at `.planning/visual-review.html` is a local development document, not a public app entry, production route or authentication bypass. Production build (including the PWA service worker) and lint pass. Motion 12.43.0 is shared with Sileo; no duplicate animation runtime remains.

Live authenticated provider workflows and production security certification remain outside this visual verification. No deployment performed.

## Earlier pass (superseded by the revision above)

Authorized 2026-11-12: user approved bypassing unavailable GSD commands.

Direction: calm, welcoming church workspace; ink, warm neutral surfaces and a single evergreen accent. Keep MUI as the accessible component foundation. Adapt selected interaction ideas from the researched libraries only where useful; do not install overlapping component systems.

Scope: shared theme and controls, responsive navigation, authentication, branded loading, dashboard hierarchy, reduced motion and keyboard focus. Preserve authentication, role boundaries and financial workflows.

Validation: existing authentication and shell tests, full unit suite, lint and production build. Production readiness still requires the security and operational work recorded in ROADMAP.md; visual changes alone do not establish it.

Library assessment: Sileo (notifications); Kokonut UI, SmoothUI, Rare UI and Watermelon UI (selective component inspiration). TUIOS is a terminal workspace, Open Motion is ambiguous/video-oriented, and oooh is unidentified. Existing MUI feedback is retained pending a demonstrated need for replacement.

## Delivered

- Evergreen and warm neutral shared theme, consistent forms/tables, touch targets and focus rings.
- Rebuilt authentication with existing signup/login/reset integrations; removed particle canvas and decorative loops.
- Custom branded route loader and first-paint HTML fallback.
- Solid mobile navigation with safe-area spacing; accessible active navigation, account button, tabs and switches.
- Dashboard welcome hierarchy and member-creation deep link; event gateway styling aligned.
- Privacy banner flows below the mobile login rather than covering the submit button.
- Reduced-motion support and matching installed-PWA colors.

## Verification

Full existing suite: 34 files / 185 tests passed. Two additional authentication regression tests passed (7 login tests total). Event gateway's four tests pass after styling changes. ESLint passes. Production build including service worker passes.

Firefox browser checks: login at 1440×1000 and 390×844; no horizontal overflow. Screenshots: `/tmp/ricgcw-desktop.png`, `/tmp/ricgcw-mobile.png`. Branded loading screenshot also inspected. Authenticated pages were exercised through unit tests, not a live authenticated browser session.

This delivery establishes the shared visual foundation and authentication redesign. Individual operational page redesigns, live provider verification, and the security/production phases in the existing roadmap remain outstanding. No deployment performed; no new UI-library dependencies installed.
