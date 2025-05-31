import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import type { User } from '../types/models';
import { authService } from '../services/authService';

interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    theme: 'light' | 'dark';
}

type AppAction =
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_THEME'; payload: 'light' | 'dark' };

const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    theme: 'light'
};

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload
            };
        case 'SET_THEME':
            return {
                ...state,
                theme: action.payload
            };
        default:
            return state;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const user = await authService.getCurrentUser();
                    dispatch({ type: 'SET_USER', payload: user });
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
