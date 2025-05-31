import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const HomePage: React.FC = () => {
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
            <Typography variant="h2" component="h1" gutterBottom>
                Välkommen till VM-tipset 2026
            </Typography>
            
            <Typography variant="h5" color="text.secondary" paragraph>
                Tippa matcherna i fotbolls-VM och tävla mot dina vänner!
            </Typography>

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

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Funktioner
                </Typography>
                <Typography paragraph>
                    ✓ Tippa alla matcher i gruppspelet<br />
                    ✓ Förutspå lagen i slutspelet<br />
                    ✓ Specialtips för extra poäng<br />
                    ✓ Diskutera med andra i forumet<br />
                    ✓ Se live-uppdaterad resultattavla
                </Typography>
            </Box>
        </Box>
    );
};
