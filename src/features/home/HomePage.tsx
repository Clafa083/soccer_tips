import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Alert, CircularProgress, Paper, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { siteContentService } from '../../services/siteContentService';
import { useTournamentInfo } from '../../hooks/useTournamentInfo';
import { usePageTitle } from '../../hooks/usePageTitle';
import { SiteContent } from '../../types/models';

export const HomePage: React.FC = () => {
    const [welcomeContent, setWelcomeContent] = useState<SiteContent | null>(null);
    const [rulesContent, setRulesContent] = useState<SiteContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { tournamentInfo, tournamentTipName } = useTournamentInfo();
    usePageTitle();

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            setLoading(true);
            const [welcome, rules] = await Promise.all([
                siteContentService.getContentByKey('homepage_welcome').catch(() => null),
                siteContentService.getContentByKey('homepage_rules').catch(() => null)
            ]);
            setWelcomeContent(welcome);
            setRulesContent(rules);
            setError(null);
        } catch (err) {
            console.error('Error loading content:', err);
            setError('Kunde inte ladda sidinnehåll');
        } finally {
            setLoading(false);
        }
    };

    const markdownStyles = {
        '& h1': { fontSize: '1.75rem', fontWeight: 700, mb: 2, mt: 0 },
        '& h2': { fontSize: '1.4rem', fontWeight: 600, mb: 1.5, mt: 2 },
        '& h3': { fontSize: '1.15rem', fontWeight: 600, mb: 1 },
        '& p': { mb: 1.5, lineHeight: 1.7 },
        '& ul, & ol': { pl: 3, mb: 1.5 },
        '& li': { mb: 0.5 },
        '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
        '& strong': { fontWeight: 600 },
        '& code': { backgroundColor: 'grey.100', px: 0.5, py: 0.25, borderRadius: 0.5, fontSize: '0.9em' },
        '& pre': { backgroundColor: 'grey.100', p: 2, borderRadius: 1, overflow: 'auto' },
        '& blockquote': { borderLeft: 4, borderColor: 'primary.main', pl: 2, ml: 0, fontStyle: 'italic', color: 'text.secondary' }
    };

    const renderContent = (content: SiteContent | null, fallback: React.ReactNode) => {
        if (!content) return fallback;

        if (content.content_type === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: content.content }} />;
        }
        if (content.content_type === 'markdown') {
            return (
                <Box sx={markdownStyles}>
                    <ReactMarkdown>{content.content}</ReactMarkdown>
                </Box>
            );
        }
        return <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>{content.content}</Typography>;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 2 }}>
                {error && (
                    <Alert severity="error">{error}</Alert>
                )}

                {/* Hero Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        textAlign: 'center',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}10 100%)`,
                        borderRadius: 3,
                        border: 1,
                        borderColor: 'primary.light'
                    }}
                >
                    <SportsSoccerIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

                    {welcomeContent ? (
                        renderContent(welcomeContent, null)
                    ) : (
                        <>
                            <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
                                Välkommen till {tournamentInfo ? `${tournamentInfo.name} ${tournamentInfo.year}` : tournamentTipName}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 400 }}>
                                {tournamentInfo?.description || `Tippa matcherna och tävla mot dina vänner!`}
                            </Typography>
                        </>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            to="/register"
                            sx={{ px: 4, py: 1.5, fontWeight: 600 }}
                        >
                            Skapa konto
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            component={RouterLink}
                            to="/login"
                            sx={{ px: 4, py: 1.5, fontWeight: 600 }}
                        >
                            Logga in
                        </Button>
                    </Box>
                </Paper>

                {/* Rules/Info Section */}
                {(rulesContent || !welcomeContent) && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider',
                            textAlign: 'left'
                        }}
                    >
                        {renderContent(
                            rulesContent,
                            <Box>
                                <Typography variant="h5" fontWeight={600} gutterBottom>
                                    Funktioner
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, '& li': { mb: 1, color: 'text.secondary' } }}>
                                    <li>Tippa alla matcher i gruppspelet</li>
                                    <li>Förutspå lagen i slutspelet</li>
                                    <li>Specialtips för extra poäng</li>
                                    <li>Tävla på resultattavlan</li>
                                    <li>Diskutera i forumet</li>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                )}
            </Box>
        </Container>
    );
};
