import fs from 'fs/promises';
import path from 'path';
import { pool } from './database';

async function runMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
        
        const connection = await pool.getConnection();
        
        try {
            for (const file of sqlFiles) {
                console.log(`Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = await fs.readFile(filePath, 'utf8');
                
                // Split the file into individual statements
                const statements = sql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                
                for (const statement of statements) {
                    await connection.execute(statement + ';');
                }
                
                console.log(`Completed migration: ${file}`);
            }
            
            console.log('All migrations completed successfully');
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations();
}

export { runMigrations };
