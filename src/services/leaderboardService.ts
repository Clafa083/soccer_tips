import api from '../api/api';

interface LeaderboardEntry {
    id: number;
    username: string;
    name: string;
    email: string;
    image_url?: string;
    total_points: number;
    total_bets: number;
    rank: number;
    created_at: string;
}

interface LeaderboardStats {
    totalUsers: number;
    totalBets: number;
    averagePoints: number;
    topScorer: LeaderboardEntry | null;
}

interface MatchSummary {
    id: number;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
    date: string;
    display_name: string;
}

interface UserPointsHistory {
    id: number;
    name: string;
    username: string;
    image_url?: string;
    total_points: number;
    points_history: {
        match_id: number;
        points_earned: number;
        cumulative_points: number;
    }[];
}

interface PointsHistoryResponse {
    users: UserPointsHistory[];
    matches: MatchSummary[];
}

export const leaderboardService = {
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        const response = await api.get('/leaderboard.php');
        return response.data;
    },

    async getLeaderboardStats(): Promise<LeaderboardStats> {
        const response = await api.get('/leaderboard.php?stats=1');
        return response.data;
    },

    async getPointsHistory(): Promise<PointsHistoryResponse> {
        const response = await api.get('/points-history.php');
        return response.data;
    }
};
