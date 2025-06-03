import { useState } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Autocomplete,
    Chip,
    Stack,
    Snackbar // <-- Lägg till denna
} from '@mui/material';
import { Match, Bet, MatchType, Team } from '../../types/models';

interface BettingMatchCardProps {
    match: Match;
    userBet?: Bet;
    onBetUpdate: (matchId: number, betData: any) => Promise<void>;
    betsLocked?: boolean;
}

export function BettingMatchCard({ match, userBet, onBetUpdate, betsLocked }: BettingMatchCardProps) {
    const [homeScore, setHomeScore] = useState<number | string>(userBet?.homeScoreBet ?? '');
    const [awayScore, setAwayScore] = useState<number | string>(userBet?.awayScoreBet ?? '');
    const [selectedHomeTeam, setSelectedHomeTeam] = useState<Team | null>(
        userBet?.homeTeamId ? { id: userBet.homeTeamId, name: 'Team', group: undefined } : null
    );
    const [selectedAwayTeam, setSelectedAwayTeam] = useState<Team | null>(
        userBet?.awayTeamId ? { id: userBet.awayTeamId, name: 'Team', group: undefined } : null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const isGroupStage = match.matchType === MatchType.GROUP;
    const matchTime = new Date(match.matchTime);
    const now = new Date();
    const hasStarted = matchTime <= now;
    const hasResult = match.homeScore !== null && match.awayScore !== null;

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleSaveBet = async () => {
        try {
            setLoading(true);
            setError(null);

            if (isGroupStage) {
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

                await onBetUpdate(match.id, {
                    homeScore: homeScoreNum,
                    awayScore: awayScoreNum
                });
                setSnackbarOpen(true); // Visa snackbar vid lyckad spara
            } else {
                if (!selectedHomeTeam || !selectedAwayTeam) {
                    setError('Båda lagen måste väljas');
                    return;
                }

                if (selectedHomeTeam.id === selectedAwayTeam.id) {
                    setError('Du kan inte välja samma lag för båda positionerna');
                    return;
                }

                await onBetUpdate(match.id, {
                    homeTeamId: selectedHomeTeam.id,
                    awayTeamId: selectedAwayTeam.id
                });
                setSnackbarOpen(true); // Visa snackbar vid lyckad spara
            }
        } catch (err) {
            console.error('Error saving bet:', err);
            setError('Kunde inte spara tipset');
        } finally {
            setLoading(false);
        }
    };

    const getTeamDisplayName = (team?: Team) => {
        return team?.name || 'TBD';
    };

    // For knockout stage, we would typically get qualified teams from an API
    // For now, using a simple placeholder approach
    const teamOptions: Team[] = [
        { id: 1, name: 'Vinnare Grupp A', group: undefined },
        { id: 2, name: 'Tvåa Grupp A', group: undefined },
        { id: 3, name: 'Vinnare Grupp B', group: undefined },
        { id: 4, name: 'Tvåa Grupp B', group: undefined },
        { id: 5, name: 'Vinnare Grupp C', group: undefined },
        { id: 6, name: 'Tvåa Grupp C', group: undefined },
        { id: 7, name: 'Vinnare Grupp D', group: undefined },
        { id: 8, name: 'Tvåa Grupp D', group: undefined }
    ];

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {formatDateTime(matchTime)}
                        {match.group && ` • Grupp ${match.group}`}
                        {hasStarted && <Chip label="Startad" size="small" sx={{ ml: 1 }} />}
                        {hasResult && <Chip label="Avslutad" size="small" color="success" sx={{ ml: 1 }} />}
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6">
                                {getTeamDisplayName(match.homeTeam)}
                            </Typography>
                            <Typography variant="h6" sx={{ mx: 2 }}>vs</Typography>
                            <Typography variant="h6">
                                {getTeamDisplayName(match.awayTeam)}
                            </Typography>
                        </Box>

                        {hasResult && (
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Typography variant="h5" color="primary">
                                    {match.homeScore} - {match.awayScore}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        {!hasStarted ? (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Ditt tips
                                </Typography>

                                {isGroupStage ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <TextField
                                            type="number"
                                            label="Hemma"
                                            value={homeScore}
                                            onChange={(e) => setHomeScore(e.target.value)}
                                            size="small"
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 80 }}
                                            disabled={!!betsLocked}
                                        />
                                        <Typography variant="body1">-</Typography>
                                        <TextField
                                            type="number"
                                            label="Borta"
                                            value={awayScore}
                                            onChange={(e) => setAwayScore(e.target.value)}
                                            size="small"
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 80 }}
                                            disabled={!!betsLocked}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ mb: 2 }}>
                                        <Autocomplete
                                            options={teamOptions}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedHomeTeam}
                                            onChange={(_, newValue) => setSelectedHomeTeam(newValue)}
                                            renderInput={(params) =>
                                                <TextField {...params} label="Vinnare hem" size="small" disabled={!!betsLocked} />
                                            }
                                            sx={{ mb: 1 }}
                                            disabled={!!betsLocked}
                                        />
                                        <Autocomplete
                                            options={teamOptions}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedAwayTeam}
                                            onChange={(_, newValue) => setSelectedAwayTeam(newValue)}
                                            renderInput={(params) =>
                                                <TextField {...params} label="Vinnare borta" size="small" disabled={!!betsLocked} />
                                            }
                                            disabled={!!betsLocked}
                                        />
                                    </Box>
                                )}

                                {error && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Button
                                    variant="contained"
                                    onClick={handleSaveBet}
                                    disabled={loading || !!betsLocked}
                                    size="small"
                                >
                                    {userBet ? 'Uppdatera tips' : 'Spara tips'}
                                </Button>
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Ditt tips
                                </Typography>
                                {userBet ? (
                                    <Box>
                                        {isGroupStage ? (
                                            <Typography variant="body1">
                                                {userBet.homeScoreBet} - {userBet.awayScoreBet}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body1">
                                                Lag {userBet.homeTeamId} vs Lag {userBet.awayTeamId}
                                            </Typography>
                                        )}
                                        {userBet.points !== null && (
                                            <Typography variant="body2" color="primary">
                                                Poäng: {userBet.points}
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Inget tips placerat
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Stack>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={() => setSnackbarOpen(false)}
                    message="Tipset har sparats!"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </CardContent>
        </Card>
    );
}