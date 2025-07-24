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
                  // Get all matches with this user's bets (if any)
                $stmt = $db->prepare("
                    SELECT 
                        m.id as match_id,
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
                        b.id as bet_id,
                        b.home_score as bet_home_score,
                        b.away_score as bet_away_score,
                        b.home_team_id as bet_home_team_id,
                        b.away_team_id as bet_away_team_id,
                        b.points as bet_points,
                        b.created_at as bet_created_at,
                        b.updated_at as bet_updated_at,
                        bht.name as bet_home_team_name,
                        bat.name as bet_away_team_name
                    FROM matches m
                    LEFT JOIN teams ht ON m.home_team_id = ht.id
                    LEFT JOIN teams at ON m.away_team_id = at.id
                    LEFT JOIN bets b ON m.id = b.match_id AND b.user_id = ?
                    LEFT JOIN teams bht ON b.home_team_id = bht.id
                    LEFT JOIN teams bat ON b.away_team_id = bat.id
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
                  // Hämta knockout-poäng
                $knockoutStmt = $db->prepare("SELECT SUM(points) as knockout_points FROM knockout_predictions WHERE user_id = ?");
                $knockoutStmt->execute([$userId]);
                $knockoutRow = $knockoutStmt->fetch(PDO::FETCH_ASSOC);
                $knockoutPoints = $knockoutRow && $knockoutRow['knockout_points'] !== null ? (int)$knockoutRow['knockout_points'] : 0;

                $result = [
                    'user' => [
                        'id' => (int)$user['id'],
                        'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                        'email' => $user['email'] ?? '',
                        'image_url' => $user['image_url'] ?? null,
                        'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s')
                    ],
                    'bets' => [],
                    'special_bets' => [],
                    'knockout_points' => $knockoutPoints
                ];
                  foreach ($bets as $match) {
                    // Build bet data (null if no bet exists)
                    $betData = null;
                    if ($match['bet_id'] !== null) {
                        $betData = [
                            'home_score' => $match['bet_home_score'] !== null ? (int)$match['bet_home_score'] : null,
                            'away_score' => $match['bet_away_score'] !== null ? (int)$match['bet_away_score'] : null,
                            'home_team_id' => $match['bet_home_team_id'] !== null ? (int)$match['bet_home_team_id'] : null,
                            'away_team_id' => $match['bet_away_team_id'] !== null ? (int)$match['bet_away_team_id'] : null,
                            'home_team_name' => $match['bet_home_team_name'],
                            'away_team_name' => $match['bet_away_team_name']
                        ];
                    }

                    $result['bets'][] = [
                        'id' => $match['bet_id'] !== null ? (int)$match['bet_id'] : null,
                        'match_id' => (int)$match['match_id'],
                        'points' => $match['bet_points'] !== null ? (int)$match['bet_points'] : 0,
                        'created_at' => $match['bet_created_at'],
                        'updated_at' => $match['bet_updated_at'],
                        'bet' => $betData,
                        'match' => [
                            'home_team_id' => (int)$match['match_home_team_id'],
                            'away_team_id' => (int)$match['match_away_team_id'],
                            'home_team_name' => $match['home_team_name'],
                            'away_team_name' => $match['away_team_name'],
                            'home_score' => $match['match_home_score'] !== null ? (int)$match['match_home_score'] : null,
                            'away_score' => $match['match_away_score'] !== null ? (int)$match['match_away_score'] : null,
                            'matchTime' => $match['matchTime'],
                            'status' => $match['status'],
                            'matchType' => $match['matchType'],
                            'group' => $match['group']
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

            case 'user-search':
                // Sök användare för @-taggning
                $query = $_GET['query'] ?? '';
                $query = trim($query);
                if (strlen($query) < 1) {
                    echo json_encode([]);
                    exit();
                }
                $stmt = $db->prepare("SELECT id, username, name, image_url FROM users WHERE username LIKE ? OR name LIKE ? ORDER BY username ASC LIMIT 10");
                $like = "%$query%";
                $stmt->execute([$like, $like]);
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($users);
                exit();

            case 'knockout-match-predictions':
                // Returnerar vilka användare som tippat på något av lagen i knockout för denna match, samt deras poäng
                $matchId = (int)($_GET['match_id'] ?? 0);
                if ($matchId <= 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid match ID']);
                    exit();
                }
                // Hämta matchinfo
                $matchStmt = $db->prepare("SELECT * FROM matches WHERE id = ?");
                $matchStmt->execute([$matchId]);
                $match = $matchStmt->fetch(PDO::FETCH_ASSOC);
                if (!$match) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Match not found']);
                    exit();
                }
                $round = $match['matchType'];
                $homeTeamId = (int)$match['home_team_id'];
                $awayTeamId = (int)$match['away_team_id'];
                // Hämta poängsats för denna runda
                $scoreStmt = $db->prepare("SELECT points_per_correct_team FROM knockout_scoring_config WHERE match_type = ?");
                $scoreStmt->execute([$round]);
                $scoreRow = $scoreStmt->fetch(PDO::FETCH_ASSOC);
                $pointsPerCorrect = $scoreRow ? (int)$scoreRow['points_per_correct_team'] : 0;
                // Hämta alla knockout-predictions för denna runda
                $predStmt = $db->prepare("
                    SELECT kp.user_id, kp.team_id, u.name, u.username, u.image_url
                    FROM knockout_predictions kp
                    JOIN users u ON kp.user_id = u.id
                    WHERE kp.round = ? AND (kp.team_id = ? OR kp.team_id = ?)
                ");
                $predStmt->execute([$round, $homeTeamId, $awayTeamId]);
                $rows = $predStmt->fetchAll(PDO::FETCH_ASSOC);
                // Hämta laginfo
                $teamStmt = $db->prepare("SELECT id, name, flag_url FROM teams WHERE id IN (?, ?)");
                $teamStmt->execute([$homeTeamId, $awayTeamId]);
                $teams = [];
                while ($row = $teamStmt->fetch(PDO::FETCH_ASSOC)) {
                    $teams[$row['id']] = [
                        'id' => (int)$row['id'],
                        'name' => $row['name'],
                        'flag_url' => $row['flag_url']
                    ];
                }
                // Gruppera på user_id
                $userTips = [];
                foreach ($rows as $row) {
                    $uid = $row['user_id'];
                    if (!isset($userTips[$uid])) {
                        $userTips[$uid] = [
                            'user' => [
                                'id' => (int)$row['user_id'],
                                'name' => $row['name'],
                                'username' => $row['username'],
                                'image_url' => $row['image_url']
                            ],
                            'teams' => [],
                            'points' => 0
                        ];
                    }
                    if (isset($teams[$row['team_id']])) {
                        $userTips[$uid]['teams'][] = $teams[$row['team_id']];
                        $userTips[$uid]['points'] += $pointsPerCorrect;
                    }
                }
                // Returnera som lista
                $result = [
                    'tips' => array_values($userTips)
                ];
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
