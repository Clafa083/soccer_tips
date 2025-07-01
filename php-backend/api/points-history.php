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
        
        // Get top 5 users by total points
        $stmt = $db->prepare("
            SELECT 
                u.id,
                u.name,
                u.username,
                u.image_url,
                (COALESCE(bet_points.total_bet_points, 0) + COALESCE(special_points.total_special_points, 0)) as total_points
            FROM users u
            LEFT JOIN (
                SELECT user_id, SUM(points) as total_bet_points
                FROM bets 
                GROUP BY user_id
            ) bet_points ON u.id = bet_points.user_id
            LEFT JOIN (
                SELECT user_id, SUM(points) as total_special_points
                FROM user_special_bets 
                GROUP BY user_id
            ) special_points ON u.id = special_points.user_id
            ORDER BY total_points DESC
            LIMIT 5
        ");
        $stmt->execute();
        $topUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get all finished matches ordered by date with team names
        $stmt = $db->prepare("
            SELECT 
                m.id, 
                m.home_team_id,
                m.away_team_id,
                m.home_score, 
                m.away_score, 
                m.matchTime as date, 
                m.status,
                ht.name as home_team,
                at.name as away_team
            FROM matches m
            LEFT JOIN teams ht ON m.home_team_id = ht.id
            LEFT JOIN teams at ON m.away_team_id = at.id
            WHERE m.status = 'finished' 
            ORDER BY m.matchTime ASC
        ");
        $stmt->execute();
        $finishedMatches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $result = [
            'users' => [],
            'matches' => []
        ];
        
        // Format matches for response
        foreach ($finishedMatches as $match) {
            $result['matches'][] = [
                'id' => (int)$match['id'],
                'home_team' => $match['home_team'] ?? 'Team ' . $match['home_team_id'],
                'away_team' => $match['away_team'] ?? 'Team ' . $match['away_team_id'],
                'home_score' => (int)$match['home_score'],
                'away_score' => (int)$match['away_score'],
                'date' => $match['date'],
                'display_name' => ($match['home_team'] ?? 'Team ' . $match['home_team_id']) . ' - ' . ($match['away_team'] ?? 'Team ' . $match['away_team_id'])
            ];
        }
        
        // For each top user, calculate cumulative points after each match
        foreach ($topUsers as $user) {
            $userHistory = [
                'id' => (int)$user['id'],
                'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                'username' => $user['username'],
                'image_url' => $user['image_url'],
                'total_points' => (int)$user['total_points'],
                'points_history' => []
            ];
            
            $cumulativePoints = 0;
            
            // For each finished match, calculate points earned
            foreach ($finishedMatches as $match) {
                // Get points earned from regular bets for this match
                $stmt = $db->prepare("
                    SELECT COALESCE(SUM(points), 0) as match_points
                    FROM bets 
                    WHERE user_id = ? AND match_id = ?
                ");
                $stmt->execute([$user['id'], $match['id']]);
                $matchPoints = $stmt->fetch(PDO::FETCH_ASSOC)['match_points'];
                
                $cumulativePoints += (int)$matchPoints;
                
                $userHistory['points_history'][] = [
                    'match_id' => (int)$match['id'],
                    'points_earned' => (int)$matchPoints,
                    'cumulative_points' => $cumulativePoints
                ];
            }
            
            // Add special bet points at the end (they don't belong to specific matches)
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(points), 0) as special_points
                FROM user_special_bets 
                WHERE user_id = ?
            ");
            $stmt->execute([$user['id']]);
            $specialPoints = $stmt->fetch(PDO::FETCH_ASSOC)['special_points'];
            
            // Add special points to the final cumulative total
            if ($specialPoints > 0 && count($userHistory['points_history']) > 0) {
                $lastIndex = count($userHistory['points_history']) - 1;
                $userHistory['points_history'][$lastIndex]['cumulative_points'] += (int)$specialPoints;
            }
            
            $result['users'][] = $userHistory;
        }
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
