import { Request, Response } from 'express';
import { pool } from '../db/database';
import { Bet, CreateBetDto, MatchType } from '../types/models';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getUserBets = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const connection = await pool.getConnection();
        
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT b.*, 
                        m.matchTime, m.matchType, m.\`group\` as matchGroup,
                        ht.name as homeTeamName, ht.flag as homeTeamFlag,
                        at.name as awayTeamName, at.flag as awayTeamFlag,
                        m.homeScore as actualHomeScore, m.awayScore as actualAwayScore
                 FROM bets b
                 JOIN matches m ON b.matchId = m.id
                 LEFT JOIN teams ht ON m.homeTeamId = ht.id
                 LEFT JOIN teams at ON m.awayTeamId = at.id
                 WHERE b.userId = ?
                 ORDER BY m.matchTime`,
                [userId]
            );
            
            const bets = rows.map(row => ({
                id: row.id,
                userId: row.userId,
                matchId: row.matchId,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                points: row.points,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                match: {
                    id: row.matchId,
                    matchTime: row.matchTime,
                    matchType: row.matchType,
                    group: row.matchGroup,
                    homeScore: row.actualHomeScore,
                    awayScore: row.actualAwayScore,
                    homeTeam: row.homeTeamName ? {
                        id: row.homeTeamId,
                        name: row.homeTeamName,
                        flag: row.homeTeamFlag
                    } : null,
                    awayTeam: row.awayTeamName ? {
                        id: row.awayTeamId,
                        name: row.awayTeamName,
                        flag: row.awayTeamFlag
                    } : null
                }
            }));
            
            res.json(bets);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching user bets:', error);
        res.status(500).json({ error: 'Failed to fetch bets' });
    }
};

export const getBetsByMatch = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const connection = await pool.getConnection();
        
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT b.*, u.name as userName
                 FROM bets b
                 JOIN users u ON b.userId = u.id
                 WHERE b.matchId = ?
                 ORDER BY b.createdAt`,
                [matchId]
            );
            
            const bets = rows.map(row => ({
                id: row.id,
                userId: row.userId,
                matchId: row.matchId,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                points: row.points,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                user: {
                    name: row.userName
                }
            }));
            
            res.json(bets);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching bets by match:', error);
        res.status(500).json({ error: 'Failed to fetch bets' });
    }
};

export const createOrUpdateBet = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { matchId, homeScore, awayScore, homeTeamId, awayTeamId }: CreateBetDto = req.body;
        
        if (!matchId) {
            return res.status(400).json({ error: 'Match ID is required' });
        }

        const connection = await pool.getConnection();
        try {
            // Check if match exists and hasn't started yet
            const [matchRows] = await connection.execute<RowDataPacket[]>(
                'SELECT matchTime, matchType FROM matches WHERE id = ?',
                [matchId]
            );
            
            if (matchRows.length === 0) {
                return res.status(404).json({ error: 'Match not found' });
            }
            
            const match = matchRows[0];
            const now = new Date();
            const matchTime = new Date(match.matchTime);
            
            if (matchTime <= now) {
                return res.status(400).json({ error: 'Cannot bet on matches that have already started' });
            }
            
            // Validate bet data based on match type
            if (match.matchType === MatchType.GROUP) {
                if (homeScore == null || awayScore == null) {
                    return res.status(400).json({ error: 'Score prediction required for group stage matches' });
                }
                if (homeScore < 0 || awayScore < 0) {
                    return res.status(400).json({ error: 'Scores cannot be negative' });
                }
            } else {
                if (!homeTeamId || !awayTeamId) {
                    return res.status(400).json({ error: 'Team predictions required for knockout matches' });
                }
            }
            
            // Check if bet already exists
            const [existingBets] = await connection.execute<RowDataPacket[]>(
                'SELECT id FROM bets WHERE userId = ? AND matchId = ?',
                [userId, matchId]
            );
            
            if (existingBets.length > 0) {
                // Update existing bet
                await connection.execute(
                    'UPDATE bets SET homeScore = ?, awayScore = ?, homeTeamId = ?, awayTeamId = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ? AND matchId = ?',
                    [homeScore || null, awayScore || null, homeTeamId || null, awayTeamId || null, userId, matchId]
                );
                
                const [updatedRows] = await connection.execute<RowDataPacket[]>(
                    'SELECT * FROM bets WHERE userId = ? AND matchId = ?',
                    [userId, matchId]
                );
                
                res.json(updatedRows[0] as Bet);
            } else {
                // Create new bet
                const [result] = await connection.execute<ResultSetHeader>(
                    'INSERT INTO bets (userId, matchId, homeScore, awayScore, homeTeamId, awayTeamId) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, matchId, homeScore || null, awayScore || null, homeTeamId || null, awayTeamId || null]
                );
                
                const [newRows] = await connection.execute<RowDataPacket[]>(
                    'SELECT * FROM bets WHERE id = ?',
                    [result.insertId]
                );
                
                res.status(201).json(newRows[0] as Bet);
            }
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating/updating bet:', error);
        res.status(500).json({ error: 'Failed to create/update bet' });
    }
};

export const deleteBet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const connection = await pool.getConnection();
        
        try {
            // Check if bet belongs to user and match hasn't started
            const [betRows] = await connection.execute<RowDataPacket[]>(
                `SELECT b.id, m.matchTime 
                 FROM bets b 
                 JOIN matches m ON b.matchId = m.id 
                 WHERE b.id = ? AND b.userId = ?`,
                [id, userId]
            );
            
            if (betRows.length === 0) {
                return res.status(404).json({ error: 'Bet not found or not authorized' });
            }
            
            const matchTime = new Date(betRows[0].matchTime);
            const now = new Date();
            
            if (matchTime <= now) {
                return res.status(400).json({ error: 'Cannot delete bet for matches that have already started' });
            }
            
            const [result] = await connection.execute<ResultSetHeader>(
                'DELETE FROM bets WHERE id = ? AND userId = ?',
                [id, userId]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Bet not found' });
            }
            
            res.status(204).send();
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting bet:', error);
        res.status(500).json({ error: 'Failed to delete bet' });
    }
};