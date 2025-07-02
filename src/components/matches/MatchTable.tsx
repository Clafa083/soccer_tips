import React, { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Box,
    Typography,
    Chip,
    Avatar,
} from '@mui/material';
import type { Match, MatchType } from '../../types/models';
import { getTeamFlagUrl } from '../../utils/flagUtils';

interface MatchTableProps {
    matches?: Match[];
    matchType?: MatchType;
    group?: string;
    onMatchClick?: (match: Match) => void;
}

type Order = 'asc' | 'desc';

interface HeadCell {
    id: keyof Match | 'homeTeamName' | 'awayTeamName' | 'result';
    label: string;
    numeric: boolean;
    disablePadding: boolean;
    hideOnMobile?: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'matchTime',
        numeric: false,
        disablePadding: false,
        label: 'Datum & Tid',
        hideOnMobile: true,
    },
    {
        id: 'homeTeamName',
        numeric: false,
        disablePadding: false,
        label: 'Hemmalag',
    },
    {
        id: 'awayTeamName',
        numeric: false,
        disablePadding: false,
        label: 'Bortalag',
    },
    {
        id: 'result',
        numeric: false,
        disablePadding: false,
        label: 'Resultat',
    },
    {
        id: 'group',
        numeric: false,
        disablePadding: false,
        label: 'Grupp/Fas',
        hideOnMobile: true,
    },
];

interface EnhancedTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Match | 'homeTeamName' | 'awayTeamName' | 'result') => void;
    order: Order;
    orderBy: string;
}

function EnhancedTableHead({ onRequestSort, order, orderBy }: EnhancedTableHeadProps) {
    const createSortHandler =
        (property: keyof Match | 'homeTeamName' | 'awayTeamName' | 'result') =>
        (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                            display: headCell.hideOnMobile ? { xs: 'none', md: 'table-cell' } : 'table-cell',
                            padding: { xs: '8px 4px', md: '16px' },
                        }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={{ 
                                    position: 'absolute',
                                    left: '-9999px',
                                    width: '1px',
                                    height: '1px',
                                    overflow: 'hidden',
                                }}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

export const MatchTable: React.FC<MatchTableProps> = ({ 
    matches = [], 
    matchType, 
    group, 
    onMatchClick 
}) => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Match | 'homeTeamName' | 'awayTeamName' | 'result'>('matchTime');

    const handleRequestSort = (
        _event: React.MouseEvent<unknown>,
        property: keyof Match | 'homeTeamName' | 'awayTeamName' | 'result',
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredMatches = useMemo(() => {
        let filtered = matches;
        
        if (matchType) {
            filtered = filtered.filter(m => m.matchType === matchType);
        } else if (group) {
            filtered = filtered.filter(m => m.group === group);
        }

        return filtered;
    }, [matches, matchType, group]);

    const sortedMatches = useMemo(() => {
        return [...filteredMatches].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (orderBy) {
                case 'homeTeamName':
                    aValue = a.homeTeam?.name || '';
                    bValue = b.homeTeam?.name || '';
                    break;
                case 'awayTeamName':
                    aValue = a.awayTeam?.name || '';
                    bValue = b.awayTeam?.name || '';
                    break;
                case 'result':
                    aValue = a.home_score !== null && a.away_score !== null 
                        ? `${a.home_score}-${a.away_score}` 
                        : '';
                    bValue = b.home_score !== null && b.away_score !== null 
                        ? `${b.home_score}-${b.away_score}` 
                        : '';
                    break;
                default:
                    aValue = a[orderBy as keyof Match];
                    bValue = b[orderBy as keyof Match];
                    break;
            }

            if (order === 'desc') {
                if (bValue < aValue) return -1;
                if (bValue > aValue) return 1;
                return 0;
            } else {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return 0;
            }
        });
    }, [filteredMatches, order, orderBy]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('sv-SE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMatchTypeLabel = (matchType?: string) => {
        const labels: { [key: string]: string } = {
            'GROUP': 'Gruppspel',
            'ROUND_OF_16': 'Åttondel',
            'QUARTER_FINAL': 'Kvartal',
            'SEMI_FINAL': 'Semifinal',
            'FINAL': 'Final',
        };
        return labels[matchType || ''] || matchType || '';
    };

    const getMatchStatus = (match: Match) => {
        const now = new Date();
        const matchDate = new Date(match.matchTime);
        
        if (match.home_score !== null && match.away_score !== null) {
            return { label: 'Avslutad', color: 'success' as const };
        } else if (matchDate <= now) {
            return { label: 'Pågår', color: 'warning' as const };
        } else {
            return { label: 'Kommande', color: 'default' as const };
        }
    };

    if (sortedMatches.length === 0) {
        return (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Inga matcher hittades
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table 
                sx={{ 
                    minWidth: { xs: 300, md: 750 },
                    '& .MuiTableCell-root': {
                        whiteSpace: { xs: 'nowrap', md: 'normal' }
                    }
                }} 
                aria-labelledby="tableTitle"
            >
                <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                />
                <TableBody>
                    {sortedMatches.map((match) => {
                        const status = getMatchStatus(match);
                        
                        return (
                            <TableRow
                                hover
                                onClick={() => onMatchClick?.(match)}
                                role="checkbox"
                                tabIndex={-1}
                                key={match.id}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell sx={{ 
                                    display: { xs: 'none', md: 'table-cell' },
                                    padding: { xs: '8px 4px', md: '16px' },
                                }}>
                                    <Box>
                                        <Typography variant="body2">
                                            {formatDate(match.matchTime)}
                                        </Typography>
                                        <Chip 
                                            label={status.label} 
                                            color={status.color} 
                                            size="small" 
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Box>
                                </TableCell>
                                
                                <TableCell sx={{ padding: { xs: '8px 4px', md: '16px' } }}>
                                    <Box display="flex" alignItems="center" gap={{ xs: 0.5, md: 1 }}>
                                        <Avatar 
                                            src={getTeamFlagUrl(match.homeTeam)} 
                                            sx={{ width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }}
                                        />
                                        <Typography variant="body2" sx={{ 
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            display: { xs: 'none', sm: 'block' }
                                        }}>
                                            {match.homeTeam?.name || 'TBD'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            display: { xs: 'block', sm: 'none' }
                                        }}>
                                            {(match.homeTeam?.name || 'TBD').substring(0, 3)}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                
                                <TableCell sx={{ padding: { xs: '8px 4px', md: '16px' } }}>
                                    <Box display="flex" alignItems="center" gap={{ xs: 0.5, md: 1 }}>
                                        <Avatar 
                                            src={getTeamFlagUrl(match.awayTeam)} 
                                            sx={{ width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }}
                                        />
                                        <Typography variant="body2" sx={{ 
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            display: { xs: 'none', sm: 'block' }
                                        }}>
                                            {match.awayTeam?.name || 'TBD'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            display: { xs: 'block', sm: 'none' }
                                        }}>
                                            {(match.awayTeam?.name || 'TBD').substring(0, 3)}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                
                                <TableCell sx={{ padding: { xs: '8px 4px', md: '16px' } }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" sx={{ 
                                            fontSize: { xs: '0.75rem', md: '0.875rem' }
                                        }}>
                                            {match.home_score !== null && match.away_score !== null 
                                                ? `${match.home_score} - ${match.away_score}`
                                                : '-'
                                            }
                                        </Typography>
                                        <Typography variant="caption" sx={{ 
                                            display: { xs: 'block', md: 'none' },
                                            fontSize: '0.7rem',
                                            color: 'text.secondary'
                                        }}>
                                            {formatDate(match.matchTime)}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                
                                <TableCell sx={{ 
                                    display: { xs: 'none', md: 'table-cell' },
                                    padding: { xs: '8px 4px', md: '16px' },
                                }}>
                                    <Typography variant="body2">
                                        {match.group || getMatchTypeLabel(match.matchType)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
