import { createTheme } from '@mui/material/styles';

// Removed Theme and ThemeOptions declarations for ffxiColors as it's not used.

// Theme colors based on the provided image
const IMAGE_MAIN_BG = '#1C1C1C'; // Very dark grey, almost black from image
const IMAGE_TABLE_ROW_BG = '#2A2A2A'; // Dark grey for table rows, slightly lighter than main BG
const IMAGE_TABLE_HEADER_BG = '#222222'; // Slightly darker grey for table header
const IMAGE_TEXT_PRIMARY = '#E0E0E0'; // Light grey/off-white for primary text
const IMAGE_TEXT_SECONDARY = '#A0A0A0'; // Muted grey for secondary text
const IMAGE_ACCENT_GOLD = '#B8860B'; // Gold for accents, borders (similar to FFXI_GOLD)
const FFXI_BLUE = '#1A2B4C'; // Kept for primary button, can be reviewed

export const ffxiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: FFXI_BLUE, // For primary actions if any, e.g., specific buttons
      contrastText: IMAGE_TEXT_PRIMARY,
    },
    secondary: {
      main: IMAGE_ACCENT_GOLD, // For accents, highlights
      contrastText: IMAGE_MAIN_BG, 
    },
    background: {
      default: IMAGE_MAIN_BG,
      paper: IMAGE_TABLE_ROW_BG, // Used for table rows, cards etc.
    },
    text: {
      primary: IMAGE_TEXT_PRIMARY,
      secondary: IMAGE_TEXT_SECONDARY,
    },
    divider: 'rgba(184, 134, 11, 0.2)', // IMAGE_ACCENT_GOLD with alpha, subtler
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: IMAGE_MAIN_BG, // Ensure body background matches
          color: IMAGE_TEXT_PRIMARY,      // Default text color for the body
          scrollbarColor: `${IMAGE_ACCENT_GOLD} ${IMAGE_TABLE_ROW_BG}`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: IMAGE_TABLE_ROW_BG, // Scrollbar track
            width: '10px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: IMAGE_ACCENT_GOLD, // Scrollbar thumb
            minHeight: 24,
            border: `3px solid ${IMAGE_TABLE_ROW_BG}`,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#DAA520', // Lighter gold on focus
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#DAA520',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#DAA520',
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: IMAGE_TABLE_ROW_BG,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // background: `linear-gradient(145deg, ${IMAGE_TABLE_HEADER_BG}, ${IMAGE_MAIN_BG})`,
          background: IMAGE_TABLE_HEADER_BG, // Solid dark color for app bar, matching image header style
          borderBottom: `1px solid ${IMAGE_ACCENT_GOLD}`, // Subtler border
          boxShadow: `0 1px 5px rgba(184, 134, 11, 0.2)`,
          color: IMAGE_TEXT_PRIMARY,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
          borderRadius: '4px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: IMAGE_ACCENT_GOLD,
          transition: 'all 0.3s ease',
          letterSpacing: '0.5px',
        },
        containedPrimary: { // Use this for primary actions if needed
          backgroundColor: FFXI_BLUE, // Keeping FFXI_BLUE for a distinct primary button
          color: IMAGE_TEXT_PRIMARY,
          '&:hover': {
            backgroundColor: '#2A3F6C', // Slightly lighter blue
            boxShadow: `0 0 8px ${IMAGE_ACCENT_GOLD}`,
          },
        },
        containedSecondary: { // Use this for gold accent buttons
          backgroundColor: IMAGE_ACCENT_GOLD,
          color: IMAGE_MAIN_BG, // Dark text on gold button
          borderColor: IMAGE_MAIN_BG, 
          '&:hover': {
            backgroundColor: '#DAA520', // Lighter gold
            borderColor: IMAGE_MAIN_BG,
            boxShadow: `0 0 8px ${IMAGE_TEXT_PRIMARY}`,
          },
        },
        outlinedPrimary: {
          borderColor: IMAGE_ACCENT_GOLD, // Gold outline
          color: IMAGE_TEXT_PRIMARY, 
          '&:hover': {
            backgroundColor: 'rgba(184, 134, 11, 0.1)', // IMAGE_ACCENT_GOLD with alpha
            borderColor: '#DAA520', // Lighter gold border on hover
            color: '#DAA520',
          },
        },
      },
    },
    MuiPaper: { // This will affect FilterBar and other Paper components
      styleOverrides: {
        root: {
          backgroundColor: IMAGE_TABLE_ROW_BG, // Using table row color for general paper elements
          backgroundImage: 'none',
          border: `1px solid rgba(184, 134, 11, 0.3)`, // Subtler gold border
          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.4)`,
          borderRadius: '4px', // Slightly smaller radius, closer to image style
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: IMAGE_TABLE_HEADER_BG, // Darker background for table head, as in image
          borderBottom: `1px solid ${IMAGE_ACCENT_GOLD}`, // Gold border for head
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: IMAGE_TEXT_PRIMARY, // Light text for header cells, as in image
          fontWeight: 'normal', // Image header text is not particularly bold
          textTransform: 'none', // Image header text is not uppercase
          letterSpacing: '0.5px',
          borderBottom: 'none', // Handled by MuiTableHead root border
          padding: '8px 12px', // Adjust padding to match image density
          fontSize: '0.85rem',
        },
        body: {
          color: IMAGE_TEXT_PRIMARY,
          borderColor: `rgba(120, 120, 120, 0.2)`, // Subtle grey border for row separation
          padding: '6px 12px', // Adjust padding for density
          fontSize: '0.8rem',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: IMAGE_TEXT_SECONDARY,
          '&.Mui-focused': {
            color: IMAGE_ACCENT_GOLD,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(184, 134, 11, 0.4)', // Gold with alpha for outline
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: IMAGE_ACCENT_GOLD,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: IMAGE_ACCENT_GOLD,
            borderWidth: '1px',
          },
          color: IMAGE_TEXT_PRIMARY,
        },
        notchedOutline: {
          borderColor: 'rgba(184, 134, 11, 0.4)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: IMAGE_TEXT_SECONDARY,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: IMAGE_TEXT_SECONDARY,
          '&.Mui-checked': {
            color: IMAGE_ACCENT_GOLD,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: IMAGE_TABLE_HEADER_BG, // Dark tooltip background
          color: IMAGE_TEXT_PRIMARY,
          border: `1px solid ${IMAGE_ACCENT_GOLD}`,
          fontSize: '0.75rem',
        },
        arrow: {
          color: IMAGE_ACCENT_GOLD,
        },
      },
    },
    // Ensure react-data-table-component specific styles in PlayerTableModern.tsx
    // are also updated or use these theme settings effectively.
    // The DataTable component itself might need its `customStyles` prop adjusted
    // if these Mui component overrides are not fully picked up by it.
  },
});
