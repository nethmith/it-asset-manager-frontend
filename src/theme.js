import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2f55d4', // Professional Deep Blue/Indigo
      light: '#eef2ff',
      dark: '#1e3a8a',
    },
    secondary: {
      main: '#64748b', // Soft Slate Gray
    },
    background: {
      default: '#f4f6f8', // Global light gray background
      paper: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#ecfdf5',
    },
    warning: {
      main: '#f59e0b',
      light: '#fffbeb',
    },
    info: {
      main: '#3b82f6',
      light: '#eff6ff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  typography: {
    fontFamily: '"Inter", "Public Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // More professional look
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1e3a8a',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Subtle elevation
          border: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f8fafc',
          color: '#64748b',
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#fcfcfc', // Alternating row colors
          },
        },
      },
    },
  },
});

export default theme;
