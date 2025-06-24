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
            // Return real stats
            $stmt = $db->prepare("SELECT COUNT(*) as total_users FROM users");
            $stmt->execute();
            $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'];
            
            $stmt = $db->prepare("SELECT COUNT(*) as total_bets FROM bets");
            $stmt->execute();
            $totalBets = $stmt->fetch(PDO::FETCH_ASSOC)['total_bets'];
            
            $stmt = $db->prepare("SELECT COUNT(*) as finished_matches FROM matches WHERE status = 'finished'");
            $stmt->execute();
            $finishedMatches = $stmt->fetch(PDO::FETCH_ASSOC)['finished_matches'];
            
            $stmt = $db->prepare("SELECT AVG(total_points) as avg_points FROM (SELECT COALESCE(SUM(points), 0) as total_points FROM bets GROUP BY user_id) as user_totals");
            $stmt->execute();
            $avgResult = $stmt->fetch(PDO::FETCH_ASSOC);
            $averagePoints = $avgResult ? (float)$avgResult['avg_points'] : 0.0;
            
            $stats = [
                'totalUsers' => (int)$totalUsers,
                'totalBets' => (int)$totalBets,
                'finishedMatches' => (int)$finishedMatches,
                'averagePoints' => round($averagePoints, 1),
                'topScorer' => null
            ];
            
            // Get real top scorer
            $stmt = $db->prepare("
                SELECT u.*, COALESCE(SUM(b.points), 0) as total_points
                FROM users u
                LEFT JOIN bets b ON u.id = b.user_id
                GROUP BY u.id
                ORDER BY total_points DESC
                LIMIT 1
            ");
            $stmt->execute();
            $topUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($topUser && $topUser['total_points'] > 0) {
                $stats['topScorer'] = [
                    'id' => (int)$topUser['id'],
                    'username' => $topUser['name'] ?? $topUser['username'] ?? 'Unknown',
                    'name' => $topUser['name'] ?? $topUser['username'] ?? 'Unknown',
                    'email' => $topUser['email'] ?? '',
                    'total_points' => (int)$topUser['total_points'],
                    'created_at' => $topUser['created_at'] ?? date('Y-m-d H:i:s')
                ];
            }
            
            echo json_encode($stats);        } else {
            // Return leaderboard with real points from bets table
            $stmt = $db->prepare("
                SELECT 
                    u.*,
                    COALESCE(SUM(b.points), 0) as total_points,
                    COUNT(b.id) as total_bets
                FROM users u
                LEFT JOIN bets b ON u.id = b.user_id
                GROUP BY u.id
                ORDER BY total_points DESC, u.created_at ASC
                LIMIT 20
            ");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert to leaderboard format
            $leaderboard = [];
            foreach ($users as $index => $user) {
                $leaderboard[] = [
                    'rank' => $index + 1,
                    'id' => (int)$user['id'],
                    'username' => $user['name'] ?? $user['username'] ?? 'Unknown',
                    'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                    'email' => $user['email'] ?? '',
                    'image_url' => $user['image_url'] ?? null,
                    'total_points' => (int)$user['total_points'],
                    'total_bets' => (int)$user['total_bets'],
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
