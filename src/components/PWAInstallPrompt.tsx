import { useState, useEffect } from 'react';
import { Button, Snackbar, Paper, Typography, Box, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);

            // Visa prompt efter en kort fördröjning (inte direkt vid sidladdning)
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            const dismissedTime = dismissed ? parseInt(dismissed) : 0;
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

            // Visa bara om användaren inte avfärdade inom senaste 24h
            if (!dismissed || dismissedTime < oneDayAgo) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Kolla om appen redan är installerad
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;

        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
            setInstallPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!installPrompt || !showPrompt) return null;

    return (
        <Snackbar
            open={showPrompt}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ mb: 2 }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 2,
                    maxWidth: 400
                }}
            >
                <GetAppIcon color="primary" sx={{ fontSize: 32 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        Installera appen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Lägg till på hemskärmen för snabbare åtkomst
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleInstall}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Installera
                </Button>
                <IconButton size="small" onClick={handleDismiss}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Snackbar>
    );
};
