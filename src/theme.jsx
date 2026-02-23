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
  const primary = isLight ? '#3B82F6' : '#60A5FA'; // Vibrant Blue
  const secondary = isLight ? '#64748B' : '#94A3B8'; // Slate
  const backgroundDefault = isLight ? '#F8FAFC' : '#0B1120'; // Clean White vs Deep Space
  const backgroundPaper = isLight ? '#FFFFFF' : '#1E293B';
  
  return {
    palette: {
      mode,
      primary: { main: primary, light: '#93C5FD', dark: '#1D4ED8' },
      secondary: { main: secondary, light: '#CBD5E1', dark: '#334155' },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
        glass: isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(30, 41, 59, 0.75)',
        glassBorder: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)',
      },
      text: {
        primary: isLight ? '#0F172A' : '#F8FAFC',
        secondary: isLight ? '#64748B' : '#94A3B8',
      },
      action: {
        hover: isLight ? alpha('#3B82F6', 0.08) : alpha('#60A5FA', 0.12),
        selected: isLight ? alpha('#3B82F6', 0.15) : alpha('#60A5FA', 0.2),
      },
      divider: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em', fontFamily: '"Playfair Display", serif' },
      h2: { fontWeight: 800, letterSpacing: '-0.03em', fontFamily: '"Playfair Display", serif' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em', fontFamily: '"Playfair Display", serif' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600, letterSpacing: '0.01em' },
      subtitle2: { fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' },
      body1: { lineHeight: 1.6, fontSize: '1rem' }, // Larger body text
      body2: { lineHeight: 1.6, fontSize: '0.875rem' },
      button: { textTransform: 'none', fontWeight: 700, borderRadius: 4 },
    },
    shape: {
      borderRadius: 1,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: ${backgroundDefault};
            background-image: ${isLight 
              ? 'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 255, 255, 0.8) 0px, transparent 50%)' 
              : 'radial-gradient(at 50% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 60%)'};
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
          },
          elevation1: {
            boxShadow: isLight 
              ? '0px 10px 40px -10px rgba(0, 0, 0, 0.05)' 
              : '0px 10px 40px -10px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { 
            padding: '12px 28px',
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:active': { transform: 'scale(0.98)' },
          },
          contained: {
            boxShadow: isLight 
              ? '0 10px 30px -10px rgba(59, 130, 246, 0.5)' 
              : '0 10px 30px -10px rgba(96, 165, 250, 0.4)',
            '&:hover': {
              boxShadow: isLight 
                ? '0 15px 35px -10px rgba(59, 130, 246, 0.6)' 
                : '0 15px 35px -10px rgba(96, 165, 250, 0.5)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
            boxShadow: isLight 
              ? '0px 4px 24px rgba(0, 0, 0, 0.04)' 
              : '0px 4px 24px rgba(0, 0, 0, 0.25)',
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(11, 17, 32, 0.85)',
            backdropFilter: 'blur(20px)',
            borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            height: 80,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            boxShadow: isLight 
              ? '0 -10px 40px rgba(0,0,0,0.05)' 
              : '0 -10px 40px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: secondary,
            padding: '6px 0',
            minWidth: 'auto',
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              color: primary,
              transform: 'translateY(-4px)',
            },
            '& .MuiSvgIcon-root': {
               transition: 'all 0.3s ease',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
               filter: `drop-shadow(0 4px 8px ${alpha(primary, 0.4)})`,
            }
          },
          label: {
            fontSize: '0.7rem',
            fontWeight: 700,
            marginTop: 4,
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            }
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 6,
            padding: '12px 16px',
            '&.Mui-selected': {
              backgroundColor: isLight ? alpha(primary, 0.1) : alpha(primary, 0.2),
              color: primary,
              '&:hover': {
                backgroundColor: isLight ? alpha(primary, 0.15) : alpha(primary, 0.3),
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isLight ? alpha('#000', 0.04) : alpha('#fff', 0.06)}`,
            padding: '20px 24px',
          },
          head: {
            fontWeight: 800,
            backgroundColor: isLight ? alpha('#F8FAFC', 0.8) : alpha('#0B1120', 0.8),
            color: secondary,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: isLight 
              ? '0px 25px 80px -15px rgba(0, 0, 0, 0.15)' 
              : '0px 25px 80px -15px rgba(0, 0, 0, 0.6)',
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
