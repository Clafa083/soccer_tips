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
    Stack
} from '@mui/material';
import { Match, Bet, MatchType, Team } from '../../types/models';

interface BettingMatchCardProps {
    match: Match;
    userBet?: Bet;
    onBetUpdate: (matchId: number, betData: any) => Promise<void>;
}

export function BettingMatchCard({ match, userBet, onBetUpdate }: BettingMatchCardProps) {
    const [homeScore, setHomeScore] = useState<number | string>(userBet?.home_score ?? '');
    const [awayScore, setAwayScore] = useState<number | string>(userBet?.away_score ?? '');
    const [selectedHomeTeam, setSelectedHomeTeam] = useState<Team | null>(
        userBet?.home_team_id ? { id: userBet.home_team_id, name: 'Team', group: undefined } : null
    );
    const [selectedAwayTeam, setSelectedAwayTeam] = useState<Team | null>(
        userBet?.away_team_id ? { id: userBet.away_team_id, name: 'Team', group: undefined } : null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isGroupStage = match.matchType === MatchType.GROUP;
    const matchTime = new Date(match.matchTime);
    const now = new Date();
    const hasStarted = matchTime <= now;
    const hasResult = match.home_score !== null && match.away_score !== null;

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
                                    {match.home_score} - {match.away_score}
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
                                                <TextField {...params} label="Vinnare hem" size="small" />
                                            }
                                            sx={{ mb: 1 }}
                                        />
                                        <Autocomplete
                                            options={teamOptions}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedAwayTeam}
                                            onChange={(_, newValue) => setSelectedAwayTeam(newValue)}
                                            renderInput={(params) => 
                                                <TextField {...params} label="Vinnare borta" size="small" />
                                            }
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
                                    disabled={loading}
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
                                                {userBet.home_score} - {userBet.away_score}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body1">
                                                Lag {userBet.home_team_id} vs Lag {userBet.away_team_id}
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
            </CardContent>
        </Card>
    );
}