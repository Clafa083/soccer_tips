<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = Database::getInstance()->getConnection();
          // Simple query to get all users (without assuming column names)
        $stmt = $db->prepare("SELECT * FROM users LIMIT 5");
        
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert to leaderboard format
        $leaderboard = [];
        foreach ($users as $index => $user) {
            $leaderboard[] = [
                'rank' => $index + 1,
                'id' => $user['id'] ?? 0,
                'username' => $user['name'] ?? $user['username'] ?? 'Unknown',
                'email' => $user['email'] ?? '',
                'image_url' => $user['image_url'] ?? null,
                'total_bets' => 0,
                'correct_bets' => 0,
                'points' => 0,
                'success_rate' => 0.0
            ];
        }
        
        echo json_encode($leaderboard);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
