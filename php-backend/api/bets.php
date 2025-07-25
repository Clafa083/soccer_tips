<?php
// PHP Backend - Bets Controller
// Replaces: backend/src/controllers/betController.ts

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

class BetController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getUserFromToken() {
        $user = authenticateToken();
        
        if (!$user) {
            errorResponse('Authentication required', 401);
        }
        
        return $user;
    }
    
    public function getUserBets() {
        $user = $this->getUserFromToken();
        
        try {
            $bets = Database::getInstance()->query('
                SELECT 
                    b.id, b.user_id, b.match_id, b.home_score, b.away_score,
                    b.home_team_id, b.away_team_id, b.points, b.created_at, b.updated_at,
                    m.matchTime, m.matchType, m.home_score as match_home_score, m.away_score as match_away_score, m.group,
                    ht.name as home_team_name, ht.flag_url as home_team_flag,
                    at.name as away_team_name, at.flag_url as away_team_flag
                FROM bets b
                JOIN matches m ON b.match_id = m.id
                LEFT JOIN teams ht ON m.home_team_id = ht.id
                LEFT JOIN teams at ON m.away_team_id = at.id
                WHERE b.user_id = ?
                ORDER BY m.matchTime ASC
            ', [$user['id']]);
            
            $formattedBets = array_map(function($bet) {
                return [
                    'id' => (int)$bet['id'],
                    'user_id' => (int)$bet['user_id'],
                    'match_id' => (int)$bet['match_id'],
                    'home_score' => $bet['home_score'],
                    'away_score' => $bet['away_score'],
                    'home_team_id' => $bet['home_team_id'],
                    'away_team_id' => $bet['away_team_id'],
                    'points' => $bet['points'],
                    'created_at' => $bet['created_at'],
                    'updated_at' => $bet['updated_at'],
                    'match' => [
                        'id' => (int)$bet['match_id'],
                        'matchTime' => $bet['matchTime'],
                        'matchType' => $bet['matchType'],
                        'group' => $bet['group'],
                        'home_score' => $bet['match_home_score'],
                        'away_score' => $bet['match_away_score'],
                        'homeTeam' => $bet['home_team_name'] ? [
                            'id' => (int)$bet['home_team_id'],
                            'name' => $bet['home_team_name'],
                            'flag' => $bet['home_team_flag']
                        ] : null,
                        'awayTeam' => $bet['away_team_name'] ? [
                            'id' => (int)$bet['away_team_id'],
                            'name' => $bet['away_team_name'],
                            'flag' => $bet['away_team_flag']
                        ] : null
                    ]
                ];
            }, $bets);
            
            jsonResponse($formattedBets);
            
        } catch (Exception $e) {
            error_log('Error getting user bets: ' . $e->getMessage());
            errorResponse('Failed to get bets', 500);
        }
    }    public function createOrUpdateBet() {
        $user = $this->getUserFromToken();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['match_id'])) {
            errorResponse('Match ID required', 400);
        }
        
        $matchId = (int)$input['match_id'];
        
        // Accept both camelCase and snake_case formats for backward compatibility
        $homeScore = null;
        if (isset($input['home_score'])) {
            $homeScore = (int)$input['home_score'];
        } elseif (isset($input['homeScore'])) {
            $homeScore = (int)$input['homeScore'];
        }
        
        $awayScore = null;
        if (isset($input['away_score'])) {
            $awayScore = (int)$input['away_score'];
        } elseif (isset($input['awayScore'])) {
            $awayScore = (int)$input['awayScore'];
        }
        
        $homeTeamId = null;
        if (isset($input['home_team_id'])) {
            $homeTeamId = (int)$input['home_team_id'];
        } elseif (isset($input['homeTeamId'])) {
            $homeTeamId = (int)$input['homeTeamId'];
        }
        
        $awayTeamId = null;
        if (isset($input['away_team_id'])) {
            $awayTeamId = (int)$input['away_team_id'];        } elseif (isset($input['awayTeamId'])) {
            $awayTeamId = (int)$input['awayTeamId'];
        }
        
        // Bestäm vilken user_id som ska användas
        $targetUserId = $user['id'];
        if (isset($input['user_id']) && isset($user['role']) && $user['role'] === 'admin') {
            $targetUserId = (int)$input['user_id'];
        }
        
        try {
            // Check if match exists
            $matches = Database::getInstance()->query(
                'SELECT matchTime FROM matches WHERE id = ?',
                [$matchId]
            );
            
            if (empty($matches)) {
                errorResponse('Match not found', 404);
            }
            
            // Check if bet exists
            $existingBets = Database::getInstance()->query(
                'SELECT id FROM bets WHERE user_id = ? AND match_id = ?',
                [$targetUserId, $matchId]
            );
            
            if (!empty($existingBets)) {
                // Update existing bet
                Database::getInstance()->query(
                    'UPDATE bets SET home_score = ?, away_score = ?, home_team_id = ?, away_team_id = ?, updated_at = NOW() 
                     WHERE user_id = ? AND match_id = ?',
                    [$homeScore, $awayScore, $homeTeamId, $awayTeamId, $targetUserId, $matchId]
                );
                
                $betId = $existingBets[0]['id'];
            } else {
                // Create new bet
                Database::getInstance()->query(
                    'INSERT INTO bets (user_id, match_id, home_score, away_score, home_team_id, away_team_id, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                    [$targetUserId, $matchId, $homeScore, $awayScore, $homeTeamId, $awayTeamId]
                );
                
                $betId = Database::getInstance()->getConnection()->lastInsertId();
            }
            
            jsonResponse([
                'id' => (int)$betId,
                'user_id' => $targetUserId,
                'match_id' => $matchId,
                'home_score' => $homeScore,
                'away_score' => $awayScore,
                'home_team_id' => $homeTeamId,
                'away_team_id' => $awayTeamId
            ]);
            
        } catch (Exception $e) {
            error_log('Error creating/updating bet: ' . $e->getMessage());
            errorResponse('Failed to save bet', 500);
        }
    }
    
    public function getUserBetsById($userId) {
        try {
            $bets = Database::getInstance()->query('
                SELECT 
                    b.id, b.user_id, b.match_id, b.home_score, b.away_score,
                    b.home_team_id, b.away_team_id, b.points, b.created_at, b.updated_at,
                    m.matchTime, m.matchType, m.home_score as match_home_score, m.away_score as match_away_score, m.group,
                    ht.name as home_team_name, ht.flag_url as home_team_flag,
                    at.name as away_team_name, at.flag_url as away_team_flag
                FROM bets b
                JOIN matches m ON b.match_id = m.id
                LEFT JOIN teams ht ON m.home_team_id = ht.id
                LEFT JOIN teams at ON m.away_team_id = at.id
                WHERE b.user_id = ?
                ORDER BY m.matchTime ASC
            ', [$userId]);
            
            $formattedBets = array_map(function($bet) {
                return [
                    'id' => (int)$bet['id'],
                    'user_id' => (int)$bet['user_id'],
                    'match_id' => (int)$bet['match_id'],
                    'home_score' => $bet['home_score'],
                    'away_score' => $bet['away_score'],
                    'home_team_id' => $bet['home_team_id'],
                    'away_team_id' => $bet['away_team_id'],
                    'points' => $bet['points'],
                    'created_at' => $bet['created_at'],
                    'updated_at' => $bet['updated_at'],
                    'match' => [
                        'id' => (int)$bet['match_id'],
                        'matchTime' => $bet['matchTime'],
                        'matchType' => $bet['matchType'],
                        'group' => $bet['group'],
                        'home_score' => $bet['match_home_score'],
                        'away_score' => $bet['match_away_score'],
                        'homeTeam' => $bet['home_team_name'] ? [
                            'id' => (int)$bet['home_team_id'],
                            'name' => $bet['home_team_name'],
                            'flag' => $bet['home_team_flag']
                        ] : null,
                        'awayTeam' => $bet['away_team_name'] ? [
                            'id' => (int)$bet['away_team_id'],
                            'name' => $bet['away_team_name'],
                            'flag' => $bet['away_team_flag']
                        ] : null
                    ]
                ];
            }, $bets);
            
            jsonResponse($formattedBets);
            
        } catch (Exception $e) {
            error_log('Error getting user bets by ID: ' . $e->getMessage());
            errorResponse('Failed to get user bets', 500);
        }
    }
}

// Route handling - simplified for direct access
$method = $_SERVER['REQUEST_METHOD'];

$controller = new BetController();

if ($method === 'GET') {
    if (isset($_GET['user_id'])) {
        // Kontrollera att inloggad användare är admin
        $user = $controller->getUserFromToken();
        if (!isset($user['role']) || $user['role'] !== 'admin') {
            errorResponse('Endast admin kan visa andra användares tips', 403);
        }
        $controller->getUserBetsById((int)$_GET['user_id']);
    } else {
        $controller->getUserBets();
    }
} elseif ($method === 'POST') {
    $controller->createOrUpdateBet();
} else {
    errorResponse('Method not allowed', 405);
}
?>
