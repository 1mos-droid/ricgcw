import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// 1. Context to manage the toggle state
const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// 2. Custom hook to use the theme switch anywhere
export const useColorMode = () => useContext(ColorModeContext);

// 3. The Cupertino Design System (iOS/macOS Style)
const getDesignTokens = (mode) => {
  const isLight = mode === 'light';
  
  const systemBlue = '#007AFF';
  const systemPurple = '#5856D6';
  
  const backgroundDefault = isLight ? '#F2F2F7' : '#000000'; // Grouped backgrounds
  const backgroundPaper = isLight ? '#FFFFFF' : '#1C1C1E'; // Translucent iOS materials
  
  return {
    palette: {
      mode,
      primary: { main: systemBlue, light: '#64D2FF', dark: '#0059B3', contrastText: '#FFFFFF' },
      secondary: { main: systemPurple, light: '#BF5AF2', dark: '#401A80', contrastText: '#FFFFFF' },
      accent: { main: '#D4AF37' },
      success: { main: '#34C759' }, // iOS Green
      error: { main: '#FF3B30' }, // iOS Red
      warning: { main: '#FF9500' }, // iOS Orange
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
        glass: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(28, 28, 30, 0.7)',
        glassBorder: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
      },
      text: {
        primary: isLight ? '#000000' : '#FFFFFF',
        secondary: '#8E8E93',
      },
      divider: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    },
    // Soft, deep, premium iOS-style floating shadows
    shadows: [
      'none',
      isLight ? '0px 2px 8px rgba(0, 0, 0, 0.01)' : '0px 2px 8px rgba(0, 0, 0, 0.1)',
      isLight ? '0px 4px 12px rgba(0, 0, 0, 0.02)' : '0px 4px 12px rgba(0, 0, 0, 0.15)',
      isLight ? '0px 8px 24px rgba(0, 0, 0, 0.02)' : '0px 8px 24px rgba(0, 0, 0, 0.2)',
      isLight ? '0px 12px 32px rgba(0, 0, 0, 0.03)' : '0px 12px 32px rgba(0, 0, 0, 0.25)',
      ...Array(20).fill(isLight ? '0px 20px 48px rgba(0, 0, 0, 0.04)' : '0px 20px 48px rgba(0, 0, 0, 0.3)'),
    ],
    typography: {
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "SF Compact", "Helvetica Neue", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.03em' },
      h3: { fontWeight: 800, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 650, letterSpacing: '-0.01em' },
      h6: { fontWeight: 650, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600, letterSpacing: '0em' },
      subtitle2: { fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.72rem' },
      body1: { fontSize: '0.96rem', fontWeight: 450, letterSpacing: '-0.01em' },
      body2: { fontSize: '0.86rem', fontWeight: 450, letterSpacing: '-0.01em' },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
    },
    shape: {
      borderRadius: 12, // iOS rounded standard
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: ${backgroundDefault} !important;
            background-image: ${isLight
              ? 'radial-gradient(at 0% 0%, rgba(0, 122, 255, 0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(88, 86, 214, 0.03) 0px, transparent 50%)'
              : 'radial-gradient(at 0% 0%, rgba(0, 122, 255, 0.08) 0px, transparent 60%), radial-gradient(at 100% 100%, rgba(88, 86, 214, 0.08) 0px, transparent 60%)'} !important;
            background-attachment: fixed !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Custom Scrollbar resembling iOS */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'};
            border-radius: 10px;
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
