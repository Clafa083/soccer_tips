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
    total_points: number;
    total_bets: number;
}

interface BettingStats {
    totalUsers: number;
    totalMatches: number;
    totalBets: number;
    finishedMatches: number;
    averagePoints: number;
    topScorer: {
        name: string;
        totalPoints: number;    } | null;
}

interface UserBetsData {
    user: {
        id: number;
        name: string;
        email: string;
        image_url?: string;
        created_at: string;
    };
    bets: any[];
}

interface MatchBetsData {
    match: {
        id: number;
        home_team_id: number;
        away_team_id: number;
        home_team_name: string;
        away_team_name: string;
        home_score?: number;
        away_score?: number;
        matchTime: string;
        status: string;
        matchType: string;
        group?: string;
    };
    bets: any[];
}

export const adminService = {
    async calculateAllPoints(): Promise<{ message: string; updatedBets: number; finishedMatches: number }> {
        const response = await api.post('/admin.php?action=calculate-points');
        return response.data;
    },

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
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

    async updateUserRole(userId: number, role: 'user' | 'admin'): Promise<void> {
        await api.put(`/admin.php?action=update-role&id=${userId}`, { role });
    },

    async getBettingStats(): Promise<BettingStats> {
        const response = await api.get('/admin.php?action=stats');
        return response.data;
    },

    async getUserBets(userId: number): Promise<UserBetsData> {
        const response = await api.get(`/admin.php?action=user-bets&user_id=${userId}`);
        return response.data;
    },

    async getMatchBets(matchId: number): Promise<MatchBetsData> {
        const response = await api.get(`/admin.php?action=match-bets&match_id=${matchId}`);
        return response.data;
    },

    async updateMatch(matchId: number, updates: {
        allowed_home_groups?: string;
        allowed_away_groups?: string;
        home_group_description?: string;
        away_group_description?: string;
        home_team_id?: number | null;
        away_team_id?: number | null;
        matchTime?: string;
        status?: string;
        home_score?: number | null;
        away_score?: number | null;
    }): Promise<{ message: string; matchId: number }> {
        const response = await api.post(`/admin.php?action=update-match&id=${matchId}`, updates);
        return response.data;
    }
};