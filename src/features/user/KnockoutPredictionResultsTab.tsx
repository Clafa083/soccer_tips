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
  Box
} from "@mui/material";

// Typdefinitioner
interface KnockoutConfig {
  key: string;
  label: string;
  points: number;
}

interface Props {
  userId: number;
}

export const KnockoutPredictionResultsTab: React.FC<Props> = ({ userId }) => {
  const [rounds, setRounds] = useState<KnockoutConfig[]>([]);
  const [userPredictions, setUserPredictions] = useState<Record<string, Team[]>>({});
  const [correctTeams, setCorrectTeams] = useState<Record<string, Team[]>>({});
  const [loading, setLoading] = useState(true);

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
          label: c.match_type.replace(/_/g, ' ').toLowerCase().replace('round of 16', 'Åttondelsfinal').replace('quarter final', 'Kvartsfinal').replace('semi final', 'Semifinal').replace('final', 'Final'),
          points: c.points_per_correct_team
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
      });
      setUserPredictions(user);
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  if (loading) return <div>Laddar knockout-resultat...</div>;

  const renderTeamCell = (team?: Team) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AvatarFlag flagUrl={getFlagUrl(team ?? '')} name={team?.name} />
      <Typography variant="body2" fontWeight={500}>{team?.name || 'Okänt lag'}</Typography>
    </Box>
  );

  // Flagga-komponent för snyggare flaggvisning
  const AvatarFlag = ({ flagUrl, name }: { flagUrl?: string; name?: string }) => (
    flagUrl ? (
      <img src={flagUrl} alt={name} width={24} style={{ borderRadius: 4, border: '1px solid #eee' }} />
    ) : (
      <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'text.secondary' }}>
        ?
      </Box>
    )
  );

  // Samla alla rader för alla rundor
  const allRows = rounds.map((round) => {
    const userTeams = userPredictions[round.key] || [];
    const facitTeams = correctTeams[round.key] || [];
    const rows = userTeams.map((team) => {
      const correct = facitTeams.some((t) => t.id === team.id);
      return {
        roundLabel: round.label.charAt(0).toUpperCase() + round.label.slice(1),
        correctTeam: correct ? team : undefined,
        userTeam: team,
        points: correct ? round.points : 0,
        rowType: 'user'
      };
    });
    // Facit-lag som användaren inte har valt
    const facitRows = facitTeams.filter((t) => !userTeams.some((ut) => ut.id === t.id)).map((team) => ({
      roundLabel: round.label.charAt(0).toUpperCase() + round.label.slice(1),
      correctTeam: team,
      userTeam: undefined,
      points: 0,
      rowType: 'facit'
    }));
    return { roundKey: round.key, roundLabel: round.label, rows: [...rows, ...facitRows] };
  });

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 3 }}>Knockout-resultat</Typography>
      {allRows.map(({ roundLabel, rows }) => (
        <Box key={roundLabel} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{roundLabel.charAt(0).toUpperCase() + roundLabel.slice(1)}</Typography>
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
                {rows.map((row, i) => (
                  <TableRow key={i} sx={{ bgcolor: row.rowType === 'facit' ? 'grey.100' : row.points > 0 ? 'success.lighter' : 'error.lighter' }}>
                    <TableCell>{row.correctTeam ? renderTeamCell(row.correctTeam) : null}</TableCell>
                    <TableCell>{row.userTeam ? renderTeamCell(row.userTeam) : null}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.points > 0 ? `${row.points} poäng` : '0 poäng'}
                        color={row.points > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </div>
  );
};

export default KnockoutPredictionResultsTab;
