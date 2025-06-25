import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ThemeMode, getTheme } from '../theme';

interface ThemeContextType {
    themeMode: ThemeMode;
    toggleTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface AppThemeProviderProps {
    children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        // Hämta sparad tema-preferens från localStorage
        const saved = localStorage.getItem('themeMode');
        return (saved as ThemeMode) || 'light';
    });

    const toggleTheme = (mode: ThemeMode) => {
        setThemeMode(mode);
        localStorage.setItem('themeMode', mode);
    };

    useEffect(() => {
        // Spara tema-preferens när den ändras
        localStorage.setItem('themeMode', themeMode);
    }, [themeMode]);

    const theme = getTheme(themeMode);

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within an AppThemeProvider');
    }
    return context;
}
