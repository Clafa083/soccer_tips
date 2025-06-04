// filepath: c:\kod\soccer_tips\soccer_tips\backend\src\db\DevelopmentDatabaseAdapter.ts
import { pool } from './database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { mockTeams, mockMatches, mockUsers, mockBets } from './mockDatabase'; // Added mockBets
import { Team, Match, User, Bet } from '../types/models';
import * as dotenv from 'dotenv';

// Database result interface
interface DatabaseResult {
    insertId?: number;
    affectedRows?: number;
    rows: any[];
}

// Load environment variables
dotenv.config();

export class DevelopmentDatabaseAdapter {
    private useMockData: boolean;

    constructor() {
        this.useMockData = process.env.DEV_MODE === 'mock';
        
        console.log('Environment check:');
        console.log('DEV_MODE:', process.env.DEV_MODE);
        console.log('NODE_ENV:', process.env.NODE_ENV);
        
        if (this.useMockData) {
            console.log('🎭 Using mock database for development');
        } else {
            console.log('🗄️ Using real MySQL database');
        }
    }    async query(sql: string, params?: any[]): Promise<{ rows: any[]; metadata?: any }> {
        if (!this.useMockData) {
            // Direct MySQL query implementation
            const connection = await pool.getConnection();
            
            try {
                const [result] = await connection.execute(sql, params || []);
                
                if (Array.isArray(result)) {
                    // SELECT query
                    return { rows: result as RowDataPacket[] };
                } else {
                    // INSERT, UPDATE, DELETE query
                    const header = result as ResultSetHeader;
                    return {
                        rows: [],
                        metadata: {
                            insertId: header.insertId,
                            affectedRows: header.affectedRows
                        }
                    };
                }
            } finally {
                connection.release();
            }
        }

        // Mock implementation for common queries
        console.log(`🎭 Mock query: ${sql}`);
        
        if (sql.includes('SELECT * FROM teams')) {
            return { rows: mockTeams };
        }
        
        if (sql.includes('SELECT * FROM matches')) {
            return { rows: mockMatches };
        }
        
        if (sql.includes('SELECT * FROM users')) {
            return { rows: mockUsers };
        }

        if (sql.toLowerCase().startsWith('select * from bets where userid')) { // Adjusted to be more specific
            if (params && params.length > 0) {
                const userId = params[0];
                const userBets = mockBets.filter(bet => bet.userId === userId);
                return { rows: userBets };
            }
            return { rows: [] };
        }

        if (sql.toLowerCase().startsWith('select * from bets where matchid')) { // Added for getBetsByMatch
            if (params && params.length > 0) {
                const matchId = params[0];
                const matchBets = mockBets.filter(bet => bet.matchId === matchId);
                return { rows: matchBets };
            }
            return { rows: [] };
        }
        
        if (sql.includes('INSERT INTO teams')) {
            // Mock team creation
            const newId = Math.max(...mockTeams.map(t => t.id)) + 1;
            const mockTeam = {
                id: newId,
                name: 'New Team',
                group: 'A',
                flag: '🏳️',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockTeams.push(mockTeam);
            return { rows: [mockTeam] };
        }
        
        if (sql.includes('UPDATE teams')) {
            // Mock team update
            return { rows: [{ affectedRows: 1 }] };
        }
        
        if (sql.includes('DELETE FROM teams')) {
            // Mock team deletion
            return { rows: [{ affectedRows: 1 }] };
        }
          // Default mock response
        return { rows: [] };
    }

    async getUserBets(userId: number): Promise<Bet[]> {
        if (this.useMockData) {
            console.log(`🎭 Mock: Fetching bets for userId: ${userId}`);
            return mockBets.filter(bet => bet.userId === userId);
        } else {
            console.log(`🗄️ DB: Fetching bets for userId: ${userId}`);
            const sql = 'SELECT * FROM Bets WHERE userId = ?';
            const { rows } = await this.query(sql, [userId]);
            
            // Mappa DB-fältnamn till frontend-fältnamn
            return rows.map(bet => ({
                ...bet,
                homeScoreBet: bet.homeScore,
                awayScoreBet: bet.awayScore
            })) as Bet[];
        }
    }

    async getBetsByMatch(matchId: number): Promise<Bet[]> {
        if (this.useMockData) {
            console.log(`🎭 Mock: Fetching bets for matchId: ${matchId}`);
            return mockBets.filter(bet => bet.matchId === matchId);        } else {
            console.log(`🗄️ DB: Fetching bets for matchId: ${matchId}`);
            const sql = 'SELECT * FROM Bets WHERE matchId = ?';
            const { rows } = await this.query(sql, [matchId]);
            
            // Mappa DB-fältnamn till frontend-fältnamn
            return rows.map(bet => ({
                ...bet,
                homeScoreBet: bet.homeScore,
                awayScoreBet: bet.awayScore
            })) as Bet[];
        }
    }

    async createOrUpdateBet({ userId, matchId, homeScoreBet, awayScoreBet, homeTeamId, awayTeamId }: {
        userId: number, 
        matchId: number, 
        homeScoreBet?: number, 
        awayScoreBet?: number,
        homeTeamId?: number,
        awayTeamId?: number 
    }): Promise<Bet> {        if (this.useMockData) {
            // Mock: hitta och uppdatera eller skapa nytt bet
            let bet = mockBets.find(b => b.userId === userId && b.matchId === matchId);
            
            if (bet) {
                bet.homeScoreBet = homeScoreBet;
                bet.awayScoreBet = awayScoreBet;
                bet.homeTeamId = homeTeamId;
                bet.awayTeamId = awayTeamId;
                bet.updatedAt = new Date();
            } else {
                bet = {
                    id: mockBets.length + 1,
                    userId,
                    matchId,
                    homeScoreBet,
                    awayScoreBet,
                    homeTeamId,
                    awayTeamId,
                    points: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                mockBets.push(bet);
            }            return bet;
        } else {
            // Riktig databas: försök uppdatera, annars skapa nytt
            const selectSql = 'SELECT * FROM bets WHERE userId = ? AND matchId = ?';
            const { rows } = await this.query(selectSql, [userId, matchId]);
            
            if (rows.length > 0) {
                // Uppdatera
                const updateSql = 'UPDATE bets SET homeScore = ?, awayScore = ?, homeTeamId = ?, awayTeamId = ?, updatedAt = NOW() WHERE userId = ? AND matchId = ?';
                await this.query(updateSql, [
                    homeScoreBet ?? null, 
                    awayScoreBet ?? null, 
                    homeTeamId ?? null, 
                    awayTeamId ?? null, 
                    userId, 
                    matchId
                ]);
                
                // Returnera objektet med både databasens och frontendets namngivning
                const updatedBet = { 
                    ...rows[0], 
                    homeScore: homeScoreBet,  // Databasens kolumnnamn
                    awayScore: awayScoreBet,  // Databasens kolumnnamn
                    homeScoreBet: homeScoreBet, // Frontends namngivning
                    awayScoreBet: awayScoreBet, // Frontends namngivning
                    updatedAt: new Date() 
                };
                
                return updatedBet;
            } else {                // Skapa nytt
                const insertSql = 'INSERT INTO bets (userId, matchId, homeScore, awayScore, homeTeamId, awayTeamId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
                const result = await this.query(insertSql, [
                    userId,
                    matchId, 
                    homeScoreBet ?? null, 
                    awayScoreBet ?? null, 
                    homeTeamId ?? null, 
                    awayTeamId ?? null
                ]);
                
                // Returnera objektet med både databasens och frontendets namngivning
                return {
                    id: result.metadata?.insertId || 0,
                    userId,
                    matchId,
                    homeScore: homeScoreBet,  // Databasens kolumnnamn
                    awayScore: awayScoreBet,  // Databasens kolumnnamn
                    homeScoreBet: homeScoreBet, // Frontends namngivning
                    awayScoreBet: awayScoreBet, // Frontends namngivning
                    points: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }
        }
    }

    async deleteBet(userId: number, matchId: number): Promise<boolean> {
        if (this.useMockData) {
            const index = mockBets.findIndex(b => b.userId === userId && b.matchId === matchId);
            if (index !== -1) {
                mockBets.splice(index, 1);
                return true;
            }
            return false;
        } else {
            const sql = 'DELETE FROM bets WHERE userId = ? AND matchId = ?';
            const { metadata } = await this.query(sql, [userId, matchId]);
            return (metadata?.affectedRows || 0) > 0;
        }
    }    // Get the value of a setting
    async getSetting(name: string): Promise<string | null> {
        console.log('🔧 getSetting called with name:', name);
        if (!this.useMockData) {
            const [rows] = await pool.execute('SELECT value FROM settings WHERE name = ?', [name]);
            if (Array.isArray(rows) && rows.length > 0) {
                const row = rows[0] as { value: string };
                return row.value;
            }
            return null;
        } else {
            // For mock mode, just return 'false' for betsLocked
            if (name === 'betsLocked') return 'false';
            return null;
        }
    }

    // Set the value of a setting
    async setSetting(name: string, value: string): Promise<void> {
        if (!this.useMockData) {
            await pool.execute(
                'INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
                [name, value]
            );
        } else {
            // No-op for mock mode
        }
    }

    async switchToRealDatabase() {
        this.useMockData = false;
        console.log('🗄️ Switched to real MySQL database');
    }

    async switchToMockDatabase() {
        this.useMockData = true;
        console.log('🎭 Switched to mock database');
    }

    isUsingMockData(): boolean {
        return this.useMockData;
    }
}

// Export singleton instance
export const devDb = new DevelopmentDatabaseAdapter();
