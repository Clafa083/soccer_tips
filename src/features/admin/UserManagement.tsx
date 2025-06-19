import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    Chip,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { Delete, AdminPanelSettings, Person } from '@mui/icons-material';
import { adminService } from '../../services/adminService';

interface User {
    id: number;
    name: string;
    email: string;
    image_url?: string;
    role: 'user' | 'admin';
    created_at: string;
    totalBets: number;
    totalPoints: number;
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Kunde inte ladda användare');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            await adminService.deleteUser(userToDelete.id);
            await loadUsers();
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            setError(null);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Kunde inte ta bort användare');
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    if (loading) {
        return <Typography>Laddar användare...</Typography>;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Användarhantering
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Hantera användarkonton och se statistik. Endast icke-admin användare kan tas bort.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Användare</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Roll</TableCell>
                            <TableCell align="center">Tips</TableCell>
                            <TableCell align="center">Poäng</TableCell>
                            <TableCell>Registrerad</TableCell>
                            <TableCell align="right">Åtgärder</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar 
                                            src={user.image_url} 
                                            sx={{ width: 32, height: 32 }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography variant="body2">
                                            {user.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {user.role === 'admin' ? (
                                        <Chip 
                                            icon={<AdminPanelSettings />}
                                            label="Admin" 
                                            color="primary" 
                                            size="small" 
                                        />
                                    ) : (
                                        <Chip 
                                            icon={<Person />}
                                            label="Användare" 
                                            color="default" 
                                            size="small" 
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {user.totalBets}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        {user.totalPoints}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDate(new Date(user.created_at))}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {user.role !== 'admin' && (
                                        <IconButton
                                            onClick={() => handleDeleteClick(user)}
                                            size="small"
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        Inga användare hittades
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Ta bort användare</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Är du säker på att du vill ta bort användaren "{userToDelete?.name}"? 
                        Detta kommer också att ta bort alla deras tips. Denna åtgärd kan inte ångras.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Avbryt
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                    >
                        Ta bort
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}