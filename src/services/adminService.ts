import api from '../api/api';

interface User {
    id: number;
    name: string;
    email: string;
    image_url?: string;
    role: 'user' | 'admin';
    created_at: string;
    totalBets: number;
    totalPoints: number;
}

interface LeaderboardEntry {
    id: number;
    name: string;
    email: string;
    image_url?: string;
    created_at: string;
    totalPoints: number;
    totalBets: number;
}

interface BettingStats {
    totalUsers: number;
    totalMatches: number;
    totalBets: number;
    finishedMatches: number;
    averagePoints: number;
    topScorer: {
        name: string;
        totalPoints: number;
    } | null;
}

export const adminService = {    async calculateAllPoints(): Promise<{ message: string; updatedBets: number; finishedMatches: number }> {
        const response = await api.post('/admin.php?action=calculate-points');
        return response.data;
    },async getLeaderboard(): Promise<LeaderboardEntry[]> {
        const response = await api.get('/leaderboard.php');
        return response.data;
    },

    async getAllUsers(): Promise<User[]> {
        const response = await api.get('/admin.php?action=users');
        return response.data;
    },

    async deleteUser(userId: number): Promise<void> {
        await api.delete(`/admin.php?action=delete&id=${userId}`);
    },

    async getBettingStats(): Promise<BettingStats> {
        const response = await api.get('/admin.php?action=stats');
        return response.data;
    }
};