import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useTheme
} from '@mui/material';
import {
    Timeline as TimelineIcon,
    Close as CloseIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { leaderboardService } from '../../services/leaderboardService';

// Import types that are now defined in the service file
interface UserPointsHistory {
    id: number;
    name: string;
    username: string;
    image_url?: string;
    total_points: number;
    points_history: {
        match_id: number;
        points_earned: number;
        cumulative_points: number;
    }[];
}

interface MatchSummary {
    id: number;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
    date: string;
    display_name: string;
}

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface PointsHistoryChartProps {
    open: boolean;
    onClose: () => void;
}

export function PointsHistoryChart({ open, onClose }: PointsHistoryChartProps) {
    const theme = useTheme();
    const [users, setUsers] = useState<UserPointsHistory[]>([]);
    const [matches, setMatches] = useState<MatchSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const data = await leaderboardService.getPointsHistory();
                    setUsers(data.users);
                    setMatches(data.matches);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Ett fel uppstod');
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [open]);

    // Colors for different users
    const colors = [
        '#FF6B6B', // Coral red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#96CEB4', // Mint green
        '#FFEAA7'  // Light yellow
    ];

    // Prepare chart data
    const chartData = {
        labels: matches.map(match => match.display_name),
        datasets: users.map((user, index) => ({
            label: user.name,
            data: user.points_history.map(point => point.cumulative_points),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.2,
            fill: false
        }))
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: theme.palette.text.primary
                }
            },
            title: {
                display: true,
                text: 'Poängresa - Top 5 Spelare',
                color: theme.palette.text.primary,
                font: {
                    size: 18,
                    weight: 'bold' as const
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                callbacks: {
                    afterBody: function(tooltipItems: TooltipItem<'line'>[]) {
                        if (tooltipItems.length > 0) {
                            const firstItem = tooltipItems[0];
                            const matchIndex = firstItem.dataIndex;
                            const match = matches[matchIndex];
                            
                            if (match) {
                                return [`Match: ${match.home_team} ${match.home_score}-${match.away_score} ${match.away_team}`,
                                       `Datum: ${new Date(match.date).toLocaleDateString('sv-SE')}`];
                            }
                        }
                        return [];
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Matcher',
                    color: theme.palette.text.primary
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    color: theme.palette.divider + '40'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Ackumulerade Poäng',
                    color: theme.palette.text.primary
                },
                ticks: {
                    color: theme.palette.text.secondary
                },
                grid: {
                    color: theme.palette.divider + '40'
                },
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                        <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Poänghistorik - Top 5</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {users.length > 0 && (
                    <>
                        {/* User stats cards */}
                        <Box 
                            sx={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 2,
                                mb: 3
                            }}
                        >
                            {users.map((user, index) => (
                                <Card key={user.id} sx={{ 
                                    border: `2px solid ${colors[index % colors.length]}`,
                                    backgroundColor: colors[index % colors.length] + '10'
                                }}>
                                    <CardContent sx={{ pb: '16px !important' }}>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <Avatar 
                                                src={user.image_url}
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32, 
                                                    mr: 1,
                                                    backgroundColor: colors[index % colors.length]
                                                }}
                                            >
                                                {user.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {user.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    #{index + 1}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip 
                                            icon={<TrendingUpIcon />}
                                            label={`${user.total_points} poäng`}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: colors[index % colors.length],
                                                color: 'white'
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        {/* Chart */}
                        <Paper elevation={2} sx={{ p: 2, height: '500px' }}>
                            <Line data={chartData} options={chartOptions} />
                        </Paper>

                        {/* Info text */}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                            Diagrammet visar hur poängen har utvecklats för de fem bästa spelarna genom turneringen.
                            Hovra över punkterna för att se matchdetaljer.
                        </Typography>
                    </>
                )}

                {users.length === 0 && !loading && (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary">
                            Ingen data tillgänglig ännu. Vänta tills fler matcher har spelats.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Stäng</Button>
            </DialogActions>
        </Dialog>
    );
}
