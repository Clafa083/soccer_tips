import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Avatar,
    Alert,    CircularProgress,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Stack
} from '@mui/material';
import {
    Person as PersonIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Visibility,
    VisibilityOff,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';

interface ProfileFormData {
    name: string;
    username: string;
    email: string;
    image_url: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
}

export function ProfilePage() {
    const { state, dispatch } = useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    const [formData, setFormData] = useState<ProfileFormData>({
        name: '',
        username: '',
        email: '',
        image_url: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (state.user) {
            setFormData(prev => ({
                ...prev,
                name: state.user?.name || '',
                username: state.user?.username || '',
                email: state.user?.email || '',
                image_url: state.user?.image_url || ''
            }));
        }
    }, [state.user]);

    const handleInputChange = (field: keyof ProfileFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleProfileUpdate = async () => {
        if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
            setError('Namn, användarnamn och e-post krävs');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Ange en giltig e-postadress');
            return;
        }

        try {
            setLoading(true);            const updateData = {
                name: formData.name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim()
            };

            const response = await authService.updateProfile(updateData);
            
            dispatch({ type: 'SET_USER', payload: response.user });
            
            setSuccess('Profil uppdaterad!');
            setEditingProfile(false);
            setError(null);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Kunde inte uppdatera profilen');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!formData.current_password || !formData.new_password) {
            setError('Nuvarande och nytt lösenord krävs');
            return;
        }

        if (formData.new_password.length < 6) {
            setError('Nytt lösenord måste vara minst 6 tecken');
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            setError('Nya lösenord matchar inte');
            return;
        }

        try {
            setLoading(true);
            await authService.updateProfile({
                current_password: formData.current_password,
                new_password: formData.new_password
            });
            
            setSuccess('Lösenord uppdaterat!');
            setEditingPassword(false);
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_password: ''
            }));
            setError(null);
        } catch (err: any) {
            console.error('Error updating password:', err);
            setError(err.message || 'Kunde inte uppdatera lösenordet');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        if (state.user) {
            setFormData(prev => ({
                ...prev,
                name: state.user?.name || '',
                username: state.user?.username || '',
                email: state.user?.email || '',
                image_url: state.user?.image_url || ''
            }));
        }
        setEditingProfile(false);
        setError(null);
        setSuccess(null);
    };

    const handleCancelPasswordEdit = () => {
        setFormData(prev => ({
            ...prev,
            current_password: '',
            new_password: '',
            confirm_password: ''
        }));
        setEditingPassword(false);
        setError(null);
        setSuccess(null);
    };    const formatDate = (dateString: string | undefined) => {
        if (!dateString) {
            return 'Okänt datum';
        }
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Okänt datum';
            }
            
            return date.toLocaleDateString('sv-SE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Okänt datum';
        }
    };    // Image handling functions
    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Vänligen välj en bildfil');
            return;
        }

        // Validate file size (max 10MB for original)
        if (file.size > 10 * 1024 * 1024) {
            setError('Bilden får max vara 10MB stor');
            return;
        }

        try {
            setError(null);
            
            // Compress image before setting it
            const compressedFile = await compressImage(file);
            setSelectedImage(compressedFile);
            
            // Create preview from compressed file
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(compressedFile);
            
        } catch (error) {
            console.error('Error compressing image:', error);
            setError('Kunde inte bearbeta bilden. Försök med en annan bild.');
        }
    };    const handleImageUpload = async () => {
        if (!selectedImage || !state.user) return;

        try {
            setUploadingImage(true);
            setError(null);

            // Convert image to base64
            const base64 = await convertToBase64(selectedImage);
            console.log('Image size after compression:', selectedImage.size);
            console.log('Base64 length:', base64.length);
            
            // Update profile with base64 image
            const updateData = {
                name: state.user.name,
                username: state.user.username,
                email: state.user.email,
                image_url: base64
            };

            const response = await authService.updateProfile(updateData);
            dispatch({ type: 'SET_USER', payload: response.user });
            
            setSuccess('Profilbild uppdaterad!');
            setSelectedImage(null);
            setImagePreview(null);
        } catch (err: any) {
            console.error('Error uploading image:', err);
            setError(err.message || 'Kunde inte ladda upp bilden');
        } finally {
            setUploadingImage(false);
        }
    };const handleRemoveImage = async () => {
        if (!state.user) return;

        try {
            setUploadingImage(true);
            setError(null);

            const updateData = {
                name: state.user.name,
                username: state.user.username,
                email: state.user.email,
                image_url: ''
            };

            const response = await authService.updateProfile(updateData);
            dispatch({ type: 'SET_USER', payload: response.user });
            
            setSuccess('Profilbild borttagen!');
            setSelectedImage(null);
            setImagePreview(null);
        } catch (err: any) {
            console.error('Error removing image:', err);
            setError(err.message || 'Kunde inte ta bort bilden');
        } finally {
            setUploadingImage(false);
        }
    };    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width *= maxWidth / height;
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Kunde inte komprimera bilden'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Kunde inte ladda bilden'));
            img.src = URL.createObjectURL(file);
        });
    };

    if (!state.user) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    Du måste vara inloggad för att komma åt din profil.
                </Alert>
            </Container>
        );
    }

    // Additional safety check for incomplete user data
    if (!state.user.name || !state.user.username || !state.user.email) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Laddar profildata...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                    Min Profil
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Profile Information Card */}
                <Box sx={{ flex: 2 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" component="h2">
                                    Profilinformation
                                </Typography>
                                {!editingProfile && (
                                    <IconButton onClick={() => setEditingProfile(true)}>
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </Box>

                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Namn"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    disabled={!editingProfile}
                                    variant={editingProfile ? 'outlined' : 'filled'}
                                />
                                <TextField
                                    fullWidth
                                    label="Användarnamn"
                                    value={formData.username}
                                    onChange={handleInputChange('username')}
                                    disabled={!editingProfile}
                                    variant={editingProfile ? 'outlined' : 'filled'}
                                />                                <TextField
                                    fullWidth
                                    label="E-post"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    disabled={!editingProfile}
                                    variant={editingProfile ? 'outlined' : 'filled'}
                                />
                            </Stack>

                            {editingProfile && (
                                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                        onClick={handleProfileUpdate}
                                        disabled={loading}
                                    >
                                        {loading ? 'Sparar...' : 'Spara ändringar'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancelEdit}
                                        disabled={loading}
                                    >
                                        Avbryt
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>                {/* Profile Picture and Info Card */}
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            {/* Profile Picture with Upload */}
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                <Avatar
                                    src={imagePreview || state.user.image_url || formData.image_url}
                                    sx={{ 
                                        width: 120, 
                                        height: 120, 
                                        mx: 'auto',
                                        fontSize: '3rem'
                                    }}
                                >
                                    {state.user.name?.charAt(0)?.toUpperCase() || '?'}
                                </Avatar>
                                
                                {/* Upload Button */}
                                <IconButton
                                    component="label"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        width: 40,
                                        height: 40,
                                        '&:hover': {
                                            bgcolor: 'primary.dark'
                                        }
                                    }}
                                    disabled={uploadingImage}
                                >
                                    {uploadingImage ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
                                    <input
                                        hidden
                                        accept="image/*"
                                        type="file"
                                        onChange={handleImageSelect}
                                    />
                                </IconButton>
                            </Box>

                            {/* Image Preview Actions */}
                            {selectedImage && (
                                <Box sx={{ mb: 2 }}>
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleImageUpload}
                                            disabled={uploadingImage}
                                            startIcon={uploadingImage ? <CircularProgress size={16} /> : <SaveIcon />}
                                        >
                                            {uploadingImage ? 'Laddar upp...' : 'Spara bild'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                            }}
                                            disabled={uploadingImage}
                                        >
                                            Avbryt
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            {/* Remove Image Button */}
                            {state.user.image_url && !selectedImage && (
                                <Box sx={{ mb: 2 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={handleRemoveImage}
                                        disabled={uploadingImage}
                                        startIcon={<DeleteIcon />}
                                    >
                                        Ta bort bild
                                    </Button>
                                </Box>
                            )}

                            <Typography variant="h6" gutterBottom>
                                {state.user.name || 'Okänt namn'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                @{state.user.username || 'okänt'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {state.user.role === 'admin' ? 'Administratör' : 'Användare'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Medlem sedan {formatDate(state.user.created_at)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Password Change Card */}
            <Box sx={{ mt: 3 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" component="h2">
                                Ändra lösenord
                            </Typography>
                            {!editingPassword && (
                                <IconButton onClick={() => setEditingPassword(true)}>
                                    <EditIcon />
                                </IconButton>
                            )}
                        </Box>                        {editingPassword ? (
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Nuvarande lösenord"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={formData.current_password}
                                    onChange={handleInputChange('current_password')}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    edge="end"
                                                >
                                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                                    <TextField
                                        fullWidth
                                        label="Nytt lösenord"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={formData.new_password}
                                        onChange={handleInputChange('new_password')}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        edge="end"
                                                    >
                                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Bekräfta nytt lösenord"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirm_password}
                                        onChange={handleInputChange('confirm_password')}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                        onClick={handlePasswordUpdate}
                                        disabled={loading}
                                    >
                                        {loading ? 'Uppdaterar...' : 'Uppdatera lösenord'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancelPasswordEdit}
                                        disabled={loading}
                                    >
                                        Avbryt
                                    </Button>
                                </Box>
                            </Stack>
                        ) : (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Klicka på redigera-ikonen för att ändra ditt lösenord.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Glömt ditt lösenord? Du kan{' '}
                                    <Button
                                        component="a"
                                        href="/forgot-password"
                                        variant="text"
                                        size="small"
                                        sx={{ p: 0, textTransform: 'none', textDecoration: 'underline' }}
                                    >
                                        återställa det här
                                    </Button>
                                    .
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
