import api from '../api/api';

interface FootballDataTeam {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    address: string;
    website: string;
    founded: number;
    clubColors: string;
    venue: string;
    runningCompetitions: any[];
}

interface FootballDataMatch {
    id: number;
    utcDate: string;
    status: string;
    matchday: number;
    stage: string;
    group: string | null;
    lastUpdated: string;
    homeTeam: FootballDataTeam;
    awayTeam: FootballDataTeam;
    score: {
        winner: string | null;
        duration: string;
        fullTime: {
            home: number | null;
            away: number | null;
        };
        halfTime: {
            home: number | null;
            away: number | null;
        };
    };
    season: {
        id: number;
        startDate: string;
        endDate: string;
        currentMatchday: number;
        winner: any | null;
    };
}

interface FootballDataCompetition {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
    plan: string;
    currentSeason: {
        id: number;
        startDate: string;
        endDate: string;
        currentMatchday: number;
        winner: any | null;
    };
    numberOfAvailableSeasons: number;
    lastUpdated: string;
}

export const footballDataService = {
    // Get available competitions
    async getCompetitions(): Promise<FootballDataCompetition[]> {
        try {
            const response = await api.get('/football-data-proxy.php?action=competitions');
            return response.data.competitions || [];
        } catch (error) {
            console.error('Error fetching competitions:', error);
            throw error;
        }
    },

    // Get teams from a specific competition
    async getCompetitionTeams(competitionCode: string): Promise<FootballDataTeam[]> {
        try {
            console.log(`Fetching teams for competition: ${competitionCode}`);
            
            const response = await api.get(`/football-data-proxy.php?action=teams&competition=${competitionCode}`);
            
            console.log(`Received ${response.data.teams?.length || 0} teams`);
            return response.data.teams || [];
        } catch (error) {
            console.error('Detailed error fetching teams:', error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error('Nätverksfel: Kunde inte ansluta till Football-Data.org. Kontrollera din internetanslutning eller om API:et är tillgängligt.');
            }
            throw error;
        }
    },

    // Get matches from a specific competition
    async getCompetitionMatches(competitionCode: string): Promise<FootballDataMatch[]> {
        try {
            const response = await api.get(`/football-data-proxy.php?action=matches&competition=${competitionCode}`);
            return response.data.matches || [];
        } catch (error) {
            console.error('Error fetching matches:', error);
            throw error;
        }
    },

    // Import teams to local database via our backend API
    async importTeamsToDatabase(teams: FootballDataTeam[]): Promise<void> {
        const teamsToImport = teams.map(team => ({
            external_id: team.id,
            name: team.name,
            short_name: team.shortName || team.tla,
            flag_url: team.crest,
            group: null // Will be set manually by admin
        }));

        await api.post('/admin.php?action=import_teams', {
            teams: teamsToImport
        });
    },

    // Import matches to local database via our backend API
    async importMatchesToDatabase(matches: FootballDataMatch[]): Promise<void> {
        const matchesToImport = matches.map(match => ({
            external_id: match.id,
            home_team_name: match.homeTeam.name,
            away_team_name: match.awayTeam.name,
            match_time: match.utcDate,
            stage: match.stage,
            group: match.group,
            matchday: match.matchday,
            home_score: match.score.fullTime.home,
            away_score: match.score.fullTime.away,
            status: match.status.toLowerCase() === 'finished' ? 'finished' : 'scheduled'
        }));

        await api.post('/admin.php?action=import_matches', {
            matches: matchesToImport
        });
    },

    // Helper method to get major competitions (EURO, World Cup, etc.)
    getMajorCompetitions(): { code: string; name: string; }[] {
        return [
            { code: 'EC', name: 'UEFA European Championship (EURO)' },
            { code: 'WC', name: 'FIFA World Cup' },
            { code: 'CL', name: 'UEFA Champions League' },
            { code: 'ELC', name: 'UEFA Europa League' },
            { code: 'PL', name: 'Premier League' },
            { code: 'BL1', name: 'Bundesliga' },
            { code: 'SA', name: 'Serie A' },
            { code: 'PD', name: 'La Liga' },
            { code: 'FL1', name: 'Ligue 1' }
        ];
    }
};

export type { FootballDataTeam, FootballDataMatch, FootballDataCompetition };
