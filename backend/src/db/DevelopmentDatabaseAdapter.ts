// filepath: c:\kod\soccer_tips\soccer_tips\backend\src\db\DevelopmentDatabaseAdapter.ts
import { pool } from './database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { mockTeams, mockMatches, mockUsers } from './mockDatabase';
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
