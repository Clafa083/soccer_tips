import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Fab,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import { 
    Add as AddIcon, 
    Forum as ForumIcon, 
    Reply as ReplyIcon,
    MoreVert as MoreVertIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { forumService } from '../../services/forumService';
import { useApp } from '../../context/AppContext';

interface ForumPost {
    id: number;
    title: string;
    content: string;
    user_id: number;
    username: string;
    image_url?: string;
    reply_count: number;
    created_at: string;
    updated_at: string;
}

export function ForumPage() {
    const navigate = useNavigate();
    const { state } = useApp();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    const isLoggedIn = state.isAuthenticated;
    const isAdmin = state.user?.role === 'admin';

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const postsData = await forumService.getAllPosts();
            setPosts(postsData);
            setError(null);
        } catch (err: any) {
            console.error('Error loading forum posts:', err);
            setError(err.message || 'Failed to load forum posts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Titel och innehåll krävs');
            return;
        }

        try {
            setSubmitting(true);
            await forumService.createPost({
                title: formData.title.trim(),
                content: formData.content.trim()
            });
            
            setFormData({ title: '', content: '' });
            setDialogOpen(false);
            await loadPosts();
            setError(null);
        } catch (err: any) {
            console.error('Error creating post:', err);
            setError(err.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };    const handleDialogClose = () => {
        setDialogOpen(false);
        setFormData({ title: '', content: '' });
        setError(null);
    };

    const handlePostClick = (postId: number) => {
        navigate(`/forum/${postId}`);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: number) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedPostId(postId);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedPostId(null);
    };

    const handleDeletePost = async () => {
        if (!selectedPostId) return;

        try {
            await forumService.deletePost(selectedPostId);
            await loadPosts();
            setError(null);
        } catch (err: any) {
            console.error('Error deleting post:', err);
            setError(err.message || 'Kunde inte ta bort inlägget');
        }
        handleMenuClose();
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ForumIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Forum
                    </Typography>
                </Box>
                
                {/* Create Post Button for larger screens - Only show if logged in */}
                {isLoggedIn && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                        sx={{ 
                            display: { xs: 'none', sm: 'flex' },
                            minWidth: '140px'
                        }}
                    >
                        Nytt inlägg
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {posts.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        Inga foruminlägg än
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Var den första att starta en diskussion!
                    </Typography>
                </Paper>            ) : (
                <List sx={{ mb: 4 }}>
                    {posts.map((post) => (
                        <Paper key={post.id} sx={{ mb: 2 }}>
                            <ListItem 
                                alignItems="flex-start" 
                                sx={{ 
                                    p: 3, 
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => handlePostClick(post.id)}
                            >
                                <Avatar
                                    src={post.image_url}
                                    sx={{ mr: 2, mt: 0.5 }}
                                >
                                    {post.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="h3">
                                                {post.title}
                                            </Typography>
                                            <Chip 
                                                icon={<ReplyIcon />}
                                                label={post.reply_count}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                {post.content}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Av {post.username} • {formatDate(post.created_at)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                {isAdmin && (
                                    <IconButton
                                        onClick={(event) => handleMenuOpen(event, post.id)}
                                        sx={{ ml: 1 }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                )}
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}

            {/* Admin Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Ta bort inlägg
                </MenuItem>
            </Menu>

            {/* Create Post Button for mobile/tablet - Only show if logged in */}
            {isLoggedIn && (
                <Fab
                    color="primary"
                    aria-label="create post"
                    sx={{ 
                        position: 'fixed', 
                        bottom: 16, 
                        right: 16,
                        display: { xs: 'flex', sm: 'none' }
                    }}
                    onClick={() => setDialogOpen(true)}
                >
                    <AddIcon />
                </Fab>
            )}            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Skapa nytt inlägg</DialogTitle>
                <DialogContent>
                    {!isLoggedIn ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Du måste vara inloggad för att skapa inlägg.
                        </Alert>
                    ) : (
                        <>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Titel"
                                fullWidth
                                variant="outlined"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Innehåll"
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>
                        {!isLoggedIn ? 'Stäng' : 'Avbryt'}
                    </Button>
                    {isLoggedIn && (
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained"
                            disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                        >
                            {submitting ? <CircularProgress size={20} /> : 'Skapa'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}
