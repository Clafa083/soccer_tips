import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab, Container, Alert, CircularProgress, Typography } from '@mui/material';
import { MatchTable } from '../../components/matches/MatchTable';
import { MatchType } from '../../types/models';
import { useMatches } from '../../hooks/useMatches';
import { usePageTitle } from '../../hooks/usePageTitle';
import { KnockoutScoringConfigService } from '../../services/knockoutScoringConfigService';
import { getKnockoutLabel } from '../../utils/knockoutUtils';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

const knockoutStages = [
    { type: MatchType.ROUND_OF_16, title: 'Åttondelsfinaler' },
    { type: MatchType.QUARTER_FINAL, title: 'Kvartsfinaler' },
    { type: MatchType.SEMI_FINAL, title: 'Semifinaler' },
    { type: MatchType.FINAL, title: 'Final' }
];

export const MatchesPage: React.FC = () => {
    usePageTitle('Matcher');
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState(() => {
        return location.state && typeof location.state.tab === 'number' ? location.state.tab : 0;
    });
    const navigate = useNavigate();
    const { matches: allMatches, loading, error } = useMatches();
    const [activeKnockoutStages, setActiveKnockoutStages] = useState<{ type: MatchType, title: string }[]>([]);

    useEffect(() => {
        KnockoutScoringConfigService.getAllConfigs().then(configs => {
            const activeTypes = configs.filter(cfg => cfg.active).map(cfg => cfg.match_type as MatchType);
            setActiveKnockoutStages(
                knockoutStages.filter(stage => activeTypes.includes(stage.type))
                    .map(stage => ({ type: stage.type, title: getKnockoutLabel(stage.type) }))
            );
        });
    }, []);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleMatchClick = (match: any) => {
        navigate(`/match/${match.id}`, { state: { tab: selectedTab } });
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Ett fel uppstod när matcherna skulle hämtas: {error.message}
                    <br />
                    <small>Försök igen senare eller kontakta support om problemet kvarstår.</small>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Gruppspel" />
                    <Tab label="Slutspel" />
                    <Tab label="Alla matcher" />
                </Tabs>
            </Box>            <TabPanel value={selectedTab} index={0}>
                <MatchTable 
                    matches={allMatches} 
                    matchType={MatchType.GROUP}
                    onMatchClick={handleMatchClick}
                />
            </TabPanel>

            <TabPanel value={selectedTab} index={1}>
                <Box>
                    {activeKnockoutStages.map(stage => (
                        <Box key={stage.type} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {stage.title}
                            </Typography>
                            <MatchTable
                                matches={allMatches}
                                matchType={stage.type}
                                onMatchClick={handleMatchClick}
                            />
                        </Box>
                    ))}
                </Box>
            </TabPanel>

            <TabPanel value={selectedTab} index={2}>
                <MatchTable 
                    matches={allMatches}
                    onMatchClick={handleMatchClick}
                />
            </TabPanel>
        </Container>
    );
};
