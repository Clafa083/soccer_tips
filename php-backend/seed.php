<?php
require_once __DIR__ . '/config/database.php';

echo "Starting database seeding...\n";

try {
    $db = Database::getInstance()->getConnection();
    
    // Clear existing data
    echo "Clearing existing data...\n";
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    $db->exec("TRUNCATE TABLE bets");
    $db->exec("TRUNCATE TABLE matches");
    $db->exec("TRUNCATE TABLE teams");
    $db->exec("TRUNCATE TABLE users");
    $db->exec("TRUNCATE TABLE forum_replies");
    $db->exec("TRUNCATE TABLE forum_posts");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    // Insert teams
    echo "Seeding teams...\n";
    $teams = [
        ['Germany', 'A', 'https://flagcdn.com/w320/de.png'],
        ['Scotland', 'A', 'https://flagcdn.com/w320/gb-sct.png'],
        ['Hungary', 'A', 'https://flagcdn.com/w320/hu.png'],
        ['Switzerland', 'A', 'https://flagcdn.com/w320/ch.png'],
        ['Spain', 'B', 'https://flagcdn.com/w320/es.png'],
        ['Croatia', 'B', 'https://flagcdn.com/w320/hr.png'],
        ['Italy', 'B', 'https://flagcdn.com/w320/it.png'],
        ['Albania', 'B', 'https://flagcdn.com/w320/al.png'],
        ['Slovenia', 'C', 'https://flagcdn.com/w320/si.png'],
        ['Denmark', 'C', 'https://flagcdn.com/w320/dk.png'],
        ['Serbia', 'C', 'https://flagcdn.com/w320/rs.png'],
        ['England', 'C', 'https://flagcdn.com/w320/gb-eng.png'],
        ['Poland', 'D', 'https://flagcdn.com/w320/pl.png'],
        ['Netherlands', 'D', 'https://flagcdn.com/w320/nl.png'],
        ['Austria', 'D', 'https://flagcdn.com/w320/at.png'],
        ['France', 'D', 'https://flagcdn.com/w320/fr.png'],
        ['Belgium', 'E', 'https://flagcdn.com/w320/be.png'],
        ['Slovakia', 'E', 'https://flagcdn.com/w320/sk.png'],
        ['Romania', 'E', 'https://flagcdn.com/w320/ro.png'],
        ['Ukraine', 'E', 'https://flagcdn.com/w320/ua.png'],
        ['Turkey', 'F', 'https://flagcdn.com/w320/tr.png'],
        ['Georgia', 'F', 'https://flagcdn.com/w320/ge.png'],
        ['Portugal', 'F', 'https://flagcdn.com/w320/pt.png'],
        ['Czech Republic', 'F', 'https://flagcdn.com/w320/cz.png']
    ];
    
    $stmt = $db->prepare("INSERT INTO teams (name, `group`, flag_url) VALUES (?, ?, ?)");
    foreach ($teams as $team) {
        $stmt->execute($team);
    }
    
    // Insert users
    echo "Seeding users...\n";
    $password_hash = password_hash('password123', PASSWORD_DEFAULT);    $users = [
        ['admin', 'admin', 'admin@example.com', $password_hash, $password_hash, 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'],
        ['alice', 'alice', 'alice@example.com', $password_hash, $password_hash, 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'],
        ['bob', 'bob', 'bob@example.com', $password_hash, $password_hash, 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'],
        ['charlie', 'charlie', 'charlie@example.com', $password_hash, $password_hash, 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'],
        ['diana', 'diana', 'diana@example.com', $password_hash, $password_hash, 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana']
    ];
    
    $stmt = $db->prepare("INSERT INTO users (username, name, email, password_hash, password, role, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($users as $user) {
        $stmt->execute($user);
    }
    
    // Get team and user IDs for matches and bets
    $team_ids = [];
    $stmt = $db->query("SELECT id, name FROM teams ORDER BY id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $team_ids[$row['name']] = $row['id'];
    }
    
    $user_ids = [];
    $stmt = $db->query("SELECT id, username FROM users ORDER BY id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $user_ids[$row['username']] = $row['id'];
    }
    
    // Insert some matches
    echo "Seeding matches...\n";
    $matches = [
        [$team_ids['Germany'], $team_ids['Scotland'], '2024-06-14 21:00:00', 'finished', 5, 1],
        [$team_ids['Hungary'], $team_ids['Switzerland'], '2024-06-15 15:00:00', 'finished', 1, 3],
        [$team_ids['Spain'], $team_ids['Croatia'], '2024-06-15 18:00:00', 'finished', 3, 0],
        [$team_ids['Italy'], $team_ids['Albania'], '2024-06-15 21:00:00', 'finished', 2, 1],
        [$team_ids['Slovenia'], $team_ids['Denmark'], '2024-06-16 18:00:00', 'scheduled', null, null],
        [$team_ids['Serbia'], $team_ids['England'], '2024-06-16 21:00:00', 'scheduled', null, null],
        [$team_ids['Poland'], $team_ids['Netherlands'], '2024-06-16 15:00:00', 'scheduled', null, null],
        [$team_ids['Austria'], $team_ids['France'], '2024-06-17 21:00:00', 'scheduled', null, null]
    ];
      $stmt = $db->prepare("INSERT INTO matches (home_team_id, away_team_id, matchTime, status, home_score, away_score) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($matches as $match) {
        $stmt->execute($match);
    }
    
    // Get match IDs
    $match_ids = [];
    $stmt = $db->query("SELECT id FROM matches ORDER BY id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $match_ids[] = $row['id'];
    }
    
    // Insert some bets for finished matches
    echo "Seeding bets...\n";
    $bets = [
        // Germany vs Scotland (5-1) - users predicted different scores
        [$user_ids['alice'], $match_ids[0], 3, 1, 1], // Wrong score, right outcome = 1 point
        [$user_ids['bob'], $match_ids[0], 5, 1, 3],   // Exact score = 3 points
        [$user_ids['charlie'], $match_ids[0], 2, 0, 1], // Wrong score, right outcome = 1 point
        
        // Hungary vs Switzerland (1-3)
        [$user_ids['alice'], $match_ids[1], 1, 3, 3], // Exact score = 3 points
        [$user_ids['diana'], $match_ids[1], 0, 2, 1], // Wrong score, right outcome = 1 point
        
        // Spain vs Croatia (3-0)
        [$user_ids['bob'], $match_ids[2], 2, 0, 1], // Wrong score, right outcome = 1 point
        [$user_ids['charlie'], $match_ids[2], 3, 0, 3], // Exact score = 3 points
        
        // Italy vs Albania (2-1)
        [$user_ids['diana'], $match_ids[3], 2, 1, 3], // Exact score = 3 points
        [$user_ids['alice'], $match_ids[3], 1, 0, 1], // Wrong score, right outcome = 1 point
    ];
    
    $stmt = $db->prepare("INSERT INTO bets (userId, match_id, home_score, away_score, points_earned) VALUES (?, ?, ?, ?, ?)");
    foreach ($bets as $bet) {
        $stmt->execute($bet);
    }
    
    // Insert some forum posts
    echo "Seeding forum posts...\n";
    $forum_posts = [
        [$user_ids['alice'], 'Predictions for Group A', 'Who do you think will advance from Group A? Germany looks strong but Switzerland could surprise!', '2024-06-10 10:00:00', '2024-06-10 10:00:00'],
        [$user_ids['bob'], 'Spain looking dominant', 'After that 3-0 win against Croatia, Spain is definitely my pick for the championship. Their midfield is incredible!', '2024-06-16 09:00:00', '2024-06-16 09:00:00'],
        [$user_ids['charlie'], 'Upset predictions?', 'Any bold predictions for upsets in the next round? I have a feeling Georgia might surprise Portugal...', '2024-06-17 14:30:00', '2024-06-17 14:30:00']
    ];
    
    $stmt = $db->prepare("INSERT INTO forum_posts (userId, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)");
    foreach ($forum_posts as $post) {
        $stmt->execute($post);
    }
    
    // Get forum post IDs
    $post_ids = [];
    $stmt = $db->query("SELECT id FROM forum_posts ORDER BY id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $post_ids[] = $row['id'];
    }
    
    // Insert some forum replies
    echo "Seeding forum replies...\n";
    $forum_replies = [
        [$post_ids[0], $user_ids['bob'], 'I agree about Germany, but I think Hungary could be the dark horse in Group A!', '2024-06-10 11:00:00'],
        [$post_ids[0], $user_ids['diana'], 'Switzerland definitely has potential. They always perform well in major tournaments.', '2024-06-10 12:00:00'],
        [$post_ids[1], $user_ids['charlie'], 'Absolutely! That passing game is mesmerizing. Pedri and Gavi are the future.', '2024-06-16 10:00:00'],
        [$post_ids[2], $user_ids['alice'], 'Georgia vs Portugal would be amazing! Though I think France might surprise everyone by struggling.', '2024-06-17 15:00:00']
    ];
    
    $stmt = $db->prepare("INSERT INTO forum_replies (post_id, userId, content, created_at) VALUES (?, ?, ?, ?)");
    foreach ($forum_replies as $reply) {
        $stmt->execute($reply);
    }
    
    echo "Database seeded successfully!\n";
    echo "Sample users created:\n";
    echo "- admin@example.com (password: password123) - Admin user\n";
    echo "- alice@example.com (password: password123) - Regular user\n";
    echo "- bob@example.com (password: password123) - Regular user\n";
    echo "- charlie@example.com (password: password123) - Regular user\n";
    echo "- diana@example.com (password: password123) - Regular user\n";
    
} catch (Exception $e) {
    echo "Error seeding database: " . $e->getMessage() . "\n";
}
?>
