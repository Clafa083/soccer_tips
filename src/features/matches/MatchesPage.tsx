import React, { useState } from 'react';
import { Box, Tabs, Tab, Container, Alert, CircularProgress } from '@mui/material';
import { MatchList } from '../../components/matches/MatchList';
import { MatchBetsDialog } from '../../components/matches/MatchBetsDialog';
import { MatchType, Match } from '../../types/models';
import { useMatches } from '../../hooks/useMatches';

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
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { matches: allMatches, loading, error } = useMatches();    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleMatchClick = (match: Match) => {
        setSelectedMatch(match);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedMatch(null);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">
                    Ett fel uppstod när matcherna skulle hämtas. Försök igen senare.
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
                <MatchList 
                    matches={allMatches} 
                    matchType={MatchType.GROUP}
                    onMatchClick={handleMatchClick}
                />
            </TabPanel>

            <TabPanel value={selectedTab} index={1}>
                <Box>
                    {knockoutStages.map(stage => (
                        <Box key={stage.type} sx={{ mb: 4 }}>
                            <MatchList
                                matches={allMatches}
                                matchType={stage.type}
                                onMatchClick={handleMatchClick}
                            />
                        </Box>
                    ))}
                </Box>
            </TabPanel>

            <TabPanel value={selectedTab} index={2}>
                <MatchList 
                    matches={allMatches}
                    onMatchClick={handleMatchClick}
                />
            </TabPanel>

            <MatchBetsDialog
                match={selectedMatch}
                open={dialogOpen}
                onClose={handleDialogClose}
            />
        </Container>
    );
};
