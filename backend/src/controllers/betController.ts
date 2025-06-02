import { Request, Response } from 'express';
import { devDb as dbAdapter } from '../db/DevelopmentDatabaseAdapter';
import { DatabaseAdapter } from '../db/DatabaseAdapter';

export const getUserBets = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    try {
        const bets = await dbAdapter.getUserBets(userId);
        res.json(bets);
    } catch (error) {
        console.error('Error fetching user bets:', error);
        res.status(500).json({ message: 'Failed to fetch user bets' });
    }
};

export const getBetsByMatch = async (req: Request, res: Response): Promise<void> => {
    const matchId = parseInt(req.params.matchId, 10);

    if (isNaN(matchId)) {
        res.status(400).json({ message: 'Invalid matchId format' });
        return;
    }

    try {
        const bets = await dbAdapter.getBetsByMatch(matchId);
        res.json(bets);
    } catch (error) {
        console.error('Error fetching bets by match:', error);
        res.status(500).json({ message: 'Failed to fetch bets for the match' });
    }
};

export const createOrUpdateBet = async (req: Request, res: Response): Promise<void> => {
    const userId = req.body.userId;
    const matchId = req.body.matchId;
    const homeScoreBet = req.body.homeScoreBet;
    const awayScoreBet = req.body.awayScoreBet;

    if (!userId || !matchId) {
        res.status(400).json({ message: 'userId and matchId are required' });
        return;
    }

    try {
        // Check if bets are locked
        const betsLocked = await DatabaseAdapter.getSetting('betsLocked');
        if (betsLocked === 'true') {
            res.status(403).json({ message: 'Betting is currently locked by admin.' });
            return;
        }
        const bet = await dbAdapter.createOrUpdateBet({ userId, matchId, homeScoreBet, awayScoreBet });
        res.status(200).json(bet);
    } catch (error) {
        console.error('Error creating/updating bet:', error);
        res.status(500).json({ message: 'Failed to create or update bet' });
    }
};

export const deleteBet = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.body.userId, 10);
    const matchId = parseInt(req.body.matchId, 10);

    if (isNaN(userId) || isNaN(matchId)) {
        res.status(400).json({ message: 'Invalid userId or matchId format' });
        return;
    }

    try {
        const result = await dbAdapter.deleteBet(userId, matchId);
        if (result) {
            res.status(200).json({ message: 'Bet deleted' });
        } else {
            res.status(404).json({ message: 'Bet not found' });
        }
    } catch (error) {
        console.error('Error deleting bet:', error);
        res.status(500).json({ message: 'Failed to delete bet' });
    }
};