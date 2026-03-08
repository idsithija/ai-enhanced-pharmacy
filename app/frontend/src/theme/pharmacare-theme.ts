import { createTheme } from '@mui/material/styles';

// PharmaCare Design System
export const pharmacareColors = {
  // Primary Colors
  primary: '#00d4ff',      // Cyan - brand color
  primaryDark: '#00a8cc',  // Darker cyan for hover
  primaryLight: '#66e3ff', // Lighter cyan

  // Sidebar & Dark Elements
  sidebarBg: '#1e293b',    // Dark slate
  sidebarDivider: '#334155',
  sidebarText: '#cbd5e1',
  sidebarTextActive: '#00d4ff',
  
  // Background Colors
  bgLight: '#f8fafc',      // Light gray background
  bgWhite: '#ffffff',
  bgGray: '#f9fafb',
  
  // Text Colors
  textPrimary: '#1e293b',  // Dark slate
  textSecondary: '#64748b', // Medium gray
  textMuted: '#94a3b8',    // Light gray
  
  // Status Colors
  success: '#10b981',      // Green
  successLight: '#d1fae5',
  error: '#ef4444',        // Red
  errorLight: '#fee2e2',
  warning: '#f59e0b',      // Orange/Amber
  warningLight: '#fef3c7',
  info: '#3b82f6',         // Blue
  infoLight: '#dbeafe',
  
  // Borders
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Icon Background Colors (for stat cards)
  iconBgBlue: '#dbeafe',
  iconBgCyan: '#cffafe',
  iconBgPurple: '#ede9fe',
  iconBgPink: '#fce7f3',
  iconBgGreen: '#d1fae5',
  iconBgOrange: '#ffedd5',
};

// Material-UI Theme Configuration
export const pharmacareTheme = createTheme({
  palette: {
    primary: {
      main: pharmacareColors.primary,
      dark: pharmacareColors.primaryDark,
      light: pharmacareColors.primaryLight,
    },
    secondary: {
      main: pharmacareColors.sidebarBg,
    },
    success: {
      main: pharmacareColors.success,
      light: pharmacareColors.successLight,
    },
    error: {
      main: pharmacareColors.error,
      light: pharmacareColors.errorLight,
    },
    warning: {
      main: pharmacareColors.warning,
      light: pharmacareColors.warningLight,
    },
    info: {
      main: pharmacareColors.info,
      light: pharmacareColors.infoLight,
    },
    background: {
      default: pharmacareColors.bgLight,
      paper: pharmacareColors.bgWhite,
    },
    text: {
      primary: pharmacareColors.textPrimary,
      secondary: pharmacareColors.textSecondary,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: pharmacareColors.textPrimary,
    },
    h5: {
      fontWeight: 700,
      color: pharmacareColors.textPrimary,
    },
    h6: {
      fontWeight: 600,
      color: pharmacareColors.textPrimary,
    },
    button: {
      textTransform: 'none', // Disable uppercase buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: pharmacareColors.primary,
          color: pharmacareColors.textPrimary,
          fontWeight: 600,
          '&:hover': {
            background: pharmacareColors.primaryDark,
          },
        },
        outlined: {
          borderColor: pharmacareColors.border,
          color: pharmacareColors.textPrimary,
          '&:hover': {
            borderColor: pharmacareColors.primary,
            background: 'rgba(0, 212, 255, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `1px solid ${pharmacareColors.border}`,
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: pharmacareColors.border,
            },
            '&:hover fieldset': {
              borderColor: pharmacareColors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: pharmacareColors.primary,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorSuccess: {
          backgroundColor: pharmacareColors.successLight,
          color: pharmacareColors.success,
        },
        colorError: {
          backgroundColor: pharmacareColors.errorLight,
          color: pharmacareColors.error,
        },
        colorWarning: {
          backgroundColor: pharmacareColors.warningLight,
          color: pharmacareColors.warning,
        },
        colorInfo: {
          backgroundColor: pharmacareColors.infoLight,
          color: pharmacareColors.info,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: pharmacareColors.textSecondary,
          backgroundColor: pharmacareColors.bgGray,
        },
      },
    },
  },
});

// Common Component Styles
export const pharmacareStyles = {
  // Stat Card
  statCard: {
    card: {
      height: '100%',
      border: `1px solid ${pharmacareColors.border}`,
      borderRadius: 2,
    },
    contentPadding: 3,
    valueText: {
      fontWeight: 700,
      color: pharmacareColors.textPrimary,
    },
    changePositive: {
      color: pharmacareColors.success,
      fontWeight: 500,
    },
    changeNegative: {
      color: pharmacareColors.error,
      fontWeight: 500,
    },
  },
  
  // Search Field
  searchField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: pharmacareColors.bgGray,
      '& fieldset': { border: 'none' },
    },
  },
  
  // Page Container
  pageContainer: {
    p: 3,
  },
  
  // Page Title
  pageTitle: {
    fontWeight: 700,
    color: pharmacareColors.textPrimary,
    mb: 4,
  },
  
  // Action Button (Primary)
  primaryButton: {
    bgcolor: pharmacareColors.primary,
    color: pharmacareColors.textPrimary,
    fontWeight: 600,
    borderRadius: 2,
    px: 3,
    py: 1,
    '&:hover': {
      bgcolor: pharmacareColors.primaryDark,
    },
  },
  
  // Card Header
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  
  // Table Container
  tableContainer: {
    border: `1px solid ${pharmacareColors.border}`,
    borderRadius: 2,
  },
};
