import { useState } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    TextField,
    Chip,
    Stack,
    Avatar
} from '@mui/material';
import { Match, Bet, Team } from '../../types/models';
import { generateFlagUrlForTeam } from '../../utils/flagUtils';

interface BettingMatchCardProps {
    match: Match;
    userBet?: Bet;
    onBetChange?: (matchId: number, betData: any) => void;
    bettingLocked?: boolean;
    hasPendingChanges?: boolean;
    pendingBet?: any;
}

export function BettingMatchCard({ match, userBet, onBetChange, bettingLocked = false, hasPendingChanges = false, pendingBet }: BettingMatchCardProps) {
    // Endast gruppspelslogik:
    const [homeScore, setHomeScore] = useState<number | string>(() => {
        if (pendingBet?.homeScore !== undefined) {
            return pendingBet.homeScore;
        }
        return userBet?.home_score ?? '';
    });
    const [awayScore, setAwayScore] = useState<number | string>(() => {
        if (pendingBet?.awayScore !== undefined) {
            return pendingBet.awayScore;
        }
        return userBet?.away_score ?? '';
    });
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
    const handleBetChange = (newHomeScore?: number | string, newAwayScore?: number | string) => {
        if (!onBetChange) return;
        const betData: any = {};
        if (newHomeScore !== undefined) {
            betData.homeScore = newHomeScore === '' ? null : Number(newHomeScore);
        } else if (homeScore !== '') {
            betData.homeScore = Number(homeScore);
        }
        if (newAwayScore !== undefined) {
            betData.awayScore = newAwayScore === '' ? null : Number(newAwayScore);
        } else if (awayScore !== '') {
            betData.awayScore = Number(awayScore);
        }
        onBetChange(match.id, betData);
    };
    const getTeamDisplayName = (team?: Team) => team?.name || 'TBD';
    const TeamDisplay = ({ team, align = 'left' }: { team?: Team; align?: 'left' | 'right' }) => {
        const flagUrl = generateFlagUrlForTeam(team?.name || '');
        const teamName = getTeamDisplayName(team);
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexDirection: align === 'right' ? 'row-reverse' : 'row', flex: 1, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
                {flagUrl ? (
                    <Avatar src={flagUrl} alt={`${teamName} flagga`} sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 }, borderRadius: 1, border: '1px solid rgba(0,0,0,0.12)' }} />
                ) : (
                    <Avatar sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 }, borderRadius: 1, backgroundColor: 'grey.300', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>{teamName.charAt(0)}</Avatar>
                )}
                <Typography variant="h6" sx={{ textAlign: align === 'right' ? 'right' : 'left', fontSize: { xs: '0.8rem', sm: '1.25rem' }, fontWeight: { xs: 500, sm: 400 }, lineHeight: 1.2 }}>{teamName}</Typography>
            </Box>
        );
    };
    return (
        <Card sx={{ mb: 2, '& .MuiCardContent-root': { padding: { xs: 2, sm: 3 }, '&:last-child': { paddingBottom: { xs: 2, sm: 3 } } } }}>
            <CardContent>
                <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {formatDateTime(matchTime)}
                            {match.group && ` • Grupp ${match.group}`}
                            {hasResult && (
                                <Chip label="Avslutad" size="small" color="success" sx={{ ml: 1, height: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }} />
                            )}
                        </Typography>
                        {hasPendingChanges && (
                            <Chip label="Osparade ändringar" size="small" color="warning" variant="outlined" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }} />
                        )}
                    </Box>
                </Box>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems="center">
                    <Box sx={{ flex: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 1, sm: 2 } }}>
                            <TeamDisplay team={match.homeTeam} align="left" />
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: { xs: 40, sm: 60 } }}>
                                <Typography variant="h6" sx={{ fontWeight: 'medium', fontSize: { xs: '1rem', sm: '1.25rem' } }}>VS</Typography>
                            </Box>
                            <TeamDisplay team={match.awayTeam} align="right" />
                        </Box>
                        {hasResult && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{match.home_score} - {match.away_score}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ flex: 1, width: '100%' }}>
                        {!hasResult ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: 1, justifyContent: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 500 }}>Ditt tips</Typography>
                                    <TextField
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        inputProps={{ pattern: "[0-9]*" }}
                                        label="Hemma"
                                        value={homeScore}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || (/^\d{1,2}$/.test(value) && parseInt(value) <= 99)) {
                                                setHomeScore(value);
                                            }
                                        }}
                                        onBlur={() => { handleBetChange(homeScore, undefined); }}
                                        size="small"
                                        sx={{ width: { xs: 70, sm: 80 } }}
                                        disabled={isDisabled}
                                    />
                                    <Typography variant="body1" sx={{ mx: { xs: 0.5, sm: 1 } }}>-</Typography>
                                    <TextField
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        inputProps={{ pattern: "[0-9]*" }}
                                        label="Borta"
                                        value={awayScore}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || (/^\d{1,2}$/.test(value) && parseInt(value) <= 99)) {
                                                setAwayScore(value);
                                            }
                                        }}
                                        onBlur={() => { handleBetChange(undefined, awayScore); }}
                                        size="small"
                                        sx={{ width: { xs: 70, sm: 80 } }}
                                        disabled={isDisabled}
                                    />
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 500 }}>Ditt tips</Typography>
                                    {userBet ? (
                                        <Typography variant="body1" sx={{ textAlign: 'center', fontSize: { xs: '1rem', sm: '1.125rem' }, fontWeight: 'medium' }}>{userBet.home_score} - {userBet.away_score}</Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Inget tips placerat</Typography>
                                    )}
                                </Box>
                                {userBet && userBet.points !== null && (
                                    <Typography variant="body2" color="primary" sx={{ textAlign: 'center', mt: 1, fontWeight: 'medium' }}>Poäng: {userBet.points}</Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}