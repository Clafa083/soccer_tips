import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/database';
import { User, UserWithoutPassword, LoginDTO, RegisterDTO, AuthResponse, JwtPayload } from '../types/auth';

class AuthService {    private generateToken(user: UserWithoutPassword): string {
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        };

        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    private excludePassword(user: User): UserWithoutPassword {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async register(data: RegisterDTO): Promise<AuthResponse> {
        const connection = await pool.getConnection();
        
        try {
            // Check if user already exists
            const [existingUsers] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [data.email]
            );

            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                throw new Error('User with this email already exists');
            }

            const hashedPassword = await this.hashPassword(data.password);

            // Create new user
            const [result] = await connection.execute(
                'INSERT INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, false)',
                [data.email, data.name, hashedPassword]
            );

            if (!('insertId' in result)) {
                throw new Error('Failed to create user');
            }

            const [newUserRows] = await connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [result.insertId]
            );

            const newUser = (Array.isArray(newUserRows) && newUserRows[0]) as User;
            const userWithoutPassword = this.excludePassword(newUser);
            const token = this.generateToken(userWithoutPassword);

            return { token, user: userWithoutPassword };
        } finally {
            connection.release();
        }
    }

    async login(credentials: LoginDTO): Promise<AuthResponse> {
        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [credentials.email]
            );

            const user = (Array.isArray(users) && users[0]) as User | undefined;

            if (!user) {
                throw new Error('Invalid email or password');
            }

            const validPassword = await bcrypt.compare(credentials.password, user.password);
            if (!validPassword) {
                throw new Error('Invalid email or password');
            }

            const userWithoutPassword = this.excludePassword(user);
            const token = this.generateToken(userWithoutPassword);

            return { token, user: userWithoutPassword };
        } finally {
            connection.release();
        }
    }

    async getUserById(userId: number): Promise<UserWithoutPassword> {
        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            const user = (Array.isArray(users) && users[0]) as User | undefined;

            if (!user) {
                throw new Error('User not found');        }

            return this.excludePassword(user);
        } finally {
            connection.release();
        }
    }

    async updateProfile(userId: number, updateData: Partial<Pick<User, 'name' | 'email' | 'imageUrl'>>): Promise<UserWithoutPassword> {
        const connection = await pool.getConnection();
        
        try {
            const allowedFields = ['name', 'email', 'imageUrl'];
            const updates: string[] = [];
            const values: any[] = [];

            // Build dynamic update query based on provided fields
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key) && updateData[key as keyof typeof updateData] !== undefined) {
                    updates.push(`${key} = ?`);
                    values.push(updateData[key as keyof typeof updateData]);
                }
            });

            if (updates.length === 0) {
                throw new Error('No valid fields to update');
            }

            // Check if email is being updated and ensure it's unique
            if (updateData.email) {
                const [existingUsers] = await connection.execute(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [updateData.email, userId]
                );

                if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                    throw new Error('Email already in use by another user');
                }
            }

            // Add updatedAt timestamp and userId to the query
            updates.push('updatedAt = CURRENT_TIMESTAMP');
            values.push(userId);

            // Execute update
            await connection.execute(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            // Return updated user
            const [updatedUsers] = await connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            const updatedUser = (Array.isArray(updatedUsers) && updatedUsers[0]) as User;

            if (!updatedUser) {
                throw new Error('User not found after update');
            }

            return this.excludePassword(updatedUser);
        } finally {
            connection.release();
        }
    }
}

export const authService = new AuthService();
