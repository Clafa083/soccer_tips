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
}
