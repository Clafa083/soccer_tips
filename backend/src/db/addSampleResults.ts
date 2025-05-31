import { pool } from './database';

async function addSampleResults() {
    const connection = await pool.getConnection();
    
    try {
        console.log('Adding sample match results...');
        
        // Add results to first few matches to test scoring
        const sampleResults = [
            { homeScore: 0, awayScore: 2, matchIndex: 1 }, // Qatar vs Ecuador (0-2)
            { homeScore: 0, awayScore: 2, matchIndex: 2 }, // Senegal vs Netherlands (0-2)
            { homeScore: 6, awayScore: 2, matchIndex: 7 }, // England vs Iran (6-2)
            { homeScore: 1, awayScore: 1, matchIndex: 8 }, // USA vs Wales (1-1)
        ];
        
        // Get first few matches to update
        const [matches] = await connection.execute(
            'SELECT id, homeTeamId, awayTeamId FROM matches ORDER BY matchTime LIMIT 10'
        );
        
        for (let i = 0; i < sampleResults.length && i < (matches as any[]).length; i++) {
            const result = sampleResults[i];
            const match = (matches as any[])[i];
            
            await connection.execute(
                'UPDATE matches SET homeScore = ?, awayScore = ? WHERE id = ?',
                [result.homeScore, result.awayScore, match.id]
            );
            
            console.log(`Updated match ${match.id} with score ${result.homeScore}-${result.awayScore}`);
        }
        
        console.log('Sample results added successfully!');
        
    } catch (error) {
        console.error('Error adding sample results:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    addSampleResults()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { addSampleResults };