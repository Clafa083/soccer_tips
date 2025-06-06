-- Fix database structure for production
-- Run this in phpMyAdmin for familjenfalth_senr2 database

-- Add missing flag_url column to teams table if it doesn't exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS flag_url VARCHAR(255);

-- Fix matches table structure
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_id INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_id INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_score INT DEFAULT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_score INT DEFAULT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_date DATETIME;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matchTime DATETIME;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status ENUM('scheduled', 'live', 'finished') DEFAULT 'scheduled';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_type ENUM('group', 'round_of_16', 'quarter_final', 'semi_final', 'final') DEFAULT 'group';

-- Add missing image_url column to users table if it doesn't exist  
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

-- Ensure users table has 'name' column (some APIs expect this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add username column if it doesn't exist (for compatibility)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- Add password_hash column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add password column if it doesn't exist (some systems use this instead)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user';

-- Update existing users to have name = email (fallback) if name is null
-- This is safer since email should always exist
UPDATE users SET name = email WHERE name IS NULL OR name = '';

-- Update username = email if username is null (for compatibility)
UPDATE users SET username = email WHERE username IS NULL OR username = '';

-- Fix bets table structure
ALTER TABLE bets ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS match_id INT;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS home_score INT;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS away_score INT;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS points_earned INT DEFAULT 0;

-- Create forum tables if they don't exist
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
