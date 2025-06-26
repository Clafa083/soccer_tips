import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { siteContentService } from '../../services/siteContentService';
import { SiteContent } from '../../types/models';

export const HomePage: React.FC = () => {
    const [welcomeContent, setWelcomeContent] = useState<SiteContent | null>(null);
    const [rulesContent, setRulesContent] = useState<SiteContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const renderContent = (content: SiteContent | null, fallback: React.ReactNode) => {
        if (!content) return fallback;
        
        if (content.content_type === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: content.content }} />;
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
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                gap: 4
            }}
        >
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Welcome Content */}
            {renderContent(
                welcomeContent,
                <>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Välkommen till VM-tipset 2026
                    </Typography>
                    <Typography variant="h5" color="text.secondary" paragraph>
                        Tippa matcherna i fotbolls-VM och tävla mot dina vänner!
                    </Typography>
                </>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                    variant="contained" 
                    size="large"
                    component={RouterLink}
                    to="/register"
                >
                    Skapa konto
                </Button>
                <Button 
                    variant="outlined" 
                    size="large"
                    component={RouterLink}
                    to="/login"
                >
                    Logga in
                </Button>
            </Box>

            {/* Rules Content */}
            {renderContent(
                rulesContent,
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Funktioner
                    </Typography>
                    <Typography paragraph>
                        ✓ Tippa alla matcher i gruppspelet<br />
                        ✓ Förutspå lagen i slutspelet<br />
                        ✓ Specialtips för extra poäng<br />
                        ✓ Tävla på resultattavlan<br />
                        ✓ Diskutera i forumet
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
