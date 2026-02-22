import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider, responsiveFontSizes, alpha } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// 1. Context to manage the toggle state
const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// 2. Custom hook to use the theme switch anywhere
export const useColorMode = () => useContext(ColorModeContext);

// 3. The Design System ("Exquisite" Look)
const getDesignTokens = (mode) => {
  const isLight = mode === 'light';
  
  // Premium Palette
  const primary = isLight ? '#2563EB' : '#60A5FA'; // Royal Blue
  const secondary = isLight ? '#475569' : '#94A3B8'; // Slate
  const backgroundDefault = isLight ? '#F1F5F9' : '#0F172A'; // Soft Gray vs Deep Navy
  const backgroundPaper = isLight ? '#FFFFFF' : '#1E293B';
  
  return {
    palette: {
      mode,
      primary: { main: primary, light: '#60A5FA', dark: '#1D4ED8' },
      secondary: { main: secondary, light: '#94A3B8', dark: '#334155' },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
        glass: isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(30, 41, 59, 0.65)',
        glassBorder: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)',
      },
      text: {
        primary: isLight ? '#0F172A' : '#F8FAFC',
        secondary: isLight ? '#64748B' : '#94A3B8',
      },
      action: {
        hover: isLight ? alpha('#2563EB', 0.04) : alpha('#60A5FA', 0.08),
        selected: isLight ? alpha('#2563EB', 0.1) : alpha('#60A5FA', 0.16),
      },
      divider: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em', fontFamily: '"Playfair Display", serif' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em', fontFamily: '"Playfair Display", serif' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em', fontFamily: '"Playfair Display", serif' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600, letterSpacing: '0.01em' },
      subtitle2: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'uppercase', fontSize: '0.75rem' },
      body1: { lineHeight: 1.7 },
      button: { textTransform: 'none', fontWeight: 700, borderRadius: 12 },
    },
    shape: {
      borderRadius: 20,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: ${backgroundDefault};
            background-image: ${isLight 
              ? 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 255, 255, 0.5) 0px, transparent 50%)' 
              : 'radial-gradient(at 0% 0%, rgba(30, 41, 59, 1) 0px, transparent 50%)'};
            background-attachment: fixed;
          }
        `,
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isLight 
              ? '0px 4px 20px rgba(0, 0, 0, 0.03)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { 
            padding: '10px 24px',
            fontSize: '0.9rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { transform: 'translateY(-2px)' },
          },
          contained: {
            boxShadow: isLight 
              ? '0 10px 20px -5px rgba(37, 99, 235, 0.3)' 
              : '0 10px 20px -5px rgba(96, 165, 250, 0.3)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)'}`,
            boxShadow: isLight 
              ? '0px 4px 20px rgba(0, 0, 0, 0.02), 0px 8px 16px rgba(0, 0, 0, 0.02)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            marginBottom: 4,
            '&.Mui-selected': {
              backgroundColor: isLight ? alpha(primary, 0.08) : alpha(primary, 0.15),
              color: primary,
              '&:hover': {
                backgroundColor: isLight ? alpha(primary, 0.12) : alpha(primary, 0.25),
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isLight ? alpha('#000', 0.03) : alpha('#fff', 0.05)}`,
            padding: '16px 24px',
          },
          head: {
            fontWeight: 700,
            backgroundColor: isLight ? alpha('#F1F5F9', 0.5) : alpha('#1E293B', 0.5),
            color: secondary,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            boxShadow: isLight 
              ? '0px 20px 60px -10px rgba(0, 0, 0, 0.1)' 
              : '0px 20px 60px -10px rgba(0, 0, 0, 0.5)',
          },
        },
      },
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
