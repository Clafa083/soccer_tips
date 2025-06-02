import { Request, Response } from 'express';
import { devDb } from '../db/DevelopmentDatabaseAdapter';
import { Team, CreateTeamDto, UpdateTeamDto } from '../types/models';

// Helper function to transform database row to Team object
function transformRowToTeam(row: any): Team {
    return {
        id: row.id,
        name: row.name,
        flag: row.flag,
        group: row.group,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}

export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await devDb.query(
            'SELECT * FROM teams ORDER BY `group`, name',
            []
        );
        
        const teams = result.rows.map(transformRowToTeam);
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTeamsByGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { group } = req.params;
        
        if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(group)) {
            res.status(400).json({ error: 'Invalid group' });
            return;
        }
          const result = await devDb.query(
            'SELECT * FROM teams WHERE `group` = ? ORDER BY name',
            [group]
        );
        
        const teams = result.rows.map(transformRowToTeam);
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams by group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const teamData: CreateTeamDto = req.body;
        
        // Validate required fields
        if (!teamData.name) {
            res.status(400).json({ error: 'Team name is required' });
            return;
        }
        
        // Validate group if provided
        if (teamData.group && !['A', 'B', 'C', 'D', 'E', 'F'].includes(teamData.group)) {
            res.status(400).json({ error: 'Invalid group' });
            return;
        }
          const insertResult = await devDb.query(
            'INSERT INTO teams (name, `group`, flag, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [teamData.name, teamData.group || undefined, teamData.flag || undefined]
        );
          const newTeam: Team = {
            id: insertResult.metadata?.insertId || Math.floor(Math.random() * 1000000),
            name: teamData.name,
            group: teamData.group,
            flag: teamData.flag,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        res.status(201).json(newTeam);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const teamData: UpdateTeamDto = req.body;
        
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid team ID' });
            return;
        }
        
        // Validate group if provided
        if (teamData.group && !['A', 'B', 'C', 'D', 'E', 'F'].includes(teamData.group)) {
            res.status(400).json({ error: 'Invalid group' });
            return;
        }
        
        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        
        if (teamData.name !== undefined) {
            updates.push('name = ?');
            values.push(teamData.name);
        }
        
        if (teamData.group !== undefined) {
            updates.push('`group` = ?');
            values.push(teamData.group);
        }
        
        if (teamData.flag !== undefined) {
            updates.push('flag = ?');
            values.push(teamData.flag);
        }
        
        if (updates.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        
        updates.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
          const updateResult = await devDb.query(
            `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        if (!updateResult.rows || updateResult.rows.length === 0) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        
        res.json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid team ID' });
            return;
        }
          // Check if there are any matches involving this team
        const matchesResult = await devDb.query(
            'SELECT COUNT(*) as matchCount FROM matches WHERE homeTeamId = ? OR awayTeamId = ?',
            [id, id]
        );
        
        const matchCount = matchesResult.rows[0].matchCount;
        
        if (matchCount > 0) {
            res.status(400).json({ 
                error: 'Cannot delete team with existing matches',
                matchCount: matchCount
            });
            return;
        }
          const deleteResult = await devDb.query(
            'DELETE FROM teams WHERE id = ?',
            [id]
        );
        
        if (!deleteResult.rows || deleteResult.rows.length === 0) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};