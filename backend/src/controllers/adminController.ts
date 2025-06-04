import { Request, Response } from 'express';
import { DatabaseAdapter } from '../db/DatabaseAdapter';
import { mockUsers } from '../db/mockDatabase';

// Simple check for mock mode based on environment
const isUsingMockData = () => process.env.DEV_MODE === 'mock';

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
                'SELECT id, userId, homeScore as betHomeScore, awayScore as betAwayScore FROM bets WHERE matchId = ?',
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
export const getLeaderboard = async (req: Request, res: Response) => {
    if (isUsingMockData()) {
        console.log('Using mock leaderboard data');
        const leaderboard = mockUsers
            .filter(u => !u.isAdmin)
            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)); // Handle undefined totalPoints
        res.json(leaderboard);
        return;    }
    
    try {
        const result = await DatabaseAdapter.query(
            `SELECT 
                u.id, u.name, u.email, u.imageUrl, u.createdAt,
                COALESCE(SUM(b.points), 0) as totalPoints,
                COUNT(b.id) as totalBets
             FROM users u
             LEFT JOIN bets b ON u.id = b.userId
             WHERE u.isAdmin = FALSE
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