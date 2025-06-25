import { createTheme, Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'cozy';

// Grundläggande typografi och komponenter som delas mellan alla teman
const baseTypography = {
    fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
    ].join(','),
    h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 600,
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
    },
    h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
    },
    h6: {
        fontSize: '1rem',
        fontWeight: 500,
    },
};

const baseComponents = {
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none' as const,
                borderRadius: 8,
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
        },
    },
};

// Ljust tema (standard)
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
        },
        background: {
            default: '#fafafa',
            paper: '#ffffff',
        },
        text: {
            primary: '#333333',
            secondary: '#666666',
        },
    },
    typography: baseTypography,
    components: {
        ...baseComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#333333',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

// Mörkt tema
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
            light: '#bbdefb',
            dark: '#42a5f5',
        },
        secondary: {
            main: '#ce93d8',
            light: '#e1bee7',
            dark: '#ba68c8',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
        },
    },
    typography: baseTypography,
    components: {
        ...baseComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e1e1e',
                    color: '#ffffff',
                    boxShadow: '0 1px 3px rgba(255,255,255,0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(255,255,255,0.1)',
                    backgroundColor: '#1e1e1e',
                },
            },
        },
    },
});

// Mysigt tema (varma färger)
export const cozyTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#d2691e', // Saddle brown
            light: '#deb887',
            dark: '#8b4513',
        },
        secondary: {
            main: '#cd853f', // Peru
            light: '#f4a460',
            dark: '#a0522d',
        },
        background: {
            default: '#faf0e6', // Linen
            paper: '#fff8dc', // Cornsilk
        },
        text: {
            primary: '#2f1b14', // Dark brown
            secondary: '#5d4037',
        },
        success: {
            main: '#8bc34a',
        },
        error: {
            main: '#f44336',
        },
        warning: {
            main: '#ff9800',
        },
        info: {
            main: '#2196f3',
        },
    },
    typography: {
        ...baseTypography,
        fontFamily: [
            '"Georgia"',
            '"Times New Roman"',
            'serif',
        ].join(','),
    },
    components: {
        ...baseComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#8b4513',
                    color: '#fff8dc',
                    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)',
                    backgroundColor: '#fff8dc',
                    border: '1px solid #deb887',
                },
            },
        },        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none' as const,
                    borderRadius: 12,
                    fontWeight: 500,
                },
            },
        },
    },
});

export const getTheme = (mode: ThemeMode): Theme => {
    switch (mode) {
        case 'dark':
            return darkTheme;
        case 'cozy':
            return cozyTheme;
        case 'light':
        default:
            return lightTheme;
    }
};

// Bakåtkompatibilitet - exportera ljust tema som standard
export const theme = lightTheme;
