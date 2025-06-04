import { Request, Response } from 'express';
import { DatabaseAdapter } from '../db/DatabaseAdapter';
import { mockUsers } from '../db/mockDatabase';
import { KnockoutScoringConfig, UpdateKnockoutScoringDto } from '../types/models';

// Simple check for mock mode based on environment
const isUsingMockData = () => process.env.DEV_MODE === 'mock';

// Helper function to calculate knockout points based on teams that advanced
const calculateKnockoutPoints = async (match: any, bet: any): Promise<number> => {
    try {
        // Get knockout scoring configuration
        const scoringResult = await DatabaseAdapter.query(
            'SELECT pointsPerCorrectTeam FROM knockout_scoring WHERE matchType = ?',
            [match.matchType.toUpperCase()]
        );
        
        if (!scoringResult.rows || scoringResult.rows.length === 0) {
            // Default points if no configuration found
            const defaultPoints = { 'ROUND_OF_16': 1, 'QUARTER_FINAL': 2, 'SEMI_FINAL': 3, 'FINAL': 4 };
            const pointsPerTeam = defaultPoints[match.matchType as keyof typeof defaultPoints] || 1;
            return await calculateTeamAdvancementPoints(match, bet, pointsPerTeam);
        }
        
        const pointsPerTeam = scoringResult.rows[0].pointsPerCorrectTeam;
        return await calculateTeamAdvancementPoints(match, bet, pointsPerTeam);
    } catch (error) {
        console.error('Error calculating knockout points:', error);
        return 0;
    }
};

// Helper function to calculate points based on team advancement
const calculateTeamAdvancementPoints = async (match: any, bet: any, pointsPerTeam: number): Promise<number> => {
    if (!bet.homeTeamId || !bet.awayTeamId) {
        return 0;
    }
    
    // Get teams that actually advanced from this match stage
    const advancedTeams = await getTeamsThatAdvancedFromStage(match.matchType);
    
    let points = 0;
    
    // Check if user's predicted teams actually advanced from this stage
    if (advancedTeams.includes(bet.homeTeamId)) {
        points += pointsPerTeam;
    }
    if (advancedTeams.includes(bet.awayTeamId)) {
        points += pointsPerTeam;
    }
    
    return points;
};

// Helper function to get teams that advanced from a specific tournament stage
const getTeamsThatAdvancedFromStage = async (matchType: string): Promise<number[]> => {
    try {
        let nextStageType: string;
        
        // Determine what stage comes after the current one
        switch (matchType) {
            case 'ROUND_OF_16':
                nextStageType = 'QUARTER_FINAL';
                break;
            case 'QUARTER_FINAL':
                nextStageType = 'SEMI_FINAL';
                break;
            case 'SEMI_FINAL':
                nextStageType = 'FINAL';
                break;
            case 'FINAL':
                // For final, get the winner (team with higher score)
                const finalResult = await DatabaseAdapter.query(
                    'SELECT homeTeamId, awayTeamId, homeScore, awayScore FROM matches WHERE matchType = ? AND homeScore IS NOT NULL AND awayScore IS NOT NULL',
                    ['FINAL']
                );
                
                if (!finalResult.rows || finalResult.rows.length === 0) {
                    return [];
                }
                
                const finalMatch = finalResult.rows[0];
                if (finalMatch.homeScore > finalMatch.awayScore) {
                    return [finalMatch.homeTeamId];
                } else if (finalMatch.awayScore > finalMatch.homeScore) {
                    return [finalMatch.awayTeamId];
                }
                return [];
            default:
                return [];
        }
        
        // Get teams that participated in the next stage
        const nextStageResult = await DatabaseAdapter.query(
            'SELECT DISTINCT homeTeamId, awayTeamId FROM matches WHERE matchType = ? AND homeTeamId IS NOT NULL AND awayTeamId IS NOT NULL',
            [nextStageType]
        );
        
        if (!nextStageResult.rows) {
            return [];
        }
        
        const advancedTeams = new Set<number>();
        for (const match of nextStageResult.rows) {
            if (match.homeTeamId) advancedTeams.add(match.homeTeamId);
            if (match.awayTeamId) advancedTeams.add(match.awayTeamId);
        }
        
        return Array.from(advancedTeams);
    } catch (error) {
        console.error('Error getting teams that advanced from stage:', error);
        return [];
    }
};

// Calculate points for all bets based on match results
export const calculateAllPoints = async (req: Request, res: Response) => {
    if (isUsingMockData()) {
        console.log('Mock point calculation');
        res.json({ 
            message: 'Successfully calculated points for 2 bets (mock data)',
            updatedBets: 2,
            finishedMatches: 2
        });
        return;
    }
    
    try {
        // Get all finished matches (with results)
        const matchesResult = await DatabaseAdapter.query(
            `SELECT id, homeScore, awayScore, matchType FROM matches 
             WHERE homeScore IS NOT NULL AND awayScore IS NOT NULL`
        );
        const matchesRows = matchesResult.rows || [];
        
        let totalUpdatedBets = 0;
          for (const match of matchesRows) {            // Get all bets for this match
            const betsResult = await DatabaseAdapter.query(
                'SELECT id, userId, homeScore as betHomeScore, awayScore as betAwayScore, homeTeamId, awayTeamId FROM bets WHERE matchId = ?',
                [match.id]
            );
            const betsRows = betsResult.rows || [];
            
            for (const bet of betsRows) {
                let points = 0;
                
                // Calculate points based on match type and bet accuracy
                if (match.matchType === 'GROUP') {
                    // Group stage scoring
                    if (bet.betHomeScore === match.homeScore && bet.betAwayScore === match.awayScore) {
                        // Exact score: 3 points
                        points = 3;
                    } else if (
                        (bet.betHomeScore > bet.betAwayScore && match.homeScore > match.awayScore) ||
                        (bet.betHomeScore < bet.betAwayScore && match.homeScore < match.awayScore) ||
                        (bet.betHomeScore === bet.betAwayScore && match.homeScore === match.awayScore)
                    ) {
                        // Correct result (win/draw/loss): 1 point
                        points = 1;
                    }
                    // Wrong result: 0 points
                } else {
                    // Knockout stage scoring - calculate points based on teams that advanced
                    points = await calculateKnockoutPoints(match, bet);
                }
                  // Update bet with calculated points
                await DatabaseAdapter.query(
                    'UPDATE bets SET points = ? WHERE id = ?',
                    [points, bet.id]
                );
                
                totalUpdatedBets++;
            }
        }
        
        res.json({ 
            message: `Successfully calculated points for ${totalUpdatedBets} bets`,
            updatedBets: totalUpdatedBets,
            finishedMatches: matchesRows.length
        });
        
    } catch (error) {
        console.error('Error calculating points:', error);
        res.status(500).json({ error: 'Failed to calculate points' });
    }
};

// Get all users with their total points
export const getLeaderboard = async (req: Request, res: Response) => {    if (isUsingMockData()) {
        console.log('Using mock leaderboard data');
        const leaderboard = mockUsers
            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)); // Handle undefined totalPoints
        res.json(leaderboard);
        return;    }
    
    try {        const result = await DatabaseAdapter.query(
            `SELECT 
                u.id, u.name, u.email, u.imageUrl, u.createdAt,
                COALESCE(SUM(b.points), 0) as totalPoints,
                COUNT(b.id) as totalBets
             FROM users u
             LEFT JOIN bets b ON u.id = b.userId
             GROUP BY u.id, u.name, u.email, u.imageUrl, u.createdAt
             ORDER BY totalPoints DESC, u.name ASC`
        );
        
        res.json(result.rows || []);
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

// Get all users for user management
export const getAllUsers = async (req: Request, res: Response) => {
    if (isUsingMockData()) {
        console.log('Using mock user data');
        res.json(mockUsers);
        return;    }
    
    try {
        const result = await DatabaseAdapter.query(
            `SELECT 
                u.id, u.name, u.email, u.imageUrl, u.isAdmin, u.createdAt,
                COUNT(b.id) as totalBets,
                COALESCE(SUM(b.points), 0) as totalPoints
             FROM users u
             LEFT JOIN bets b ON u.id = b.userId
             GROUP BY u.id, u.name, u.email, u.imageUrl, u.isAdmin, u.createdAt
             ORDER BY u.createdAt DESC`
        );
        
        res.json(result.rows || []);
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Delete a user and all their bets
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {        // Check if user exists and is not an admin
        const userResult = await DatabaseAdapter.query(
            'SELECT id, isAdmin FROM users WHERE id = ?',
            [id]
        );
        const userRows = userResult.rows || [];
        
        if (userRows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        if (userRows[0].isAdmin) {
            res.status(400).json({ error: 'Cannot delete admin users' });
            return;
        }
          // Delete user (bets will be deleted automatically due to foreign key cascade)
        const result = await DatabaseAdapter.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        
        if (!result.rows || result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        res.json({ message: 'User deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// Get betting statistics
export const getBettingStats = async (req: Request, res: Response) => {
    if (isUsingMockData()) {
        console.log('Using mock betting stats');
        res.json({
            totalUsers: 1,
            totalMatches: 4,
            totalBets: 2,
            finishedMatches: 2,
            averagePoints: 2.0,
            topScorer: {
                name: 'Test User',
                totalPoints: 7
            }
        });
        return;
    }
    
    try {        // Get overall statistics
        const statsResult = await DatabaseAdapter.query(
            `SELECT 
                COUNT(DISTINCT u.id) as totalUsers,
                COUNT(DISTINCT m.id) as totalMatches,
                COUNT(b.id) as totalBets,
                COUNT(CASE WHEN m.homeScore IS NOT NULL THEN 1 END) as finishedMatches,
                AVG(CASE WHEN b.points IS NOT NULL THEN b.points END) as averagePoints
             FROM users u
             CROSS JOIN matches m
             LEFT JOIN bets b ON u.id = b.userId AND m.id = b.matchId
             WHERE u.isAdmin = FALSE`
        );
          // Get top scorer
        const topScorerResult = await DatabaseAdapter.query(
            `SELECT u.name, COALESCE(SUM(b.points), 0) as totalPoints
             FROM users u
             LEFT JOIN bets b ON u.id = b.userId
             WHERE u.isAdmin = FALSE
             GROUP BY u.id, u.name
             ORDER BY totalPoints DESC
             LIMIT 1`
        );
        
        const statsRows = statsResult.rows || [];
        const topScorerRows = topScorerResult.rows || [];
        
        res.json({
            ...(statsRows[0] || {}),
            topScorer: topScorerRows[0] || null
        });
        
    } catch (error) {
        console.error('Error fetching betting stats:', error);
        res.status(500).json({ error: 'Failed to fetch betting statistics' });
    }
};

// GET /api/admin/bets-locked
export async function getBetsLocked(req: Request, res: Response) {
    console.log('=== getBetsLocked called ===');
    
    try {
        console.log('Calling DatabaseAdapter.getSetting("betsLocked")...');
        const value = await DatabaseAdapter.getSetting('betsLocked');
        console.log('✅ getSetting returned:', value);
        res.json({ betsLocked: value === 'true' });
    } catch (err: any) {
        console.error('❌ getSetting error in controller:');
        console.error('Error type:', err?.constructor?.name);
        console.error('Error message:', err?.message);
        console.error('Error stack:', err?.stack);
        res.status(500).json({ error: 'Failed to get betsLocked setting' });
    }
}

export async function setBetsLocked(req: Request, res: Response) {
    try {
        const { betsLocked } = req.body;
        if (typeof betsLocked !== 'boolean') {
            return res.status(400).json({ error: 'betsLocked must be boolean' });
        }
        await DatabaseAdapter.setSetting('betsLocked', betsLocked ? 'true' : 'false');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to set betsLocked setting' });
    }
}

// Update user admin status
export const updateUserAdminStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isAdmin } = req.body;
    
    try {
        // Validate input
        if (typeof isAdmin !== 'boolean') {
            res.status(400).json({ error: 'isAdmin must be a boolean value' });
            return;
        }
        
        // Check if user exists
        const userResult = await DatabaseAdapter.query(
            'SELECT id, isAdmin FROM users WHERE id = ?',
            [id]
        );
        const userRows = userResult.rows || [];
        
        if (userRows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        // Update user admin status
        await DatabaseAdapter.query(
            'UPDATE users SET isAdmin = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [isAdmin ? 1 : 0, id]
        );
        
        res.json({ 
            success: true, 
            message: isAdmin ? 'User promoted to admin successfully' : 'User admin status removed successfully'
        });
        
    } catch (error) {
        console.error('Error updating user admin status:', error);
        res.status(500).json({ error: 'Failed to update user admin status' });
    }
};

// Get knockout scoring configuration
export const getKnockoutScoringConfig = async (req: Request, res: Response) => {
    try {
        const result = await DatabaseAdapter.query(
            'SELECT * FROM knockout_scoring ORDER BY CASE matchType WHEN "ROUND_OF_16" THEN 1 WHEN "QUARTER_FINAL" THEN 2 WHEN "SEMI_FINAL" THEN 3 WHEN "FINAL" THEN 4 END'
        );
        
        const config = result.rows || [];
        res.json(config);
    } catch (error) {
        // If table doesn't exist, create it
        try {
            await DatabaseAdapter.query(`
                CREATE TABLE IF NOT EXISTS knockout_scoring (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    matchType VARCHAR(50) NOT NULL UNIQUE,
                    pointsPerCorrectTeam INT NOT NULL DEFAULT 1,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            // Insert default values
            await DatabaseAdapter.query(`
                INSERT IGNORE INTO knockout_scoring (matchType, pointsPerCorrectTeam) VALUES
                ('ROUND_OF_16', 1),
                ('QUARTER_FINAL', 2),
                ('SEMI_FINAL', 3),
                ('FINAL', 4)
            `);
            
            // Try again
            const result = await DatabaseAdapter.query(
                'SELECT * FROM knockout_scoring ORDER BY CASE matchType WHEN "ROUND_OF_16" THEN 1 WHEN "QUARTER_FINAL" THEN 2 WHEN "SEMI_FINAL" THEN 3 WHEN "FINAL" THEN 4 END'
            );
            res.json(result.rows || []);
        } catch (createError) {
            console.error('Error creating knockout scoring table:', createError);
            res.status(500).json({ error: 'Failed to get knockout scoring configuration' });
        }
    }
};

// Update knockout scoring configuration
export const updateKnockoutScoringConfig = async (req: Request, res: Response) => {
    try {
        const updateData: UpdateKnockoutScoringDto = req.body;
        
        const updates = [
            { matchType: 'ROUND_OF_16', points: updateData.roundOf16Points },
            { matchType: 'QUARTER_FINAL', points: updateData.quarterFinalPoints },
            { matchType: 'SEMI_FINAL', points: updateData.semiFinalPoints },
            { matchType: 'FINAL', points: updateData.finalPoints }
        ];
        
        for (const update of updates) {
            if (update.points !== undefined) {
                await DatabaseAdapter.query(
                    'UPDATE knockout_scoring SET pointsPerCorrectTeam = ?, updatedAt = CURRENT_TIMESTAMP WHERE matchType = ?',
                    [update.points, update.matchType]
                );
            }
        }
        
        // Return updated configuration
        const result = await DatabaseAdapter.query(
            'SELECT * FROM knockout_scoring ORDER BY CASE matchType WHEN "ROUND_OF_16" THEN 1 WHEN "QUARTER_FINAL" THEN 2 WHEN "SEMI_FINAL" THEN 3 WHEN "FINAL" THEN 4 END'
        );
        
        res.json(result.rows || []);
    } catch (error) {
        console.error('Error updating knockout scoring config:', error);
        res.status(500).json({ error: 'Failed to update knockout scoring configuration' });
    }
};