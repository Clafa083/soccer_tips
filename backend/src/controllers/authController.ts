import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { LoginDTO, RegisterDTO } from '../types/auth';

const USE_MOCK_DATA = process.env.DEV_MODE === 'mock';

console.log('AuthController environment check:');
console.log('DEV_MODE:', process.env.DEV_MODE);
console.log('USE_MOCK_DATA:', USE_MOCK_DATA);

export const authController = {
    async register(req: Request, res: Response) {
        try {
            const registerData: RegisterDTO = req.body;
            const result = await authService.register(registerData);
            res.status(201).json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            res.status(400).json({ message });
        }
    },    async login(req: Request, res: Response) {
        console.log('=== LOGIN METHOD CALLED ===');
        try {
            const credentials: LoginDTO = req.body;
            
            console.log('Login attempt - DEV_MODE:', process.env.DEV_MODE);
            console.log('Login attempt - USE_MOCK_DATA:', USE_MOCK_DATA);
            
            if (false) { // Disabled mock authentication - always use real database
                console.log('Using mock authentication');
                // Simple mock authentication
                if (credentials.email === 'admin@vm-tips.se' && credentials.password === 'admin123') {
                    res.json({
                        token: 'mock-jwt-token-admin',
                        user: {
                            id: 1,
                            email: 'admin@vm-tips.se',
                            name: 'Admin User',
                            isAdmin: true,
                            imageUrl: null,
                            createdAt: new Date()
                        }
                    });
                    return;
                } else if (credentials.email === 'test@vm-tips.se' && credentials.password === 'test123') {
                    res.json({
                        token: 'mock-jwt-token-user',
                        user: {
                            id: 2,
                            email: 'test@vm-tips.se',
                            name: 'Test User',
                            isAdmin: false,
                            imageUrl: null,
                            createdAt: new Date()
                        }
                    });
                    return;
                } else {
                    res.status(401).json({ message: 'Invalid credentials (mock)' });                    return;
                }
            }
            
            console.log('Using real database authentication');
            const result = await authService.login(credentials);
            res.json(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            res.status(401).json({ message });
        }
    },    async getCurrentUser(req: Request, res: Response) {
        try {
            if (!req.user?.userId) {
                throw new Error('User not authenticated');
            }
            const user = await authService.getUserById(req.user.userId);
            res.json(user);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to get user';
            res.status(400).json({ message });
        }
    },

    async updateProfile(req: Request, res: Response) {
        try {
            if (!req.user?.userId) {
                throw new Error('User not authenticated');
            }
            const updateData = req.body;
            const updatedUser = await authService.updateProfile(req.user.userId, updateData);
            res.json(updatedUser);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            res.status(400).json({ message });
        }
    }
};
