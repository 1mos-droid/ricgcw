import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// 1. Context to manage the toggle state
const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// 2. Custom hook to use the theme switch anywhere
export const useColorMode = () => useContext(ColorModeContext);

// 3. The Design System (CareOS Look)
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // LIGHT MODE (Clean, Apple-like)
          primary: { main: '#2563EB' }, // Royal Blue
          secondary: { main: '#64748B' }, // Slate
          background: {
            default: '#F1F5F9', // Soft Blue-Gray
            paper: '#FFFFFF',   // Pure White
          },
          text: {
            primary: '#1E293B', // Dark Slate
            secondary: '#475569',
          },
        }
      : {
          // DARK MODE (Rich Navy/Slate)
          primary: { main: '#60A5FA' }, // Lighter Blue for contrast
          secondary: { main: '#94A3B8' },
          background: {
            default: '#0F172A', // Deep Navy (Not Pitch Black)
            paper: '#1E293B',   // Card Color
          },
          text: {
            primary: '#F8FAFC', // White
            secondary: '#CBD5E1',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
  },
  shape: {
    borderRadius: 12, // Soft rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { 
          boxShadow: 'none', 
          '&:hover': { boxShadow: 'none' },
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: mode === 'light' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: mode === 'light' 
            ? '0px 4px 20px rgba(0, 0, 0, 0.05)' // Soft drop shadow
            : '0px 4px 20px rgba(0, 0, 0, 0.2)', // Deeper shadow for dark mode
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #1E293B',
        }
      }
    }
  },
});

export default function ThemeConfig({ children }) {
  const [mode, setMode] = useState('light'); // Default to Light Mode

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  // UseMemo ensures we don't recreate the theme object on every render
  const theme = useMemo(() => {
    let theme = createTheme(getDesignTokens(mode));
    // responsiveFontSizes automatically scales h1-h6 on mobile devices
    return responsiveFontSizes(theme);
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}