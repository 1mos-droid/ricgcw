---
last_mapped_commit: 69a60581989600e6a61780065108474cfbf1c25f
last_mapped_at: 2026-09-21
---
# Testing Patterns

**Analysis Date:** 2026-09-21

## Test Framework

**Runner:**

- Vitest `^4.0.18`
- Config: Configured within [`vite.config.js`](file:///home/admin/Projects/ricgcw/vite.config.js#L121):
  ```javascript
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
  ```

**Assertion Library:**

- Vitest built-in assertions (`describe`, `it`, `expect`, `vi`).
- DOM matchers: `@testing-library/jest-dom` (e.g., `toBeInTheDocument`, `toHaveTextContent`, `toBeVisible`).

**Run Commands:**

```bash
npm test -- --run            # Run all 25 test files to completion
npm test                     # Run in interactive watch mode
npm run coverage             # Generate V8 coverage report into coverage/
```

## Test File Organization

**Location:**

- Co-located pattern: Tests reside directly alongside their target source file within `src/`, sharing the same directory.

**Naming:**

- JavaScript utilities: `<name>.test.js` (e.g., [`src/utils/fuzzyMatch.test.js`](file:///home/admin/Projects/ricgcw/src/utils/fuzzyMatch.test.js)).
- React components and pages: `<Name>.test.jsx` (e.g., [`src/components/CommandPalette.test.jsx`](file:///home/admin/Projects/ricgcw/src/components/CommandPalette.test.jsx), [`src/pages/Attendance.test.jsx`](file:///home/admin/Projects/ricgcw/src/pages/Attendance.test.jsx)).

**Structure:**

```text
src/
├── components/
│   ├── CommandPalette.jsx
│   ├── CommandPalette.test.jsx
│   └── Layout.jsx
│   └── Layout.test.jsx
├── pages/
│   ├── Attendance.jsx
│   ├── Attendance.test.jsx
│   ├── Dashboard.jsx
│   ├── Dashboard.test.jsx
│   └── Dashboard.birthday.test.jsx
└── utils/
    ├── autoRoster.js
    ├── autoRoster.test.js
    ├── dualCustody.js
    └── dualCustody.test.js
```

## Test Structure

**Suite Organization:**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette from './CommandPalette';

describe('CommandPalette Component', () => {
  const mockMembers = [
    { id: '1', name: 'John Doe', branch: 'Mallam', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', branch: 'Kokrobitey', email: 'jane@example.com' },
  ];

  it('renders modal when open is true', () => {
    render(
      <CommandPalette
        open={true}
        onClose={vi.fn()}
        members={mockMembers}
        onNavigate={vi.fn()}
        onSelectMember={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText(/Type a command or search.../i)).toBeInTheDocument();
  });
});
```

## Mocking

**Framework:**

- Vitest mock API (`vi.fn()`, `vi.mock()`, `vi.spyOn()`).

**Global Environment Mocks ([`src/setupTests.js`](file:///home/admin/Projects/ricgcw/src/setupTests.js)):**

- `window.localStorage`: Custom in-memory mock supporting `getItem`, `setItem`, `removeItem`, and `clear`.
- `window.matchMedia`: Headless media query evaluation mock for responsive checks.
- `window.scrollTo`: No-op mock.

**Component-Level Mocking Pattern:**

```javascript
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@ricgcw.org', role: 'admin', name: 'Pastor Kwesi' },
    isAuthenticated: true,
    hasRole: (roles) => roles.includes('admin'),
    loading: false
  })
}));
```

**What to Mock:**

- Network requests (Axios, Termii, Paystack, Hugging Face, Bible API).
- Cloud backend SDKs (Firebase Firestore collections, Appwrite account sessions).
- Window navigation and browser APIs unavailable in jsdom.

**What NOT to Mock:**

- Pure domain algorithms ([`src/utils/dualCustody.js`](file:///home/admin/Projects/ricgcw/src/utils/dualCustody.js), [`src/utils/safetyTokens.js`](file:///home/admin/Projects/ricgcw/src/utils/safetyTokens.js), [`src/utils/churnAlert.js`](file:///home/admin/Projects/ricgcw/src/utils/churnAlert.js)).
- Atomic UI components when rendering integration dialogs (render real MUI elements to verify DOM state).

## Fixtures and Factories

**Test Data:**

- Handcrafted fixture arrays declared at the top of test suites representing typical congregation members, roster slots, and deposit entries:
  ```javascript
  const mockVolunteers = [
    { id: 'v1', name: 'Sister Mary', roles: ['usher'], availability: ['Sunday'], gapWeeks: 1 },
    { id: 'v2', name: 'Brother Paul', roles: ['usher'], availability: ['Sunday'], gapWeeks: 2 }
  ];
  ```

## Coverage

**Requirements:**

- High test coverage on all critical business utility functions in `src/utils/` (currently 100% pass rate across 103 tests).

**View Coverage:**

```bash
npm run coverage
```

## Test Types

**Unit Tests:**

- Evaluates individual algorithm behavior with edge cases, invalid inputs, and boundary checks (e.g., token expiration, Levenshtein distance, multi-slot volunteer allocation).

**Component Tests:**

- Tests rendering, accessibility, and user interactions using `@testing-library/react`.
- Verifies modal opening/closing, button click handlers, tab switching, and validation message presentation.

**Integration Tests:**

- Validates interplay between React Router, `AuthContext`, and `WorkspaceContext` (e.g., [`src/components/Layout.test.jsx`](file:///home/admin/Projects/ricgcw/src/components/Layout.test.jsx)).

**E2E Tests:**

- Not currently configured with Playwright or Cypress; component integration tests in jsdom provide comprehensive coverage of user flows.

## Common Patterns

**Async Testing:**

```javascript
it('fetches and displays member records', async () => {
  render(<Members />);
  expect(await screen.findByText('Kofi Annan')).toBeInTheDocument();
});
```

**Security / Error Testing:**

```javascript
it('fails to decrypt or returns corrupted results when using the wrong key', () => {
  const encrypted = encryptSensitiveNotes('Confidential confession', 'correct-key');
  const result = decryptSensitiveNotes(encrypted, 'wrong-key');
  expect(result).toMatch(/Decryption failed/);
});
```

---

*Testing analysis: 2026-09-21*
