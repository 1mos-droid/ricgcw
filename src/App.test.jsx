import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AuthProvider } from './context/AuthContext';

describe('App Smoke Test', () => {
  it('renders without crashing', () => {
    // We wrap in MemoryRouter because App likely uses routing hooks but isn't wrapped in a Router itself (usually index.js does that)
    // Checking main.jsx to confirm wrapping strategy would be good, but this is a safe bet for a unit test of App
    render(
      <MemoryRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <App />
          </WorkspaceProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    // Just checking if it renders. We can look for something specific later.
    // Given it's behind auth usually, it might redirect to login.
  });
});
