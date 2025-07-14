import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardActionArea, Avatar, Button, Chip, Paper, Container, CircularProgress, Alert } from '@mui/material';
import { knockoutPredictionService } from '../../services/knockoutPredictionService';
import { KnockoutScoringConfigService, KnockoutScoringConfig } from '../../services/knockoutScoringConfigService';
import { getFlagUrl } from '../../utils/flagUtils';
import { useApp } from '../../context/AppContext';
import { getKnockoutLabel } from '../../utils/knockoutUtils';

// Exempelgrupper för test (ersätt med backend-data om tillgängligt)
const groupNames = ['Grupp A', 'Grupp B', 'Grupp C', 'Grupp D', 'Grupp E', 'Grupp F', 'Grupp G', 'Grupp H'];

// Max antal lag per runda
const knockoutMaxTeams: Record<string, number> = {
  ROUND_OF_16: 16,
  QUARTER_FINAL: 8,
  SEMI_FINAL: 4,
  FINAL: 2
};

type KnockoutRoundConfig = KnockoutScoringConfig & { max_teams: number };

export function KnockoutPredictionPage() {
  const { state } = useApp();
  const [teams, setTeams] = useState<{ id: number; name: string; flagUrl: string; group?: string }[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Record<string, number[]>>({});
  const [knockoutRounds, setKnockoutRounds] = useState<KnockoutRoundConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Hämta lag, knockout-predictions och knockout-round config från backend
  useEffect(() => {
    const userId = state.user?.id;
    if (!userId) {
      setError('Ingen användare inloggad. Logga in för att tippa.');
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      knockoutPredictionService.getTeams(),
      knockoutPredictionService.getPredictions(userId),
      KnockoutScoringConfigService.getAllConfigs()
    ])
      .then(([teamsData, predictionsData, roundsData]) => {
        // Om backend returnerar group, annars hårdkoda för test
        const teamsWithGroup = teamsData.map((team: any, i: number) => ({
          ...team,
          group: team.group || groupNames[Math.floor(i / 4)], // 4 lag per grupp
          flagUrl: getFlagUrl(team.code || team.name)
        }));
        setTeams(teamsWithGroup);
        // Filter only active rounds
        const activeRounds = roundsData.filter((r: KnockoutScoringConfig) => r.active);
        // Sätt max-antal lag per runda
        const roundsWithMax = activeRounds.map(round => ({
          ...round,
          max_teams: knockoutMaxTeams[round.match_type] || 0
        }));
        setKnockoutRounds(roundsWithMax);
        // Set selected teams for only active rounds
        const selected: Record<string, number[]> = {};
        roundsWithMax.forEach(round => {
          selected[round.match_type] = (predictionsData[round.match_type] || []);
        });
        setSelectedTeams(selected);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Kunde inte hämta data från servern.');
        setLoading(false);
      });
  }, [state.user]);

  // Filtrera möjliga lag för varje runda baserat på tidigare val
  const getAvailableTeams = (roundKey: string): { id: number; name: string; flagUrl: string; group?: string }[] => {
    if (roundKey === 'ROUND_OF_16') return teams;
    const roundIndex = knockoutRounds.findIndex(r => r.match_type === roundKey);
    if (roundIndex > 0) {
      const prevKey = knockoutRounds[roundIndex - 1].match_type;
      return teams.filter(t => selectedTeams[prevKey]?.includes(t.id));
    }
    return teams;
  };

  const handleSelect = (round: string, teamId: number) => {
    setSelectedTeams(prev => {
      const current = prev[round] || [];
      if (current.includes(teamId)) {
        return { ...prev, [round]: current.filter(id => id !== teamId) };
      } else {
        return { ...prev, [round]: [...current, teamId] };
      }
    });
  };

  const handleSave = async () => {
    const userId = state.user?.id;
    if (!userId) {
      setError('Ingen användare inloggad. Logga in för att spara.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await knockoutPredictionService.savePredictions(userId, selectedTeams);
      setLoading(false);
      if (data.success) setSuccess(true);
      else setError('Kunde inte spara.');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Kunde inte spara.');
    }
  };

  // Kontrollera om för många lag är valda i någon runda
  const getOverLimitRounds = () => {
    return knockoutRounds.filter(round => selectedTeams[round.match_type]?.length > round.max_teams);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
      >
        Tippa slutspelslag
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph
        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
      >
        Välj vilka lag du tror går vidare till respektive slutspelsrunda. Du behöver inte placera dem i specifika matcher.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>Dina val har sparats!</Alert>
      )}
      {getOverLimitRounds().length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Du har valt för många lag i följande omgång(er): {getOverLimitRounds().map(r => getKnockoutLabel(r.match_type)).join(', ')}. Välj max antal lag per omgång!
        </Alert>
      )}
      {knockoutRounds.map(round => (
        <Paper key={round.match_type} sx={{ p: 2, mb: { xs: 3, sm: 4 } }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            {getKnockoutLabel(round.match_type)} ({selectedTeams[round.match_type]?.length}/{round.max_teams} valda)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {getAvailableTeams(round.match_type).map(team => (
              <Box key={team.id} sx={{ width: { xs: '48%', sm: '23%', md: '15%' }, mb: 2, position: 'relative' }}>
                {/* Grupp-tagg uppe till vänster */}
                {team.group && (
                  <Chip label={team.group} size="small" sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, bgcolor: 'background.paper', fontSize: '0.75rem' }} />
                )}
                <Card
                  variant={selectedTeams[round.match_type]?.includes(team.id) ? 'outlined' : 'elevation'}
                  sx={{
                    border: selectedTeams[round.match_type]?.includes(team.id)
                      ? '2px solid #1976d2'
                      : '1px solid #eee',
                  }}
                >
                  <CardActionArea onClick={() => handleSelect(round.match_type, team.id)}>
                    <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                      <Avatar src={team.flagUrl} sx={{ width: 40, height: 40, mb: 1 }} />
                      <Typography variant="body2">{team.name}</Typography>
                      {selectedTeams[round.match_type]?.includes(team.id) && (
                        <Chip label="Vald" color="primary" size="small" sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {round.description || 'Välj lag från varje grupp.'}
          </Typography>
        </Paper>
      ))}
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSave}
        disabled={loading || getOverLimitRounds().length > 0}
        sx={{ 
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          borderRadius: 3,
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.5 },
          fontSize: { xs: '0.9rem', sm: '1.1rem' },
          zIndex: 1000,
          boxShadow: 3,
          minWidth: { xs: 'auto', sm: 'auto' },
          '&:hover': {
            boxShadow: 6,
          }
        }}
      >
        {loading ? 'Sparar...' : `Spara dina slutspelsval`}
      </Button>
    </Container>
  );
}
