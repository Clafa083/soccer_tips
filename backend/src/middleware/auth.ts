import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

const USE_MOCK_DATA = process.env.DEV_MODE === 'mock';

console.log('Auth middleware environment check:');
console.log('DEV_MODE:', process.env.DEV_MODE);
console.log('USE_MOCK_DATA:', USE_MOCK_DATA);

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Authentication token required' });
        return;
    }

    if (USE_MOCK_DATA) {
        // Mock token validation
        if (token === 'mock-jwt-token-admin') {
            req.user = { userId: 1, email: 'admin@vm-tips.se', isAdmin: true };
            next();
            return;
        } else if (token === 'mock-jwt-token-user') {
            req.user = { userId: 2, email: 'test@vm-tips.se', isAdmin: false };
            next();
            return;
        } else {
            res.status(403).json({ message: 'Invalid mock token' });
            return;
        }
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.isAdmin) {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};
