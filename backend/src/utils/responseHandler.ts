import { Request, Response, NextFunction } from 'express';

// Wrapper function to fix Express route handler return type issues
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Helper to avoid return type issues
export const sendResponse = (res: Response, statusCode: number, data: any) => {
    res.status(statusCode).json(data);
};

export const sendError = (res: Response, statusCode: number, message: string) => {
    res.status(statusCode).json({ error: message });
};