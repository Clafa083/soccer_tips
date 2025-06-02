import { pool } from './database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
}
