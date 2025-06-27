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
        '@media (max-width:600px)': {
            fontSize: '2rem',
        },
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 600,
        '@media (max-width:600px)': {
            fontSize: '1.75rem',
        },
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        '@media (max-width:600px)': {
            fontSize: '1.5rem',
        },
    },
    h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
            fontSize: '1.25rem',
        },
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
            fontSize: '1.125rem',
        },
    },
    h6: {
        fontSize: '1rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
            fontSize: '0.9rem',
        },
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
    MuiContainer: {
        styleOverrides: {
            root: {
                paddingLeft: 16,
                paddingRight: 16,
                '@media (max-width: 600px)': {
                    paddingLeft: 8,
                    paddingRight: 8,
                },
            },
        },
    },
    MuiAutocomplete: {
        styleOverrides: {
            paper: {
                '@media (max-width: 600px)': {
                    maxHeight: '50vh',
                },
            },
            listbox: {
                '@media (max-width: 600px)': {
                    padding: 4,
                },
            },
            option: {
                '@media (max-width: 600px)': {
                    minHeight: 40,
                    padding: '8px 12px',
                },
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '@media (max-width: 600px)': {
                    '& .MuiInputLabel-root': {
                        fontSize: '0.875rem',
                    },
                    '& .MuiInputBase-input': {
                        fontSize: '0.875rem',
                    },
                },
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

// Mysigt tema (naturinspirerat med varma färger)
export const cozyTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#365E32', // Mörk grön
            light: '#81A263', // Mellangrön
            dark: '#2d4e29',
        },
        secondary: {
            main: '#FD9B63', // Orange
            light: '#ffb48a',
            dark: '#e8884a',
        },
        background: {
            default: '#f9f7f4', // Ljus varm vit
            paper: '#ffffff', // Ren vit för kort
        },
        text: {
            primary: '#365E32', // Mörk grön för text
            secondary: '#6d7c6a', // Ljusare grön för sekundär text
        },
        success: {
            main: '#81A263', // Mellangrön för framgång
        },
        error: {
            main: '#d32f2f',
        },
        warning: {
            main: '#E7D37F', // Gul för varningar
        },
        info: {
            main: '#365E32',
        },
        // Anpassade färger för temat
        divider: '#E7D37F',
    },
    typography: {
        fontFamily: [
            '"Noto Sans"',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontFamily: ['"Oswald"', 'sans-serif'].join(','),
            fontSize: '2.5rem',
            fontWeight: 600,
            color: '#365E32',
            '@media (max-width:600px)': {
                fontSize: '2rem',
            },
        },
        h2: {
            fontFamily: ['"Oswald"', 'sans-serif'].join(','),
            fontSize: '2rem',
            fontWeight: 600,
            color: '#365E32',
            '@media (max-width:600px)': {
                fontSize: '1.75rem',
            },
        },
        h3: {
            fontFamily: ['"Oswald"', 'sans-serif'].join(','),
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#365E32',
            '@media (max-width:600px)': {
                fontSize: '1.5rem',
            },
        },
        h4: {
            fontFamily: ['"Oswald"', 'sans-serif'].join(','),
            fontSize: '1.5rem',
            fontWeight: 500,
            color: '#365E32',
            '@media (max-width:600px)': {
                fontSize: '1.25rem',
            },
        },
        h5: {
            fontFamily: ['"Oswald"', 'sans-serif'].join(','),
            fontSize: '1.25rem',
            fontWeight: 500,
            color: '#365E32',
            '@media (max-width:600px)': {
                fontSize: '1.125rem',
            },
        },
        h6: {
            fontFamily: ['"Oswald"', 'sans-serif'].join(','),
            fontSize: '1rem',
            fontWeight: 500,
            color: '#365E32',
            '@media (max-width:600px)': {
                fontSize: '0.9rem',
            },
        },
    },
    components: {
        ...baseComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#365E32',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(54, 94, 50, 0.3)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(54, 94, 50, 0.1)',
                    backgroundColor: '#ffffff',
                    border: '1px solid #E7D37F',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(54, 94, 50, 0.15)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none' as const,
                    borderRadius: 12,
                    fontWeight: 500,
                    fontFamily: ['"Noto Sans"', 'sans-serif'].join(','),
                },
                contained: {
                    backgroundColor: '#365E32',
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: '#2d4e29',
                    },
                },
                outlined: {
                    borderColor: '#81A263',
                    color: '#365E32',
                    '&:hover': {
                        backgroundColor: 'rgba(129, 162, 99, 0.1)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                colorPrimary: {
                    backgroundColor: '#81A263',
                    color: '#ffffff',
                },
                colorSecondary: {
                    backgroundColor: '#FD9B63',
                    color: '#ffffff',
                },
                outlined: {
                    borderColor: '#E7D37F',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily: ['"Noto Sans"', 'sans-serif'].join(','),
                    fontWeight: 500,
                    '&.Mui-selected': {
                        color: '#365E32',
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#E7D37F',
                    '& .MuiTableCell-head': {
                        color: '#365E32',
                        fontWeight: 600,
                        fontFamily: ['"Oswald"', 'sans-serif'].join(','),
                    },
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
