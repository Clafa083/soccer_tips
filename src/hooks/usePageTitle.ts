import { useEffect } from 'react';
import { useTournamentInfo } from './useTournamentInfo';

export const usePageTitle = (pageTitle?: string) => {
  const { tournamentInfo } = useTournamentInfo();

  useEffect(() => {
    if (tournamentInfo) {
      const tournamentDisplayName = `${tournamentInfo.name} ${tournamentInfo.year}`;
      document.title = pageTitle 
        ? `${pageTitle} | ${tournamentDisplayName}` 
        : tournamentDisplayName;
    }
  }, [pageTitle, tournamentInfo]);
};

export default usePageTitle;
