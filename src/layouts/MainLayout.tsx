import React from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useApp } from '../context/AppContext';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    Divider
} from '@mui/material';
import {
    AccountCircle,
    Menu as MenuIcon,
    SportsSoccer,
    EmojiEvents,
    Forum as ForumIcon,
    AdminPanelSettings,
    Casino
} from '@mui/icons-material';

export const MainLayout: React.FC = () => {
    const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { state: { user, isAuthenticated }, dispatch } = useApp();
    const navigate = useNavigate();
    const isAdmin = user?.isAdmin ?? false;

    const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const navItems = [
        { label: 'Matcher', path: '/matches', icon: <SportsSoccer />, always: true },
        { label: 'Mina Tips', path: '/betting', icon: <Casino />, requireAuth: true },
        { label: 'Resultattavla', path: '/leaderboard', icon: <EmojiEvents />, always: true },
        { label: 'Forum', path: '/forum', icon: <ForumIcon />, always: true },
        { label: 'Admin', path: '/admin', icon: <AdminPanelSettings />, requireAdmin: true },
    ];

    const renderNavItems = () => navItems.filter(item => {
        if (item.requireAdmin) return isAdmin;
        if (item.requireAuth) return isAuthenticated;
        return item.always;
    }).map(({ label, path, icon }) => (
        <Button
            key={path}
            color="inherit"
            component={RouterLink}
            to={path}
            startIcon={isMobile ? null : icon}
            sx={{ 
                textDecoration: 'none',
                minWidth: isMobile ? 'auto' : undefined,
                px: isMobile ? 1 : 2,
                py: 1,
                borderRadius: 1,
                typography: 'button',
                '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                },
                ...(location.pathname === path && {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                    },
                })
            }}
        >
            {label}
        </Button>
    ));

    const mobileDrawer = (
        <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            sx={{
                '& .MuiDrawer-paper': { width: 240, bgcolor: 'background.default' }
            }}
        >
            <List>
                <ListItem sx={{ mb: 2 }}>
                    <Typography variant="h6" component={RouterLink} to="/" 
                        sx={{ textDecoration: 'none', color: 'inherit' }} 
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        VM-tipset
                    </Typography>
                </ListItem>
                <Divider />
                {navItems.filter(item => {
                    if (item.requireAdmin) return isAdmin;
                    if (item.requireAuth) return isAuthenticated;
                    return item.always;
                }).map(({ label, path, icon }) => (
                    <ListItem 
                        key={path} 
                        onClick={() => setMobileMenuOpen(false)}
                        sx={{ 
                            cursor: 'pointer',
                            backgroundColor: location.pathname === path ? 'action.selected' : 'transparent'
                        }}
                    >
                        <Button
                            component={RouterLink}
                            to={path}
                            fullWidth
                            startIcon={icon}
                            sx={{ 
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                color: 'inherit'
                            }}
                        >
                            {label}
                        </Button>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="sticky" elevation={1}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {isMobile ? (
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMobileMenuToggle}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        ) : (
                            <Typography 
                                variant="h6" 
                                component={RouterLink} 
                                to="/" 
                                sx={{ 
                                    flexGrow: 0,
                                    mr: 4,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <SportsSoccer />
                                VM-tipset
                            </Typography>
                        )}

                        <Box sx={{ 
                            display: 'flex', 
                            gap: 1,
                            alignItems: 'center',
                            flexGrow: 1,
                            justifyContent: isMobile ? 'flex-end' : 'flex-start'
                        }}>
                            {!isMobile && renderNavItems()}
                        </Box>

                        {isAuthenticated ? (
                            <>
                                <IconButton
                                    size="large"
                                    onClick={handleUserMenu}
                                    color="inherit"
                                >
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                        <AccountCircle />
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={userMenuAnchor}
                                    open={Boolean(userMenuAnchor)}
                                    onClose={handleUserMenuClose}
                                >                                    <MenuItem 
                                        component={RouterLink} 
                                        to="/profile"
                                        onClick={handleUserMenuClose}
                                    >
                                        Min Profil
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        handleUserMenuClose();
                                        authService.logout();
                                        dispatch({ type: 'SET_USER', payload: null });
                                        navigate('/');
                                    }}>
                                        Logga ut
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                color="inherit"
                                component={RouterLink}
                                to="/login"
                                sx={{ ml: 2 }}
                            >
                                Logga in
                            </Button>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {isMobile && mobileDrawer}

            <Container component="main" sx={{ flex: 1, py: 4 }}>
                <Outlet />
            </Container>

            <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} VM-tipset
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};
