// Models for the VM-tipset application
export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Team {
    id: number;
    name: string;
    group?: string;
    // New database fields
    flag_url?: string;
    created_at?: string;
    updated_at?: string;
    // Legacy compatibility
    flag?: string;
}

export interface Match {
    id: number;
    // New database fields
    home_team_id: number;
    away_team_id: number;
    home_score?: number;
    away_score?: number;
    matchTime: string;
    status: 'scheduled' | 'live' | 'finished';
    matchType: MatchType;
    group?: string;
    created_at: string;
    updated_at: string;
    // Legacy compatibility fields
    homeTeamId?: number;
    awayTeamId?: number;
    homeScore?: number;
    awayScore?: number;
    // Related objects
    homeTeam?: Team;
    awayTeam?: Team;
}

export interface Bet {
    id: number;
    // New database fields
    user_id: number;
    match_id: number;
    home_score?: number;
    away_score?: number;
    home_team_id?: number;  // For knockout stage predictions
    away_team_id?: number;  // For knockout stage predictions
    points?: number;
    created_at: string;
    updated_at: string;
    // Legacy compatibility fields
    userId?: number;
    matchId?: number;
    homeScore?: number;
    awayScore?: number;
    homeTeamId?: number;
    awayTeamId?: number;
    createdAt?: string;
    updatedAt?: string;
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
    // New format
    match_id?: number;
    home_score?: number;
    away_score?: number;
    home_team_id?: number;
    away_team_id?: number;
    // Legacy format support
    matchId?: number;
    homeScore?: number;
    awayScore?: number;
    homeTeamId?: number;
    awayTeamId?: number;
}
