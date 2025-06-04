import { Request, Response } from 'express';
import { DatabaseAdapter } from '../db/DatabaseAdapter';

export const getUserBets = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }    try {
        const bets = await DatabaseAdapter.getUserBets(userId);
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
    }    try {
        const bets = await DatabaseAdapter.getBetsByMatch(matchId);
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
    const homeTeamId = req.body.homeTeamId;
    const awayTeamId = req.body.awayTeamId;

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
        }        const bet = await DatabaseAdapter.createOrUpdateBet({ 
            userId, 
            matchId, 
            homeScoreBet, 
            awayScoreBet,
            homeTeamId,
            awayTeamId
        });
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
    }    try {
        const result = await DatabaseAdapter.deleteBet(userId, matchId);
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

// Get bets for a specific user (public endpoint for viewing other users' bets)
export const getUserBetsById = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
        res.status(400).json({ message: 'Invalid userId format' });
        return;
    }

    try {
        // Get user bets with match details
        const betsResult = await DatabaseAdapter.query(            `SELECT 
                b.id, b.userId, b.matchId, b.homeScore as homeScoreBet, b.awayScore as awayScoreBet,
                b.homeTeamId, b.awayTeamId, b.points, b.createdAt, b.updatedAt,
                m.matchTime, m.matchType, m.homeScore, m.awayScore, m.group,
                ht.name as homeTeamName, ht.flag as homeTeamFlag,
                at.name as awayTeamName, at.flag as awayTeamFlag,
                u.name as userName, u.imageUrl as userImageUrl
             FROM bets b
             JOIN matches m ON b.matchId = m.id
             LEFT JOIN teams ht ON m.homeTeamId = ht.id
             LEFT JOIN teams at ON m.awayTeamId = at.id
             JOIN users u ON b.userId = u.id
             WHERE b.userId = ?
             ORDER BY m.matchTime ASC`,
            [userId]
        );

        const bets = betsResult.rows?.map(row => ({
            id: row.id,
            userId: row.userId,
            matchId: row.matchId,
            homeScoreBet: row.homeScoreBet,
            awayScoreBet: row.awayScoreBet,
            homeTeamId: row.homeTeamId,
            awayTeamId: row.awayTeamId,
            points: row.points,
            createdAt: row.createdAt,            updatedAt: row.updatedAt,
            userName: row.userName,
            userImageUrl: row.userImageUrl,
            match: {
                id: row.matchId,
                matchTime: row.matchTime,
                matchType: row.matchType,
                group: row.group,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                homeTeam: row.homeTeamName ? {
                    id: row.homeTeamId,
                    name: row.homeTeamName,
                    flag: row.homeTeamFlag
                } : undefined,
                awayTeam: row.awayTeamName ? {
                    id: row.awayTeamId,
                    name: row.awayTeamName,
                    flag: row.awayTeamFlag
                } : undefined
            }
        })) || [];

        res.json(bets);
    } catch (error) {
        console.error('Error fetching user bets by ID:', error);
        res.status(500).json({ message: 'Failed to fetch user bets' });
    }
};

// Get public bets for a specific match (with user names and avatars but no admin restriction)
export const getPublicBetsByMatch = async (req: Request, res: Response): Promise<void> => {
    const matchId = parseInt(req.params.matchId, 10);

    if (isNaN(matchId)) {
        res.status(400).json({ message: 'Invalid matchId format' });
        return;
    }

    try {
        // Get all bets for this match with user details
        const betsResult = await DatabaseAdapter.query(
            `SELECT 
                b.id, b.userId, b.matchId, b.homeScore as homeScoreBet, b.awayScore as awayScoreBet,
                b.homeTeamId, b.awayTeamId, b.points, b.createdAt, b.updatedAt,
                u.name as userName, u.imageUrl as userImageUrl
             FROM bets b
             JOIN users u ON b.userId = u.id
             WHERE b.matchId = ?
             ORDER BY b.createdAt ASC`,
            [matchId]
        );

        const bets = betsResult.rows?.map(row => ({
            id: row.id,
            userId: row.userId,
            matchId: row.matchId,
            homeScoreBet: row.homeScoreBet,
            awayScoreBet: row.awayScoreBet,
            homeTeamId: row.homeTeamId,
            awayTeamId: row.awayTeamId,
            points: row.points,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            userName: row.userName,
            userImageUrl: row.userImageUrl
        })) || [];

        res.json(bets);
    } catch (error) {
        console.error('Error fetching public bets by match:', error);
        res.status(500).json({ message: 'Failed to fetch bets for the match' });
    }
};