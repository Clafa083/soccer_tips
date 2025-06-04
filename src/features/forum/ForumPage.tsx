import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Forum as ForumIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { forumService, ForumPost } from '../../services/forumService';
import { useApp } from '../../context/AppContext';
import { getAvatarProps } from '../../utils/avatarUtils';

const ForumPage: React.FC = () => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    
    const { state: { user } } = useApp();

    useEffect(() => {
        loadPosts();
    }, []);    const loadPosts = async () => {
        console.log('🔵 ForumPage: Starting loadPosts()');
        try {
            setLoading(true);
            console.log('🔵 ForumPage: Calling forumService.getAllPosts()');
            const forumPosts = await forumService.getAllPosts();
            console.log('✅ ForumPage: Posts loaded successfully:', forumPosts);
            setPosts(forumPosts);
            setError(null);
        } catch (err: any) {
            const errorMessage = `Kunde inte ladda foruminlägg: ${err.message}`;
            setError(errorMessage);
            console.error('❌ ForumPage: Error loading forum posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;

        console.log('🔵 ForumPage: Starting post creation...');
        console.log('Content:', newPostContent.trim());
        console.log('User:', user);
        console.log('Token in localStorage:', localStorage.getItem('token'));

        try {
            setCreating(true);
            console.log('🔵 ForumPage: Calling forumService.createPost...');
            const newPost = await forumService.createPost(newPostContent.trim());
            console.log('✅ ForumPage: Post created successfully:', newPost);
            setPosts([newPost, ...posts]);
            setNewPostContent('');
            setShowCreateDialog(false);
            setError(null);
        } catch (err: any) {
            console.error('❌ ForumPage: Error creating post:', err);
            console.error('Error message:', err.message);
            console.error('Full error:', err);
            setError(err.message || 'Kunde inte skapa inlägg');
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            await forumService.deletePost(postId);
            setPosts(posts.filter(post => post.id !== postId));
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Kunde inte ta bort inlägg');
            console.error('Error deleting post:', err);
        }
    };

    const canDeletePost = (post: ForumPost): boolean => {
        if (!user) return false;
        return post.userId === user.id || user.isAdmin;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            return diffInMinutes < 1 ? 'Nu' : `${diffInMinutes} min sedan`;
        } else if (diffInHours < 24) {
            return `${diffInHours} h sedan`;
        } else {
            return date.toLocaleDateString('sv-SE', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <ForumIcon sx={{ fontSize: 40, color: 'white' }} />
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', mb: 0 }}>
                            VM-Forum
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            Diskutera matcher, tipsa och dela dina åsikter med andra tippare
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Create Post Button */}
            {user && (
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateDialog(true)}
                        size="large"
                    >
                        Skapa nytt inlägg
                    </Button>
                </Box>
            )}

            {/* Forum Posts */}
            <Stack spacing={2}>
                {posts.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <ForumIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Inga inlägg än
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user ? 'Var först med att skapa ett inlägg!' : 'Logga in för att skapa inlägg.'}
                        </Typography>
                    </Paper>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} elevation={2}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="flex-start">                                    <Avatar
                                        {...getAvatarProps(post.user.imageUrl, post.user.name)}
                                        sx={{ bgcolor: post.user.isAdmin ? 'primary.main' : 'secondary.main' }}
                                    />
                                    
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {post.user.name}
                                            </Typography>
                                            {post.user.isAdmin && (
                                                <Chip
                                                    icon={<AdminIcon />}
                                                    label="Admin"
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(post.createdAt)}
                                            </Typography>
                                        </Stack>
                                        
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                                            {post.content}
                                        </Typography>
                                    </Box>

                                    {canDeletePost(post) && (
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeletePost(post.id)}
                                            title="Ta bort inlägg"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Stack>

            {/* Create Post Dialog */}
            <Dialog 
                open={showCreateDialog} 
                onClose={() => setShowCreateDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Skapa nytt foruminlägg</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        label="Innehåll"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Skriv ditt inlägg här..."
                        sx={{ mt: 2 }}
                        inputProps={{ maxLength: 2000 }}
                        helperText={`${newPostContent.length}/2000 tecken`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCreateDialog(false)}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={handleCreatePost}
                        variant="contained"
                        disabled={!newPostContent.trim() || creating}
                        startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
                    >
                        {creating ? 'Skapar...' : 'Skapa inlägg'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ForumPage;
