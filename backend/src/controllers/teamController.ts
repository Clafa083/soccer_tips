import { Request, Response } from 'express';
import { pool } from '../db/database';
import { mockTeams } from '../db/mockDatabase';
import { Team, CreateTeamDto } from '../types/models';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const USE_MOCK_DATA = !process.env.DB_HOST || process.env.NODE_ENV === 'development';

export const getAllTeams = async (req: Request, res: Response) => {
    try {
        console.log('Attempting to fetch teams...');
        
        if (USE_MOCK_DATA) {
            console.log('Using mock data for teams');
            console.log(`Found ${mockTeams.length} mock teams`);
            res.json(mockTeams);
            return;
        }
        
        const connection = await pool.getConnection();
        console.log('Database connection acquired');
        
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM teams ORDER BY `group`, name'
            );
            console.log(`Found ${rows.length} teams`);
            res.json(rows as Team[]);
        } finally {
            connection.release();
            console.log('Database connection released');
        }
    } catch (error) {
        console.error('Error fetching teams:', error);
        console.error('Full error details:', error);
        res.status(500).json({ 
            error: 'Failed to fetch teams',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTeamsByGroup = async (req: Request, res: Response) => {
    try {
        const { group } = req.params;
        
        if (USE_MOCK_DATA) {
            console.log(`Using mock data for teams in group ${group}`);
            const filteredTeams = mockTeams.filter(team => team.group === group);
            res.json(filteredTeams);
            return;
        }
        
        const connection = await pool.getConnection();
        
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM teams WHERE `group` = ? ORDER BY name',
                [group]
            );
            res.json(rows as Team[]);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching teams by group:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
};

export const createTeam = async (req: Request, res: Response) => {
    try {
        const { name, group, flag }: CreateTeamDto = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Team name is required' });
        }

        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute<ResultSetHeader>(
                'INSERT INTO teams (name, `group`, flag) VALUES (?, ?, ?)',
                [name, group || null, flag || null]
            );
            
            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM teams WHERE id = ?',
                [result.insertId]
            );
            
            res.status(201).json(rows[0] as Team);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating team:', error);
        if (error instanceof Error && error.message.includes('Duplicate entry')) {
            res.status(409).json({ error: 'Team already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create team' });
        }
    }
};

export const updateTeam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, group, flag }: Partial<CreateTeamDto> = req.body;
        
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'UPDATE teams SET name = COALESCE(?, name), `group` = COALESCE(?, `group`), flag = COALESCE(?, flag), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [name || null, group || null, flag || null, id]
            );
            
            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM teams WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Team not found' });
            }
            
            res.json(rows[0] as Team);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
};

export const deleteTeam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.execute<ResultSetHeader>(
                'DELETE FROM teams WHERE id = ?',
                [id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Team not found' });
            }
            
            res.status(204).send();
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
};