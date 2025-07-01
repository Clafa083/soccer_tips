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
        } elseif ($action === 'import_teams') {
            // Import teams from Football-Data.org API
            $input = json_decode(file_get_contents('php://input'), true);
            $teams = $input['teams'] ?? [];
            
            if (empty($teams)) {
                http_response_code(400);
                echo json_encode(['error' => 'No teams provided']);
                exit();
            }
            
            try {
                $db->beginTransaction();
                $importedCount = 0;
                $skippedCount = 0;
                
                foreach ($teams as $team) {
                    // Check if team already exists by external_id or name
                    $checkStmt = $db->prepare("
                        SELECT id FROM teams 
                        WHERE external_id = ? OR name = ?
                    ");
                    $checkStmt->execute([$team['external_id'], $team['name']]);
                    
                    if (!$checkStmt->fetch()) {
                        // Insert new team
                        $insertStmt = $db->prepare("
                            INSERT INTO teams (external_id, name, short_name, flag_url, `group`, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                        ");
                        $insertStmt->execute([
                            $team['external_id'],
                            $team['name'],
                            $team['short_name'] ?? $team['name'],
                            $team['flag_url'] ?? null,
                            $team['group'] ?? null
                        ]);
                        $importedCount++;
                    } else {
                        $skippedCount++;
                    }
                }
                
                $db->commit();
                echo json_encode([
                    'message' => 'Teams import completed',
                    'imported' => $importedCount,
                    'skipped' => $skippedCount
                ]);
                
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                error_log('Error importing teams: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to import teams: ' . $e->getMessage()]);
            }
        } elseif ($action === 'import_matches') {
            // Import matches from Football-Data.org API
            $input = json_decode(file_get_contents('php://input'), true);
            $matches = $input['matches'] ?? [];
            
            if (empty($matches)) {
                http_response_code(400);
                echo json_encode(['error' => 'No matches provided']);
                exit();
            }
            
            try {
                $db->beginTransaction();
                $importedCount = 0;
                $skippedCount = 0;
                
                foreach ($matches as $match) {
                    // Check if match already exists by external_id
                    $checkStmt = $db->prepare("SELECT id FROM matches WHERE external_id = ?");
                    $checkStmt->execute([$match['external_id']]);
                    
                    if (!$checkStmt->fetch()) {
                        // Find home and away teams by name
                        $homeTeamStmt = $db->prepare("SELECT id FROM teams WHERE name = ? LIMIT 1");
                        $homeTeamStmt->execute([$match['home_team_name']]);
                        $homeTeam = $homeTeamStmt->fetch();
                        
                        $awayTeamStmt = $db->prepare("SELECT id FROM teams WHERE name = ? LIMIT 1");
                        $awayTeamStmt->execute([$match['away_team_name']]);
                        $awayTeam = $awayTeamStmt->fetch();
                        
                        // Determine match type based on stage
                        $matchType = 'GROUP';
                        switch (strtoupper($match['stage'])) {
                            case 'ROUND_OF_16':
                                $matchType = 'ROUND_OF_16';
                                break;
                            case 'QUARTER_FINAL':
                            case 'QUARTER-FINAL':
                                $matchType = 'QUARTER_FINAL';
                                break;
                            case 'SEMI_FINAL':
                            case 'SEMI-FINAL':
                                $matchType = 'SEMI_FINAL';
                                break;
                            case 'FINAL':
                                $matchType = 'FINAL';
                                break;
                            default:
                                $matchType = 'GROUP';
                        }
                        
                        // Insert new match
                        $insertStmt = $db->prepare("
                            INSERT INTO matches (
                                external_id, home_team_id, away_team_id, matchTime, 
                                matchType, `group`, home_score, away_score, status, 
                                created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                        ");
                        $insertStmt->execute([
                            $match['external_id'],
                            $homeTeam ? $homeTeam['id'] : null,
                            $awayTeam ? $awayTeam['id'] : null,
                            $match['match_time'],
                            $matchType,
                            $match['group'],
                            $match['home_score'],
                            $match['away_score'],
                            $match['status']
                        ]);
                        $importedCount++;
                    } else {
                        $skippedCount++;
                    }
                }
                
                $db->commit();
                echo json_encode([
                    'message' => 'Matches import completed',
                    'imported' => $importedCount,
                    'skipped' => $skippedCount
                ]);
                
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                error_log('Error importing matches: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to import matches: ' . $e->getMessage()]);
            }
        } elseif ($action === 'import_teams_api_football') {
            // Import teams from API-Football
            $input = json_decode(file_get_contents('php://input'), true);
            $teams = $input['teams'] ?? [];
            
            if (empty($teams)) {
                http_response_code(400);
                echo json_encode(['error' => 'No teams provided']);
                exit();
            }
            
            try {
                $db->beginTransaction();
                $importedCount = 0;
                $skippedCount = 0;
                
                foreach ($teams as $team) {
                    // Check if team already exists by external_id or name
                    $checkStmt = $db->prepare("
                        SELECT id FROM teams 
                        WHERE external_id = ? OR name = ?
                    ");
                    $checkStmt->execute([$team['external_id'], $team['name']]);
                    
                    if (!$checkStmt->fetch()) {
                        // Insert new team
                        $insertStmt = $db->prepare("
                            INSERT INTO teams (external_id, name, short_name, flag_url, `group`, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                        ");
                        $insertStmt->execute([
                            $team['external_id'],
                            $team['name'],
                            $team['name'], // Use full name as short name for API-Football
                            $team['logo'] ?? null,
                            null // API-Football doesn't provide group info directly
                        ]);
                        $importedCount++;
                    } else {
                        $skippedCount++;
                    }
                }
                
                $db->commit();
                echo json_encode([
                    'message' => 'Teams import completed (API-Football)',
                    'imported' => $importedCount,
                    'skipped' => $skippedCount
                ]);
                
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                error_log('Error importing teams from API-Football: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to import teams: ' . $e->getMessage()]);
            }
        } elseif ($action === 'import_fixtures_api_football') {
            // Import fixtures from API-Football
            $input = json_decode(file_get_contents('php://input'), true);
            $fixtures = $input['fixtures'] ?? [];
            
            if (empty($fixtures)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fixtures provided']);
                exit();
            }
            
            try {
                $db->beginTransaction();
                $importedCount = 0;
                $skippedCount = 0;
                
                foreach ($fixtures as $fixture) {
                    // Check if fixture already exists by external_id
                    $checkStmt = $db->prepare("SELECT id FROM matches WHERE external_id = ?");
                    $checkStmt->execute([$fixture['external_id']]);
                    
                    if (!$checkStmt->fetch()) {
                        // Find home and away teams by external_id
                        $homeTeamStmt = $db->prepare("SELECT id FROM teams WHERE external_id = ? LIMIT 1");
                        $homeTeamStmt->execute([$fixture['home_team_external_id']]);
                        $homeTeam = $homeTeamStmt->fetch();
                        
                        $awayTeamStmt = $db->prepare("SELECT id FROM teams WHERE external_id = ? LIMIT 1");
                        $awayTeamStmt->execute([$fixture['away_team_external_id']]);
                        $awayTeam = $awayTeamStmt->fetch();
                        
                        // Determine match type based on round
                        $matchType = 'GROUP';
                        $round = strtoupper($fixture['round'] ?? '');
                        if (strpos($round, 'FINAL') !== false) {
                            if (strpos($round, 'SEMI') !== false) {
                                $matchType = 'SEMI_FINAL';
                            } elseif (strpos($round, 'QUARTER') !== false) {
                                $matchType = 'QUARTER_FINAL';
                            } else {
                                $matchType = 'FINAL';
                            }
                        } elseif (strpos($round, '16') !== false) {
                            $matchType = 'ROUND_OF_16';
                        }
                        
                        // Convert status to our format
                        $status = 'SCHEDULED';
                        switch ($fixture['status']) {
                            case 'FT':
                            case 'Match Finished':
                                $status = 'FINISHED';
                                break;
                            case 'LIVE':
                            case '1H':
                            case '2H':
                            case 'HT':
                                $status = 'IN_PLAY';
                                break;
                            case 'CANC':
                            case 'PST':
                                $status = 'CANCELLED';
                                break;
                        }
                        
                        // Insert new match
                        $insertStmt = $db->prepare("
                            INSERT INTO matches (
                                external_id, home_team_id, away_team_id, matchTime, 
                                matchType, home_score, away_score, status, 
                                created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                        ");
                        $insertStmt->execute([
                            $fixture['external_id'],
                            $homeTeam ? $homeTeam['id'] : null,
                            $awayTeam ? $awayTeam['id'] : null,
                            $fixture['match_date'],
                            $matchType,
                            $fixture['home_score'] ?? null,
                            $fixture['away_score'] ?? null,
                            $status
                        ]);
                        $importedCount++;
                    } else {
                        $skippedCount++;
                    }
                }
                
                $db->commit();
                echo json_encode([
                    'message' => 'Fixtures import completed (API-Football)',
                    'imported' => $importedCount,
                    'skipped' => $skippedCount
                ]);
                
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                error_log('Error importing fixtures from API-Football: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to import fixtures: ' . $e->getMessage()]);
            }
        } elseif ($action === 'import_excel_teams') {
            // Import teams from Excel data
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            // Debug logging
            error_log('Excel teams import - Raw input: ' . $rawInput);
            error_log('Excel teams import - Decoded input: ' . json_encode($input));
            
            if ($input === null) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data provided']);
                exit();
            }
            
            $teams = $input['teams'] ?? [];
            
            if (empty($teams)) {
                http_response_code(400);
                echo json_encode(['error' => 'No teams data provided', 'debug' => $input]);
                exit();
            }
            
            try {
                $db->beginTransaction();
                
                $importedCount = 0;
                $errors = [];
                
                foreach ($teams as $teamData) {
                    try {
                        // Check if team already exists
                        $checkStmt = $db->prepare("SELECT id FROM teams WHERE name = ?");
                        $checkStmt->execute([$teamData['name']]);
                        
                        if ($checkStmt->fetch()) {
                            $errors[] = "Lag '{$teamData['name']}' finns redan";
                            continue;
                        }
                        
                        // Insert new team
                        $stmt = $db->prepare("
                            INSERT INTO teams (name, `group`, flag_url, short_name, created_at) 
                            VALUES (?, ?, ?, ?, NOW())
                        ");
                        
                        $stmt->execute([
                            $teamData['name'],
                            $teamData['group'] ?? null,
                            $teamData['flag_url'] ?? $teamData['logo'] ?? null, // Use flag_url or fallback to logo
                            $teamData['short_name'] ?? null
                        ]);
                        
                        $importedCount++;
                    } catch (Exception $e) {
                        $errors[] = "Fel vid import av lag '{$teamData['name']}': " . $e->getMessage();
                    }
                }
                
                $db->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => "$importedCount lag importerades framgångsrikt",
                    'imported_count' => $importedCount,
                    'errors' => $errors
                ]);
                
            } catch (Exception $e) {
                $db->rollback();
                error_log('Error importing Excel teams: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to import teams: ' . $e->getMessage()]);
            }
            
        } elseif ($action === 'import_excel_matches') {
            // Import matches from Excel data
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            // Debug logging
            error_log('Excel matches import - Raw input: ' . $rawInput);
            error_log('Excel matches import - Decoded input: ' . json_encode($input));
            
            if ($input === null) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data provided']);
                exit();
            }
            
            $matches = $input['matches'] ?? [];
            
            if (empty($matches)) {
                http_response_code(400);
                echo json_encode(['error' => 'No matches data provided', 'debug' => $input]);
                exit();
            }
            
            try {
                $db->beginTransaction();
                
                $importedCount = 0;
                $errors = [];
                
                foreach ($matches as $matchData) {
                    try {
                        // Debug logging för varje match
                        error_log('Processing match: ' . json_encode($matchData));
                        
                        // Find home team
                        $homeTeamStmt = $db->prepare("SELECT id FROM teams WHERE name = ?");
                        $homeTeamStmt->execute([$matchData['homeTeam']]);
                        $homeTeam = $homeTeamStmt->fetch();
                        
                        if (!$homeTeam) {
                            $errors[] = "Hemmalag '{$matchData['homeTeam']}' hittades inte. Tillgängliga lag: " . implode(', ', getAvailableTeamNames($db));
                            error_log("Home team '{$matchData['homeTeam']}' not found");
                            continue;
                        }
                        
                        // Find away team
                        $awayTeamStmt = $db->prepare("SELECT id FROM teams WHERE name = ?");
                        $awayTeamStmt->execute([$matchData['awayTeam']]);
                        $awayTeam = $awayTeamStmt->fetch();
                        
                        if (!$awayTeam) {
                            $errors[] = "Bortalag '{$matchData['awayTeam']}' hittades inte. Tillgängliga lag: " . implode(', ', getAvailableTeamNames($db));
                            error_log("Away team '{$matchData['awayTeam']}' not found");
                            continue;
                        }
                        
                        // Combine date and time - för Excel använder vi bara datum
                        $matchDateTime = $matchData['date'] . ' 00:00:00';
                        
                        // Insert match
                        $stmt = $db->prepare("
                            INSERT INTO matches (
                                home_team_id, away_team_id, matchTime, status, matchType, 
                                `group`, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
                        ");
                        
                        $stmt->execute([
                            $homeTeam['id'],
                            $awayTeam['id'],
                            $matchDateTime,
                            'scheduled', // Alla Excel-matcher startar som schemalagda
                            $matchData['matchType'] ?? 'GROUP',
                            $matchData['group'] ?? null
                        ]);
                        
                        $importedCount++;
                    } catch (Exception $e) {
                        $errors[] = "Fel vid import av match '{$matchData['homeTeam']} vs {$matchData['awayTeam']}': " . $e->getMessage();
                    }
                }
                
                $db->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => "$importedCount matcher importerades framgångsrikt",
                    'imported_count' => $importedCount,
                    'errors' => $errors
                ]);
                
            } catch (Exception $e) {
                $db->rollback();
                error_log('Error importing Excel matches: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to import matches: ' . $e->getMessage()]);
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
        $stagePoints = [
            'ROUND_OF_16' => 2,
            'QUARTER_FINAL' => 3,
            'SEMI_FINAL' => 4,
            'FINAL' => 5
        ];

        $usersStmt = $db->prepare("SELECT id FROM users");
        $usersStmt->execute();
        $users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($users as $user) {
            $userId = $user['id'];

            foreach ($stagePoints as $stage => $pointsPerTeam) {
                // Using positional placeholders as a workaround for a specific server issue with named parameters in UNION queries
                $teamsInStageStmt = $db->prepare("
                    SELECT DISTINCT team_id FROM (
                        SELECT home_team_id as team_id FROM matches WHERE matchType = ? AND home_team_id IS NOT NULL
                        UNION
                        SELECT away_team_id as team_id FROM matches WHERE matchType = ? AND away_team_id IS NOT NULL
                    ) as actual_teams
                ");
                $teamsInStageStmt->execute([$stage, $stage]);
                $actualTeamIds = $teamsInStageStmt->fetchAll(PDO::FETCH_COLUMN);

                if (empty($actualTeamIds)) {
                    continue;
                }

                $userBetsQuery = $db->prepare("
                    SELECT b.home_team_id, b.away_team_id
                    FROM bets b
                    JOIN matches m ON b.match_id = m.id
                    WHERE b.user_id = :userId AND m.matchType = :stage
                ");
                $userBetsQuery->execute([':userId' => $userId, ':stage' => $stage]);
                $betTeams = $userBetsQuery->fetchAll(PDO::FETCH_ASSOC);

                $predictedTeamIds = [];
                foreach ($betTeams as $teams) {
                    if ($teams['home_team_id'] !== null) {
                        $predictedTeamIds[] = $teams['home_team_id'];
                    }
                    if ($teams['away_team_id'] !== null) {
                        $predictedTeamIds[] = $teams['away_team_id'];
                    }
                }
                $uniquePredictedTeamIds = array_unique($predictedTeamIds);

                $correctPredictions = array_intersect($uniquePredictedTeamIds, $actualTeamIds);
                $stagePointsEarned = count($correctPredictions) * $pointsPerTeam;

                $userBetsForStageStmt = $db->prepare("
                    SELECT b.id FROM bets b
                    JOIN matches m ON b.match_id = m.id
                    WHERE b.user_id = :userId AND m.matchType = :stage
                    ORDER BY b.id
                ");
                $userBetsForStageStmt->execute([':userId' => $userId, ':stage' => $stage]);
                $userBetsForStage = $userBetsForStageStmt->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($userBetsForStage)) {
                    $firstBetId = $userBetsForStage[0]['id'];
                    $updatePointsStmt = $db->prepare("UPDATE bets SET points = ? WHERE id = ?");
                    $updatePointsStmt->execute([$stagePointsEarned, $firstBetId]);

                    if (count($userBetsForStage) > 1) {
                        $zeroPointsStmt = $db->prepare("UPDATE bets SET points = 0 WHERE id = ?");
                        for ($i = 1; $i < count($userBetsForStage); $i++) {
                            $otherBetId = $userBetsForStage[$i]['id'];
                            $zeroPointsStmt->execute([$otherBetId]);
                        }
                    }
                }
            }
        }
    } catch (Exception $e) {
        error_log('Error calculating knockout stage points: ' . $e->getMessage());
        throw $e;
    }
}

// Helper function to get available team names
function getAvailableTeamNames($db) {
    $stmt = $db->prepare("SELECT name FROM teams ORDER BY name");
    $stmt->execute();
    $teams = $stmt->fetchAll(PDO::FETCH_COLUMN);
    return $teams;
}
?>
