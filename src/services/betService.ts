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
    async getUserBets(): Promise<BetWithMatch[]> {
        const response = await api.get('/bets.php');
        return response.data;
    },

    async createOrUpdateBet(betData: CreateBetDto): Promise<Bet> {
        // Transform to backend format
        const backendFormat = {
            match_id: betData.match_id || betData.matchId,
            home_score: betData.home_score || betData.homeScore,
            away_score: betData.away_score || betData.awayScore,
            home_team_id: betData.home_team_id || betData.homeTeamId,
            away_team_id: betData.away_team_id || betData.awayTeamId,
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