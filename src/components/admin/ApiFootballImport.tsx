import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Sports as SportsIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { apiFootballV3Service, ApiFootballV3League, ApiFootballV3Team, ApiFootballV3Fixture } from '../../services/apiFootballV3Service';

interface ApiFootballImportProps {
  onImportComplete?: () => void;
}

const ApiFootballImport: React.FC<ApiFootballImportProps> = ({ onImportComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Leagues state
  const [leagues, setLeagues] = useState<ApiFootballV3League[]>([]);
  
  // Teams state
  const [teams, setTeams] = useState<ApiFootballV3Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Set<number>>(new Set());
  
  // Fixtures state
  const [fixtures, setFixtures] = useState<ApiFootballV3Fixture[]>([]);
  const [selectedFixtures, setSelectedFixtures] = useState<Set<number>>(new Set());

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await apiFootballV3Service.testConnection();
      
      if (result.success) {
        setSuccess(`API-anslutning fungerar! ${result.message}`);
        console.log('API test details:', result.details);
      } else {
        setError(`API-test misslyckades: ${result.message}`);
        console.error('API test details:', result.details);
      }
    } catch (err) {
      setError(`Fel vid test av API-anslutning: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const searchLeagues = async () => {
    if (!searchTerm.trim()) {
      setError('Ange en sökterm för att hitta ligor');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const fetchedLeagues = await apiFootballV3Service.searchLeagues(searchTerm);
      setLeagues(fetchedLeagues);
      
      if (fetchedLeagues.length === 0) {
        setError(`Inga ligor hittades för "${searchTerm}". Prova andra söktermer som "euro", "world cup", "champions league", etc.`);
      } else {
        setSuccess(`Hittade ${fetchedLeagues.length} ligor för "${searchTerm}".`);
      }
    } catch (err) {
      setError(`Fel vid hämtning av ligor: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularLeagues = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const fetchedLeagues = await apiFootballV3Service.getPopularLeagues();
      setLeagues(fetchedLeagues);
      
      if (fetchedLeagues.length === 0) {
        setError('Inga populära ligor hittades.');
      } else {
        setSuccess(`Hittade ${fetchedLeagues.length} populära ligor och mästerskap.`);
      }
    } catch (err) {
      setError(`Fel vid hämtning av ligor: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLeagues = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const fetchedLeagues = await apiFootballV3Service.getCurrentLeagues();
      setLeagues(fetchedLeagues);
      
      if (fetchedLeagues.length === 0) {
        setError('Inga aktuella ligor hittades.');
      } else {
        setSuccess(`Hittade ${fetchedLeagues.length} aktuella ligor.`);
      }
    } catch (err) {
      setError(`Fel vid hämtning av ligor: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsForLeague = async (leagueId: number, season?: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use current season if not provided
      const currentSeason = season || new Date().getFullYear();
      const fetchedTeams = await apiFootballV3Service.getTeamsByLeague(leagueId, currentSeason);
      setTeams(fetchedTeams);
      setSelectedTeams(new Set());
      
      if (fetchedTeams.length === 0) {
        setError('Inga lag hittades för denna liga.');
      } else {
        setSuccess(`Hittade ${fetchedTeams.length} lag.`);
      }
    } catch (err) {
      setError(`Fel vid hämtning av lag: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFixturesForLeague = async (leagueId: number, season?: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use current season if not provided
      const currentSeason = season || new Date().getFullYear();
      const fetchedFixtures = await apiFootballV3Service.getFixturesByLeague(leagueId, currentSeason);
      setFixtures(fetchedFixtures);
      setSelectedFixtures(new Set());
      
      if (fetchedFixtures.length === 0) {
        setError('Inga matcher hittades för denna liga.');
      } else {
        setSuccess(`Hittade ${fetchedFixtures.length} matcher.`);
      }
    } catch (err) {
      setError(`Fel vid hämtning av matcher: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelection = (teamId: number, selected: boolean) => {
    const newSelection = new Set(selectedTeams);
    if (selected) {
      newSelection.add(teamId);
    } else {
      newSelection.delete(teamId);
    }
    setSelectedTeams(newSelection);
  };

  const handleFixtureSelection = (fixtureId: number, selected: boolean) => {
    const newSelection = new Set(selectedFixtures);
    if (selected) {
      newSelection.add(fixtureId);
    } else {
      newSelection.delete(fixtureId);
    }
    setSelectedFixtures(newSelection);
  };

  const selectAllTeams = () => {
    setSelectedTeams(new Set(teams.map(team => team.team.id)));
  };

  const selectAllFixtures = () => {
    setSelectedFixtures(new Set(fixtures.map(fixture => fixture.fixture.id)));
  };

  const clearTeamSelection = () => {
    setSelectedTeams(new Set());
  };

  const clearFixtureSelection = () => {
    setSelectedFixtures(new Set());
  };

  const importSelectedTeams = async () => {
    if (selectedTeams.size === 0) {
      setError('Välj minst ett lag att importera.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const teamsToImport = teams.filter(team => selectedTeams.has(team.team.id));
      await apiFootballV3Service.importTeamsToDatabase(teamsToImport);
      setSuccess(`${teamsToImport.length} lag importerades framgångsrikt.`);
      setSelectedTeams(new Set());
      onImportComplete?.();
    } catch (err) {
      setError(`Fel vid import av lag: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  const importSelectedFixtures = async () => {
    if (selectedFixtures.size === 0) {
      setError('Välj minst en match att importera.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fixturesToImport = fixtures.filter(fixture => selectedFixtures.has(fixture.fixture.id));
      await apiFootballV3Service.importFixturesToDatabase(fixturesToImport);
      setSuccess(`${fixturesToImport.length} matcher importerades framgångsrikt.`);
      setSelectedFixtures(new Set());
      onImportComplete?.();
    } catch (err) {
      setError(`Fel vid import av matcher: ${err instanceof Error ? err.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          API-Football Import
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Importera lag och matcher från API-Football för olika mästerskap och ligor.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={testApiConnection}
            disabled={loading}
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            Testa API-anslutning
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Step 1: Search and Fetch Leagues */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              1. Hämta Ligor och Mästerskap
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Sök efter specifika ligor:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="Sökterm (t.ex. euro, world cup, champions league)"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && searchLeagues()}
                  disabled={loading}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={searchLeagues}
                  disabled={loading || !searchTerm.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                >
                  Sök
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Eller välj från fördefinierade alternativ:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={fetchPopularLeagues}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  size="small"
                >
                  Populära Mästerskap
                </Button>
                <Button
                  variant="outlined"
                  onClick={fetchCurrentLeagues}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  size="small"
                >
                  Aktuella Ligor
                </Button>
              </Box>
            </Box>

            {leagues.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Hittade ligor:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {leagues.map((league) => (
                    <Box key={league.league.id} sx={{ flex: '1 1 300px', minWidth: 250 }}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {league.league.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {league.country.name} • {league.seasons.find(s => s.current)?.year || 'N/A'}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SportsIcon />}
                            onClick={() => fetchTeamsForLeague(league.league.id, league.seasons.find(s => s.current)?.year)}
                            disabled={loading}
                          >
                            Hämta Lag
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EventIcon />}
                            onClick={() => fetchFixturesForLeague(league.league.id, league.seasons.find(s => s.current)?.year)}
                            disabled={loading}
                          >
                            Hämta Matcher
                          </Button>
                        </Box>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Step 2: Teams Import */}
        {teams.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                2. Importera Lag ({teams.length} tillgängliga)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" onClick={selectAllTeams} disabled={loading}>
                  Välj alla
                </Button>
                <Button size="small" onClick={clearTeamSelection} disabled={loading}>
                  Rensa val
                </Button>
                <Chip
                  label={`${selectedTeams.size} valda`}
                  color={selectedTeams.size > 0 ? 'primary' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {teams.map((team) => (
                    <Box key={team.team.id} sx={{ flex: '1 1 300px', minWidth: 250 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedTeams.has(team.team.id)}
                            onChange={(e) =>
                              handleTeamSelection(team.team.id, e.target.checked)
                            }
                            disabled={loading}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {team.team.logo && (
                              <img
                                src={team.team.logo}
                                alt={team.team.name}
                                style={{ width: 20, height: 20 }}
                              />
                            )}
                            <Typography variant="body2">{team.team.name}</Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={importSelectedTeams}
                disabled={loading || selectedTeams.size === 0}
                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              >
                Importera Valda Lag ({selectedTeams.size})
              </Button>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Step 3: Fixtures Import */}
        {fixtures.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                3. Importera Matcher ({fixtures.length} tillgängliga)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" onClick={selectAllFixtures} disabled={loading}>
                  Välj alla
                </Button>
                <Button size="small" onClick={clearFixtureSelection} disabled={loading}>
                  Rensa val
                </Button>
                <Chip
                  label={`${selectedFixtures.size} valda`}
                  color={selectedFixtures.size > 0 ? 'primary' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                {fixtures.map((fixture) => (
                  <Box key={fixture.fixture.id} sx={{ mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFixtures.has(fixture.fixture.id)}
                          onChange={(e) =>
                            handleFixtureSelection(fixture.fixture.id, e.target.checked)
                          }
                          disabled={loading}
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2">
                            {fixture.teams.home.name} vs {fixture.teams.away.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(fixture.fixture.date).toLocaleDateString('sv-SE')} • {fixture.league.round} • {fixture.fixture.status.long}
                          </Typography>
                        </Box>
                      }
                    />
                    <Divider />
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                onClick={importSelectedFixtures}
                disabled={loading || selectedFixtures.size === 0}
                startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              >
                Importera Valda Matcher ({selectedFixtures.size})
              </Button>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiFootballImport;
