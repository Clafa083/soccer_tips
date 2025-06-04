-- Create knockout scoring configuration table
CREATE TABLE IF NOT EXISTS knockout_scoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matchType VARCHAR(50) NOT NULL UNIQUE,
    pointsPerCorrectTeam INT NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default values
INSERT IGNORE INTO knockout_scoring (matchType, pointsPerCorrectTeam) VALUES
('ROUND_OF_16', 1),
('QUARTER_FINAL', 2),
('SEMI_FINAL', 3),
('FINAL', 4);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_knockout_scoring_matchType ON knockout_scoring(matchType);
