import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// 1. Context to manage the toggle state
const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// 2. Custom hook to use the theme switch anywhere
export const useColorMode = () => useContext(ColorModeContext);

// 3. The Quiet Confidence Design System (Clean, Modern, Restrained)
const getDesignTokens = (mode) => {
  const isLight = mode === 'light';
  
  const systemBlue = isLight ? '#2563EB' : '#3B82F6';
  const systemPurple = isLight ? '#4F46E5' : '#6366F1';
  
  const backgroundDefault = isLight ? '#F8FAFC' : '#090A0F';
  const backgroundPaper = isLight ? '#FFFFFF' : '#111318';
  
  return {
    palette: {
      mode,
      primary: { main: systemBlue, light: '#60A5FA', dark: '#1D4ED8', contrastText: '#FFFFFF' },
      secondary: { main: systemPurple, light: '#818CF8', dark: '#3730A3', contrastText: '#FFFFFF' },
      accent: { main: '#D97706' },
      success: { main: '#10B981' },
      error: { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
        glass: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(17, 19, 24, 0.85)',
        glassBorder: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
      },
      text: {
        primary: isLight ? '#0F172A' : '#F8FAFC',
        secondary: isLight ? '#64748B' : '#94A3B8',
      },
      divider: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
    },
    // Restrained, subtle elevation shadows
    shadows: [
      'none',
      isLight ? '0 1px 2px 0 rgba(0, 0, 0, 0.04)' : '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      isLight ? '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)' : '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
      isLight ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)' : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
      isLight ? '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)' : '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      ...Array(20).fill(isLight ? '0 10px 20px -3px rgba(0, 0, 0, 0.06)' : '0 10px 20px -3px rgba(0, 0, 0, 0.6)'),
    ],
    typography: {
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.015em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, letterSpacing: '-0.005em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500, letterSpacing: '0em' },
      subtitle2: { fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.72rem' },
      body1: { fontSize: '0.925rem', fontWeight: 400, letterSpacing: '-0.005em' },
      body2: { fontSize: '0.85rem', fontWeight: 400, letterSpacing: '-0.005em' },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem' },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: ${backgroundDefault} !important;
            background-image: none !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Clean minimal scrollbars */
          ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'};
          }
        `,
      }
    },
  };
};

export default function ThemeConfig({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.className = mode === 'light' ? 'light-theme' : 'dark-theme';
  }, [mode]);

  const theme = useMemo(() => {
    let theme = createTheme(getDesignTokens(mode));
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
