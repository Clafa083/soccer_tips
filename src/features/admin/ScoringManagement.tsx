import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    LinearProgress
} from '@mui/material';
import { Calculate, Leaderboard, TrendingUp } from '@mui/icons-material';
import { adminService } from '../../services/adminService';

interface BettingStats {
    totalUsers: number;
    totalMatches: number;
    totalBets: number;
    finishedMatches: number;
    averagePoints: number;
    topScorer: {
        name: string;
        totalPoints: number;
    } | null;
}

interface LeaderboardEntry {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
    createdAt: Date;
    totalPoints: number;
    totalBets: number;
}

export function ScoringManagement() {
    const [stats, setStats] = useState<BettingStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, leaderboardData] = await Promise.all([
                adminService.getBettingStats(),
                adminService.getLeaderboard()
            ]);
            setStats(statsData);
            setLeaderboard(leaderboardData);
            setError(null);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Kunde inte ladda data');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculatePoints = async () => {
        try {
            setCalculating(true);
            setError(null);
            setSuccessMessage(null);
            
            const result = await adminService.calculateAllPoints();
            setSuccessMessage(
                `Poängberäkning klar! Uppdaterade ${result.updatedBets} tips baserat på ${result.finishedMatches} avslutade matcher.`
            );
            
            // Reload data to show updated points
            await loadData();
        } catch (err) {
            console.error('Error calculating points:', err);
            setError('Kunde inte beräkna poäng');
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return <Typography>Laddar statistik...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Poänghantering</Typography>
                <Button
                    variant="contained"
                    startIcon={<Calculate />}
                    onClick={handleCalculatePoints}
                    disabled={calculating}
                    color="primary"
                >
                    {calculating ? 'Beräknar...' : 'Beräkna alla poäng'}
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
                Beräkna poäng för alla tips baserat på matchresultat. Gruppspel: 3p för exakt resultat, 1p för rätt utgång.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {successMessage}
                </Alert>
            )}

            {calculating && (
                <Box sx={{ mb: 3 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Beräknar poäng för alla tips...
                    </Typography>
                </Box>
            )}

            {stats && (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp color="primary" />
                                <Typography variant="h6">
                                    {stats.totalUsers}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Registrerade användare
                            </Typography>
                        </CardContent>
                    </Card>
                    
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="h6">
                                {stats.finishedMatches}/{stats.totalMatches}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avslutade matcher
                            </Typography>
                        </CardContent>
                    </Card>
                    
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="h6">
                                {stats.totalBets}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Totalt antal tips
                            </Typography>
                        </CardContent>
                    </Card>
                    
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="h6">
                                {stats.averagePoints?.toFixed(1) || '0.0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Genomsnittlig poäng per tips
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
            )}

            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Leaderboard />
                    <Typography variant="h6">
                        Leaderboard (Top 10)
                    </Typography>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width="60px">Plats</TableCell>
                                <TableCell>Användare</TableCell>
                                <TableCell align="center">Tips</TableCell>
                                <TableCell align="center">Poäng</TableCell>
                                <TableCell align="center">Poäng/tips</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.slice(0, 10).map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                        <Typography 
                                            variant="h6" 
                                            color={index < 3 ? 'primary' : 'text.secondary'}
                                        >
                                            #{index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar 
                                                src={entry.imageUrl} 
                                                sx={{ width: 32, height: 32 }}
                                            >
                                                {entry.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {entry.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {entry.totalBets}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography 
                                            variant="body1" 
                                            fontWeight="bold"
                                            color={index < 3 ? 'primary' : 'text.primary'}
                                        >
                                            {entry.totalPoints}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            {entry.totalBets > 0 
                                                ? (entry.totalPoints / entry.totalBets).toFixed(1)
                                                : '0.0'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {leaderboard.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary">
                                            Inga användare med poäng än
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}