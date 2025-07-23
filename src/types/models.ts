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
    // Group constraints for knockout matches
    allowed_home_groups?: string; // Comma-separated list (e.g., "A,B")
    allowed_away_groups?: string; // Comma-separated list (e.g., "C,D")
    home_group_description?: string; // Description for users (e.g., "Vinnare grupp A och B")
    away_group_description?: string; // Description for users (e.g., "Vinnare grupp C och D")
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
    options: string[]; // Array of possible answers
    correct_option?: string; // The correct answer (admin only)
    points: number;
    is_active: boolean;
    deadline: string;
    created_at: string;
    updated_at: string;
}

export interface UserSpecialBet {
    id: number;
    user_id: number;
    special_bet_id: number;
    selected_option: string; // The option selected by user
    points: number;
    created_at: string;
    updated_at: string;
    // Related objects
    special_bet?: SpecialBet;
    user?: User;
}

export enum MatchType {
    GROUP = 'GROUP',
    ROUND_OF_16 = 'ROUND_OF_16',
    QUARTER_FINAL = 'QUARTER_FINAL',
    SEMI_FINAL = 'SEMI_FINAL',
    FINAL = 'FINAL'
}

// DTOs for API requests
export interface CreateSpecialBetDto {
    question: string;
    options: string[]; // Array of possible answers
    correct_option?: string; // The correct answer
    points: number;
    is_active?: boolean;
}

export interface CreateUserSpecialBetDto {
    special_bet_id: number;
    selected_option: string; // The selected option
}

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

export interface UserBetsData {
    user: {
        id: number;
        name: string;
        email: string;
        image_url?: string;
        created_at: string;
    };
    bets: UserBet[];
    special_bets: UserSpecialBetDetails[];
    knockout_points?: number;
}

export interface UserSpecialBetDetails {
    id: number;
    special_bet_id: number;
    question: string;
    selected_option: string; // The option selected by user
    options: string[]; // All available options
    correct_option?: string; // The correct answer (shown after betting closes)
    points: number;
    max_points: number;
    created_at: string;
    updated_at: string;
}

export interface UserBet {
    id: number | null;
    match_id: number;
    points: number;
    created_at: string | null;
    updated_at: string | null;
    bet: {
        home_score?: number;
        away_score?: number;
        home_team_id?: number;
        away_team_id?: number;
        home_team_name?: string;
        away_team_name?: string;
    } | null;
    match: {
        home_team_id: number;
        away_team_id: number;
        home_team_name: string;
        away_team_name: string;
        home_score?: number;
        away_score?: number;
        matchTime: string;
        status: string;
        matchType: string;
        group?: string;
    };
}

export interface MatchBetsData {
    match: {
        id: number;
        home_team_id: number;
        away_team_id: number;
        home_team_name: string;
        away_team_name: string;
        home_score?: number;
        away_score?: number;
        matchTime: string;
        status: string;
        matchType: string;
        group?: string;
    };
    bets: MatchBet[];
}

export interface MatchBet {
    id: number;
    user_id: number;
    points: number;
    created_at: string;
    updated_at: string;
    user: {
        name: string;
        username: string;
        image_url?: string;
    };
    bet: {
        home_score?: number;
        away_score?: number;
        home_team_id?: number;
        away_team_id?: number;
        home_team_name?: string;
        away_team_name?: string;
    };
}

// Site Content för redigerbart innehåll
export interface SiteContent {
    id: number;
    content_key: string;
    title: string;
    content: string;
    content_type: 'text' | 'html' | 'markdown';
    updated_at: string;
    created_at: string;
}

export interface CreateSiteContentDto {
    content_key: string;
    title: string;
    content: string;
    content_type?: 'text' | 'html' | 'markdown';
}

export interface UpdateSiteContentDto {
    title: string;
    content: string;
    content_type?: 'text' | 'html' | 'markdown';
}

export interface KnockoutScoringConfig {
    id: number;
    match_type: 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
    points_per_correct_team: number;
    created_at: string;
    updated_at: string;
}
