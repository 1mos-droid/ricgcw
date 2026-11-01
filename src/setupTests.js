import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    length: 0,
    key: vi.fn((index) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock fallback environment variables for tests in CI environments without .env
if (typeof import.meta !== 'undefined' && import.meta.env) {
  if (!import.meta.env.VITE_HF_TOKEN) {
    import.meta.env.VITE_HF_TOKEN = 'mock-test-hf-token';
  }
  if (!import.meta.env.VITE_HF_REPO_ID) {
    import.meta.env.VITE_HF_REPO_ID = '1mos-droid/church-media';
  }
  if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY = 'pk_test_dummy';
  }
}

