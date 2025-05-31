import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

const USE_MOCK_DATA = !process.env.DB_HOST || process.env.NODE_ENV === 'development';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
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
            return res.status(403).json({ message: 'Invalid mock token' });
        }
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
