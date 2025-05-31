import { useState, useEffect } from 'react';
import { Match, MatchType } from '../types/models';
import { matchService } from '../services/matchService';

interface UseMatchesOptions {
    type?: MatchType;
    group?: string;
}

interface UseMatchesReturn {
    matches: Match[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export const useMatches = ({ type, group }: UseMatchesOptions = {}): UseMatchesReturn => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            setError(null);
            let fetchedMatches: Match[];
            
            if (type) {
                fetchedMatches = await matchService.getMatchesByType(type);
            } else if (group) {
                fetchedMatches = await matchService.getMatchesByGroup(group);
            } else {
                fetchedMatches = await matchService.getAllMatches();
            }

            setMatches(fetchedMatches);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch matches'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [type, group]);

    return {
        matches,
        loading,
        error,
        refetch: fetchMatches
    };
};
