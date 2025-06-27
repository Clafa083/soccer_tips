import { useState, useEffect } from 'react';
import { TournamentService, TournamentInfo } from '../services/tournamentService';

export const useTournamentInfo = () => {
  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tournamentDisplayName, setTournamentDisplayName] = useState<string>('');
  const [tournamentTipName, setTournamentTipName] = useState<string>('VM-tipset');

  useEffect(() => {
    const loadTournamentInfo = async () => {
      try {
        const [info, displayName, tipName] = await Promise.all([
          TournamentService.getTournamentInfo(),
          TournamentService.getTournamentDisplayName(),
          TournamentService.getTournamentTipName()
        ]);
        setTournamentInfo(info);
        setTournamentDisplayName(displayName);
        setTournamentTipName(tipName);
      } catch (error) {
        console.error('Error loading tournament info:', error);
        // Set fallback values
        setTournamentTipName('VM-tipset');
        setTournamentDisplayName('VM 2026');
      } finally {
        setLoading(false);
      }
    };

    loadTournamentInfo();
  }, []);

  return { 
    tournamentInfo, 
    tournamentDisplayName,
    tournamentTipName,
    loading 
  };
};

export default useTournamentInfo;
