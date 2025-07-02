import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, Button, Box, Collapse, IconButton } from '@mui/material';
import { Close, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { tipsCompletionService, TipsCompletionStatus } from '../services/tipsCompletionService';

export const TipsCompletionAlert: React.FC = () => {
    const { state: { user } } = useApp();
    const navigate = useNavigate();
    const [tipsStatus, setTipsStatus] = useState<TipsCompletionStatus | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkTipsCompletion = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            // Kontrollera om vi redan har visat varningen i denna session
            const alertShownKey = `tips-alert-shown-${user.id}`;
            const alertAlreadyShown = sessionStorage.getItem(alertShownKey) === 'true';
            
            if (alertAlreadyShown) {
                setLoading(false);
                return;
            }

            try {
                const status = await tipsCompletionService.getTipsCompletionStatus(user.id);
                setTipsStatus(status);
                
                // Visa bara varningen om tips inte är kompletta
                if (!status.isComplete) {
                    setShowAlert(true);
                    // Markera att vi har visat varningen
                    sessionStorage.setItem(alertShownKey, 'true');
                }
            } catch (error) {
                console.error('Error checking tips completion:', error);
            } finally {
                setLoading(false);
            }
        };

        checkTipsCompletion();
    }, [user?.id]);

    const handleClose = () => {
        setShowAlert(false);
    };

    const handleGoToBetting = () => {
        navigate('/betting');
        setShowAlert(false);
    };

    const handleGoToSpecialBets = () => {
        navigate('/special-bets');
        setShowAlert(false);
    };

    if (loading || !tipsStatus || tipsStatus.isComplete || !showAlert) {
        return null;
    }

    const hasMissingMatchTips = tipsStatus.missingMatchTips > 0;
    const hasMissingSpecialTips = tipsStatus.missingSpecialTips > 0;

    return (
        <Collapse in={showAlert}>
            <Alert 
                severity="warning" 
                icon={<Warning />}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={handleClose}
                    >
                        <Close fontSize="inherit" />
                    </IconButton>
                }
                sx={{ mb: 2 }}
            >
                <AlertTitle>Dina tips är inte kompletta!</AlertTitle>
                <Box sx={{ mb: 1 }}>
                    {hasMissingMatchTips && (
                        <div>• Du saknar tips på <strong>{tipsStatus.missingMatchTips}</strong> matcher av totalt {tipsStatus.totalMatches}</div>
                    )}
                    {hasMissingSpecialTips && (
                        <div>• Du saknar <strong>{tipsStatus.missingSpecialTips}</strong> special-tips av totalt {tipsStatus.totalSpecialBets}</div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                        Kom ihåg att fylla i alla dina tips innan första matchen börjar!
                    </div>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {hasMissingMatchTips && (
                        <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={handleGoToBetting}
                            sx={{ minWidth: 'auto' }}
                        >
                            Gå till Tippa
                        </Button>
                    )}
                    {hasMissingSpecialTips && (
                        <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={handleGoToSpecialBets}
                            sx={{ minWidth: 'auto' }}
                        >
                            Gå till Special-tips
                        </Button>
                    )}
                </Box>
            </Alert>
        </Collapse>
    );
};
