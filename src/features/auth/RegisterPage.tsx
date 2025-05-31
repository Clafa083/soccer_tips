import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    Paper
} from '@mui/material';
import { authService } from '../../services/authService';
import { useApp } from '../../context/AppContext';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { dispatch } = useApp();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };    const validateForm = (): string => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            return 'Alla fält måste fyllas i';
        }
        
        if (!validateName(formData.name)) {
            return 'Namnet får endast innehålla bokstäver, mellanslag och bindestreck';
        }
        
        if (!validateEmail(formData.email)) {
            return 'Ogiltig e-postadress';
        }
        
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            return passwordErrors[0];
        }
        
        if (formData.password !== formData.confirmPassword) {
            return 'Lösenorden matchar inte';
        }
        
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { user } = await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            dispatch({ type: 'SET_USER', payload: user });
            navigate('/');
        } catch (err) {
            setError(err instanceof Error 
                ? err.message 
                : 'Ett fel uppstod vid registreringen. Försök igen.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Skapa konto
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Namn"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="E-postadress"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Lösenord"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Bekräfta lösenord"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Skapar konto...' : 'Skapa konto'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                {"Har du redan ett konto? Logga in"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};
