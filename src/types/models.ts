// Models for the VM-tipset application
export interface User {
    id: number;
    email: string;
    name: string;
    imageUrl?: string;
    isAdmin: boolean;
    createdAt: Date;
}

export interface Team {
    id: number;
    name: string;
    group?: string;
    flag?: string;
}

export interface Match {
    id: number;
    homeTeamId: number;
    awayTeamId: number;
    homeTeam?: Team;
    awayTeam?: Team;
    homeScore?: number;
    awayScore?: number;
    matchTime: Date;
    matchType: MatchType;
    group?: string;
}

export interface Bet {
    id: number;
    userId: number;
    matchId: number;
    homeScore?: number;
    awayScore?: number;
    homeTeamId?: number;  // For knockout stage predictions
    awayTeamId?: number;  // For knockout stage predictions
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
export interface CreateBetDto {
    matchId: number;
    homeScore?: number;
    awayScore?: number;
    homeTeamId?: number;
    awayTeamId?: number;
}
