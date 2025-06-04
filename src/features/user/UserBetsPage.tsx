import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Card,
    CardContent,
    Avatar,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { ArrowBack, TrendingUp, Check, Close, Remove } from '@mui/icons-material';
import { betService } from '../../services/betService';
import { getAvatarProps } from '../../utils/avatarUtils';

interface UserBetWithMatch {
    id: number;
    userId: number;
    matchId: number;
    homeScoreBet?: number;
    awayScoreBet?: number;
    homeTeamId?: number;
    awayTeamId?: number;
    points?: number;
    createdAt: Date;    updatedAt: Date;
    userName: string;
    userImageUrl?: string;
    match: {
        id: number;
        matchTime: Date;
        matchType: string;
        group?: string;
        homeScore?: number;
        awayScore?: number;
        homeTeam?: {
            id: number;
            name: string;
            flag?: string;
        };
        awayTeam?: {
            id: number;
            name: string;
            flag?: string;
        };
    };
}

export function UserBetsPage() {
    const { userId } = useParams<{ userId: string }>();
    const [userBets, setUserBets] = useState<UserBetWithMatch[]>([]);
    const [loading, setLoading] = useState(true);    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [userImageUrl, setUserImageUrl] = useState<string>('');

    useEffect(() => {
        if (userId) {
            loadUserBets(parseInt(userId));
        }
    }, [userId]);

    const loadUserBets = async (id: number) => {
        try {
            setLoading(true);
            const bets = await betService.getUserBetsById(id);            setUserBets(bets);
            if (bets.length > 0) {
                setUserName(bets[0].userName);
                setUserImageUrl(bets[0].userImageUrl || '');
            }
            setError(null);
        } catch (err) {
            console.error('Error loading user bets:', err);
            setError('Kunde inte ladda användarens tips');
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
    };

    const getMatchResult = (match: BetWithMatch['match']) => {
        if (match.homeScore !== null && match.awayScore !== null) {
            return `${match.homeScore} - ${match.awayScore}`;
        }
        return 'Ej spelad';
    };

    const getBetDisplay = (bet: BetWithMatch) => {
        if (bet.homeScoreBet !== undefined && bet.awayScoreBet !== undefined) {
            return `${bet.homeScoreBet} - ${bet.awayScoreBet}`;
        }
        if (bet.homeTeamId && bet.awayTeamId) {
            return `Lag ${bet.homeTeamId} vs Lag ${bet.awayTeamId}`;
        }
        return 'Inget tips';
    };

    const getPointsDisplay = (points?: number) => {
        if (points === undefined || points === null) {
            return <Chip label="Väntar" size="small" />;
        }
        if (points === 0) {
            return <Chip label="0 poäng" size="small" color="error" icon={<Close />} />;
        }
        if (points === 1) {
            return <Chip label="1 poäng" size="small" color="warning" icon={<Remove />} />;
        }
        if (points === 3) {
            return <Chip label="3 poäng" size="small" color="success" icon={<Check />} />;
        }
        return <Chip label={`${points} poäng`} size="small" color="primary" />;
    };

    const getTotalPoints = () => {
        return userBets.reduce((total, bet) => total + (bet.points || 0), 0);
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

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    component={RouterLink}
                    to="/leaderboard"
                    startIcon={<ArrowBack />}
                    variant="outlined"
                >
                    Tillbaka till resultattavlan
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                component={RouterLink}
                to="/leaderboard"
                startIcon={<ArrowBack />}
                variant="outlined"
                sx={{ mb: 3 }}
            >
                Tillbaka till resultattavlan
            </Button>

            {/* User Header */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Stack direction="row" spacing={3} alignItems="center">                        <Avatar 
                            {...getAvatarProps(userImageUrl, userName)}
                            sx={{ width: 80, height: 80, fontSize: '32px' }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" gutterBottom>
                                {userName}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Chip 
                                    icon={<TrendingUp />}
                                    label={`${getTotalPoints()} poäng totalt`}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip 
                                    label={`${userBets.length} tips`}
                                    variant="outlined"
                                />
                                <Chip 
                                    label={`${userBets.filter(bet => bet.points !== null && bet.points !== undefined).length} avslutade`}
                                    variant="outlined"
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Bets Table */}
            <Typography variant="h5" sx={{ mb: 3 }}>
                Alla tips
            </Typography>

            {userBets.length === 0 ? (
                <Alert severity="info">
                    Denna användare har inte lagt några tips än.
                </Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Match</TableCell>
                                <TableCell>Typ</TableCell>
                                <TableCell>Datum</TableCell>
                                <TableCell align="center">Tips</TableCell>
                                <TableCell align="center">Resultat</TableCell>
                                <TableCell align="center">Poäng</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userBets
                                .sort((a, b) => new Date(a.match.matchTime).getTime() - new Date(b.match.matchTime).getTime())
                                .map((bet) => (
                                <TableRow 
                                    key={bet.id}
                                    sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                                >
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {getTeamDisplayName(bet.match.homeTeam)} vs {getTeamDisplayName(bet.match.awayTeam)}
                                            </Typography>
                                            {bet.match.group && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Grupp {bet.match.group}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {getMatchTypeDisplay(bet.match.matchType)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDateTime(bet.match.matchTime)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" fontWeight="bold">
                                            {getBetDisplay(bet)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {getMatchResult(bet.match)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {getPointsDisplay(bet.points)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
