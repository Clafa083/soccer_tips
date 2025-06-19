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
        
        // Check if stats are requested
        if (isset($_GET['stats']) && $_GET['stats'] == '1') {
            // Return stats
            $stmt = $db->prepare("SELECT COUNT(*) as total_users FROM users");
            $stmt->execute();
            $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'];
            
            $stats = [
                'totalUsers' => (int)$totalUsers,
                'totalBets' => 0, // Could be calculated from bets table
                'averagePoints' => 0.0, // Could be calculated
                'topScorer' => null // Could be calculated
            ];
            
            // Try to get a top scorer (first user for demo)
            if ($totalUsers > 0) {
                $stmt = $db->prepare("SELECT * FROM users LIMIT 1");
                $stmt->execute();
                $topUser = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($topUser) {
                    $stats['topScorer'] = [
                        'id' => $topUser['id'] ?? 0,
                        'username' => $topUser['name'] ?? $topUser['username'] ?? 'Unknown',
                        'name' => $topUser['name'] ?? $topUser['username'] ?? 'Unknown',
                        'email' => $topUser['email'] ?? '',
                        'total_points' => 100, // Demo value
                        'created_at' => $topUser['created_at'] ?? date('Y-m-d H:i:s')
                    ];
                    $stats['averagePoints'] = 50.0; // Demo value
                }
            }
            
            echo json_encode($stats);
        } else {
            // Return leaderboard
            $stmt = $db->prepare("SELECT * FROM users LIMIT 10");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to leaderboard format
            $leaderboard = [];
            foreach ($users as $index => $user) {
                $leaderboard[] = [
                    'rank' => $index + 1,
                    'id' => $user['id'] ?? 0,
                    'username' => $user['name'] ?? $user['username'] ?? 'Unknown',
                    'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                    'email' => $user['email'] ?? '',
                    'image_url' => $user['image_url'] ?? null,
                    'total_points' => ($index + 1) * 10, // Demo points (decreasing)
                    'total_bets' => ($index + 1) * 5, // Demo bets
                    'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s')
                ];
            }
            
            echo json_encode($leaderboard);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
