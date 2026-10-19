import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Hoisted mocks
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockUpdateProfile = vi.fn();
const mockSendPasswordResetEmail = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args) => mockSignOut(...args),
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  updateProfile: (...args) => mockUpdateProfile(...args),
  sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args),
}));

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn((db, col, id) => ({ path: `${col}/${id}`, id }));

vi.mock('firebase/firestore', () => ({
  getDoc: (...args) => mockGetDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  doc: (...args) => mockDoc(...args),
}));

vi.mock('../firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

const mockAccountCreateSession = vi.fn();
const mockAccountGet = vi.fn();
const mockAccountDeleteSession = vi.fn();

vi.mock('../appwrite', () => ({
  account: {
    createEmailPasswordSession: (...args) => mockAccountCreateSession(...args),
    get: (...args) => mockAccountGet(...args),
    deleteSession: (...args) => mockAccountDeleteSession(...args),
  },
}));

// Test Consumer Component
const Consumer = ({ onReady }) => {
  const auth = useAuth();
  React.useEffect(() => {
    if (onReady) onReady(auth);
  }, [auth, onReady]);

  return (
    <div>
      <span data-testid="user-email">{auth.user?.email || 'no-user'}</span>
      <span data-testid="user-role">{auth.user?.role || 'no-role'}</span>
      <span data-testid="loading">{auth.loading ? 'loading' : 'ready'}</span>
    </div>
  );
};

describe('AuthContext with Firebase Authentication and Appwrite Migration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });
  });

  it('renders correctly and initializes unauthenticated state', async () => {
    let authContext;
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer onReady={(val) => { authContext = val; }} />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    expect(authContext.isAuthenticated).toBe(false);
  });

  it('logs in successfully using native Firebase Authentication', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'fb-uid-123',
        email: 'test@ricgcw.com',
        displayName: 'Test Minister',
        emailVerified: true,
      }
    });

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        name: 'Test Minister',
        role: 'minister',
        branch: 'Mallam',
        status: 'Active',
      })
    });

    let authContext;
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer onReady={(val) => { authContext = val; }} />
        </AuthProvider>
      );
    });

    let loggedInUser;
    await act(async () => {
      loggedInUser = await authContext.login('test@ricgcw.com', 'ValidPassword123!');
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@ricgcw.com',
      'ValidPassword123!'
    );
    expect(loggedInUser.email).toBe('test@ricgcw.com');
    expect(loggedInUser.role).toBe('minister');
    expect(screen.getByTestId('user-email').textContent).toBe('test@ricgcw.com');
  });

  it('seamlessly migrates legacy Appwrite user on first login', async () => {
    // 1. Firebase Auth fails because user is not yet created in Firebase
    const notFoundError = new Error('Invalid credentials');
    notFoundError.code = 'auth/invalid-credential';
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(notFoundError);

    // 2. Appwrite verifies user password
    mockAccountCreateSession.mockResolvedValueOnce({ $id: 'session-123' });
    mockAccountGet.mockResolvedValueOnce({
      $id: 'appwrite-uid-456',
      email: 'legacy@ricgcw.com',
      name: 'Legacy Deacon',
    });

    // 3. User is created in Firebase Auth
    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'new-firebase-uid-789',
        email: 'legacy@ricgcw.com',
        displayName: 'Legacy Deacon',
        emailVerified: true,
      }
    });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: 'Legacy Deacon',
        role: 'branch_admin',
        branch: 'Langma',
        status: 'Active',
      })
    });

    let authContext;
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer onReady={(val) => { authContext = val; }} />
        </AuthProvider>
      );
    });

    let result;
    await act(async () => {
      result = await authContext.login('legacy@ricgcw.com', 'LegacyPassword123!');
    });

    // Verify Appwrite checked password
    expect(mockAccountCreateSession).toHaveBeenCalledWith('legacy@ricgcw.com', 'LegacyPassword123!');
    // Verify Firebase account created with exact same credentials
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'legacy@ricgcw.com',
      'LegacyPassword123!'
    );
    // Verify Appwrite session cleared
    expect(mockAccountDeleteSession).toHaveBeenCalledWith('current');
    // Verify Firestore updated
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        firebaseUid: 'new-firebase-uid-789',
        migratedToFirebase: true,
      }),
      { merge: true }
    );
    expect(result.email).toBe('legacy@ricgcw.com');
  });

  it('rejects login when both Firebase and Appwrite reject credentials', async () => {
    const fbError = new Error('Invalid credential');
    fbError.code = 'auth/invalid-credential';
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(fbError);

    const appwriteError = new Error('Invalid credentials');
    appwriteError.code = 401;
    appwriteError.type = 'user_invalid_credentials';
    mockAccountCreateSession.mockRejectedValueOnce(appwriteError);

    let authContext;
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer onReady={(val) => { authContext = val; }} />
        </AuthProvider>
      );
    });

    let caughtError;
    await act(async () => {
      try {
        await authContext.login('unknown@ricgcw.com', 'WrongPass');
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe('Invalid email or password.');
  });

  it('prohibits restricted test emails from signing in or signing up', async () => {
    let authContext;
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer onReady={(val) => { authContext = val; }} />
        </AuthProvider>
      );
    });

    let loginError;
    await act(async () => {
      try {
        await authContext.login('kokrobitey@ricgcw.com', 'anyPass');
      } catch (err) {
        loginError = err;
      }
    });
    expect(loginError.message).toMatch(/restricted for test users only/);

    let signupError;
    await act(async () => {
      try {
        await authContext.signup('admin@ricgcw.com', 'anyPass', 'Admin', 'Overseer');
      } catch (err) {
        signupError = err;
      }
    });
    expect(signupError.message).toMatch(/restricted for test users only/);
  });

  it('provisions unmigrated user in Firebase and sends password reset link', async () => {
    // 1. Firebase Auth says user not found
    const notFoundError = new Error('User not found');
    notFoundError.code = 'auth/user-not-found';
    mockSendPasswordResetEmail
      .mockRejectedValueOnce(notFoundError)
      .mockResolvedValueOnce(); // second call after provisioning succeeds

    // 2. User exists in Firestore registry
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        name: 'Pastor Scola',
        email: 'scolaboakye897@gmail.com',
        role: 'branch_admin',
      })
    });

    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'provisioned-uid-111',
        email: 'scolaboakye897@gmail.com',
      }
    });

    let authContext;
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer onReady={(val) => { authContext = val; }} />
        </AuthProvider>
      );
    });

    let res;
    await act(async () => {
      res = await authContext.resetPassword('scolaboakye897@gmail.com');
    });

    expect(res.success).toBe(true);
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(2);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('signs out user cleanly', async () => {
    let authContext;
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer onReady={(val) => { authContext = val; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authContext.logout();
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockAccountDeleteSession).toHaveBeenCalledWith('current');
    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
  });
});
