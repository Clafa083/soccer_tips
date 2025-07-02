import { betService } from './betService';
import { matchService } from './matchService';
import { specialBetService } from './specialBetService';

export interface TipsCompletionStatus {
    totalMatches: number;
    completedMatches: number;
    totalSpecialBets: number;
    completedSpecialBets: number;
    isComplete: boolean;
    missingMatchTips: number;
    missingSpecialTips: number;
}

export const tipsCompletionService = {
    async getTipsCompletionStatus(userId: number): Promise<TipsCompletionStatus> {
        try {
            // Hämta alla matcher
            const matches = await matchService.getAllMatches();
            const totalMatches = matches.length;

            // Hämta användarens tips
            const userBets = await betService.getUserBets();
            const completedMatches = userBets.length;

            // Hämta alla special bets
            const specialBets = await specialBetService.getSpecialBets();
            const totalSpecialBets = specialBets.length;

            // Hämta användarens special bets
            const userSpecialBets = await specialBetService.getUserSpecialBets(userId);
            const completedSpecialBets = userSpecialBets.length;

            const missingMatchTips = totalMatches - completedMatches;
            const missingSpecialTips = totalSpecialBets - completedSpecialBets;
            const isComplete = missingMatchTips === 0 && missingSpecialTips === 0;

            return {
                totalMatches,
                completedMatches,
                totalSpecialBets,
                completedSpecialBets,
                isComplete,
                missingMatchTips,
                missingSpecialTips
            };
        } catch (error) {
            console.error('Error checking tips completion status:', error);
            // Returnera default värden vid fel
            return {
                totalMatches: 0,
                completedMatches: 0,
                totalSpecialBets: 0,
                completedSpecialBets: 0,
                isComplete: true,
                missingMatchTips: 0,
                missingSpecialTips: 0
            };
        }
    }
};
