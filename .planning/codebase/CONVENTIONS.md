---
last_mapped_commit: 69a60581989600e6a61780065108474cfbf1c25f
last_mapped_at: 2026-09-21
---
# Coding Conventions

**Analysis Date:** 2026-09-21

## Naming Patterns

**Files:**

- React Components & Pages: PascalCase with `.jsx` extension (e.g., [`src/pages/Dashboard.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.jsx), [`src/components/CommandPalette.jsx`](file:///home/admin/Projects/ricgcw/src/components/CommandPalette.jsx)).
- Utility Functions & Services: camelCase with `.js` extension (e.g., [`src/utils/dualCustody.js`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js), [`src/utils/fuzzyMatch.js`](file:///home/admin/Projects/ricgcw/src/utils/fuzzyMatch.js)).
- Test Files: Co-located with identical base name followed by `.test.js` or `.test.jsx` (e.g., [`src/utils/safetyTokens.test.js`](file:///home/admin/Projects/ricgcw/src/utils/safetyTokens.test.js), [`src/components/Layout.test.jsx`](file:///home/admin/Projects/ricgcw/src/components/Layout.test.jsx)).
- Stylesheets: Matching component name with `.css` (e.g., [`src/pages/Dashboard.css`](file:///home/admin/Projects/ricgcw/src/pages/Dashboard.css)) or kebab-case / lowercase for globals ([`src/index.css`](file:///home/admin/Projects/ricgcw/src/index.css)).

**Functions:**

- React Functional Components: PascalCase (e.g., `Dashboard`, `TopAppBar`, `RequireAuth`, `DigitalGivingDialog`).
- Custom React Hooks: camelCase with `use` prefix (e.g., `useAuth`, `useWorkspace`, `useColorMode`, `useSessionTimeout`).
- Utility & Algorithm Functions: camelCase verbs (e.g., `calculateSimilarity`, `findDuplicates`, `validateBatchDeposit`, `encryptSensitiveNotes`, `syncMemberDepartments`).

**Variables & Constants:**

- Local State & Variables: camelCase (e.g., `userRole`, `isLoading`, `memberProfile`, `signedUsers`).
- Module-Level Constants & Configs: UPPER_SNAKE_CASE (e.g., `NAV_ITEMS`, `VERSION_MAP`, `TERMII_BASE_URL`, `MS_IN_4_WEEKS`).
- Boolean Flags: Affirmative prefixes like `is`, `has`, or `can` (e.g., `isAuthenticated`, `isDeveloper`, `hasRole`, `loading`).

**Types:**

- JavaScript with JSDoc type annotations across utility modules (e.g., `@param {string} to`, `@returns {Promise<object>}`).

## Code Style

**Formatting:**

- 2-space indentation.
- Single quotes for JavaScript strings, double quotes for JSX attributes.
- Semicolons enforced.
- Trailing commas in multi-line object and array literals.

**Linting:**

- Configured via ESLint flat configuration in [`eslint.config.js`](file:///home/admin/Projects/ricgcw/eslint.config.js).
- Extends `js.configs.recommended`, `reactHooks.configs.flat.recommended`, and `reactRefresh.configs.vite`.
- Custom rules:
  - `'no-unused-vars': ['error', { varsIgnorePattern: '^(?:[A-Z_]|motion$)' }]`
  - `'react-hooks/set-state-in-effect': 'off'`
  - `'react-refresh/only-export-components': 'off'`
- Global ignores include `dist/`, `dev-dist/`, `functions/`, and `coverage/`.

## Import Organization

**Order:**

1. React core and external framework packages (`react`, `react-router-dom`, `framer-motion`).
2. Component and styling libraries (`@mui/material`, `@mui/icons-material`, `lucide-react`).
3. Internal Context Providers & Custom Hooks (`../context/AuthContext`, `../context/WorkspaceContext`, `../theme`).
4. UI Components, Dialogs & Layouts (`./layout/TopAppBar`, `../components/atoms/ActionButton`).
5. Core Services, Utilities & Configuration (`../firebase`, `../appwrite`, `../utils/dateUtils`).

**Path Aliases:**

- Standard relative imports (`../`, `./`) are used throughout the repository without custom path aliases (e.g., `@/`).

## Error Handling

**Patterns:**

- Asynchronous API Operations: Wrap all network calls in `try ... catch` blocks; return a standardized response object with `success: false` and `error: string` rather than throwing uncaught exceptions to the UI:
  ```javascript
  try {
    const response = await axios.post(...);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Operation Error:', error);
    return { success: false, error: error.message || 'Operation failed' };
  }
  ```
- User Notification: Trigger `showNotification(message, 'error')` from `WorkspaceContext` to provide non-blocking visual snackbars.
- Component-Level Failures: Caught gracefully by [`src/components/ErrorBoundary.jsx`](file:///home/admin/Projects/ricgcw/src/components/ErrorBoundary.jsx).

## Logging

**Framework:**

- `console.error` and `console.warn` for runtime error diagnostics.
- Sentry (`@sentry/react`) initialized in [`src/main.jsx`](file:///home/admin/Projects/ricgcw/src/main.jsx) for automated production crash reporting.

**Patterns:**

- Prefix log messages with domain context (e.g., `console.error('Termii SMS Error:', ...)` or `console.error('Hugging Face commit error:', ...)`).
- Avoid logging sensitive credentials, private keys, or personal member passwords.

## Comments

**When to Comment:**

- Algorithm rationale and business rule logic (e.g., why 12-hour TTL is chosen for child safety tokens or how dual-custody verification calculates ledger parity).
- Section headings in long configuration files (e.g., `// --- PAGE IMPORTS (Lazy Loaded) ---`, `// 🟢 Unified Authentication & Authorization Guards`).

**JSDoc/TSDoc:**

- Required on all public utility functions in [`src/utils/`](file:///home/admin/Projects/ricgcw/src/utils/):
  ```javascript
  /**
   * Enforces dual custody rules on physical deposit batches.
   * @param {number} batchTotal - Logged total amount of the batch deposit
   * @param {Array} entries - List of individual log entries: { amount, type }
   * @param {Array} signedUsers - Array of emails representing counting signatures
   * @returns {Object} - Result: { success: boolean, reason?: string }
   */
  ```

## Function Design

**Size:**

- Utility functions: Short, pure, and focused on a single concern (< 50 lines).
- React components: Prefer decomposing complex sections into child molecules/organisms. Avoid monolithic components exceeding 500 lines.

**Parameters:**

- Functions with more than 3 parameters should use destructured options objects with defaults.

**Return Values:**

- Utility validators return structured status objects (e.g., `{ success: true }` or `{ success: false, reason: '...' }`).

## Module Design

**Exports:**

- React components and page modules use default exports: `export default Dashboard;`.
- Utilities and helper libraries use named exports: `export const calculateSimilarity = ...`.
- React Context hooks are exported alongside their provider: `export const useWorkspace = ...`.

**Barrel Files:**

- Not currently used; components import directly from their specific relative file paths.

---

*Convention analysis: 2026-09-21*
