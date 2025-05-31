import { Request, Response } from 'express';
import { pool } from '../db/database';
import { mockMatches } from '../db/mockDatabase';
import { Match, CreateMatchDto, UpdateMatchResultDto, MatchType } from '../types/models';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const USE_MOCK_DATA = !process.env.DB_HOST || process.env.NODE_ENV === 'development';

export const getAllMatches = async (req: Request, res: Response) => {
    try {
        if (USE_MOCK_DATA) {
            console.log('Using mock data for matches');
            res.json(mockMatches);
            return;
        }
        
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT m.*, 
                        ht.name as homeTeamName, ht.flag as homeTeamFlag,
                        at.name as awayTeamName, at.flag as awayTeamFlag
                 FROM matches m
                 LEFT JOIN teams ht ON m.homeTeamId = ht.id
                 LEFT JOIN teams at ON m.awayTeamId = at.id
                 ORDER BY m.matchTime`
            );
            
            const matches = rows.map(row => ({
                id: row.id,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                matchTime: row.matchTime,
                matchType: row.matchType,
                group: row.group,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                homeTeam: row.homeTeamId ? {
                    id: row.homeTeamId,
                    name: row.homeTeamName,
                    flag: row.homeTeamFlag,
                    group: row.group
                } : null,
                awayTeam: row.awayTeamId ? {
                    id: row.awayTeamId,
                    name: row.awayTeamName,
                    flag: row.awayTeamFlag,
                    group: row.group
                } : null
            }));
            
            res.json(matches);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

export const getMatchesByType = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        
        if (!Object.values(MatchType).includes(type as MatchType)) {
            return res.status(400).json({ error: 'Invalid match type' });
        }
        
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT m.*, 
                        ht.name as homeTeamName, ht.flag as homeTeamFlag,
                        at.name as awayTeamName, at.flag as awayTeamFlag
                 FROM matches m
                 LEFT JOIN teams ht ON m.homeTeamId = ht.id
                 LEFT JOIN teams at ON m.awayTeamId = at.id
                 WHERE m.matchType = ?
                 ORDER BY m.matchTime`,
                [type]
            );
            
            const matches = rows.map(row => ({
                id: row.id,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                matchTime: row.matchTime,
                matchType: row.matchType,
                group: row.group,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                homeTeam: row.homeTeamId ? {
                    id: row.homeTeamId,
                    name: row.homeTeamName,
                    flag: row.homeTeamFlag,
                    group: row.group
                } : null,
                awayTeam: row.awayTeamId ? {
                    id: row.awayTeamId,
                    name: row.awayTeamName,
                    flag: row.awayTeamFlag,
                    group: row.group
                } : null
            }));
            
            res.json(matches);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching matches by type:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

export const getMatchesByGroup = async (req: Request, res: Response) => {
    try {
        const { group } = req.params;
        const connection = await pool.getConnection();
        
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT m.*, 
                        ht.name as homeTeamName, ht.flag as homeTeamFlag,
                        at.name as awayTeamName, at.flag as awayTeamFlag
                 FROM matches m
                 LEFT JOIN teams ht ON m.homeTeamId = ht.id
                 LEFT JOIN teams at ON m.awayTeamId = at.id
                 WHERE m.\`group\` = ?
                 ORDER BY m.matchTime`,
                [group]
            );
            
            const matches = rows.map(row => ({
                id: row.id,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                matchTime: row.matchTime,
                matchType: row.matchType,
                group: row.group,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                homeTeam: row.homeTeamId ? {
                    id: row.homeTeamId,
                    name: row.homeTeamName,
                    flag: row.homeTeamFlag,
                    group: row.group
                } : null,
                awayTeam: row.awayTeamId ? {
                    id: row.awayTeamId,
                    name: row.awayTeamName,
                    flag: row.awayTeamFlag,
                    group: row.group
                } : null
            }));
            
            res.json(matches);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching matches by group:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

export const createMatch = async (req: Request, res: Response) => {
    try {
        const { homeTeamId, awayTeamId, matchTime, matchType, group }: CreateMatchDto = req.body;
        
        if (!matchTime || !matchType) {
            return res.status(400).json({ error: 'Match time and type are required' });
        }
        
        if (!Object.values(MatchType).includes(matchType)) {
            return res.status(400).json({ error: 'Invalid match type' });
        }

        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute<ResultSetHeader>(
                'INSERT INTO matches (homeTeamId, awayTeamId, matchTime, matchType, `group`) VALUES (?, ?, ?, ?, ?)',
                [homeTeamId || null, awayTeamId || null, matchTime, matchType, group || null]
            );
            
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT m.*, 
                        ht.name as homeTeamName, ht.flag as homeTeamFlag,
                        at.name as awayTeamName, at.flag as awayTeamFlag
                 FROM matches m
                 LEFT JOIN teams ht ON m.homeTeamId = ht.id
                 LEFT JOIN teams at ON m.awayTeamId = at.id
                 WHERE m.id = ?`,
                [result.insertId]
            );
            
            const row = rows[0];
            const match = {
                id: row.id,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                matchTime: row.matchTime,
                matchType: row.matchType,
                group: row.group,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                homeTeam: row.homeTeamId ? {
                    id: row.homeTeamId,
                    name: row.homeTeamName,
                    flag: row.homeTeamFlag,
                    group: row.group
                } : null,
                awayTeam: row.awayTeamId ? {
                    id: row.awayTeamId,
                    name: row.awayTeamName,
                    flag: row.awayTeamFlag,
                    group: row.group
                } : null
            };
            
            res.status(201).json(match);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};

export const updateMatchResult = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { homeScore, awayScore }: UpdateMatchResultDto = req.body;
        
        if (homeScore == null || awayScore == null) {
            return res.status(400).json({ error: 'Both home and away scores are required' });
        }
        
        if (homeScore < 0 || awayScore < 0) {
            return res.status(400).json({ error: 'Scores cannot be negative' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'UPDATE matches SET homeScore = ?, awayScore = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [homeScore, awayScore, id]
            );
            
            const [rows] = await connection.execute<RowDataPacket[]>(
                `SELECT m.*, 
                        ht.name as homeTeamName, ht.flag as homeTeamFlag,
                        at.name as awayTeamName, at.flag as awayTeamFlag
                 FROM matches m
                 LEFT JOIN teams ht ON m.homeTeamId = ht.id
                 LEFT JOIN teams at ON m.awayTeamId = at.id
                 WHERE m.id = ?`,
                [id]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Match not found' });
            }
            
            const row = rows[0];
            const match = {
                id: row.id,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                matchTime: row.matchTime,
                matchType: row.matchType,
                group: row.group,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                homeTeam: row.homeTeamId ? {
                    id: row.homeTeamId,
                    name: row.homeTeamName,
                    flag: row.homeTeamFlag,
                    group: row.group
                } : null,
                awayTeam: row.awayTeamId ? {
                    id: row.awayTeamId,
                    name: row.awayTeamName,
                    flag: row.awayTeamFlag,
                    group: row.group
                } : null
            };
            
            res.json(match);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating match result:', error);
        res.status(500).json({ error: 'Failed to update match result' });
    }
};

export const deleteMatch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.execute<ResultSetHeader>(
                'DELETE FROM matches WHERE id = ?',
                [id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Match not found' });
            }
            
            res.status(204).send();
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ error: 'Failed to delete match' });
    }
};