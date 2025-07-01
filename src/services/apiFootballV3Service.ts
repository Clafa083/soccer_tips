import { config } from '../config/config';

// V3 API structures
export interface ApiFootballV3League {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
  }>;
}

export interface ApiFootballV3Team {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface ApiFootballV3Fixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number;
      away: number;
    };
    penalty: {
      home: number;
      away: number;
    };
  };
}

export interface ApiFootballV3Response<T> {
  get: string;
  parameters: Record<string, any>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

class ApiFootballV3Service {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${config.API_URL}/api-football-proxy.php`;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      console.log(`Making API-Football V3 request to: ${endpoint}`);
      
      const response = await fetch(`${this.baseUrl}?endpoint=${encodeURIComponent(endpoint)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 200));

      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON. Check API-Football proxy configuration.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors.join(', '));
      }

      // Check for specific API-Football errors
      if (data.errors && typeof data.errors === 'object') {
        if (data.errors.access) {
          throw new Error(`API-Football kontot är suspenderat: ${data.errors.access}`);
        }
        if (data.errors.requests) {
          throw new Error(`API-Football begränsning: ${data.errors.requests}`);
        }
        // Handle other error types
        const errorMessages = Object.values(data.errors).filter(Boolean);
        if (errorMessages.length > 0) {
          throw new Error(`API-Football fel: ${errorMessages.join(', ')}`);
        }
      }

      return data;
    } catch (error) {
      console.error('API-Football V3 request failed:', error);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const response = await this.makeRequest<ApiFootballV3Response<any>>('status');
      return {
        success: true,
        message: 'API-Football V3 anslutning fungerar',
        details: response
      };
    } catch (error) {
      return {
        success: false,
        message: `Anslutningsfel: ${error instanceof Error ? error.message : 'Okänt fel'}`,
        details: { error }
      };
    }
  }

  async searchLeagues(search: string): Promise<ApiFootballV3League[]> {
    const endpoint = `leagues?search=${encodeURIComponent(search)}`;
    const response = await this.makeRequest<ApiFootballV3Response<ApiFootballV3League>>(endpoint);
    return response.response || [];
  }

  async getLeaguesByCountry(country: string): Promise<ApiFootballV3League[]> {
    const endpoint = `leagues?country=${encodeURIComponent(country)}`;
    const response = await this.makeRequest<ApiFootballV3Response<ApiFootballV3League>>(endpoint);
    return response.response || [];
  }

  async getCurrentLeagues(): Promise<ApiFootballV3League[]> {
    const endpoint = 'leagues?current=true';
    const response = await this.makeRequest<ApiFootballV3Response<ApiFootballV3League>>(endpoint);
    return response.response || [];
  }

  async getTeamsByLeague(leagueId: number, season: number): Promise<ApiFootballV3Team[]> {
    const endpoint = `teams?league=${leagueId}&season=${season}`;
    const response = await this.makeRequest<ApiFootballV3Response<ApiFootballV3Team>>(endpoint);
    return response.response || [];
  }

  async getFixturesByLeague(leagueId: number, season: number): Promise<ApiFootballV3Fixture[]> {
    const endpoint = `fixtures?league=${leagueId}&season=${season}`;
    const response = await this.makeRequest<ApiFootballV3Response<ApiFootballV3Fixture>>(endpoint);
    return response.response || [];
  }

  async getPopularLeagues(): Promise<ApiFootballV3League[]> {
    try {
      const searches = [
        'world cup',
        'euro',
        'champions',
        'premier',
        'bundesliga',
        'serie',
        'liga',
        'ligue',
        'copa america',
        'nations league'
      ];

      const allLeagues: ApiFootballV3League[] = [];

      for (const search of searches.slice(0, 3)) { // Begränsa för att undvika rate limiting
        try {
          const leagues = await this.searchLeagues(search);
          allLeagues.push(...leagues);
          // Lägg till delay mellan anrop
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`Search for "${search}" failed:`, error);
        }
      }

      // Ta bort dubletter
      const uniqueLeagues = allLeagues.filter((league, index, self) => 
        index === self.findIndex(l => l.league.id === league.league.id)
      );

      return uniqueLeagues.slice(0, 20); // Begränsa antalet resultat
    } catch (error) {
      console.error('Error fetching popular leagues:', error);
      return [];
    }
  }

  // Legacy import methods - konvertera till old format för compatibility
  async importTeamsToDatabase(teams: ApiFootballV3Team[]): Promise<void> {
    try {
      const response = await fetch(`${config.API_URL}/api/admin.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'import_teams_api_football',
          teams: teams.map(team => ({
            external_id: team.team.id,
            name: team.team.name,
            country: team.team.country,
            logo: team.team.logo,
            founded: team.team.founded,
            venue_name: team.venue?.name,
            venue_city: team.venue?.city,
            venue_capacity: team.venue?.capacity
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to import teams');
      }
    } catch (error) {
      console.error('Error importing teams:', error);
      throw error;
    }
  }

  async importFixturesToDatabase(fixtures: ApiFootballV3Fixture[]): Promise<void> {
    try {
      const response = await fetch(`${config.API_URL}/api/admin.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'import_fixtures_api_football',
          fixtures: fixtures.map(fixture => ({
            external_id: fixture.fixture.id,
            home_team_external_id: fixture.teams.home.id,
            away_team_external_id: fixture.teams.away.id,
            match_date: fixture.fixture.date,
            venue: fixture.fixture.venue?.name,
            referee: fixture.fixture.referee,
            status: fixture.fixture.status.short,
            round: fixture.league.round,
            home_score: fixture.goals.home,
            away_score: fixture.goals.away
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to import fixtures');
      }
    } catch (error) {
      console.error('Error importing fixtures:', error);
      throw error;
    }
  }
}

export const apiFootballV3Service = new ApiFootballV3Service();
