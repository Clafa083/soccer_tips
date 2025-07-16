import React, { useEffect, useState } from "react";
import { getFlagUrl } from "../../utils/flagUtils";
import { matchService } from "../../services/matchService";
import { knockoutPredictionService } from "../../services/knockoutPredictionService";
import { KnockoutScoringConfigService } from "../../services/knockoutScoringConfigService";
import { teamService } from "../../services/teamService";
import { Team } from "../../types/models";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Alert
} from "@mui/material";
import { useApp } from '../../context/AppContext';

// Typdefinitioner
interface KnockoutConfig {
  key: string;
  label: string;
  points: number;
  maxTeams?: number;
}

interface Props {
  userId: number;
}

export const KnockoutPredictionResultsTab: React.FC<Props> = ({ userId }) => {
  const { state } = useApp();
  const [rounds, setRounds] = useState<KnockoutConfig[]>([]);
  const [userPredictions, setUserPredictions] = useState<Record<string, Team[]>>({});
  const [correctTeams, setCorrectTeams] = useState<Record<string, Team[]>>({});
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState<Record<string, number[]>>({});
  const [error] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [configs, matches, predictions, teams] = await Promise.all([
        KnockoutScoringConfigService.getAllConfigs(),
        matchService.getAllMatches(),
        knockoutPredictionService.getPredictions(userId),
        teamService.getAllTeams()
      ]);
      // Använd teams direkt
      const knockoutRounds: KnockoutConfig[] = configs
        .filter((c) => c.active)
        .map((c) => ({
          key: c.match_type,
          label:
            c.match_type === 'ROUND_OF_16' ? 'Åttondelsfinal' :
            c.match_type === 'QUARTER_FINAL' ? 'Kvartsfinal' :
            c.match_type === 'SEMI_FINAL' ? 'Semifinal' :
            c.match_type === 'FINAL' ? 'Final' :
            c.match_type,
          points: c.points_per_correct_team,
          maxTeams: (c.match_type === 'ROUND_OF_16' ? 16 : c.match_type === 'QUARTER_FINAL' ? 8 : c.match_type === 'SEMI_FINAL' ? 4 : c.match_type === 'FINAL' ? 2 : 0)
        }));
      setRounds(knockoutRounds);
      const correct: Record<string, Team[]> = {};
      knockoutRounds.forEach((round) => {
        const roundMatches = matches.filter(
          (m) => m.matchType === round.key
        );
        const teamsInRound: Team[] = [];
        roundMatches.forEach((m) => {
          if (m.homeTeam) teamsInRound.push(m.homeTeam);
          if (m.awayTeam) teamsInRound.push(m.awayTeam);
        });
        correct[round.key] = teamsInRound.filter(
          (team, idx, arr) => team && arr.findIndex((t) => t.id === team.id) === idx
        );
      });
      setCorrectTeams(correct);
      const user: Record<string, Team[]> = {};
      const edit: Record<string, number[]> = {};
      knockoutRounds.forEach((round) => {
        const ids: number[] = predictions[round.key] || [];
        const allUserTeams: Team[] = ids.map((id) => {
          // Försök hitta lag i facit, annars i teams, annars dummy
          return (
            correct[round.key]?.find((t) => t.id === id) ||
            teams.find((t) => t.id === id) ||
            { id, name: `Okänt lag (${id})`, flag_url: undefined }
          );
        });
        user[round.key] = allUserTeams;
        edit[round.key] = ids;
      });
      setUserPredictions(user);
      setEditState(edit);
      setLoading(false);
    }
    fetchData();
  }, [userId, state.user]);

  // Helper for Swedish label
  const getSwedishLabel = (key: string) => {
    if (key === 'WINNER') return 'Vinnare';
    if (key === 'ROUND_OF_16') return 'Åttondelsfinal';
    if (key === 'QUARTER_FINAL') return 'Kvartsfinal';
    if (key === 'SEMI_FINAL') return 'Semifinal';
    if (key === 'FINAL') return 'Final';
    return key;
  };

  // Sort rounds so WINNER is last
  const sortedRounds = [...rounds].sort((a, b) => {
    if (a.key === 'WINNER') return 1;
    if (b.key === 'WINNER') return -1;
    return 0;
  });

  if (loading) return <div>Laddar slutspels-resultat...</div>;

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 3 }}>Slutspels-resultat</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
          {error}
        </Alert>
      )}
      {/* Remove warning for too many selected teams */}
      {/* {getOverLimitRounds().length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
          Du har valt för många lag i följande omgång(er): {getOverLimitRounds().map(r => r.label).join(', ')}. Välj max antal lag per omgång!
        </Alert>
      ) */}
      {sortedRounds.map(round => {
        const userTeams = userPredictions[round.key] || [];
        const facitTeams = correctTeams[round.key] || [];
        const selectedIds = editState[round.key] || [];
        // Fix: always show max=1 for WINNER
        const max = round.key === 'WINNER' ? 1 : (round.maxTeams || 0);
        // Build table rows: correct+user, sort correct first, then only user
        const allTeams = [...userTeams, ...facitTeams.filter(t => !userTeams.some(ut => ut.id === t.id))];
        const sortedRows = allTeams.sort((a, b) => {
          const aCorrect = facitTeams.some(t => t.id === a.id);
          const bCorrect = facitTeams.some(t => t.id === b.id);
          if (aCorrect && !bCorrect) return -1;
          if (!aCorrect && bCorrect) return 1;
          return 0;
        });
        return (
          <Box key={round.key} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{getSwedishLabel(round.key)} ({selectedIds.length}/{max} valda)</Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 220 }}>Rätt svar</TableCell>
                    <TableCell sx={{ width: 220 }}>Mitt svar</TableCell>
                    <TableCell align="center" sx={{ width: 120 }}>Poäng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRows.map((team, i) => {
                    const correct = facitTeams.some(t => t.id === team.id);
                    const userHas = userTeams.some(ut => ut.id === team.id);
                    return (
                      <TableRow key={i} sx={{ bgcolor: correct ? 'success.lighter' : userHas ? 'error.lighter' : 'grey.100' }}>
                        <TableCell>{correct ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <img src={getFlagUrl(team)} alt={team.name} width={24} style={{ borderRadius: 4, border: '1px solid #eee' }} />
                            <Typography variant="body2" fontWeight={500}>{team.name}</Typography>
                          </Box>
                        ) : null}</TableCell>
                        <TableCell>{userHas ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <img src={getFlagUrl(team)} alt={team.name} width={24} style={{ borderRadius: 4, border: '1px solid #eee' }} />
                            <Typography variant="body2" fontWeight={500}>{team.name}</Typography>
                          </Box>
                        ) : null}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={correct && userHas ? `${round.points} poäng` : '0 poäng'}
                            color={correct && userHas ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </div>
  );
};

export default KnockoutPredictionResultsTab;
