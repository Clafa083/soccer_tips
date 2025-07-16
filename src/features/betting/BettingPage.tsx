import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Container,
    Paper,
    Alert,
    CircularProgress,
    Button,
    Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { matchService } from '../../services/matchService';
import { betService } from '../../services/betService';
import { SystemConfigService } from '../../services/systemConfigService';
import { teamService } from '../../services/teamService';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTournamentInfo } from '../../hooks/useTournamentInfo';
import { Match, Bet, MatchType, Team } from '../../types/models';
import { BettingMatchCard } from '../../components/betting/BettingMatchCard';
import { KnockoutScoringConfigService, KnockoutScoringConfig } from '../../services/knockoutScoringConfigService';
import { getKnockoutLabel } from '../../utils/knockoutUtils';
import { KnockoutPredictionPage } from "../knockout/KnockoutPredictionPage";
import { SpecialBetsPage } from "./SpecialBetsPage";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`betting-tabpanel-${index}`}
            aria-labelledby={`betting-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function BettingPage() {
    usePageTitle('Mina Tips');
    const { tournamentTipName } = useTournamentInfo();
    const [currentTab, setCurrentTab] = useState(0);
    const [matches, setMatches] = useState<Match[]>([]);
    const [userBets, setUserBets] = useState<Bet[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bettingLocked, setBettingLocked] = useState(false);
    const [pendingBets, setPendingBets] = useState<Map<number, any>>(new Map());
    const [savingAll, setSavingAll] = useState(false);
    const [knockoutRounds, setKnockoutRounds] = useState<KnockoutScoringConfig[]>([]);

    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [matchesData, betsData, locked, teamsData, roundsData] = await Promise.all([
                matchService.getAllMatches(),
                betService.getUserBets(),
                SystemConfigService.isBettingLocked(),
                teamService.getAllTeams(),
                KnockoutScoringConfigService.getAllConfigs()
            ]);
            setMatches(matchesData);
            setBettingLocked(locked);
            setTeams(teamsData);
            setUserBets(betsData.map(betWithMatch => ({
                id: betWithMatch.id,
                user_id: betWithMatch.user_id,
                match_id: betWithMatch.match_id,
                home_score: betWithMatch.home_score,
                away_score: betWithMatch.away_score,
                home_team_id: betWithMatch.home_team_id,
                away_team_id: betWithMatch.away_team_id,
                points: betWithMatch.points,
                created_at: betWithMatch.created_at,
                updated_at: betWithMatch.updated_at
            })));
            setKnockoutRounds(roundsData.filter((r: KnockoutScoringConfig) => r.active));
            setError(null);
        } catch (err) {
            console.error('Error loading betting data:', err);
            setError('Failed to load betting data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };    const getUserBetForMatch = (matchId: number): Bet | undefined => {
        return userBets.find(bet => bet.match_id === matchId);
    };    const getPendingBetForMatch = (matchId: number): any => {
        return pendingBets.get(matchId);
    };

    // New function to handle pending bet changes without immediately saving
    const handleBetChange = (matchId: number, betData: any) => {
        setPendingBets(prev => {
            const newPending = new Map(prev);
            // Merge with existing pending data to preserve all fields
            const existingData = newPending.get(matchId) || {};
            newPending.set(matchId, { ...existingData, ...betData });
            return newPending;
        });
    };

    // Function to save all pending bets
    const handleSaveAllBets = async () => {
        if (bettingLocked || pendingBets.size === 0) {
            return;
        }

        setSavingAll(true);
        setError(null);

        try {
            // Save all pending bets in parallel
            const savePromises = Array.from(pendingBets.entries()).map(([matchId, betData]) =>
                betService.createOrUpdateBet({
                    match_id: matchId,
                    ...betData
                })
            );

            await Promise.all(savePromises);
            
            // Clear pending bets and reload data
            setPendingBets(new Map());
            await loadData();
        } catch (err) {
            console.error('Error saving all bets:', err);
            setError('Kunde inte spara alla tips');
        } finally {
            setSavingAll(false);
        }
    };

    const groupMatches = matches.filter(match => match.matchType === MatchType.GROUP);
    const knockoutMatches = matches.filter(match => match.matchType !== MatchType.GROUP);

    const groupsByLetter = groupMatches.reduce((acc, match) => {
        const group = match.group || 'Unknown';
        if (!acc[group]) acc[group] = [];
        acc[group].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

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
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
            >
                {tournamentTipName}
            </Typography>
            <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
                Tippa samtliga matcher. Du ska tippa resultatet på gruppspelsmatcher och även vilka lag som går vidare i slutspelets matcher.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {bettingLocked && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Tips är för tillfället låsta av administratören. Du kan inte lägga eller ändra dina tips.
                </Alert>
            )}

            {!bettingLocked && pendingBets.size > 0 && (
                <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                    <Chip 
                        label={`${pendingBets.size} osparade ändringar`} 
                        color="warning" 
                        size="medium"
                    />
                </Box>
            )}

            <Paper sx={{ width: '100%' }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange}
                    aria-label="betting tabs"
                    variant="fullWidth"
                    sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            minHeight: { xs: 40, sm: 48 }
                        }
                    }}
                >
                    <Tab label="Gruppspel" />
                    <Tab label="Slutspel" />
                    <Tab label="Slutspelsval" />
                    <Tab label="Special-tips" />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    {/* Gruppspel-tabben */}
                    {Object.keys(groupsByLetter).sort().map(group => (
                        <Box key={group} sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Typography 
                                variant="h6" 
                                gutterBottom
                                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                            >
                                Grupp {group}
                            </Typography>
                            {groupsByLetter[group]
                                .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
                                .map(match => (
                                    <BettingMatchCard
                                        key={match.id}
                                        match={match}
                                        userBet={getUserBetForMatch(match.id)}
                                        onBetChange={handleBetChange}
                                        bettingLocked={bettingLocked}
                                        hasPendingChanges={pendingBets.has(match.id)}
                                        availableTeams={teams}
                                        pendingBet={getPendingBetForMatch(match.id)}
                                    />
                                ))
                            }
                        </Box>
                    ))}
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    {/* Slutspel-tabben */}
                    {knockoutRounds.map(round => {
                        const stageMatches = knockoutMatches.filter(match => match.matchType === round.match_type);
                        if (stageMatches.length === 0) return null;
                        return (
                            <Box key={round.match_type} sx={{ mb: { xs: 3, sm: 4 } }}>
                                <Typography 
                                    variant="h6" 
                                    gutterBottom
                                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                >
                                    {getKnockoutLabel(round.match_type)}
                                </Typography>
                                {stageMatches
                                    .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
                                    .map(match => (
                                        <BettingMatchCard
                                            key={match.id}
                                            match={match}
                                            userBet={getUserBetForMatch(match.id)}
                                            onBetChange={handleBetChange}
                                            bettingLocked={bettingLocked}
                                            hasPendingChanges={pendingBets.has(match.id)}
                                            availableTeams={teams}
                                            pendingBet={getPendingBetForMatch(match.id)}
                                        />
                                    ))
                                }
                            </Box>
                        );
                    })}
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    {/* Slutspelsval-tabben */}
                    <KnockoutPredictionPage />
                </TabPanel>

                <TabPanel value={currentTab} index={3}>
                    {/* Special-tips-tabben */}
                    <SpecialBetsPage />
                </TabPanel>
            </Paper>

            {/* Sticky Save All Button - Improved for mobile */}
            {!bettingLocked && pendingBets.size > 0 && (
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAllBets}
                    disabled={savingAll}
                    sx={{ 
                        position: 'fixed',
                        bottom: { xs: 16, sm: 24 },
                        right: { xs: 16, sm: 24 },
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                        zIndex: 1000,
                        boxShadow: 3,
                        minWidth: { xs: 'auto', sm: 'auto' },
                        '&:hover': {
                            boxShadow: 6,
                        },
                        // Hide text on very small screens, show only icon and count
                        '@media (max-width: 400px)': {
                            '& .MuiButton-startIcon': {
                                marginRight: 0.5
                            }
                        }
                    }}
                >
                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {savingAll ? 'Sparar...' : `Spara alla tips (${pendingBets.size})`}
                    </Box>
                    <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>
                        {savingAll ? 'Sparar...' : `Spara (${pendingBets.size})`}
                    </Box>
                </Button>
            )}
        </Container>
    );
}