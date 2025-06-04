import { pool } from './database';
import { MatchType } from '../types/models';
import * as bcrypt from 'bcrypt';

const teams = [
    // Group A
    { name: 'Qatar', group: 'A', flag: '🇶🇦' },
    { name: 'Ecuador', group: 'A', flag: '🇪🇨' },
    { name: 'Senegal', group: 'A', flag: '🇸🇳' },
    { name: 'Netherlands', group: 'A', flag: '🇳🇱' },
    
    // Group B
    { name: 'England', group: 'B', flag: '🏴' },
    { name: 'Iran', group: 'B', flag: '🇮🇷' },
    { name: 'USA', group: 'B', flag: '🇺🇸' },
    { name: 'Wales', group: 'B', flag: '🏴' },
    
    // Group C
    { name: 'Argentina', group: 'C', flag: '🇦🇷' },
    { name: 'Saudi Arabia', group: 'C', flag: '🇸🇦' },
    { name: 'Mexico', group: 'C', flag: '🇲🇽' },
    { name: 'Poland', group: 'C', flag: '🇵🇱' },
    
    // Group D
    { name: 'France', group: 'D', flag: '🇫🇷' },
    { name: 'Australia', group: 'D', flag: '🇦🇺' },
    { name: 'Denmark', group: 'D', flag: '🇩🇰' },
    { name: 'Tunisia', group: 'D', flag: '🇹🇳' },
    
    // Group E
    { name: 'Spain', group: 'E', flag: '🇪🇸' },
    { name: 'Costa Rica', group: 'E', flag: '🇨🇷' },
    { name: 'Germany', group: 'E', flag: '🇩🇪' },
    { name: 'Japan', group: 'E', flag: '🇯🇵' },
    
    // Group F
    { name: 'Belgium', group: 'F', flag: '🇧🇪' },
    { name: 'Canada', group: 'F', flag: '🇨🇦' },
    { name: 'Morocco', group: 'F', flag: '🇲🇦' },
    { name: 'Croatia', group: 'F', flag: '🇭🇷' },
    
    // Group G
    { name: 'Brazil', group: 'G', flag: '🇧🇷' },
    { name: 'Serbia', group: 'G', flag: '🇷🇸' },
    { name: 'Switzerland', group: 'G', flag: '🇨🇭' },
    { name: 'Cameroon', group: 'G', flag: '🇨🇲' },
    
    // Group H
    { name: 'Portugal', group: 'H', flag: '🇵🇹' },
    { name: 'Ghana', group: 'H', flag: '🇬🇭' },
    { name: 'Uruguay', group: 'H', flag: '🇺🇾' },
    { name: 'South Korea', group: 'H', flag: '🇰🇷' }
];

const sampleMatches = [
    // Group A matches
    { homeTeam: 'Qatar', awayTeam: 'Ecuador', matchTime: '2025-06-15 18:00:00', matchType: MatchType.GROUP, group: 'A' },
    { homeTeam: 'Senegal', awayTeam: 'Netherlands', matchTime: '2025-06-15 21:00:00', matchType: MatchType.GROUP, group: 'A' },
    { homeTeam: 'Qatar', awayTeam: 'Senegal', matchTime: '2025-06-19 15:00:00', matchType: MatchType.GROUP, group: 'A' },
    { homeTeam: 'Netherlands', awayTeam: 'Ecuador', matchTime: '2025-06-19 18:00:00', matchType: MatchType.GROUP, group: 'A' },
    { homeTeam: 'Ecuador', awayTeam: 'Senegal', matchTime: '2025-06-23 18:00:00', matchType: MatchType.GROUP, group: 'A' },
    { homeTeam: 'Netherlands', awayTeam: 'Qatar', matchTime: '2025-06-23 18:00:00', matchType: MatchType.GROUP, group: 'A' },
      // Group B matches
    { homeTeam: 'England', awayTeam: 'Iran', matchTime: '2025-06-16 15:00:00', matchType: MatchType.GROUP, group: 'B' },
    { homeTeam: 'USA', awayTeam: 'Wales', matchTime: '2025-06-16 21:00:00', matchType: MatchType.GROUP, group: 'B' },
    { homeTeam: 'Wales', awayTeam: 'Iran', matchTime: '2025-06-20 12:00:00', matchType: MatchType.GROUP, group: 'B' },
    { homeTeam: 'England', awayTeam: 'USA', matchTime: '2025-06-20 21:00:00', matchType: MatchType.GROUP, group: 'B' },
    { homeTeam: 'Iran', awayTeam: 'USA', matchTime: '2025-06-24 21:00:00', matchType: MatchType.GROUP, group: 'B' },
    { homeTeam: 'Wales', awayTeam: 'England', matchTime: '2025-06-24 21:00:00', matchType: MatchType.GROUP, group: 'B' },
      // Some knockout matches (to be determined)
    { homeTeam: null, awayTeam: null, matchTime: '2025-06-29 18:00:00', matchType: MatchType.ROUND_OF_16, group: null },
    { homeTeam: null, awayTeam: null, matchTime: '2025-06-29 21:00:00', matchType: MatchType.ROUND_OF_16, group: null },
    { homeTeam: null, awayTeam: null, matchTime: '2025-07-04 18:00:00', matchType: MatchType.QUARTER_FINAL, group: null },
    { homeTeam: null, awayTeam: null, matchTime: '2025-07-04 21:00:00', matchType: MatchType.QUARTER_FINAL, group: null },
    { homeTeam: null, awayTeam: null, matchTime: '2025-07-09 21:00:00', matchType: MatchType.SEMI_FINAL, group: null },
    { homeTeam: null, awayTeam: null, matchTime: '2025-07-10 21:00:00', matchType: MatchType.SEMI_FINAL, group: null },
    { homeTeam: null, awayTeam: null, matchTime: '2025-07-14 18:00:00', matchType: MatchType.FINAL, group: null }
];

async function seedDatabase() {
    const connection = await pool.getConnection();
    
    try {
        console.log('Starting database seeding...');
        
        // Clear existing data
        await connection.execute('DELETE FROM bets');
        await connection.execute('DELETE FROM matches');
        await connection.execute('DELETE FROM teams');
        
        console.log('Cleared existing data');
        
        // Insert teams
        const teamInsertPromises = teams.map(team => 
            connection.execute(
                'INSERT INTO teams (name, `group`, flag) VALUES (?, ?, ?)',
                [team.name, team.group, team.flag]
            )
        );
        
        await Promise.all(teamInsertPromises);
        console.log(`Inserted ${teams.length} teams`);
        
        // Get team IDs for matches
        const [teamRows] = await connection.execute('SELECT id, name FROM teams');
        const teamMap = new Map();
        (teamRows as any[]).forEach(row => {
            teamMap.set(row.name, row.id);
        });
        
        // Insert matches
        for (const match of sampleMatches) {
            const homeTeamId = match.homeTeam ? teamMap.get(match.homeTeam) : null;
            const awayTeamId = match.awayTeam ? teamMap.get(match.awayTeam) : null;
            
            await connection.execute(
                'INSERT INTO matches (homeTeamId, awayTeamId, matchTime, matchType, `group`) VALUES (?, ?, ?, ?, ?)',
                [homeTeamId, awayTeamId, match.matchTime, match.matchType, match.group]
            );
        }
        
        console.log(`Inserted ${sampleMatches.length} matches`);
        
        // Create an admin user if it doesn't exist
        console.log('Checking for existing admin user...');
        const [existingAdmins] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            ['admin@vm-tips.se']
        );
        
        console.log('Existing admins:', existingAdmins);
        
        if ((existingAdmins as any[]).length === 0) {
            console.log('Creating admin user...');
            // Hash a simple password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(
                'INSERT INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)',
                ['admin@vm-tips.se', 'Admin', hashedPassword, true]
            );
            
            console.log('Created admin user: admin@vm-tips.se / admin123');
        } else {
            console.log('Admin user already exists');
        }
        
        // Insert test users
        //await connection.execute(
        //    'INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        //    [1, 'admin@vm-tips.se', 'Admin User', '$2b$10$Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9QeQ9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9', 1]
        //);
        //await connection.execute(
        //    'INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        //    [2, 'test@vm-tips.se', 'Test User', '$2b$10$Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9QeQ9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9', 0]
       // );

        // Insert test bets for user1 on first two matches
        //const [matches] = await connection.execute('SELECT id FROM matches ORDER BY id ASC LIMIT 2');
        //const matchRows = Array.isArray(matches) ? matches as any[] : [];
        //if (matchRows.length >= 2) {
        //    await connection.execute(
       //         'INSERT INTO bets (userId, matchId, homeScoreBet, awayScoreBet, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        //        [2, matchRows[0].id, 2, 1]
        //    );
        //    await connection.execute(
        //        'INSERT INTO bets (userId, matchId, homeScoreBet, awayScoreBet, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        //        [2, matchRows[1].id, 1, 1]
        //    );
        //}
        
        // Insert default settings
        await connection.execute(
            "INSERT INTO settings (name, value) VALUES ('betsLocked', 'false') ON DUPLICATE KEY UPDATE value = value;"
        );
        console.log('Inserted default betsLocked setting');
        
        console.log('Database seeding completed successfully!');
        
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { seedDatabase };