<?php
// PHP Backend - Bets Controller
// Replaces: backend/src/controllers/betController.ts

require_once __DIR__ . '/../config/database.php';

class BetController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    private function getUserFromToken() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            errorResponse('No token provided', 401);
        }
        
        $token = $matches[1];
        $user = $this->verifyJWT($token);
        
        if (!$user) {
            errorResponse('Invalid token', 401);
        }
        
        return $user;
    }
    
    private function verifyJWT($token) {
        // Same JWT verification as in AuthController
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        [$header, $payload, $signature] = $parts;
        
        $expectedSignature = base64url_encode(hash_hmac(
            'sha256',
            $header . '.' . $payload,
            $_ENV['JWT_SECRET'] ?? 'your-secret-key',
            true
        ));
        
        if (!hash_equals($signature, $expectedSignature)) {
            return null;
        }
        
        $data = json_decode(base64url_decode($payload), true);
        
        if ($data['exp'] < time()) {
            return null;
        }
        
        return [
            'id' => $data['id'],
            'email' => $data['email'],
            'name' => $data['name'],
            'isAdmin' => $data['isAdmin']
        ];
    }
    
    public function getUserBets() {
        $user = $this->getUserFromToken();
        
        try {
            $bets = Database::getInstance()->query('
                SELECT 
                    b.id, b.userId, b.matchId, b.homeScore as homeScoreBet, b.awayScore as awayScoreBet,
                    b.homeTeamId, b.awayTeamId, b.points, b.createdAt, b.updatedAt,
                    m.matchTime, m.matchType, m.homeScore, m.awayScore, m.group,
                    ht.name as homeTeamName, ht.flag as homeTeamFlag,
                    at.name as awayTeamName, at.flag as awayTeamFlag
                FROM bets b
                JOIN matches m ON b.matchId = m.id
                LEFT JOIN teams ht ON m.homeTeamId = ht.id
                LEFT JOIN teams at ON m.awayTeamId = at.id
                WHERE b.userId = ?
                ORDER BY m.matchTime ASC
            ', [$user['id']]);
            
            $formattedBets = array_map(function($bet) {
                return [
                    'id' => (int)$bet['id'],
                    'userId' => (int)$bet['userId'],
                    'matchId' => (int)$bet['matchId'],
                    'homeScoreBet' => $bet['homeScoreBet'],
                    'awayScoreBet' => $bet['awayScoreBet'],
                    'homeTeamId' => $bet['homeTeamId'],
                    'awayTeamId' => $bet['awayTeamId'],
                    'points' => $bet['points'],
                    'createdAt' => $bet['createdAt'],
                    'updatedAt' => $bet['updatedAt'],
                    'match' => [
                        'id' => (int)$bet['matchId'],
                        'matchTime' => $bet['matchTime'],
                        'matchType' => $bet['matchType'],
                        'group' => $bet['group'],
                        'homeScore' => $bet['homeScore'],
                        'awayScore' => $bet['awayScore'],
                        'homeTeam' => $bet['homeTeamName'] ? [
                            'id' => (int)$bet['homeTeamId'],
                            'name' => $bet['homeTeamName'],
                            'flag' => $bet['homeTeamFlag']
                        ] : null,
                        'awayTeam' => $bet['awayTeamName'] ? [
                            'id' => (int)$bet['awayTeamId'],
                            'name' => $bet['awayTeamName'],
                            'flag' => $bet['awayTeamFlag']
                        ] : null
                    ]
                ];
            }, $bets);
            
            jsonResponse($formattedBets);
            
        } catch (Exception $e) {
            error_log('Error getting user bets: ' . $e->getMessage());
            errorResponse('Failed to get bets', 500);
        }
    }
    
    public function createOrUpdateBet() {
        $user = $this->getUserFromToken();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['matchId'])) {
            errorResponse('Match ID required', 400);
        }
        
        $matchId = (int)$input['matchId'];
        $homeScoreBet = $input['homeScoreBet'] ?? null;
        $awayScoreBet = $input['awayScoreBet'] ?? null;
        $homeTeamId = $input['homeTeamId'] ?? null;
        $awayTeamId = $input['awayTeamId'] ?? null;
        
        try {
            // Check if match exists and betting is allowed
            $matches = Database::getInstance()->query(
                'SELECT matchTime FROM matches WHERE id = ?',
                [$matchId]
            );
            
            if (empty($matches)) {
                errorResponse('Match not found', 404);
            }
            
            $match = $matches[0];
            $matchTime = new DateTime($match['matchTime']);
            $now = new DateTime();
            
            if ($matchTime <= $now) {
                errorResponse('Betting is closed for this match', 400);
            }
            
            // Check if bet exists
            $existingBets = Database::getInstance()->query(
                'SELECT id FROM bets WHERE userId = ? AND matchId = ?',
                [$user['id'], $matchId]
            );
            
            if (!empty($existingBets)) {
                // Update existing bet
                Database::getInstance()->query(
                    'UPDATE bets SET homeScore = ?, awayScore = ?, homeTeamId = ?, awayTeamId = ?, updatedAt = NOW() 
                     WHERE userId = ? AND matchId = ?',
                    [$homeScoreBet, $awayScoreBet, $homeTeamId, $awayTeamId, $user['id'], $matchId]
                );
                
                $betId = $existingBets[0]['id'];
            } else {
                // Create new bet
                Database::getInstance()->query(
                    'INSERT INTO bets (userId, matchId, homeScore, awayScore, homeTeamId, awayTeamId, createdAt, updatedAt) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                    [$user['id'], $matchId, $homeScoreBet, $awayScoreBet, $homeTeamId, $awayTeamId]
                );
                
                $betId = Database::getInstance()->getConnection()->lastInsertId();
            }
            
            jsonResponse([
                'id' => (int)$betId,
                'userId' => $user['id'],
                'matchId' => $matchId,
                'homeScoreBet' => $homeScoreBet,
                'awayScoreBet' => $awayScoreBet,
                'homeTeamId' => $homeTeamId,
                'awayTeamId' => $awayTeamId
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
                    b.id, b.userId, b.matchId, b.homeScore as homeScoreBet, b.awayScore as awayScoreBet,
                    b.homeTeamId, b.awayTeamId, b.points, b.createdAt, b.updatedAt,
                    m.matchTime, m.matchType, m.homeScore, m.awayScore, m.group,
                    ht.name as homeTeamName, ht.flag as homeTeamFlag,
                    at.name as awayTeamName, at.flag as awayTeamFlag,
                    u.name as userName, u.imageUrl as userImageUrl
                FROM bets b
                JOIN matches m ON b.matchId = m.id
                LEFT JOIN teams ht ON m.homeTeamId = ht.id
                LEFT JOIN teams at ON m.awayTeamId = at.id
                JOIN users u ON b.userId = u.id
                WHERE b.userId = ?
                ORDER BY m.matchTime ASC
            ', [$userId]);
            
            $formattedBets = array_map(function($bet) {
                return [
                    'id' => (int)$bet['id'],
                    'userId' => (int)$bet['userId'],
                    'matchId' => (int)$bet['matchId'],
                    'homeScoreBet' => $bet['homeScoreBet'],
                    'awayScoreBet' => $bet['awayScoreBet'],
                    'homeTeamId' => $bet['homeTeamId'],
                    'awayTeamId' => $bet['awayTeamId'],
                    'points' => $bet['points'],
                    'createdAt' => $bet['createdAt'],
                    'updatedAt' => $bet['updatedAt'],
                    'userName' => $bet['userName'],
                    'userImageUrl' => $bet['userImageUrl'],
                    'match' => [
                        'id' => (int)$bet['matchId'],
                        'matchTime' => $bet['matchTime'],
                        'matchType' => $bet['matchType'],
                        'group' => $bet['group'],
                        'homeScore' => $bet['homeScore'],
                        'awayScore' => $bet['awayScore'],
                        'homeTeam' => $bet['homeTeamName'] ? [
                            'id' => (int)$bet['homeTeamId'],
                            'name' => $bet['homeTeamName'],
                            'flag' => $bet['homeTeamFlag']
                        ] : null,
                        'awayTeam' => $bet['awayTeamName'] ? [
                            'id' => (int)$bet['awayTeamId'],
                            'name' => $bet['awayTeamName'],
                            'flag' => $bet['awayTeamFlag']
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

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

// Route handling - simplified for direct access
$method = $_SERVER['REQUEST_METHOD'];

$controller = new BetController();

if ($method === 'GET') {
    // For now, return empty array for bets
    jsonResponse([]);
} elseif ($method === 'POST') {
    $controller->createOrUpdateBet();
} else {
    errorResponse('Method not allowed', 405);
}
?>
