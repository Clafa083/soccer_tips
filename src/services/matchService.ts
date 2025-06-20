import api from '../api/api';
import { Match, Team, MatchType } from '../types/models';

export const matchService = {
    // Get all matches
    getAllMatches: async (): Promise<Match[]> => {
        const response = await api.get('/matches.php');
        return response.data;
    },

    // Get matches by type (group stage, knockout, etc)
    getMatchesByType: async (type: MatchType): Promise<Match[]> => {
        const response = await api.get(`/matches.php?type=${type}`);
        return response.data;
    },

    // Get matches by group
    getMatchesByGroup: async (group: string): Promise<Match[]> => {
        const response = await api.get(`/matches.php?group=${group}`);
        return response.data;
    },

    // Create a new match (admin only)
    createMatch: async (matchData: any): Promise<Match> => {
        const response = await api.post('/matches.php', matchData);
        return response.data;
    },    // Update match result (admin only)
    updateMatchResult: async (matchId: number, homeScore: number, awayScore: number): Promise<Match> => {
        const response = await api.put(`/matches.php?id=${matchId}`, {
            homeScore,
            awayScore
        });
        return response.data;
    },

    // Delete match (admin only)
    deleteMatch: async (matchId: number): Promise<void> => {
        await api.delete(`/matches.php?id=${matchId}`);
    },

    // Get all teams
    getAllTeams: async (): Promise<Team[]> => {
        const response = await api.get('/teams.php');
        return response.data;
    },

    // Get teams by group
    getTeamsByGroup: async (group: string): Promise<Team[]> => {
        const response = await api.get(`/teams.php?group=${group}`);
        return response.data;
    }
};
