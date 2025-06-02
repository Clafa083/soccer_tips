import fs from 'fs/promises';
import path from 'path';
import { pool } from './database';

async function runMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        
        // Filter MySQL SQL files only
        const sqlFiles = files.filter(f => f.endsWith('.sql') && !f.includes('_sqlite')).sort();
        
        console.log('Running migrations for MySQL:');
        console.log('Migration files:', sqlFiles);
        
        // MySQL migrations
        const connection = await pool.getConnection();
        
        try {
            for (const file of sqlFiles) {
                console.log(`Running MySQL migration: ${file}`);
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
                
                console.log(`Completed MySQL migration: ${file}`);
            }
        } finally {
            connection.release();
        }
        
        console.log('All migrations completed successfully');
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
