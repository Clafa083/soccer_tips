import { Request, Response } from 'express';
import { devDb } from '../db/DevelopmentDatabaseAdapter';
import { Match, CreateMatchDto, UpdateMatchDto, UpdateMatchResultDto, MatchType } from '../types/models';

// Helper function to convert ISO datetime to MySQL format
function formatDateTimeForMySQL(dateTime: string | Date): string {
    const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper function to transform database row to Match object
function transformRowToMatch(row: any): Match {
    return {
        id: row.id,
        homeTeamId: row.homeTeamId,
        awayTeamId: row.awayTeamId,
        matchTime: row.matchTime,
        matchType: row.matchType as MatchType,
        group: row.group,
        homeScore: row.homeScore,
        awayScore: row.awayScore,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        homeTeam: row.homeTeamName ? {
            id: row.homeTeamId,
            name: row.homeTeamName,
            flag: row.homeTeamFlag,
            group: row.homeTeamGroup,
            createdAt: new Date(),
            updatedAt: new Date()
        } : undefined,
        awayTeam: row.awayTeamName ? {
            id: row.awayTeamId,
            name: row.awayTeamName,
            flag: row.awayTeamFlag,
            group: row.awayTeamGroup,
            createdAt: new Date(),
            updatedAt: new Date()
        } : undefined
    };
}

export const getAllMatches = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await devDb.query(
            `SELECT m.*, 
                    ht.name as homeTeamName, ht.flag as homeTeamFlag, ht.\`group\` as homeTeamGroup,
                    at.name as awayTeamName, at.flag as awayTeamFlag, at.\`group\` as awayTeamGroup
             FROM matches m
             LEFT JOIN teams ht ON m.homeTeamId = ht.id
             LEFT JOIN teams at ON m.awayTeamId = at.id
             ORDER BY m.matchTime`,
            []
        );
        
        if (!result.rows) {
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        
        const matches = result.rows.map(transformRowToMatch);
        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMatchesByType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type } = req.params;
        
        if (!['group', 'round_of_16', 'quarter_final', 'semi_final', 'final'].includes(type)) {
            res.status(400).json({ error: 'Invalid match type' });
            return;
        }
          const result = await devDb.query(
            `SELECT m.*, 
                    ht.name as homeTeamName, ht.flag as homeTeamFlag, ht.\`group\` as homeTeamGroup,
                    at.name as awayTeamName, at.flag as awayTeamFlag, at.\`group\` as awayTeamGroup
             FROM matches m
             LEFT JOIN teams ht ON m.homeTeamId = ht.id
             LEFT JOIN teams at ON m.awayTeamId = at.id
             WHERE m.matchType = ?
             ORDER BY m.matchTime`,
            [type]
        );
        
        if (!result.rows) {
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        
        const matches = result.rows.map(transformRowToMatch);
        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches by type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMatchesByGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { group } = req.params;
        
        if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(group)) {
            res.status(400).json({ error: 'Invalid group' });
            return;
        }
          const result = await devDb.query(
            `SELECT m.*, 
                    ht.name as homeTeamName, ht.flag as homeTeamFlag, ht.\`group\` as homeTeamGroup,
                    at.name as awayTeamName, at.flag as awayTeamFlag, at.\`group\` as awayTeamGroup
             FROM matches m
             LEFT JOIN teams ht ON m.homeTeamId = ht.id
             LEFT JOIN teams at ON m.awayTeamId = at.id
             WHERE m.\`group\` = ? AND m.matchType = 'group'
             ORDER BY m.matchTime`,
            [group]
        );
        
        if (!result.rows) {
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        
        const matches = result.rows.map(transformRowToMatch);
        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches by group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createMatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const matchData: CreateMatchDto = req.body;
        
        // Validate required fields
        if (!matchData.homeTeamId || !matchData.awayTeamId || !matchData.matchTime || !matchData.matchType) {
            res.status(400).json({ error: 'Home team, away team, match time, and match type are required' });
            return;
        }
        
        // Validate match type
        if (!['group', 'round_of_16', 'quarter_final', 'semi_final', 'final'].includes(matchData.matchType)) {
            res.status(400).json({ error: 'Invalid match type' });
            return;
        }
          // Validate that teams exist
        const teamsResult = await devDb.query(
            'SELECT id FROM teams WHERE id IN (?, ?)',
            [matchData.homeTeamId, matchData.awayTeamId]
        );
        
        if (!teamsResult.rows || teamsResult.rows.length !== 2) {
            res.status(400).json({ error: 'One or both teams do not exist' });
            return;
        }
        
        // Validate that teams are different
        if (matchData.homeTeamId === matchData.awayTeamId) {
            res.status(400).json({ error: 'Home team and away team must be different' });
            return;
        }
          const insertResult = await devDb.query(
            'INSERT INTO matches (homeTeamId, awayTeamId, matchTime, matchType, `group`, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [matchData.homeTeamId, matchData.awayTeamId, formatDateTimeForMySQL(matchData.matchTime), matchData.matchType, matchData.group || undefined]
        );
          const newMatch: Match = {
            id: insertResult.metadata?.insertId || Math.floor(Math.random() * 1000000),
            homeTeamId: matchData.homeTeamId,
            awayTeamId: matchData.awayTeamId,
            matchTime: matchData.matchTime,
            matchType: matchData.matchType as MatchType,
            group: matchData.group,
            homeScore: undefined,
            awayScore: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        res.status(201).json(newMatch);
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateMatchResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const resultData: UpdateMatchResultDto = req.body;
        
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid match ID' });
            return;
        }
        
        // Validate input
        if (resultData.homeScore === undefined || resultData.awayScore === undefined) {
            res.status(400).json({ error: 'Home score and away score are required' });
            return;
        }
        
        if (resultData.homeScore < 0 || resultData.awayScore < 0) {
            res.status(400).json({ error: 'Scores cannot be negative' });
            return;
        }
          // Check if match exists
        const matchResult = await devDb.query(
            'SELECT id FROM matches WHERE id = ?',
            [id]
        );
        
        if (!matchResult.rows || matchResult.rows.length === 0) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }
        
        const updateResult = await devDb.query(
            'UPDATE matches SET homeScore = ?, awayScore = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [resultData.homeScore, resultData.awayScore, id]
        );
        
        if (updateResult.metadata?.affectedRows === 0) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }
        
        res.json({ message: 'Match result updated successfully' });
    } catch (error) {
        console.error('Error updating match result:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateMatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const matchData: UpdateMatchDto = req.body;
        
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid match ID' });
            return;
        }
        
        // Check if match exists
        const matchResult = await devDb.query(
            'SELECT id FROM matches WHERE id = ?',
            [id]
        );
        
        if (!matchResult.rows || matchResult.rows.length === 0) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }
        
        // Validate teams if provided
        if (matchData.homeTeamId && matchData.awayTeamId) {
            if (matchData.homeTeamId === matchData.awayTeamId) {
                res.status(400).json({ error: 'Home team and away team must be different' });
                return;
            }
            
            const teamsResult = await devDb.query(
                'SELECT id FROM teams WHERE id IN (?, ?)',
                [matchData.homeTeamId, matchData.awayTeamId]
            );
            
            if (!teamsResult.rows || teamsResult.rows.length !== 2) {
                res.status(400).json({ error: 'One or both teams do not exist' });
                return;
            }
        }
        
        // Validate match type if provided
        if (matchData.matchType && !['group', 'round_of_16', 'quarter_final', 'semi_final', 'final'].includes(matchData.matchType)) {
            res.status(400).json({ error: 'Invalid match type' });
            return;
        }
        
        // Build dynamic update query
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        
        if (matchData.homeTeamId !== undefined) {
            updateFields.push('homeTeamId = ?');
            updateValues.push(matchData.homeTeamId);
        }
        
        if (matchData.awayTeamId !== undefined) {
            updateFields.push('awayTeamId = ?');
            updateValues.push(matchData.awayTeamId);
        }
          if (matchData.matchTime !== undefined) {
            updateFields.push('matchTime = ?');
            updateValues.push(formatDateTimeForMySQL(matchData.matchTime));
        }
        
        if (matchData.matchType !== undefined) {
            updateFields.push('matchType = ?');
            updateValues.push(matchData.matchType);
        }
        
        if (matchData.group !== undefined) {
            updateFields.push('`group` = ?');
            updateValues.push(matchData.group);
        }
        
        if (updateFields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        
        updateFields.push('updatedAt = CURRENT_TIMESTAMP');
        updateValues.push(id);
        
        const updateQuery = `UPDATE matches SET ${updateFields.join(', ')} WHERE id = ?`;
        
        const updateResult = await devDb.query(updateQuery, updateValues);
        
        if (updateResult.metadata?.affectedRows === 0) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }
        
        // Fetch and return the updated match
        const updatedMatchResult = await devDb.query(
            `SELECT m.*, 
                    ht.name as homeTeamName, ht.flag as homeTeamFlag, ht.\`group\` as homeTeamGroup,
                    at.name as awayTeamName, at.flag as awayTeamFlag, at.\`group\` as awayTeamGroup
             FROM matches m
             LEFT JOIN teams ht ON m.homeTeamId = ht.id
             LEFT JOIN teams at ON m.awayTeamId = at.id
             WHERE m.id = ?`,
            [id]
        );
        
        if (!updatedMatchResult.rows || updatedMatchResult.rows.length === 0) {
            res.status(404).json({ error: 'Updated match not found' });
            return;
        }
        
        const updatedMatch = transformRowToMatch(updatedMatchResult.rows[0]);
        res.json(updatedMatch);
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteMatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid match ID' });
            return;
        }
          // Check if there are any bets on this match
        const betsResult = await devDb.query(
            'SELECT COUNT(*) as betCount FROM bets WHERE matchId = ?',
            [id]
        );
        
        if (!betsResult.rows) {
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        
        const betCount = betsResult.rows[0].betCount;
        
        if (betCount > 0) {
            res.status(400).json({ 
                error: 'Cannot delete match with existing bets',
                betCount: betCount
            });
            return;
        }
        
        const deleteResult = await devDb.query(
            'DELETE FROM matches WHERE id = ?',
            [id]
        );
        
        if (deleteResult.metadata?.affectedRows === 0) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};