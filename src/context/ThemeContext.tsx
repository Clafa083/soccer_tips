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
        return (saved as ThemeMode) || 'cozy';
    });

    const toggleTheme = (mode: ThemeMode) => {
        setThemeMode(mode);
        localStorage.setItem('themeMode', mode);
    };

    useEffect(() => {
        // Spara tema-preferens när den ändras
        localStorage.setItem('themeMode', themeMode);
        
        // Uppdatera body bakgrundsfärg för att täcka hela sidan
        const theme = getTheme(themeMode);
        document.body.style.backgroundColor = theme.palette.background.default;
        document.body.style.color = theme.palette.text.primary;
        document.documentElement.style.backgroundColor = theme.palette.background.default;

        // Ta bort gamla temaklasser
        document.body.classList.remove('light', 'dark', 'cozy');
        // Lägg till aktuell temaklass
        document.body.classList.add(themeMode);
        // Om cozy: lägg till cozy, om dark: lägg till dark, om cozy+dark (om du vill stödja det i framtiden)
        // Just nu hanteras bara en klass åt gången
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
