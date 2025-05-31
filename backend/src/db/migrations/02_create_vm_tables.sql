-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    `group` VARCHAR(1), -- A, B, C, D, E, F, G, H
    flag VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_group (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    homeTeamId INT,
    awayTeamId INT,
    homeScore INT DEFAULT NULL,
    awayScore INT DEFAULT NULL,
    matchTime DATETIME NOT NULL,
    matchType ENUM('GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL') NOT NULL,
    `group` VARCHAR(1), -- Only for GROUP matches
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homeTeamId) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (awayTeamId) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_matchType (matchType),
    INDEX idx_group (`group`),
    INDEX idx_matchTime (matchTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    matchId INT NOT NULL,
    homeScore INT DEFAULT NULL, -- For group stage score predictions
    awayScore INT DEFAULT NULL, -- For group stage score predictions
    homeTeamId INT DEFAULT NULL, -- For knockout stage team predictions
    awayTeamId INT DEFAULT NULL, -- For knockout stage team predictions
    points INT DEFAULT NULL, -- Calculated after match result
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (homeTeamId) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (awayTeamId) REFERENCES teams(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_match (userId, matchId),
    INDEX idx_userId (userId),
    INDEX idx_matchId (matchId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    content TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create special_bets table
CREATE TABLE IF NOT EXISTS special_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    correctAnswer TEXT DEFAULT NULL,
    points INT NOT NULL DEFAULT 0,
    deadline DATETIME NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_special_bets table
CREATE TABLE IF NOT EXISTS user_special_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    specialBetId INT NOT NULL,
    answer TEXT NOT NULL,
    points INT DEFAULT NULL, -- Calculated after correct answer is set
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialBetId) REFERENCES special_bets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_special_bet (userId, specialBetId),
    INDEX idx_userId (userId),
    INDEX idx_specialBetId (specialBetId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;