import { createTheme } from '@mui/material/styles';

// Removed Theme and ThemeOptions declarations for ffxiColors as it's not used.

// HorizonXI Premium Dark Blue Theme
const HORIZON_DEEP_BLUE = '#0A1628'; // Deep navy blue background
const HORIZON_DARK_BLUE = '#1A2332'; // Dark blue for surfaces
const HORIZON_MEDIUM_BLUE = '#243447'; // Medium blue for elevated surfaces
const HORIZON_ACCENT_BLUE = '#2E4A78'; // Accent blue for highlights
const HORIZON_GOLD = '#D4AF37'; // Premium gold for accents
const HORIZON_LIGHT_GOLD = '#F4E4BC'; // Light gold for text highlights
const HORIZON_TEXT_PRIMARY = '#E8F4FD'; // Light blue-white for primary text
const HORIZON_TEXT_SECONDARY = '#94A3B8'; // Muted blue-grey for secondary text
const HORIZON_BORDER = '#334155'; // Subtle blue-grey borders

export const ffxiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: HORIZON_ACCENT_BLUE,
      contrastText: HORIZON_TEXT_PRIMARY,
    },
    secondary: {
      main: HORIZON_GOLD,
      contrastText: HORIZON_DEEP_BLUE,
    },
    background: {
      default: HORIZON_DEEP_BLUE,
      paper: HORIZON_DARK_BLUE,
    },
    text: {
      primary: HORIZON_TEXT_PRIMARY,
      secondary: HORIZON_TEXT_SECONDARY,
    },
    divider: HORIZON_BORDER,
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.5px',
    },
    h2: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.25px',
    },
    h3: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.15px',
    },
    body1: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.15px',
    },
    body2: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.25px',
    },
    button: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.5px',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
          backgroundColor: HORIZON_DEEP_BLUE,
          color: HORIZON_TEXT_PRIMARY,
          scrollbarColor: `${HORIZON_GOLD} ${HORIZON_DARK_BLUE}`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: HORIZON_DARK_BLUE,
            width: '12px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 6,
            backgroundColor: HORIZON_GOLD,
            minHeight: 24,
            border: `2px solid ${HORIZON_DARK_BLUE}`,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: HORIZON_LIGHT_GOLD,
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: HORIZON_LIGHT_GOLD,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: HORIZON_LIGHT_GOLD,
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: HORIZON_DARK_BLUE,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${HORIZON_MEDIUM_BLUE}, ${HORIZON_DARK_BLUE})`,
          borderBottom: `2px solid ${HORIZON_GOLD}`,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)`,
          color: HORIZON_TEXT_PRIMARY,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '6px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '0.3px',
          padding: '8px 16px',
          cursor: 'pointer',
          '&:hover': {
            cursor: 'pointer',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8rem',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${HORIZON_ACCENT_BLUE}, ${HORIZON_MEDIUM_BLUE})`,
          color: HORIZON_TEXT_PRIMARY,
          border: `1px solid ${HORIZON_BORDER}`,
          boxShadow: `0 4px 12px rgba(46, 74, 120, 0.3)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${HORIZON_MEDIUM_BLUE}, ${HORIZON_ACCENT_BLUE})`,
            boxShadow: `0 6px 20px rgba(46, 74, 120, 0.4), 0 0 20px rgba(212, 175, 55, 0.2)`,
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${HORIZON_GOLD}, #B8860B)`,
          color: HORIZON_DEEP_BLUE,
          border: `1px solid ${HORIZON_GOLD}`,
          boxShadow: `0 4px 12px rgba(212, 175, 55, 0.3)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${HORIZON_LIGHT_GOLD}, ${HORIZON_GOLD})`,
            boxShadow: `0 6px 20px rgba(212, 175, 55, 0.4)`,
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: HORIZON_GOLD,
          color: HORIZON_GOLD,
          borderWidth: '2px',
          '&:hover': {
            backgroundColor: `rgba(212, 175, 55, 0.1)`,
            borderColor: HORIZON_LIGHT_GOLD,
            color: HORIZON_LIGHT_GOLD,
            boxShadow: `0 0 20px rgba(212, 175, 55, 0.3)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: HORIZON_DARK_BLUE,
          backgroundImage: `linear-gradient(135deg, ${HORIZON_DARK_BLUE}, ${HORIZON_MEDIUM_BLUE})`,
          border: `1px solid ${HORIZON_BORDER}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1)`,
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${HORIZON_MEDIUM_BLUE}, ${HORIZON_ACCENT_BLUE})`,
          borderBottom: `2px solid ${HORIZON_GOLD}`,
          '& .MuiTableCell-head': {
            color: HORIZON_TEXT_PRIMARY,
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          },
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: HORIZON_TEXT_PRIMARY,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          borderBottom: 'none',
          padding: '12px 16px',
          fontSize: '0.8rem',
        },
        body: {
          color: HORIZON_TEXT_PRIMARY,
          borderColor: HORIZON_BORDER,
          padding: '8px 16px',
          fontSize: '0.8rem',
          cursor: 'default',
          '&:hover': {
            backgroundColor: `rgba(212, 175, 55, 0.05)`,
            cursor: 'pointer',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: HORIZON_TEXT_SECONDARY,
          fontWeight: 500,
          '&.Mui-focused': {
            color: HORIZON_GOLD,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          backgroundColor: `rgba(26, 35, 50, 0.5)`,
          cursor: 'text',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: HORIZON_BORDER,
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: HORIZON_GOLD,
            cursor: 'text',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: HORIZON_GOLD,
            borderWidth: '2px',
            boxShadow: `0 0 0 2px rgba(212, 175, 55, 0.1)`,
          },
          color: HORIZON_TEXT_PRIMARY,
        },
        input: {
          padding: '10px 12px',
          fontSize: '0.85rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: HORIZON_GOLD,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: HORIZON_TEXT_SECONDARY,
          '&.Mui-checked': {
            color: HORIZON_GOLD,
          },
          '&:hover': {
            backgroundColor: `rgba(212, 175, 55, 0.1)`,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: HORIZON_MEDIUM_BLUE,
          color: HORIZON_TEXT_PRIMARY,
          border: `1px solid ${HORIZON_GOLD}`,
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 500,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3)`,
        },
        arrow: {
          color: HORIZON_GOLD,
        },
      },
    },
    // Ensure react-data-table-component specific styles in PlayerTableModern.tsx
    // are also updated or use these theme settings effectively.
    // The DataTable component itself might need its `customStyles` prop adjusted
    // if these Mui component overrides are not fully picked up by it.
  },
});
