import api from '../api/api';
import { Team } from '../types/models';

interface CreateTeamDto {
    name: string;
    group?: string;
    flag?: string;
}

export const teamService = {
    async getAllTeams(): Promise<Team[]> {
        const response = await api.get('/teams.php');
        return response.data;
    },    async getTeamsByGroup(group: string): Promise<Team[]> {
        const response = await api.get(`/teams.php?group=${group}`);
        return response.data;
    },

    async createTeam(teamData: CreateTeamDto): Promise<Team> {
        const response = await api.post('/teams.php', teamData);
        return response.data;
    },    async updateTeam(teamId: number, teamData: Partial<CreateTeamDto>): Promise<Team> {
        // Convert to both camelCase and snake_case for backend compatibility
        const convertedData: any = { ...teamData };
        
        // Add snake_case versions for better backend compatibility
        if (convertedData.flag !== undefined) {
            convertedData.flag_url = convertedData.flag;
        }
        
        const response = await api.put(`/teams.php?id=${teamId}`, convertedData);
        return response.data;
    },

    async deleteTeam(teamId: number): Promise<void> {
        await api.delete(`/teams.php?id=${teamId}`);
    }
};