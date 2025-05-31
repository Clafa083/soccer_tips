import { pool } from './database';
import bcrypt from 'bcrypt';

async function addTestData() {
    const connection = await pool.getConnection();
    
    try {
        console.log('Adding test user and bets...');
        
        // Create a test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const [userResult] = await connection.execute(
            'INSERT IGNORE INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)',
            ['test@vm-tips.se', 'Test Användare', hashedPassword, false]
        );
        
        // Get the test user ID
        const [userRows] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            ['test@vm-tips.se']
        );
        
        if ((userRows as any[]).length === 0) {
            console.log('Could not create or find test user');
            return;
        }
        
        const userId = (userRows as any[])[0].id;
        console.log(`Test user ID: ${userId}`);
        
        // Get first few matches
        const [matches] = await connection.execute(
            'SELECT id FROM matches ORDER BY matchTime LIMIT 4'
        );
        
        // Add some test bets
        const testBets = [
            { homeScore: 1, awayScore: 2, matchIndex: 0 }, // Close to actual 0-2 (should get 1 point)
            { homeScore: 0, awayScore: 2, matchIndex: 1 }, // Exact match 0-2 (should get 3 points)
            { homeScore: 5, awayScore: 1, matchIndex: 2 }, // Close to actual 6-2 (should get 1 point)
            { homeScore: 1, awayScore: 1, matchIndex: 3 }, // Exact match 1-1 (should get 3 points)
        ];
        
        for (let i = 0; i < testBets.length && i < (matches as any[]).length; i++) {
            const bet = testBets[i];
            const matchId = (matches as any[])[i].id;
            
            await connection.execute(
                'INSERT IGNORE INTO bets (userId, matchId, homeScore, awayScore) VALUES (?, ?, ?, ?)',
                [userId, matchId, bet.homeScore, bet.awayScore]
            );
            
            console.log(`Added bet for match ${matchId}: ${bet.homeScore}-${bet.awayScore}`);
        }
        
        console.log('Test data added successfully!');
        console.log('Test user credentials: test@vm-tips.se / test123');
        
    } catch (error) {
        console.error('Error adding test data:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    addTestData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { addTestData };