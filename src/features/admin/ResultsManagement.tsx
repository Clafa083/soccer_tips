import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { matchService } from '../../services/matchService';
import { Match, MatchType } from '../../types/models';

export function ResultsManagement() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [homeScore, setHomeScore] = useState<number | string>('');
    const [awayScore, setAwayScore] = useState<number | string>('');
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const data = await matchService.getAllMatches();
            // Sort by match time
            const sortedMatches = data.sort((a, b) => 
                new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime()
            );
            setMatches(sortedMatches);
            setError(null);
        } catch (err) {
            console.error('Error loading matches:', err);
            setError('Kunde inte ladda matcher');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (match: Match) => {
        setSelectedMatch(match);
        setHomeScore(match.homeScore ?? '');
        setAwayScore(match.awayScore ?? '');
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedMatch(null);
        setHomeScore('');
        setAwayScore('');
    };

    const handleSaveResult = async () => {
        if (!selectedMatch) return;

        try {
            if (homeScore === '' || awayScore === '') {
                setError('Båda resultaten måste fyllas i');
                return;
            }

            const homeScoreNum = Number(homeScore);
            const awayScoreNum = Number(awayScore);

            if (homeScoreNum < 0 || awayScoreNum < 0) {
                setError('Resultatet kan inte vara negativt');
                return;
            }

            await matchService.updateMatchResult(selectedMatch.id, homeScoreNum, awayScoreNum);
            await loadMatches();
            handleCloseDialog();
            setError(null);
        } catch (err) {
            console.error('Error updating result:', err);
            setError('Kunde inte uppdatera resultat');
        }
    };

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const getMatchTypeLabel = (type: MatchType) => {
        const labels = {
            [MatchType.GROUP]: 'Gruppspel',
            [MatchType.ROUND_OF_16]: 'Åttondel',
            [MatchType.QUARTER_FINAL]: 'Kvartsfinal',
            [MatchType.SEMI_FINAL]: 'Semifinal',
            [MatchType.FINAL]: 'Final'
        };
        return labels[type];
    };

    const isMatchStarted = (matchTime: Date) => {
        return new Date(matchTime) <= new Date();
    };

    const hasResult = (match: Match) => {
        return match.homeScore !== null && match.awayScore !== null;
    };

    if (loading) {
        return <Typography>Laddar matcher...</Typography>;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Hantera matchresultat
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Mata in resultat för avslutade matcher. Detta kommer automatiskt att beräkna poäng för alla användares tips.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Datum & Tid</TableCell>
                            <TableCell>Match</TableCell>
                            <TableCell>Typ</TableCell>
                            <TableCell>Grupp</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Resultat</TableCell>
                            <TableCell align="right">Åtgärd</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {matches.map((match) => {
                            const started = isMatchStarted(match.matchTime);
                            const finished = hasResult(match);
                            
                            return (
                                <TableRow key={match.id}>
                                    <TableCell>{formatDateTime(match.matchTime)}</TableCell>
                                    <TableCell>
                                        {match.homeTeam?.name || 'TBD'} vs {match.awayTeam?.name || 'TBD'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={getMatchTypeLabel(match.matchType)} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {match.group ? `Grupp ${match.group}` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {finished ? (
                                            <Chip label="Avslutad" color="success" size="small" />
                                        ) : started ? (
                                            <Chip label="Pågår" color="warning" size="small" />
                                        ) : (
                                            <Chip label="Kommande" color="default" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {finished 
                                            ? `${match.homeScore} - ${match.awayScore}`
                                            : '-'
                                        }
                                    </TableCell>                                    <TableCell align="right">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenDialog(match)}
                                        >
                                            {finished ? 'Ändra' : 'Sätt resultat'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {matches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        Inga matcher har lagts till än
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Sätt resultat för match
                </DialogTitle>
                <DialogContent>
                    {selectedMatch && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {selectedMatch.homeTeam?.name || 'TBD'} vs {selectedMatch.awayTeam?.name || 'TBD'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {formatDateTime(selectedMatch.matchTime)}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                                <TextField
                                    label={selectedMatch.homeTeam?.name || 'Hemmalag'}
                                    type="number"
                                    value={homeScore}
                                    onChange={(e) => setHomeScore(e.target.value)}
                                    inputProps={{ min: 0 }}
                                    fullWidth
                                />
                                <Typography variant="h5">-</Typography>
                                <TextField
                                    label={selectedMatch.awayTeam?.name || 'Bortalag'}
                                    type="number"
                                    value={awayScore}
                                    onChange={(e) => setAwayScore(e.target.value)}
                                    inputProps={{ min: 0 }}
                                    fullWidth
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Avbryt</Button>
                    <Button onClick={handleSaveResult} variant="contained">
                        Spara resultat
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}