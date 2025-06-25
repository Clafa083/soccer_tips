import { useState } from 'react';
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import {
    Palette as PaletteIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    LocalFireDepartment as CozyIcon,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../theme';

interface ThemeOption {
    mode: ThemeMode;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const themeOptions: ThemeOption[] = [
    {
        mode: 'light',
        label: 'Ljust tema',
        icon: <LightModeIcon />,
        description: 'Klassiskt ljust tema',
    },
    {
        mode: 'dark',
        label: 'Mörkt tema',
        icon: <DarkModeIcon />,
        description: 'Mörkt tema för kvällsbruk',
    },
    {
        mode: 'cozy',
        label: 'Mysigt tema',
        icon: <CozyIcon />,
        description: 'Varmt och mysigt tema',
    },
];

export function ThemeToggle() {
    const { themeMode, toggleTheme } = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleThemeSelect = (mode: ThemeMode) => {
        toggleTheme(mode);
        handleClose();
    };

    const currentTheme = themeOptions.find(option => option.mode === themeMode);

    return (
        <>
            <Tooltip title="Byt tema">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? 'theme-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    color="inherit"
                >
                    {currentTheme?.icon || <PaletteIcon />}
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="theme-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {themeOptions.map((option) => (
                    <MenuItem
                        key={option.mode}
                        onClick={() => handleThemeSelect(option.mode)}
                        selected={option.mode === themeMode}
                    >
                        <ListItemIcon>
                            {option.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={option.label}
                            secondary={option.description}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
