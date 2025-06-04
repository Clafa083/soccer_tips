import { pool } from './database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Bet } from '../types/models';

export interface DatabaseResult {
    insertId?: number;
    affectedRows?: number;
    rows: any[];
}

export class DatabaseAdapter {
    static async query(sql: string, params: any[] = []): Promise<DatabaseResult> {
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.execute(sql, params);
            
            if (Array.isArray(result)) {
                // SELECT query
                return { rows: result as RowDataPacket[] };
            } else {
                // INSERT, UPDATE, DELETE query
                const header = result as ResultSetHeader;
                return {
                    insertId: header.insertId,
                    affectedRows: header.affectedRows,
                    rows: []
                };
            }
        } finally {
            connection.release();
        }
    }

    static async getConnection() {
        return await pool.getConnection();
    }

    // Get the value of a setting
    static async getSetting(name: string): Promise<string | null> {
        const [rows] = await pool.execute('SELECT value FROM settings WHERE name = ?', [name]);
        if (Array.isArray(rows) && rows.length > 0) {
            // MySQL2 returns RowDataPacket[] for SELECT
            const row = rows[0] as { value: string };
            return row.value;
        }
        return null;
    }

    // Set the value of a setting
    static async setSetting(name: string, value: string): Promise<void> {
        await pool.execute(
            'INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
            [name, value]
        );
    }

    // Get user bets
    static async getUserBets(userId: number): Promise<Bet[]> {
        const sql = 'SELECT * FROM bets WHERE userId = ?';
        const { rows } = await this.query(sql, [userId]);
        
        // Map DB field names to frontend field names
        return rows.map(bet => ({
            ...bet,
            homeScoreBet: bet.homeScore,
            awayScoreBet: bet.awayScore
        })) as Bet[];
    }

    // Get bets for a specific match
    static async getBetsByMatch(matchId: number): Promise<Bet[]> {
        const sql = 'SELECT * FROM bets WHERE matchId = ?';
        const { rows } = await this.query(sql, [matchId]);
        
        // Map DB field names to frontend field names
        return rows.map(bet => ({
            ...bet,
            homeScoreBet: bet.homeScore,
            awayScoreBet: bet.awayScore
        })) as Bet[];
    }

    // Create or update a bet
    static async createOrUpdateBet({ userId, matchId, homeScoreBet, awayScoreBet, homeTeamId, awayTeamId }: {
        userId: number, 
        matchId: number, 
        homeScoreBet?: number, 
        awayScoreBet?: number,
        homeTeamId?: number,
        awayTeamId?: number 
    }): Promise<Bet> {
        // Try to find existing bet
        const selectSql = 'SELECT * FROM bets WHERE userId = ? AND matchId = ?';
        const { rows } = await this.query(selectSql, [userId, matchId]);
        
        if (rows.length > 0) {
            // Update existing bet
            const updateSql = 'UPDATE bets SET homeScore = ?, awayScore = ?, homeTeamId = ?, awayTeamId = ?, updatedAt = NOW() WHERE userId = ? AND matchId = ?';
            await this.query(updateSql, [
                homeScoreBet ?? null, 
                awayScoreBet ?? null, 
                homeTeamId ?? null, 
                awayTeamId ?? null, 
                userId, 
                matchId
            ]);
            
            // Return the updated bet object
            const updatedBet = { 
                ...rows[0], 
                homeScore: homeScoreBet,
                awayScore: awayScoreBet,
                homeScoreBet: homeScoreBet,
                awayScoreBet: awayScoreBet,
                updatedAt: new Date() 
            };
            
            return updatedBet;
        } else {
            // Create new bet
            const insertSql = 'INSERT INTO bets (userId, matchId, homeScore, awayScore, homeTeamId, awayTeamId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
            const result = await this.query(insertSql, [
                userId,
                matchId, 
                homeScoreBet ?? null, 
                awayScoreBet ?? null, 
                homeTeamId ?? null, 
                awayTeamId ?? null
            ]);
            
            // Return the new bet object
            return {
                id: result.insertId || 0,
                userId,
                matchId,
                homeScore: homeScoreBet,
                awayScore: awayScoreBet,
                homeScoreBet: homeScoreBet,
                awayScoreBet: awayScoreBet,
                points: undefined,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
    }

    // Delete a bet
    static async deleteBet(userId: number, matchId: number): Promise<boolean> {
        const sql = 'DELETE FROM bets WHERE userId = ? AND matchId = ?';
        const { affectedRows } = await this.query(sql, [userId, matchId]);
        return (affectedRows || 0) > 0;
    }
}
