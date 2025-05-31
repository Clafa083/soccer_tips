<?php
// Complete database setup for VM-Tips on one.com
echo "<!DOCTYPE html><html><head><title>VM-Tips Database Setup</title></head><body>";
echo "<h1>VM-Tips Database Setup</h1>";

$host = 'familjenfalth.se.mysql';
$username = 'familjenfalth_senr2';
$password = 'kesokeso';
$database = 'familjenfalth_senr2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>✅ Database connection successful</h2>";
    
    // Create all tables
    $tables = [
        // Users table
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            imageUrl VARCHAR(255),
            isAdmin BOOLEAN DEFAULT FALSE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Teams table
        "CREATE TABLE IF NOT EXISTS teams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            `group` VARCHAR(1),
            flag VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_group (`group`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Matches table
        "CREATE TABLE IF NOT EXISTS matches (
            id INT AUTO_INCREMENT PRIMARY KEY,
            homeTeamId INT,
            awayTeamId INT,
            homeScore INT DEFAULT NULL,
            awayScore INT DEFAULT NULL,
            matchTime DATETIME NOT NULL,
            matchType ENUM('GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL') NOT NULL,
            `group` VARCHAR(1),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (homeTeamId) REFERENCES teams(id) ON DELETE SET NULL,
            FOREIGN KEY (awayTeamId) REFERENCES teams(id) ON DELETE SET NULL,
            INDEX idx_matchType (matchType),
            INDEX idx_group (`group`),
            INDEX idx_matchTime (matchTime)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Bets table
        "CREATE TABLE IF NOT EXISTS bets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            matchId INT NOT NULL,
            homeScore INT DEFAULT NULL,
            awayScore INT DEFAULT NULL,
            homeTeamId INT DEFAULT NULL,
            awayTeamId INT DEFAULT NULL,
            points INT DEFAULT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE,
            FOREIGN KEY (homeTeamId) REFERENCES teams(id) ON DELETE SET NULL,
            FOREIGN KEY (awayTeamId) REFERENCES teams(id) ON DELETE SET NULL,
            UNIQUE KEY unique_user_match (userId, matchId),
            INDEX idx_userId (userId),
            INDEX idx_matchId (matchId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Forum posts table
        "CREATE TABLE IF NOT EXISTS forum_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            content TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_userId (userId),
            INDEX idx_createdAt (createdAt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Special bets table
        "CREATE TABLE IF NOT EXISTS special_bets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question TEXT NOT NULL,
            correctAnswer TEXT DEFAULT NULL,
            points INT NOT NULL DEFAULT 0,
            deadline DATETIME NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_deadline (deadline)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // User special bets table
        "CREATE TABLE IF NOT EXISTS user_special_bets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            specialBetId INT NOT NULL,
            answer TEXT NOT NULL,
            points INT DEFAULT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (specialBetId) REFERENCES special_bets(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_special_bet (userId, specialBetId),
            INDEX idx_userId (userId),
            INDEX idx_specialBetId (specialBetId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    ];
    
    foreach ($tables as $i => $sql) {
        try {
            $pdo->exec($sql);
            echo "<p>✅ Table " . ($i + 1) . " created successfully</p>";
        } catch (PDOException $e) {
            echo "<p>⚠️ Table " . ($i + 1) . " warning: " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
    
    // Create admin user
    $adminEmail = 'admin@vm-tips.se';
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute([$adminEmail, 'Admin User', $adminPassword, 1]);
    
    if ($result) {
        echo "<h3>✅ Admin user created/updated</h3>";
        echo "<p><strong>Email:</strong> admin@vm-tips.se</p>";
        echo "<p><strong>Password:</strong> admin123</p>";
    }
    
    // Insert sample teams
    $teams = [
        ['Qatar', 'A', '🇶🇦'], ['Ecuador', 'A', '🇪🇨'], ['Senegal', 'A', '🇸🇳'], ['Netherlands', 'A', '🇳🇱'],
        ['England', 'B', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'], ['Iran', 'B', '🇮🇷'], ['USA', 'B', '🇺🇸'], ['Wales', 'B', '🏴󠁧󠁢󠁷󠁬󠁳󠁿'],
        ['Argentina', 'C', '🇦🇷'], ['Saudi Arabia', 'C', '🇸🇦'], ['Mexico', 'C', '🇲🇽'], ['Poland', 'C', '🇵🇱'],
        ['France', 'D', '🇫🇷'], ['Australia', 'D', '🇦🇺'], ['Denmark', 'D', '🇩🇰'], ['Tunisia', 'D', '🇹🇳'],
        ['Spain', 'E', '🇪🇸'], ['Costa Rica', 'E', '🇨🇷'], ['Germany', 'E', '🇩🇪'], ['Japan', 'E', '🇯🇵'],
        ['Belgium', 'F', '🇧🇪'], ['Canada', 'F', '🇨🇦'], ['Morocco', 'F', '🇲🇦'], ['Croatia', 'F', '🇭🇷'],
        ['Brazil', 'G', '🇧🇷'], ['Serbia', 'G', '🇷🇸'], ['Switzerland', 'G', '🇨🇭'], ['Cameroon', 'G', '🇨🇲'],
        ['Portugal', 'H', '🇵🇹'], ['Ghana', 'H', '🇬🇭'], ['Uruguay', 'H', '🇺🇾'], ['South Korea', 'H', '🇰🇷']
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO teams (name, `group`, flag) VALUES (?, ?, ?)");
    $teamCount = 0;
    foreach ($teams as $team) {
        if ($stmt->execute($team)) {
            $teamCount++;
        }
    }
    
    echo "<h3>✅ Sample teams inserted: $teamCount teams</h3>";
    
    echo "<h2>🎉 Setup Complete!</h2>";
    echo "<p><a href='/' style='background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;'>Go to VM-Tips App</a></p>";
    echo "<p><strong>Next steps:</strong></p>";
    echo "<ul>";
    echo "<li>Login as admin (admin@vm-tips.se / admin123)</li>";
    echo "<li>Go to Admin panel</li>";
    echo "<li>Create matches in the 'Matcher' tab</li>";
    echo "<li>Users can register and start betting!</li>";
    echo "</ul>";
    
} catch (PDOException $e) {
    echo "<h2>❌ Database Setup Failed</h2>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Please check your database credentials and try again.</p>";
}

echo "</body></html>";
?>