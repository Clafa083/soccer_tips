import api from '../api/api';
import { Bet, CreateBetDto } from '../types/models';

interface BetWithMatch extends Bet {
    userName?: string;
    userImageUrl?: string;
    match: {
        id: number;
        matchTime: string;
        matchType: string;
        group?: string;
        home_score?: number;
        away_score?: number;
        homeTeam?: {
            id: number;
            name: string;
            flag_url?: string;
        };
        awayTeam?: {
            id: number;
            name: string;
            flag_url?: string;
        };
    };
}

export const betService = {
    async getUserBets(userId?: number): Promise<BetWithMatch[]> {
        const url = userId ? `/bets.php?user_id=${userId}` : '/bets.php';
        const response = await api.get(url);
        return response.data;
    },

    async createOrUpdateBet(betData: CreateBetDto & { user_id?: number }): Promise<Bet> {
        // Transform to backend format
        const backendFormat = {
            match_id: betData.match_id || betData.matchId,
            home_score: betData.home_score || betData.homeScore,
            away_score: betData.away_score || betData.awayScore,
            home_team_id: betData.home_team_id || betData.homeTeamId,
            away_team_id: betData.away_team_id || betData.awayTeamId,
            ...(betData.user_id ? { user_id: betData.user_id } : {})
        };
        
        const response = await api.post('/bets.php', backendFormat);
        return response.data;
    },

    async deleteBet(betId: number): Promise<void> {
        await api.delete(`/bets.php?id=${betId}`);
    },

    async getBetsByMatch(matchId: number): Promise<Bet[]> {
        const response = await api.get(`/bets.php?match=${matchId}`);
        return response.data;
    }
};