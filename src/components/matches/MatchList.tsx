import React from 'react';
import { Typography, Box } from '@mui/material';
import type { Match, MatchType } from '../../types/models';
import { MatchCard } from './MatchCard';

interface MatchListProps {
    matches?: Match[];
    matchType?: MatchType;
    group?: string;
    onMatchClick?: (match: Match) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ 
    matches = [], 
    matchType, 
    group, 
    onMatchClick 
}) => {
    const groupMatches = (matches: Match[]) => {
        if (matchType) {
            return { [matchType]: matches.filter(m => m.matchType === matchType) };
        } else if (group) {
            return { [group]: matches.filter(m => m.group === group) };
        }

        return matches.reduce((groups: { [key: string]: Match[] }, match) => {
            const key = match.group || match.matchType;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(match);
            return groups;
        }, {});
    };

    const groupedMatches = groupMatches(matches);

    if (Object.keys(groupedMatches).length === 0) {
        return (
            <Typography color="text.secondary" align="center">
                Inga matcher hittades
            </Typography>
        );
    }

    return (
        <Box>
            {Object.entries(groupedMatches).map(([groupKey, groupMatches]) => (
                <Box key={groupKey} sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        {groupKey.replace('_', ' ')}
                    </Typography>
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: '1fr 1fr',
                            md: '1fr 1fr 1fr'
                        },
                        gap: 2
                    }}>
                        {groupMatches.map((match) => (
                            <MatchCard 
                                key={match.id}
                                match={match}
                                onMatchClick={onMatchClick}
                            />
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};
