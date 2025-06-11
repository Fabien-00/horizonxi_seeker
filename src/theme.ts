import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    ffxiColors: {
      primary: string;
      secondary: string;
      background: {
        main: string;
        paper: string;
      };
      text: {
        primary: string;
        secondary: string;
      };
    };
  }
  
  interface ThemeOptions {
    ffxiColors?: {
      primary?: string;
      secondary?: string;
      background?: {
        main?: string;
        paper?: string;
      };
      text?: {
        primary?: string;
        secondary?: string;
      };
    };
  }
}

export const ffxiTheme = createTheme({
  ffxiColors: {
    primary: '#4a90e2',
    secondary: '#2a8bff',
    background: {
      main: '#0a1a2a',
      paper: '#0f2742',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#2a8bff',
    },
    background: {
      default: '#0a1a2a',
      paper: '#0f2742',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #0a1a2a, #0f2742)',
          borderBottom: '1px solid #2a8bff',
          boxShadow: '0 0 15px rgba(42, 139, 255, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.5px',
        },
        contained: {
          background: 'linear-gradient(90deg, #4a90e2, #2a8bff)',
          '&:hover': {
            background: 'linear-gradient(90deg, #3a80d2, #1a7bef)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #0a1a2a, #0f2742)',
          border: '1px solid #2a8bff',
          boxShadow: '0 0 15px rgba(42, 139, 255, 0.15)',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
    },
  },
});
