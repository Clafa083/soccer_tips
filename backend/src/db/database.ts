import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('Database configuration:');
console.log('DB_TYPE: MySQL');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || '3306');
console.log('DB_NAME:', process.env.DB_NAME || 'vm_tips_db');
console.log('DB_USER:', process.env.DB_USER || 'vm_tips_user');

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'vm_tips_user',
    password: process.env.DB_PASSWORD || 'vm_tips_password',
    database: process.env.DB_NAME || 'vm_tips_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 60000,
    maxIdle: 10
});

// Test database connection
const initDatabase = async () => {
    // Skip database connection in mock mode
    if (process.env.DEV_MODE === 'mock') {
        console.log('🎭 Skipping MySQL connection - using mock data');
        return;
    }
    
    try {
        console.log('Testing MySQL connection...');
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database successfully!');
        connection.release();
    } catch (error) {
        console.error('Failed to connect to MySQL database:', error);
        throw error;
    }
};

// Initialize database connection only if not using mock data
if (process.env.DEV_MODE !== 'mock') {
    initDatabase();
}

export { pool };
