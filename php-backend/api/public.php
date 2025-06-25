<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $db = Database::getInstance()->getConnection();
    $action = $_GET['action'] ?? '';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        switch ($action) {
            case 'match-bets':
                // Get all bets for a specific match (public endpoint)
                $matchId = (int)($_GET['match_id'] ?? 0);
                
                if ($matchId <= 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid match ID']);
                    exit();
                }
                
                // Get match info
                $matchStmt = $db->prepare("
                    SELECT m.*, ht.name as home_team_name, at.name as away_team_name 
                    FROM matches m
                    LEFT JOIN teams ht ON m.home_team_id = ht.id
                    LEFT JOIN teams at ON m.away_team_id = at.id
                    WHERE m.id = ?
                ");
                $matchStmt->execute([$matchId]);
                $match = $matchStmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$match) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Match not found']);
                    exit();
                }
                
                // Get all bets for this match with user details
                $stmt = $db->prepare("
                    SELECT 
                        b.*,
                        u.name as user_name,
                        u.username,
                        u.image_url,
                        bht.name as bet_home_team_name,
                        bat.name as bet_away_team_name
                    FROM bets b
                    JOIN users u ON b.user_id = u.id
                    LEFT JOIN teams bht ON b.home_team_id = bht.id
                    LEFT JOIN teams bat ON b.away_team_id = bat.id
                    WHERE b.match_id = ?
                    ORDER BY u.name ASC
                ");
                $stmt->execute([$matchId]);
                $bets = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $result = [
                    'match' => [
                        'id' => (int)$match['id'],
                        'home_team_id' => (int)$match['home_team_id'],
                        'away_team_id' => (int)$match['away_team_id'],
                        'home_team_name' => $match['home_team_name'],
                        'away_team_name' => $match['away_team_name'],
                        'home_score' => $match['home_score'] !== null ? (int)$match['home_score'] : null,
                        'away_score' => $match['away_score'] !== null ? (int)$match['away_score'] : null,
                        'matchTime' => $match['matchTime'],
                        'status' => $match['status'],
                        'matchType' => $match['matchType'],
                        'group' => $match['group']
                    ],
                    'bets' => []
                ];
                
                foreach ($bets as $bet) {
                    $result['bets'][] = [
                        'id' => (int)$bet['id'],
                        'user_id' => (int)$bet['user_id'],
                        'points' => (int)$bet['points'],
                        'created_at' => $bet['created_at'],
                        'updated_at' => $bet['updated_at'],
                        'user' => [
                            'name' => $bet['user_name'] ?? $bet['username'] ?? 'Unknown',
                            'username' => $bet['username'],
                            'image_url' => $bet['image_url']
                        ],
                        'bet' => [
                            'home_score' => $bet['home_score'] !== null ? (int)$bet['home_score'] : null,
                            'away_score' => $bet['away_score'] !== null ? (int)$bet['away_score'] : null,
                            'home_team_id' => $bet['home_team_id'] !== null ? (int)$bet['home_team_id'] : null,
                            'away_team_id' => $bet['away_team_id'] !== null ? (int)$bet['away_team_id'] : null,
                            'home_team_name' => $bet['bet_home_team_name'],
                            'away_team_name' => $bet['bet_away_team_name']
                        ]
                    ];
                }
                
                echo json_encode($result);
                break;

            case 'user-bets':
                // Get detailed bets for a specific user (public endpoint)
                $userId = (int)($_GET['user_id'] ?? 0);
                
                if ($userId <= 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid user ID']);
                    exit();
                }
                
                // Get user info
                $userStmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                $userStmt->execute([$userId]);
                $user = $userStmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$user) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit();
                }
                  // Get all bets for this user with match details
                $stmt = $db->prepare("
                    SELECT 
                        b.*,
                        m.home_team_id as match_home_team_id,
                        m.away_team_id as match_away_team_id,
                        m.home_score as match_home_score,
                        m.away_score as match_away_score,
                        m.matchTime,
                        m.status,
                        m.matchType,
                        m.group,
                        ht.name as home_team_name,
                        at.name as away_team_name,
                        bht.name as bet_home_team_name,
                        bat.name as bet_away_team_name
                    FROM bets b
                    JOIN matches m ON b.match_id = m.id
                    LEFT JOIN teams ht ON m.home_team_id = ht.id
                    LEFT JOIN teams at ON m.away_team_id = at.id
                    LEFT JOIN teams bht ON b.home_team_id = bht.id
                    LEFT JOIN teams bat ON b.away_team_id = bat.id
                    WHERE b.user_id = ?
                    ORDER BY m.matchTime ASC
                ");
                $stmt->execute([$userId]);
                $bets = $stmt->fetchAll(PDO::FETCH_ASSOC);                // Get special bets for this user
                $specialStmt = $db->prepare("
                    SELECT 
                        usb.*,
                        sb.question,
                        sb.options,
                        sb.correct_option,
                        sb.points as max_points
                    FROM user_special_bets usb
                    JOIN special_bets sb ON usb.special_bet_id = sb.id
                    WHERE usb.user_id = ?
                    ORDER BY sb.id ASC
                ");
                $specialStmt->execute([$userId]);
                $specialBets = $specialStmt->fetchAll(PDO::FETCH_ASSOC);
                  $result = [
                    'user' => [
                        'id' => (int)$user['id'],
                        'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                        'email' => $user['email'] ?? '',
                        'image_url' => $user['image_url'] ?? null,
                        'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s')
                    ],
                    'bets' => [],
                    'special_bets' => []
                ];
                  foreach ($bets as $bet) {
                    $result['bets'][] = [
                        'id' => (int)$bet['id'],
                        'match_id' => (int)$bet['match_id'],
                        'points' => (int)$bet['points'],
                        'created_at' => $bet['created_at'],
                        'updated_at' => $bet['updated_at'],
                        'bet' => [
                            'home_score' => $bet['home_score'] !== null ? (int)$bet['home_score'] : null,
                            'away_score' => $bet['away_score'] !== null ? (int)$bet['away_score'] : null,
                            'home_team_id' => $bet['home_team_id'] !== null ? (int)$bet['home_team_id'] : null,
                            'away_team_id' => $bet['away_team_id'] !== null ? (int)$bet['away_team_id'] : null,
                            'home_team_name' => $bet['bet_home_team_name'],
                            'away_team_name' => $bet['bet_away_team_name']
                        ],
                        'match' => [
                            'home_team_id' => (int)$bet['match_home_team_id'],
                            'away_team_id' => (int)$bet['match_away_team_id'],
                            'home_team_name' => $bet['home_team_name'],
                            'away_team_name' => $bet['away_team_name'],
                            'home_score' => $bet['match_home_score'] !== null ? (int)$bet['match_home_score'] : null,
                            'away_score' => $bet['match_away_score'] !== null ? (int)$bet['match_away_score'] : null,
                            'matchTime' => $bet['matchTime'],
                            'status' => $bet['status'],
                            'matchType' => $bet['matchType'],
                            'group' => $bet['group']
                        ]
                    ];
                }                // Add special bets to result
                foreach ($specialBets as $bet) {
                    $options = $bet['options'] ? json_decode($bet['options'], true) : [];
                    $result['special_bets'][] = [
                        'id' => (int)$bet['id'],
                        'special_bet_id' => (int)$bet['special_bet_id'],
                        'question' => $bet['question'],
                        'selected_option' => $bet['selected_option'],
                        'options' => $options,
                        'correct_option' => $bet['correct_option'], // Will be null until admin sets it
                        'points' => (int)$bet['points'],
                        'max_points' => (int)$bet['max_points'],
                        'created_at' => $bet['created_at'],
                        'updated_at' => $bet['updated_at']
                    ];
                }
                
                echo json_encode($result);
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
                break;
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
