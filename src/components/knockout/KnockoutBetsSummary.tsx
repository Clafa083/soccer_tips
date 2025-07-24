import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Chip, CircularProgress, Alert } from '@mui/material';
import { getKnockoutLabel } from '../../utils/knockoutUtils';
import { KnockoutScoringConfigService } from '../../services/knockoutScoringConfigService';
import { Match, Team, User } from '../../types/models';
import { publicService } from '../../services/publicService';

interface KnockoutBetsSummaryProps {
  match: Match;
}

interface UserKnockoutTip {
  user: User;
  teams: Team[];
  points: number;
}

export const KnockoutBetsSummary: React.FC<KnockoutBetsSummaryProps> = ({ match }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<UserKnockoutTip[]>([]);
  const [scoringLabel, setScoringLabel] = useState<string>('');
  const [winner, setWinner] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Hämta scoring config för denna runda
        const configs = await KnockoutScoringConfigService.getAllConfigs();
        const config = configs.find((c: any) => c.match_type === match.matchType);
        setScoringLabel(config ? `${config.points_per_correct_team}p per rätt lag` : '');
        // 2. Hämta alla användares knockout-predictions
        const response = await publicService.getKnockoutPredictionsForMatch(match.id);
        setTips(response.tips || []);
        setWinner(response.winner || null);
      } catch (err: any) {
        setError('Kunde inte ladda knockout-tips.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [match.id, match.matchType]);

  if (loading) return <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.replace(/knockoutmatch/gi, 'slutspelsmatch')}</Alert>;
  if (!tips.length && !winner) return <Alert severity="info">Ingen har tippat rätt lag i denna slutspelsmatch.</Alert>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Användare som tippat rätt lag i {getKnockoutLabel(match.matchType)}
      </Typography>
      {scoringLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{scoringLabel}</Typography>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Användare</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lag</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Poäng</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tips.map((tip) => (
              <TableRow key={tip.user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={tip.user.image_url} sx={{ width: 28, height: 28 }}>
                      {tip.user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{tip.user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">@{tip.user.username}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tip.teams.map((team) => (
                      <Chip key={team.id} label={team.name} size="small" avatar={team.flag_url ? <Avatar src={team.flag_url} sx={{ width: 18, height: 18 }} /> : undefined} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip label={`${tip.points}p`} color={tip.points > 0 ? 'success' : 'default'} size="small" />
                </TableCell>
              </TableRow>
            ))}
            {/* WINNER-rad */}
            {match.matchType === 'FINAL' && winner && winner.user_tips && winner.user_tips.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={3} sx={{ background: '#f5f5f5', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>
                    {winner.label}
                  </TableCell>
                </TableRow>
                {winner.user_tips.map((tip: any) => (
                  <TableRow key={tip.user.id + '-winner'}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={tip.user.image_url} sx={{ width: 28, height: 28 }}>
                          {tip.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{tip.user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">@{tip.user.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {tip.teams.map((team: any) => (
                          <Chip key={team.id} label={team.name} size="small" avatar={team.flag_url ? <Avatar src={team.flag_url} sx={{ width: 18, height: 18 }} /> : undefined} />
                        ))}
                        {winner.winner_team && (
                          <>
                            <span style={{ margin: '0 4px' }}>&rarr;</span>
                            <Chip label={winner.winner_team.name} size="small" avatar={winner.winner_team.flag_url ? <Avatar src={winner.winner_team.flag_url} sx={{ width: 18, height: 18 }} /> : undefined} color="info" />
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${tip.points}p`} color={tip.points > 0 ? 'success' : 'default'} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 