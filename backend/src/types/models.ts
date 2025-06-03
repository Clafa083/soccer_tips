export interface User {
    id: number;
    email: string;
    name: string;
    password?: string; // Optional for return types
    imageUrl?: string;
    isAdmin: boolean;
    totalPoints?: number; // Added for leaderboard
    createdAt: Date;
    updatedAt: Date;
}

export interface Team {
    id: number;
    name: string;
    group?: string;
    flag?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Match {
    id: number;
    homeTeamId?: number;
    awayTeamId?: number;
    homeTeam?: Team;
    awayTeam?: Team;
    homeScore?: number;
    awayScore?: number;
    matchTime: Date;
    matchType: MatchType;
    group?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Bet {
    id: number;
    userId: number;
    matchId: number;
    homeScore?: number; // Original database column name
    awayScore?: number; // Original database column name
    homeScoreBet?: number; // Frontend property name
    awayScoreBet?: number; // Frontend property name
    homeTeamId?: number;
    awayTeamId?: number;
    points?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ForumPost {
    id: number;
    userId: number;
    user?: User;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SpecialBet {
    id: number;
    question: string;
    correctAnswer?: string;
    points: number;
    deadline: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSpecialBet {
    id: number;
    userId: number;
    specialBetId: number;
    answer: string;
    points?: number;
    createdAt: Date;
    updatedAt: Date;
}

export enum MatchType {
    GROUP = 'GROUP',
    ROUND_OF_16 = 'ROUND_OF_16',
    QUARTER_FINAL = 'QUARTER_FINAL',
    SEMI_FINAL = 'SEMI_FINAL',
    FINAL = 'FINAL'
}

// DTOs for API requests
export interface CreateTeamDto {
    name: string;
    group?: string;
    flag?: string;
}

export interface UpdateTeamDto {
    name?: string;
    group?: string;
    flag?: string;
}

export interface CreateMatchDto {
    homeTeamId?: number;
    awayTeamId?: number;
    matchTime: Date;
    matchType: MatchType;
    group?: string;
}

export interface UpdateMatchResultDto {
    homeScore: number;
    awayScore: number;
}

export interface CreateBetDto {
    matchId: number;
    homeScoreBet?: number; // Renamed from homeScore
    awayScoreBet?: number; // Renamed from awayScore
    homeTeamId?: number;
    awayTeamId?: number;
}

export interface CreateForumPostDto {
    content: string;
}

export interface CreateSpecialBetDto {
    question: string;
    points: number;
    deadline: Date;
}

export interface CreateUserSpecialBetDto {
    specialBetId: number;
    answer: string;
}