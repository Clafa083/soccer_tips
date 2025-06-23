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
    Avatar
} from '@mui/material';
import { Match, Bet, MatchType, Team } from '../../types/models';
import { generateFlagUrlForTeam } from '../../utils/flagUtils';

interface BettingMatchCardProps {
    match: Match;
    userBet?: Bet;
    onBetUpdate: (matchId: number, betData: any) => Promise<void>;
    onBetChange?: (matchId: number, betData: any) => void;
    bettingLocked?: boolean;
    hasPendingChanges?: boolean;
}

export function BettingMatchCard({ match, userBet, onBetUpdate, onBetChange, bettingLocked = false, hasPendingChanges = false }: BettingMatchCardProps) {
    const [homeScore, setHomeScore] = useState<number | string>(userBet?.home_score ?? '');
    const [awayScore, setAwayScore] = useState<number | string>(userBet?.away_score ?? '');
    const [selectedHomeTeam, setSelectedHomeTeam] = useState<Team | null>(
        userBet?.home_team_id ? { id: userBet.home_team_id, name: 'Team', group: undefined } : null
    );
    const [selectedAwayTeam, setSelectedAwayTeam] = useState<Team | null>(
        userBet?.away_team_id ? { id: userBet.away_team_id, name: 'Team', group: undefined } : null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);    const isGroupStage = match.matchType === MatchType.GROUP;
    const matchTime = new Date(match.matchTime);
    const hasResult = match.home_score !== null && match.away_score !== null;
    const isDisabled = bettingLocked;

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
    };    const handleBetChange = (newHomeScore?: number | string, newAwayScore?: number | string, newHomeTeam?: Team | null, newAwayTeam?: Team | null) => {
        if (!onBetChange) return;

        const betData: any = {};

        if (isGroupStage) {
            // Always send both scores for group stage matches
            betData.homeScore = newHomeScore !== undefined ? Number(newHomeScore) : Number(homeScore);
            betData.awayScore = newAwayScore !== undefined ? Number(newAwayScore) : Number(awayScore);
        } else {
            // Always send both team selections for knockout matches
            const homeTeam = newHomeTeam !== undefined ? newHomeTeam : selectedHomeTeam;
            const awayTeam = newAwayTeam !== undefined ? newAwayTeam : selectedAwayTeam;
            
            betData.homeTeamId = homeTeam?.id;
            betData.awayTeamId = awayTeam?.id;
        }

        onBetChange(match.id, betData);
    };const getTeamDisplayName = (team?: Team) => {
        return team?.name || 'TBD';
    };    const getTeamFlag = (team?: Team) => {
        // Försök med befintlig flag_url först
        const existingFlag = team?.flag_url || team?.flag;
        if (existingFlag) return existingFlag;
        
        // Fallback: generera flagg-URL baserat på lagnamn
        if (team?.name) {
            return generateFlagUrlForTeam(team.name);
        }
        
        return null;
    };

    const TeamDisplay = ({ team, align = 'left' }: { team?: Team; align?: 'left' | 'right' }) => {
        const flagUrl = getTeamFlag(team);
        const teamName = getTeamDisplayName(team);
        
        return (
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flexDirection: align === 'right' ? 'row-reverse' : 'row',
                flex: 1,
                justifyContent: align === 'right' ? 'flex-end' : 'flex-start'
            }}>
                {flagUrl ? (
                    <Avatar
                        src={flagUrl}
                        alt={`${teamName} flagga`}
                        sx={{ 
                            width: 32, 
                            height: 32,
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.12)'
                        }}
                    />
                ) : (
                    <Avatar
                        sx={{ 
                            width: 32, 
                            height: 32,
                            borderRadius: 1,
                            backgroundColor: 'grey.300',
                            fontSize: '0.75rem'
                        }}
                    >
                        {teamName.charAt(0)}
                    </Avatar>
                )}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        textAlign: align === 'right' ? 'right' : 'left',
                        fontSize: { xs: '0.9rem', sm: '1.25rem' }
                    }}
                >
                    {teamName}
                </Typography>
            </Box>
        );
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                            {formatDateTime(matchTime)}
                            {match.group && ` • Grupp ${match.group}`}
                            {hasResult && <Chip label="Avslutad" size="small" color="success" sx={{ ml: 1 }} />}
                        </Typography>
                        {hasPendingChanges && (
                            <Chip 
                                label="Osparade ändringar" 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            gap: 2
                        }}>
                            <TeamDisplay team={match.homeTeam} align="left" />
                            
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                minWidth: 60
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>VS</Typography>
                            </Box>
                            
                            <TeamDisplay team={match.awayTeam} align="right" />
                        </Box>

                        {hasResult && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {match.home_score} - {match.away_score}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        {!hasResult ? (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Ditt tips
                                </Typography>

                                {isGroupStage ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>                                        <TextField
                                            type="number"
                                            label="Hemma"
                                            value={homeScore}
                                            onChange={(e) => {
                                                setHomeScore(e.target.value);
                                                handleBetChange(e.target.value, undefined, undefined, undefined);
                                            }}
                                            size="small"
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 80 }}
                                            disabled={isDisabled}
                                        />
                                        <Typography variant="body1">-</Typography>                                        <TextField
                                            type="number"
                                            label="Borta"
                                            value={awayScore}
                                            onChange={(e) => {
                                                setAwayScore(e.target.value);
                                                handleBetChange(undefined, e.target.value, undefined, undefined);
                                            }}
                                            size="small"
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 80 }}
                                            disabled={isDisabled}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ mb: 2 }}>                                        <Autocomplete
                                            options={teamOptions}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedHomeTeam}
                                            onChange={(_, newValue) => {
                                                setSelectedHomeTeam(newValue);
                                                handleBetChange(undefined, undefined, newValue, undefined);
                                            }}
                                            renderInput={(params) => 
                                                <TextField {...params} label="Vinnare hem" size="small" />
                                            }
                                            sx={{ mb: 1 }}
                                            disabled={isDisabled}
                                        />                                        <Autocomplete
                                            options={teamOptions}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedAwayTeam}
                                            onChange={(_, newValue) => {
                                                setSelectedAwayTeam(newValue);
                                                handleBetChange(undefined, undefined, undefined, newValue);
                                            }}
                                            renderInput={(params) => 
                                                <TextField {...params} label="Vinnare borta" size="small" />
                                            }
                                            disabled={isDisabled}
                                        />
                                    </Box>
                                )}

                                {error && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                )}                                <Button
                                    variant="contained"
                                    onClick={handleSaveBet}
                                    disabled={loading || isDisabled}
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