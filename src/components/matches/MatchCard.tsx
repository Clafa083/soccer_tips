import React from 'react';
import type { Match, Team } from '../../types/models';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface MatchCardProps {
    match: Match;
    onMatchClick?: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onMatchClick }) => {
    const formatMatchTime = (date: Date) => {
        return new Date(date).toLocaleString('sv-SE', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTeamName = (team?: Team) => {
        return team?.name || 'TBD';
    };

    return (
        <Card 
            sx={{ 
                minWidth: 275, 
                cursor: onMatchClick ? 'pointer' : 'default',
                '&:hover': onMatchClick ? { bgcolor: 'action.hover' } : {}
            }}
            onClick={() => onMatchClick?.(match)}
        >
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {formatMatchTime(match.matchTime)}
                    {match.group && ` - Grupp ${match.group}`}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                        {getTeamName(match.homeTeam)}
                    </Typography>
                    {(match.homeScore !== undefined && match.awayScore !== undefined) ? (
                        <Typography variant="h6">
                            {match.homeScore} - {match.awayScore}
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            vs
                        </Typography>
                    )}
                    <Typography variant="h6">
                        {getTeamName(match.awayTeam)}
                    </Typography>
                </Box>
                <Typography color="textSecondary" variant="body2">
                    {match.matchType.replace('_', ' ')}
                </Typography>
            </CardContent>
        </Card>
    );
};
