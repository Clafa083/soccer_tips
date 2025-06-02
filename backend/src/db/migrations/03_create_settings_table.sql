-- Migration: create settings table for global app settings
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    value VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default value for betsLocked (if not already present)
INSERT INTO settings (name, value) VALUES ('betsLocked', 'false')
    ON DUPLICATE KEY UPDATE value = value;
