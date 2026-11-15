import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './Login';

const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockResetPassword = vi.fn();
const mockRefreshUserContext = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    resetPassword: mockResetPassword,
    isAuthenticated: false,
  }),
}));

vi.mock('../context/WorkspaceContext', () => ({
  useWorkspace: () => ({
    refreshUserContext: mockRefreshUserContext,
    showNotification: vi.fn(),
  }),
}));

vi.mock('../theme', () => ({
  useColorMode: () => ({
    mode: 'dark',
    toggleColorMode: vi.fn(),
  }),
}));

const theme = createTheme();

const renderLogin = () => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('Login Page', () => {
  it('keeps the password native and toggles visibility with the Rare UI control', () => {
    renderLogin();
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });
  it('submits a new member account with the selected branch', async () => {
    mockSignup.mockResolvedValueOnce({ email: 'new@example.com' });
    renderLogin();
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }));
    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'New Member' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(mockSignup).toHaveBeenCalledWith('new@example.com', 'Secret123!', 'New Member', 'Mallam'));
  });

  it('shows a failed reset response as an error', async () => {
    mockResetPassword.mockResolvedValueOnce({ success: false, error: 'Please try again later.' });
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'member@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please try again later.');
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login portal and sign in form by default', () => {
    renderLogin();
    expect(screen.getByText(/RICGCW PORTAL/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();
  });

  it('switches to password recovery mode when clicking "Forgot password?"', async () => {
    renderLogin();
    const forgotBtn = screen.getByText(/Forgot password\?/i);
    fireEvent.click(forgotBtn);

    expect(screen.getByText(/Password Recovery & Activation Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Reset Link/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Sign In/i)).toBeInTheDocument();
  });

  it('submits password reset request and shows success message', async () => {
    mockResetPassword.mockResolvedValueOnce({
      success: true,
      message: 'Password reset link sent! Check your inbox.',
    });

    renderLogin();
    fireEvent.click(screen.getByText(/Forgot password\?/i));

    const emailInput = screen.getByPlaceholderText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'member@ricgcw.com' } });

    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('member@ricgcw.com');
      expect(screen.getByText(/Password reset link sent! Check your inbox./i)).toBeInTheDocument();
    });
  });

  it('can navigate back to Sign In from password recovery mode', () => {
    renderLogin();
    fireEvent.click(screen.getByText(/Forgot password\?/i));
    expect(screen.getByText(/Return to Sign In/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Return to Sign In/i));
    expect(screen.getByText(/Ministry & Leadership Portal/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  it('calls login on submitting credentials', async () => {
    mockLogin.mockResolvedValueOnce({ email: 'test@ricgcw.com' });

    renderLogin();
    const emailInput = screen.getByPlaceholderText(/Email Address/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@ricgcw.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@ricgcw.com', 'Secret123!');
      expect(mockRefreshUserContext).toHaveBeenCalled();
    });
  });
});
