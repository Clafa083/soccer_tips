<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication and admin rights
$user = authenticateToken();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Check if user is admin
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit();
}

try {
    $db = Database::getInstance()->getConnection();
    $action = $_GET['action'] ?? '';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        switch ($action) {            case 'users':
                // Get all users with real stats from bets table
                $stmt = $db->prepare("
                    SELECT 
                        u.*,
                        COALESCE(SUM(b.points), 0) as total_points,
                        COUNT(b.id) as total_bets
                    FROM users u
                    LEFT JOIN bets b ON u.id = b.user_id
                    GROUP BY u.id
                    ORDER BY total_points DESC, u.created_at DESC
                ");
                $stmt->execute();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $result = [];
                foreach ($users as $user) {
                    $result[] = [
                        'id' => (int)$user['id'],
                        'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                        'email' => $user['email'] ?? '',
                        'image_url' => $user['image_url'] ?? null,
                        'role' => $user['role'] ?? 'user',
                        'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s'),
                        'totalBets' => (int)$user['total_bets'],
                        'totalPoints' => (int)$user['total_points']
                    ];
                }
                
                echo json_encode($result);
                break;            case 'stats':
                // Get real betting statistics
                $stmt = $db->prepare("SELECT COUNT(*) as total_users FROM users");
                $stmt->execute();
                $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'];
                
                $stmt = $db->prepare("SELECT COUNT(*) as total_matches FROM matches");
                $stmt->execute();
                $totalMatches = $stmt->fetch(PDO::FETCH_ASSOC)['total_matches'];
                
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
                
                // Get top scorer
                $stmt = $db->prepare("
                    SELECT u.name, u.username, COALESCE(SUM(b.points), 0) as total_points
                    FROM users u
                    LEFT JOIN bets b ON u.id = b.user_id
                    GROUP BY u.id
                    ORDER BY total_points DESC
                    LIMIT 1
                ");
                $stmt->execute();
                $topScorer = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $stats = [
                    'totalUsers' => (int)$totalUsers,
                    'totalMatches' => (int)$totalMatches,
                    'totalBets' => (int)$totalBets,
                    'finishedMatches' => (int)$finishedMatches,
                    'averagePoints' => round($averagePoints, 1),
                    'topScorer' => $topScorer && $topScorer['total_points'] > 0 ? [
                        'name' => $topScorer['name'] ?? $topScorer['username'] ?? 'Unknown',
                        'totalPoints' => (int)$topScorer['total_points']
                    ] : null
                ];
                
                echo json_encode($stats);
                break;
            case 'user-bets':
                // Get detailed bets for a specific user
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
                $bets = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $result = [
                    'user' => [
                        'id' => (int)$user['id'],
                        'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                        'email' => $user['email'] ?? '',
                        'image_url' => $user['image_url'] ?? null,
                        'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s')
                    ],
                    'bets' => []
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
                }
                
                echo json_encode($result);
                break;
            case 'match-bets':
                // Get all bets for a specific match
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

            default:
                echo json_encode(['message' => 'Admin endpoint working', 'status' => 'success']);
                break;
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if ($action === 'delete') {
            $userId = (int)($_GET['id'] ?? 0);
            
            if ($userId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid user ID']);
                exit();
            }
            
            // Check if user is not admin
            $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$targetUser) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
            
            if ($targetUser['role'] === 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Cannot delete admin users']);
                exit();
            }
            
            // Delete user and their bets
            $db->beginTransaction();
            try {
                // Delete user's bets first (if bets table exists)
                // $stmt = $db->prepare("DELETE FROM bets WHERE user_id = ?");
                // $stmt->execute([$userId]);
                
                // Delete user
                $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                
                $db->commit();
                echo json_encode(['message' => 'User deleted successfully']);
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        if ($action === 'update-role') {
            $userId = (int)($_GET['id'] ?? 0);
            $input = json_decode(file_get_contents('php://input'), true);
            $newRole = $input['role'] ?? '';
            
            if ($userId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid user ID']);
                exit();
            }
            
            if (!in_array($newRole, ['user', 'admin'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid role. Must be "user" or "admin"']);
                exit();
            }
            
            // Check if target user exists
            $stmt = $db->prepare("SELECT id, role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$targetUser) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
            
            // Update user role
            $stmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$newRole, $userId]);
            
            echo json_encode([
                'message' => 'User role updated successfully',
                'userId' => $userId,
                'newRole' => $newRole
            ]);        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($action === 'calculate-points') {
            // Calculate points for all bets based on finished matches
            $updatedBets = 0;
            $finishedMatches = 0;
            
            try {
                $db->beginTransaction();
                
                // Get all finished matches
                $matchesStmt = $db->prepare("
                    SELECT m.*, ht.name as home_team_name, at.name as away_team_name 
                    FROM matches m
                    LEFT JOIN teams ht ON m.home_team_id = ht.id
                    LEFT JOIN teams at ON m.away_team_id = at.id
                    WHERE m.status = 'finished' 
                    AND m.home_score IS NOT NULL 
                    AND m.away_score IS NOT NULL
                ");
                $matchesStmt->execute();
                $finishedMatchesData = $matchesStmt->fetchAll(PDO::FETCH_ASSOC);
                $finishedMatches = count($finishedMatchesData);
                
                foreach ($finishedMatchesData as $match) {
                    // Get all bets for this match
                    $betsStmt = $db->prepare("
                        SELECT * FROM bets WHERE match_id = ?
                    ");
                    $betsStmt->execute([$match['id']]);
                    $bets = $betsStmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    foreach ($bets as $bet) {
                        $points = 0;
                        
                        if ($match['matchType'] === 'GROUP') {
                            // Group stage scoring
                            if ($bet['home_score'] !== null && $bet['away_score'] !== null) {
                                $actualResult = $match['home_score'] <=> $match['away_score']; // -1, 0, or 1
                                $betResult = $bet['home_score'] <=> $bet['away_score'];
                                
                                // 1 point for correct 1/X/2 result
                                if ($actualResult === $betResult) {
                                    $points += 1;
                                    
                                    // +1 extra point for exact score
                                    if ($match['home_score'] == $bet['home_score'] && 
                                        $match['away_score'] == $bet['away_score']) {
                                        $points += 1;
                                    }
                                }
                            }
                        }
                        
                        // Update bet with calculated points
                        $updateStmt = $db->prepare("
                            UPDATE bets SET points = ? WHERE id = ?
                        ");
                        $updateStmt->execute([$points, $bet['id']]);
                        $updatedBets++;
                    }
                }
                
                // Now calculate knockout stage points separately
                calculateKnockoutStagePoints($db);

                $db->commit();
                
                echo json_encode([
                    'message' => 'Points calculated successfully',
                    'updatedBets' => $updatedBets,
                    'finishedMatches' => $finishedMatches
                ]);
                
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                throw $e;
            }
        } elseif ($action === 'update-match') {
            // Update match details including group constraints
            $matchId = (int)($_GET['id'] ?? 0);
            $input = json_decode(file_get_contents('php://input'), true);
            
            if ($matchId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid match ID']);
                exit();
            }
            
            // Validate match exists  
            $stmt = $db->prepare("SELECT id FROM matches WHERE id = ?");
            $stmt->execute([$matchId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Match not found']);
                exit();
            }
            
            try {
                // Build update query dynamically based on provided fields
                $updateFields = [];
                $params = [];
                
                if (isset($input['allowed_home_groups'])) {
                    $updateFields[] = 'allowed_home_groups = ?';
                    $params[] = $input['allowed_home_groups'];
                }
                
                if (isset($input['allowed_away_groups'])) {
                    $updateFields[] = 'allowed_away_groups = ?';
                    $params[] = $input['allowed_away_groups'];
                }
                
                if (isset($input['home_group_description'])) {
                    $updateFields[] = 'home_group_description = ?';
                    $params[] = $input['home_group_description'];
                }
                
                if (isset($input['away_group_description'])) {
                    $updateFields[] = 'away_group_description = ?';
                    $params[] = $input['away_group_description'];
                }
                
                if (isset($input['home_team_id'])) {
                    $updateFields[] = 'home_team_id = ?';
                    $params[] = $input['home_team_id'] ?: null;
                }
                
                if (isset($input['away_team_id'])) {
                    $updateFields[] = 'away_team_id = ?';
                    $params[] = $input['away_team_id'] ?: null;
                }
                
                if (isset($input['matchTime'])) {
                    $updateFields[] = 'matchTime = ?';
                    $params[] = $input['matchTime'];
                }
                
                if (isset($input['status'])) {
                    $updateFields[] = 'status = ?';
                    $params[] = $input['status'];
                }
                
                if (isset($input['home_score'])) {
                    $updateFields[] = 'home_score = ?';
                    $params[] = $input['home_score'] !== '' ? (int)$input['home_score'] : null;
                }
                
                if (isset($input['away_score'])) {
                    $updateFields[] = 'away_score = ?';
                    $params[] = $input['away_score'] !== '' ? (int)$input['away_score'] : null;
                }
                
                if (empty($updateFields)) {
                    http_response_code(400);  
                    echo json_encode(['error' => 'No fields to update']);
                    exit();
                }
                
                // Add updated_at timestamp
                $updateFields[] = 'updated_at = NOW()';
                
                // Add match ID to params
                $params[] = $matchId;
                
                $sql = "UPDATE matches SET " . implode(', ', $updateFields) . " WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                
                echo json_encode(['message' => 'Match updated successfully', 'matchId' => $matchId]);
            } catch (Exception $e) {
                error_log('Error updating match: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update match: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

// Function to calculate knockout stage points based on teams that advance to each stage
function calculateKnockoutStagePoints($db) {
    try {
        // 1. Hämta poäng per omgång från knockout_scoring_config
        $configStmt = $db->prepare("SELECT match_type, points_per_correct_team FROM knockout_scoring_config WHERE active = 1");
        $configStmt->execute();
        $configs = $configStmt->fetchAll(PDO::FETCH_KEY_PAIR); // [match_type => points]

        // 2. Hämta alla användare
        $usersStmt = $db->prepare("SELECT id FROM users");
        $usersStmt->execute();
        $users = $usersStmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($users as $userId) {
            // 3. För varje omgång (ROUND_OF_16, QUARTER_FINAL, ...)
            foreach ($configs as $round => $pointsPerTeam) {
                // 4. Hämta användarens tips för denna omgång
                $predStmt = $db->prepare("SELECT id, team_id FROM knockout_predictions WHERE user_id = ? AND round = ?");
                $predStmt->execute([$userId, $round]);
                $userPreds = $predStmt->fetchAll(PDO::FETCH_ASSOC); // [ [id, team_id], ... ]
                if (empty($userPreds)) continue;
                $userTeamIds = array_column($userPreds, 'team_id');

                // 5. Hämta de faktiska lagen som gått vidare till denna omgång
                $actualStmt = $db->prepare("
                    SELECT DISTINCT team_id FROM (
                        SELECT home_team_id as team_id FROM matches WHERE matchType = ? AND home_team_id IS NOT NULL
                        UNION
                        SELECT away_team_id as team_id FROM matches WHERE matchType = ? AND away_team_id IS NOT NULL
                    ) as actual_teams
                ");
                $actualStmt->execute([$round, $round]);
                $actualTeamIds = $actualStmt->fetchAll(PDO::FETCH_COLUMN);
                if (empty($actualTeamIds)) continue;

                // 6. Sätt poäng för varje prediction
                foreach ($userPreds as $pred) {
                    $isCorrect = in_array($pred['team_id'], $actualTeamIds);
                    $points = $isCorrect ? $pointsPerTeam : 0;
                    $updateStmt = $db->prepare("UPDATE knockout_predictions SET points = ? WHERE id = ?");
                    $updateStmt->execute([$points, $pred['id']]);
                }
            }
        }
    } catch (Exception $e) {
        error_log('Error calculating knockout stage points: ' . $e->getMessage());
        throw $e;
    }
}
?>
