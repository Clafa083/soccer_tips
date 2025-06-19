import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Person as PersonIcon,
    SportsSoccer as SoccerIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { leaderboardService } from '../../services/leaderboardService';

interface LeaderboardEntry {
    id: number;
    username: string;
    name: string;
    email: string;
    image_url?: string;
    total_points: number;
    total_bets: number;
    rank: number;
    created_at: string;
}

interface LeaderboardStats {
    totalUsers: number;
    totalBets: number;
    averagePoints: number;
    topScorer: LeaderboardEntry | null;
}

export function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [stats, setStats] = useState<LeaderboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                  const [leaderboardData, statsData] = await Promise.all([
                    leaderboardService.getLeaderboard(),
                    leaderboardService.getLeaderboardStats()
                ]);
                
                setLeaderboard(leaderboardData);
                setStats(statsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ett fel uppstod');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700'; // Guld
            case 2: return '#C0C0C0'; // Silver
            case 3: return '#CD7F32'; // Brons
            default: return 'text.secondary';
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank <= 3) {
            return <TrophyIcon sx={{ color: getRankColor(rank), fontSize: 20 }} />;
        }
        return rank;
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <TrophyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                    Resultattavla
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {stats && (
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr 1fr'
                    },
                    gap: 3,
                    mb: 4
                }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.totalUsers}
                            </Typography>
                            <Typography color="text.secondary">
                                Deltagare
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SoccerIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.totalBets}
                            </Typography>
                            <Typography color="text.secondary">
                                Totalt tips
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <StarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.averagePoints.toFixed(1)}
                            </Typography>
                            <Typography color="text.secondary">
                                Snitt poäng
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrophyIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
                            <Typography variant="h4" component="div">
                                {stats.topScorer?.total_points || 0}
                            </Typography>
                            <Typography color="text.secondary">
                                Högsta poäng
                            </Typography>
                            {stats.topScorer && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {stats.topScorer.name}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}

            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Plats</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Spelare</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Poäng</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Antal tips</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Medlem sedan</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Inga resultat hittades än
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaderboard.map((entry) => (
                                    <TableRow 
                                        key={entry.id}
                                        sx={{ 
                                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                            ...(entry.rank <= 3 && {
                                                backgroundColor: `${getRankColor(entry.rank)}20`,
                                                fontWeight: 'bold'
                                            })
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {getRankIcon(entry.rank)}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar 
                                                    src={entry.image_url}
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32, 
                                                        mr: 2,
                                                        fontSize: 14 
                                                    }}
                                                >
                                                    {entry.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                        {entry.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        @{entry.username}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={entry.total_points}
                                                color={entry.rank <= 3 ? 'primary' : 'default'}
                                                variant={entry.rank <= 3 ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>
                                                {entry.total_bets}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(entry.created_at).toLocaleDateString('sv-SE')}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {leaderboard.length > 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Visar {leaderboard.length} deltagare
                    </Typography>
                </Box>
            )}        </Container>
    );
}
