import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Avatar,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Stack
} from '@mui/material';
import { Close, TrendingUp } from '@mui/icons-material';
import { Match, Bet, MatchType, Team } from '../../types/models';
import { betService } from '../../services/betService';
import { teamService } from '../../services/teamService';
import { getAvatarProps } from '../../utils/avatarUtils';

interface MatchBetsDialogProps {
    match: Match | null;
    open: boolean;
    onClose: () => void;
}

interface BetWithUser extends Bet {
    userName: string;
    userImageUrl?: string;
}

export const MatchBetsDialog: React.FC<MatchBetsDialogProps> = ({ match, open, onClose }) => {
    const [bets, setBets] = useState<BetWithUser[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);    useEffect(() => {
        if (open && match) {
            loadBets();
            loadTeams();
        }
    }, [open, match]);    const loadTeams = async () => {
        try {
            const allTeams = await teamService.getAllTeams();
            setTeams(allTeams);
        } catch (err) {
            console.error('Error loading teams:', err);
        }
    };

    const loadBets = async () => {
        if (!match) return;
        
        try {
            setLoading(true);
            setError(null);
            const matchBets = await betService.getPublicBetsByMatch(match.id);
            setBets(matchBets);
        } catch (err) {
            console.error('Error loading match bets:', err);
            setError('Kunde inte ladda tipsen för denna match');
        } finally {
            setLoading(false);
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

    const getTeamDisplayName = (team?: { name: string }) => {
        return team?.name || 'TBD';
    };    const getBetDisplay = (bet: BetWithUser) => {
        const isGroupStage = match?.matchType === MatchType.GROUP;
        
        if (isGroupStage) {
            if (bet.homeScoreBet !== undefined && bet.awayScoreBet !== undefined) {
                return `${bet.homeScoreBet} - ${bet.awayScoreBet}`;
            }
        } else {
            if (bet.homeTeamId && bet.awayTeamId) {
                const homeTeam = teams.find(team => team.id === bet.homeTeamId);
                const awayTeam = teams.find(team => team.id === bet.awayTeamId);
                const homeTeamName = homeTeam?.name || `Lag ${bet.homeTeamId}`;
                const awayTeamName = awayTeam?.name || `Lag ${bet.awayTeamId}`;
                return `${homeTeamName} vs ${awayTeamName}`;
            }
        }
        return 'Inget tips';
    };

    const getPointsDisplay = (points?: number) => {
        if (points === undefined || points === null) {
            return <Chip label="Väntar" size="small" />;
        }
        if (points === 0) {
            return <Chip label="0 poäng" size="small" color="error" />;
        }
        if (points === 1) {
            return <Chip label="1 poäng" size="small" color="warning" />;
        }
        if (points === 3) {
            return <Chip label="3 poäng" size="small" color="success" />;
        }
        return <Chip label={`${points} poäng`} size="small" color="primary" />;
    };

    const getMatchTypeDisplay = (matchType: string) => {
        const types: Record<string, string> = {
            'GROUP': 'Gruppspel',
            'ROUND_OF_16': 'Åttondelsfinaler',
            'QUARTER_FINAL': 'Kvartsfinaler',
            'SEMI_FINAL': 'Semifinaler',
            'FINAL': 'Final'
        };
        return types[matchType] || matchType;
    };

    const getMatchResult = () => {
        if (match && match.homeScore !== null && match.awayScore !== null) {
            return `${match.homeScore} - ${match.awayScore}`;
        }
        return 'Ej spelad';
    };

    if (!match) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { minHeight: '60vh' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" component="div">
                            Tips för match
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {getTeamDisplayName(match.homeTeam)} vs {getTeamDisplayName(match.awayTeam)}
                        </Typography>
                    </Box>
                    <Button onClick={onClose} color="inherit">
                        <Close />
                    </Button>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                {/* Match Info */}
                <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                {getTeamDisplayName(match.homeTeam)}
                            </Typography>
                            <Box sx={{ textAlign: 'center' }}>
                                {match.homeScore !== null && match.awayScore !== null ? (
                                    <Typography variant="h5" color="primary">
                                        {match.homeScore} - {match.awayScore}
                                    </Typography>
                                ) : (
                                    <Typography variant="h6" color="text.secondary">
                                        vs
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    {getMatchResult()}
                                </Typography>
                            </Box>
                            <Typography variant="h6">
                                {getTeamDisplayName(match.awayTeam)}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                {formatDateTime(match.matchTime)}
                                {match.group && ` • Grupp ${match.group}`}
                            </Typography>
                            <Chip 
                                label={getMatchTypeDisplay(match.matchType)}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    </CardContent>
                </Card>

                <Divider sx={{ mb: 2 }} />

                {/* Bets List */}
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp />
                    Alla tips ({bets.length})
                </Typography>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && bets.length === 0 && (
                    <Alert severity="info">
                        Inga tips har lagts på denna match än.
                    </Alert>
                )}

                {!loading && !error && bets.length > 0 && (                    <Box>
                        {bets.map((bet) => (
                            <Card key={bet.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ py: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar 
                                            {...getAvatarProps(bet.userImageUrl, bet.userName)}
                                            sx={{ width: 40, height: 40 }}
                                        />
                                        
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {bet.userName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDateTime(bet.createdAt)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                {getBetDisplay(bet)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Tips
                                            </Typography>
                                        </Box>

                                        <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                                            {getPointsDisplay(bet.points)}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Stäng
                </Button>
            </DialogActions>
        </Dialog>
    );
};
