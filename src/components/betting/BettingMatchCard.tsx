import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    TextField,
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
    onBetChange?: (matchId: number, betData: any) => void;
    bettingLocked?: boolean;
    hasPendingChanges?: boolean;
    availableTeams?: Team[];
    pendingBet?: any;
}

export function BettingMatchCard({ match, userBet, onBetChange, bettingLocked = false, hasPendingChanges = false, availableTeams = [], pendingBet }: BettingMatchCardProps) {    const [homeScore, setHomeScore] = useState<number | string>(() => {
        if (pendingBet?.homeScore !== undefined) return pendingBet.homeScore;
        return userBet?.home_score ?? '';
    });
    const [awayScore, setAwayScore] = useState<number | string>(() => {
        if (pendingBet?.awayScore !== undefined) return pendingBet.awayScore;
        return userBet?.away_score ?? '';
    });    const [selectedHomeTeam, setSelectedHomeTeam] = useState<Team | null>(() => {
        if (pendingBet?.homeTeamId !== undefined) {
            return availableTeams.find(team => team.id === pendingBet.homeTeamId) || null;
        }
        if (userBet?.home_team_id && availableTeams.length > 0) {
            return availableTeams.find(team => team.id === userBet.home_team_id) || null;
        }
        return null;
    });
    const [selectedAwayTeam, setSelectedAwayTeam] = useState<Team | null>(() => {
        if (pendingBet?.awayTeamId !== undefined) {
            return availableTeams.find(team => team.id === pendingBet.awayTeamId) || null;
        }
        if (userBet?.away_team_id && availableTeams.length > 0) {
            return availableTeams.find(team => team.id === userBet.away_team_id) || null;        }
        return null;    });
      // Update selected teams when availableTeams, userBet or pendingBet changes
    useEffect(() => {
        // Handle pending bet updates
        if (pendingBet) {
            if (pendingBet.homeScore !== undefined) {
                setHomeScore(pendingBet.homeScore);
            }
            if (pendingBet.awayScore !== undefined) {
                setAwayScore(pendingBet.awayScore);
            }
            if (pendingBet.homeTeamId !== undefined && availableTeams.length > 0) {
                const homeTeam = availableTeams.find(team => team.id === pendingBet.homeTeamId);
                setSelectedHomeTeam(homeTeam || null);
            }
            if (pendingBet.awayTeamId !== undefined && availableTeams.length > 0) {
                const awayTeam = availableTeams.find(team => team.id === pendingBet.awayTeamId);
                setSelectedAwayTeam(awayTeam || null);
            }
        }
        // Handle user bet updates when no pending bet exists
        else if (availableTeams.length > 0 && userBet) {
            if (userBet.home_team_id) {
                const homeTeam = availableTeams.find(team => team.id === userBet.home_team_id);
                if (homeTeam && homeTeam !== selectedHomeTeam) {
                    setSelectedHomeTeam(homeTeam);
                }
            }
            if (userBet.away_team_id) {
                const awayTeam = availableTeams.find(team => team.id === userBet.away_team_id);
                if (awayTeam && awayTeam !== selectedAwayTeam) {
                    setSelectedAwayTeam(awayTeam);
                }
            }
            if (userBet.home_score !== undefined) {
                setHomeScore(userBet.home_score);
            }
            if (userBet.away_score !== undefined) {
                setAwayScore(userBet.away_score);
            }
        }    }, [availableTeams, userBet, pendingBet]);

    const isGroupStage = match.matchType === MatchType.GROUP;
    const matchTime = new Date(match.matchTime);
    const hasResult = match.home_score !== null && match.away_score !== null;
    const isDisabled = bettingLocked;

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'        }).format(date);
    };

    const handleBetChange = (newHomeScore?: number | string, newAwayScore?: number | string, newHomeTeam?: Team | null, newAwayTeam?: Team | null) => {
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
    };    // Use available teams from props instead of hardcoded options
    const teamOptions: Team[] = availableTeams;

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
                                    </Box>                                )}
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
                                            </Typography>                                        ) : (
                                            <Typography variant="body1">
                                                {(() => {
                                                    const homeTeam = availableTeams.find(team => team.id === userBet.home_team_id);
                                                    const awayTeam = availableTeams.find(team => team.id === userBet.away_team_id);
                                                    return `${homeTeam?.name || `Lag ${userBet.home_team_id}`} vs ${awayTeam?.name || `Lag ${userBet.away_team_id}`}`;
                                                })()}
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