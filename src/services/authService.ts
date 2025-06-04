import api from '../api/api';
import type { User } from '../types/models';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData extends LoginCredentials {
    name: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    updateProfile: async (data: Partial<Pick<User, 'name' | 'email' | 'imageUrl'>>): Promise<User> => {
        const response = await api.put<User>('/auth/profile', data);
        return response.data;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};
