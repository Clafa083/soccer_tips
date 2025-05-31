// Mock database for local development
import { Team, Match, MatchType } from '../types/models';

export const mockTeams: Team[] = [
    // Group A
    { id: 1, name: 'Qatar', group: 'A', flag: '🇶🇦', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Ecuador', group: 'A', flag: '🇪🇨', createdAt: new Date(), updatedAt: new Date() },
    { id: 3, name: 'Senegal', group: 'A', flag: '🇸🇳', createdAt: new Date(), updatedAt: new Date() },
    { id: 4, name: 'Netherlands', group: 'A', flag: '🇳🇱', createdAt: new Date(), updatedAt: new Date() },
    
    // Group B
    { id: 5, name: 'England', group: 'B', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', createdAt: new Date(), updatedAt: new Date() },
    { id: 6, name: 'Iran', group: 'B', flag: '🇮🇷', createdAt: new Date(), updatedAt: new Date() },
    { id: 7, name: 'USA', group: 'B', flag: '🇺🇸', createdAt: new Date(), updatedAt: new Date() },
    { id: 8, name: 'Wales', group: 'B', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', createdAt: new Date(), updatedAt: new Date() },
    
    // Group C
    { id: 9, name: 'Argentina', group: 'C', flag: '🇦🇷', createdAt: new Date(), updatedAt: new Date() },
    { id: 10, name: 'Saudi Arabia', group: 'C', flag: '🇸🇦', createdAt: new Date(), updatedAt: new Date() },
    { id: 11, name: 'Mexico', group: 'C', flag: '🇲🇽', createdAt: new Date(), updatedAt: new Date() },
    { id: 12, name: 'Poland', group: 'C', flag: '🇵🇱', createdAt: new Date(), updatedAt: new Date() },
];

export const mockMatches: Match[] = [
    {
        id: 1,
        homeTeamId: 1,
        awayTeamId: 2,
        homeTeam: mockTeams[0],
        awayTeam: mockTeams[1],
        homeScore: undefined,
        awayScore: undefined,
        matchTime: new Date('2024-06-14T18:00:00'),
        matchType: MatchType.GROUP,
        group: 'A',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        homeTeamId: 3,
        awayTeamId: 4,
        homeTeam: mockTeams[2],
        awayTeam: mockTeams[3],
        homeScore: undefined,
        awayScore: undefined,
        matchTime: new Date('2024-06-14T21:00:00'),
        matchType: MatchType.GROUP,
        group: 'A',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        homeTeamId: 5,
        awayTeamId: 6,
        homeTeam: mockTeams[4],
        awayTeam: mockTeams[5],
        homeScore: 6,
        awayScore: 2,
        matchTime: new Date('2024-06-12T15:00:00'),
        matchType: MatchType.GROUP,
        group: 'B',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 4,
        homeTeamId: 7,
        awayTeamId: 8,
        homeTeam: mockTeams[6],
        awayTeam: mockTeams[7],
        homeScore: 1,
        awayScore: 1,
        matchTime: new Date('2024-06-12T21:00:00'),
        matchType: MatchType.GROUP,
        group: 'B',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const mockUsers = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@vm-tips.se',
        imageUrl: null,
        isAdmin: true,
        createdAt: new Date(),
        totalBets: 0,
        totalPoints: 0
    },
    {
        id: 2,
        name: 'Test User',
        email: 'test@vm-tips.se',
        imageUrl: null,
        isAdmin: false,
        createdAt: new Date(),
        totalBets: 4,
        totalPoints: 7
    }
];

export const mockBets = [
    {
        id: 1,
        userId: 2,
        matchId: 3,
        homeScore: 5,
        awayScore: 1,
        homeTeamId: undefined,
        awayTeamId: undefined,
        points: 1, // Right outcome but not exact score
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        userId: 2,
        matchId: 4,
        homeScore: 1,
        awayScore: 1,
        homeTeamId: undefined,
        awayTeamId: undefined,
        points: 3, // Exact score
        createdAt: new Date(),
        updatedAt: new Date()
    }
];