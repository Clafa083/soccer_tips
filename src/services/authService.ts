import api from '../api/api';
import type { User } from '../types/models';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData extends LoginCredentials {
    name: string;
    username: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

interface UpdateProfileData {
    name?: string;
    username?: string;
    email?: string;
    image_url?: string;
    current_password?: string;
    new_password?: string;
}

interface UpdateProfileResponse {
    message: string;
    user: User;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth.php?action=login', credentials);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth.php?action=register', data);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<{ user: User }>('/auth.php');
        return response.data.user;
    },updateProfile: async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
        const response = await api.put<UpdateProfileResponse>('/auth.php', data);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth.php?action=forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth.php?action=reset-password', { 
            token, 
            new_password: newPassword 
        });
        return response.data;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};
