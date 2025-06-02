-- SQLite version of VM tables
-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    "group" TEXT, -- A, B, C, D, E, F, G, H (group is a reserved word in SQLite, so we quote it)
    flag TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teams_group ON teams("group");

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    homeTeamId INTEGER,
    awayTeamId INTEGER,
    homeScore INTEGER DEFAULT NULL,
    awayScore INTEGER DEFAULT NULL,
    matchTime DATETIME NOT NULL,
    matchType TEXT NOT NULL CHECK (matchType IN ('GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL')),
    "group" TEXT, -- Only for GROUP matches
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (homeTeamId) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (awayTeamId) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_matches_matchType ON matches(matchType);
CREATE INDEX IF NOT EXISTS idx_matches_group ON matches("group");
CREATE INDEX IF NOT EXISTS idx_matches_matchTime ON matches(matchTime);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    matchId INTEGER NOT NULL,
    homeScore INTEGER DEFAULT NULL, -- For group stage score predictions
    awayScore INTEGER DEFAULT NULL, -- For group stage score predictions
    homeTeamId INTEGER DEFAULT NULL, -- For knockout stage team predictions
    awayTeamId INTEGER DEFAULT NULL, -- For knockout stage team predictions
    points INTEGER DEFAULT NULL, -- Calculated after match result
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (homeTeamId) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (awayTeamId) REFERENCES teams(id) ON DELETE SET NULL,
    UNIQUE(userId, matchId)
);

CREATE INDEX IF NOT EXISTS idx_bets_userId ON bets(userId);
CREATE INDEX IF NOT EXISTS idx_bets_matchId ON bets(matchId);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_userId ON forum_posts(userId);
CREATE INDEX IF NOT EXISTS idx_forum_posts_createdAt ON forum_posts(createdAt);

-- Create special_bets table
CREATE TABLE IF NOT EXISTS special_bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    correctAnswer TEXT DEFAULT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    deadline DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_special_bets_deadline ON special_bets(deadline);

-- Create user_special_bets table
CREATE TABLE IF NOT EXISTS user_special_bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    specialBetId INTEGER NOT NULL,
    answer TEXT NOT NULL,
    points INTEGER DEFAULT NULL, -- Calculated after correct answer is set
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialBetId) REFERENCES special_bets(id) ON DELETE CASCADE,
    UNIQUE(userId, specialBetId)
);

CREATE INDEX IF NOT EXISTS idx_user_special_bets_userId ON user_special_bets(userId);
CREATE INDEX IF NOT EXISTS idx_user_special_bets_specialBetId ON user_special_bets(specialBetId);
