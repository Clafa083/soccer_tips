import { Request, Response } from 'express';

export const getUserBets = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'getUserBets' });
};

export const getBetsByMatch = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'getBetsByMatch' });
};

export const createOrUpdateBet = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'createOrUpdateBet' });
};

export const deleteBet = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'deleteBet' });
};