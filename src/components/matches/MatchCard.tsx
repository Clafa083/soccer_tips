import React from 'react';
import type { Match, Team } from '../../types/models';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { getTeamFlagUrl } from '../../utils/flagUtils';

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
    };    const TeamDisplay = ({ team, align = 'left' }: { team?: Team; align?: 'left' | 'right' }) => {
        const flagUrl = getTeamFlagUrl(team);
        const teamName = getTeamName(team);
        
        return (
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flexDirection: align === 'right' ? 'row-reverse' : 'row',
                flex: 1,
                justifyContent: align === 'right' ? 'flex-end' : 'flex-start'
            }}>
                {flagUrl ? (
                    <Avatar
                        src={flagUrl}
                        alt={`${teamName} flagga`}
                        sx={{ 
                            width: 32, 
                            height: 32,
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.12)'
                        }}
                    />
                ) : (
                    <Avatar
                        sx={{ 
                            width: 32, 
                            height: 32,
                            borderRadius: 1,
                            backgroundColor: 'grey.300',
                            fontSize: '0.75rem'
                        }}
                    >
                        {teamName.charAt(0)}
                    </Avatar>
                )}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        textAlign: align === 'right' ? 'right' : 'left',
                        fontSize: { xs: '0.9rem', sm: '1.25rem' }
                    }}
                >
                    {teamName}
                </Typography>
            </Box>
        );
    };

    return (
        <Card 
            sx={{ 
                minWidth: 275, 
                cursor: onMatchClick ? 'pointer' : 'default',
                '&:hover': onMatchClick ? { bgcolor: 'action.hover' } : {},
                transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => onMatchClick?.(match)}
        >
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {formatMatchTime(new Date(match.matchTime))}
                    {match.group && ` - Grupp ${match.group}`}
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    gap: 2
                }}>
                    <TeamDisplay team={match.homeTeam} align="left" />
                    
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        minWidth: 60
                    }}>
                        {(match.home_score !== null && match.away_score !== null) ? (
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {match.home_score} - {match.away_score}
                            </Typography>
                        ) : (
                            <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 'medium' }}>
                                VS
                            </Typography>
                        )}
                    </Box>
                    
                    <TeamDisplay team={match.awayTeam} align="right" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="textSecondary" variant="body2">
                        {match.matchType.replace('_', ' ')}
                    </Typography>
                    {match.status && (
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1, 
                                backgroundColor: match.status === 'finished' ? 'success.light' : 
                                              match.status === 'live' ? 'warning.light' : 'grey.200',
                                color: match.status === 'finished' ? 'success.dark' : 
                                       match.status === 'live' ? 'warning.dark' : 'grey.700'
                            }}
                        >
                            {match.status === 'finished' ? 'Avslutad' : 
                             match.status === 'live' ? 'Pågår' : 'Kommande'}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
