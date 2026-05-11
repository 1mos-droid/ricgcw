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
  
  // Premium RICGCW Palette (Hybrid: Logo Accuracy + High Contrast)
  const primaryMain = isLight ? '#1034A6' : '#D4AF37'; // Regal Blue vs Logo Gold
  const goldAccent = '#D4AF37'; 
  const globeBlue = '#00A2E8';
  
  const backgroundDefault = isLight ? '#F8FAFC' : '#020617';
  const backgroundPaper = isLight ? '#FFFFFF' : '#0B1222';
  
  return {
    palette: {
      mode,
      primary: { main: primaryMain, light: '#6366F1', dark: '#1E3A8A', contrastText: '#FFFFFF' },
      secondary: { main: globeBlue, light: '#48CAE4', dark: '#023E8A', contrastText: '#FFFFFF' },
      accent: { main: goldAccent },
      success: { main: '#10B981' },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
        glass: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(11, 18, 34, 0.92)',
        glassBorder: isLight ? 'rgba(16, 52, 166, 0.1)' : 'rgba(212, 175, 55, 0.15)',
      },
      text: {
        primary: isLight ? '#0F172A' : '#FFFFFF',
        secondary: isLight ? '#475569' : '#94A3B8',
      },
      divider: isLight ? 'rgba(16, 52, 166, 0.08)' : 'rgba(212, 175, 55, 0.1)',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      h1: { fontWeight: 900, letterSpacing: '-0.04em', fontFamily: '"Playfair Display", serif' },
      h2: { fontWeight: 900, letterSpacing: '-0.04em', fontFamily: '"Playfair Display", serif' },
      h3: { fontWeight: 800, letterSpacing: '-0.03em', fontFamily: '"Playfair Display", serif' },
      h4: { fontWeight: 800, letterSpacing: '-0.02em', fontFamily: '"Playfair Display", serif' },
      h5: { fontWeight: 800, letterSpacing: '-0.01em' },
      h6: { fontWeight: 800 },
      subtitle1: { fontWeight: 700, letterSpacing: '0.01em' },
      subtitle2: { fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.65rem' },
      body1: { lineHeight: 1.75, fontSize: '1rem', fontWeight: 500 },
      body2: { lineHeight: 1.75, fontSize: '0.875rem', fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 900, letterSpacing: '0.05em' },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: ${backgroundDefault};
            background-image: ${isLight 
              ? 'radial-gradient(at 0% 0%, rgba(16, 52, 166, 0.04) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 255, 255, 0.8) 0px, transparent 50%)' 
              : 'radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.08) 0px, transparent 70%), url("data:image/svg+xml,%3Csvg width=\\"24\\" height=\\"24\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Ccircle cx=\\"2\\" cy=\\"2\\" r=\\"0.8\\" fill=\\"rgba(212,175,55,0.08)\\"/%3E%3C/svg%3E")'};
            background-attachment: fixed;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
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
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            border: `1px solid ${isLight ? 'rgba(16, 52, 166, 0.05)' : 'rgba(212, 175, 55, 0.1)'}`,
          },
          elevation1: {
            boxShadow: isLight 
              ? '0px 20px 40px rgba(15, 23, 42, 0.06)' 
              : '0px 20px 40px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(11, 18, 34, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(212, 175, 55, 0.1)'}`,
            height: 70,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: primaryMain,
            },
          },
          label: {
            fontWeight: 800,
            fontSize: '0.65rem',
            '&.Mui-selected': {
              fontSize: '0.7rem',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { 
            borderRadius: 8,
            padding: '14px 30px',
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.1)', transform: 'translateY(-1px)' },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primaryMain} 0%, ${isLight ? '#1E3A8A' : '#8B6508'} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${isLight ? '#1E3A8A' : '#8B6508'} 0%, ${primaryMain} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(11, 18, 34, 0.92)',
            backdropFilter: 'blur(40px)',
            border: `1px solid ${isLight ? 'rgba(16, 52, 166, 0.08)' : 'rgba(212, 175, 55, 0.12)'}`,
            boxShadow: isLight 
              ? '0px 24px 48px -12px rgba(15, 23, 42, 0.06)' 
              : '0px 24px 48px -12px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(24px)',
            borderBottom: `1px solid ${isLight ? 'rgba(16, 52, 166, 0.05)' : 'rgba(212, 175, 55, 0.08)'}`,
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
