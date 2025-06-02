import { Request, Response } from 'express';

export const testFunction = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'test' });
};
