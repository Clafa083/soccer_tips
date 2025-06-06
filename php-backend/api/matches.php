<?php
// PHP Backend - Matches Controller  
// Replaces: backend/src/controllers/matchController.ts

require_once __DIR__ . '/../config/database.php';

class MatchController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getAllMatches() {
        try {
            $matches = Database::getInstance()->query('
                SELECT 
                    m.*,
                    ht.name as homeTeamName, ht.flag as homeTeamFlag,
                    at.name as awayTeamName, at.flag as awayTeamFlag
                FROM matches m
                LEFT JOIN teams ht ON m.homeTeamId = ht.id
                LEFT JOIN teams at ON m.awayTeamId = at.id
                ORDER BY m.matchTime ASC
            ');
            
            // Transform data to match frontend expectations
            $formattedMatches = array_map(function($match) {
                return [
                    'id' => (int)$match['id'],
                    'homeTeamId' => $match['homeTeamId'],
                    'awayTeamId' => $match['awayTeamId'],
                    'matchTime' => $match['matchTime'],
                    'matchType' => $match['matchType'],
                    'group' => $match['group'],
                    'homeScore' => $match['homeScore'],
                    'awayScore' => $match['awayScore'],
                    'createdAt' => $match['createdAt'],
                    'updatedAt' => $match['updatedAt'],
                    'homeTeam' => $match['homeTeamId'] ? [
                        'id' => (int)$match['homeTeamId'],
                        'name' => $match['homeTeamName'],
                        'flag' => $match['homeTeamFlag']
                    ] : null,
                    'awayTeam' => $match['awayTeamId'] ? [
                        'id' => (int)$match['awayTeamId'],
                        'name' => $match['awayTeamName'],
                        'flag' => $match['awayTeamFlag']
                    ] : null
                ];
            }, $matches);
            
            jsonResponse($formattedMatches);
            
        } catch (Exception $e) {
            error_log('Error getting matches: ' . $e->getMessage());
            errorResponse('Failed to get matches', 500);
        }
    }
    
    public function getMatchById($matchId) {
        try {
            $matches = Database::getInstance()->query('
                SELECT 
                    m.*,
                    ht.name as homeTeamName, ht.flag as homeTeamFlag,
                    at.name as awayTeamName, at.flag as awayTeamFlag
                FROM matches m
                LEFT JOIN teams ht ON m.homeTeamId = ht.id
                LEFT JOIN teams at ON m.awayTeamId = at.id
                WHERE m.id = ?
            ', [$matchId]);
            
            if (empty($matches)) {
                errorResponse('Match not found', 404);
            }
            
            $match = $matches[0];
            $formattedMatch = [
                'id' => (int)$match['id'],
                'homeTeamId' => $match['homeTeamId'],
                'awayTeamId' => $match['awayTeamId'],
                'matchTime' => $match['matchTime'],
                'matchType' => $match['matchType'],
                'group' => $match['group'],
                'homeScore' => $match['homeScore'],
                'awayScore' => $match['awayScore'],
                'createdAt' => $match['createdAt'],
                'updatedAt' => $match['updatedAt'],
                'homeTeam' => $match['homeTeamId'] ? [
                    'id' => (int)$match['homeTeamId'],
                    'name' => $match['homeTeamName'],
                    'flag' => $match['homeTeamFlag']
                ] : null,
                'awayTeam' => $match['awayTeamId'] ? [
                    'id' => (int)$match['awayTeamId'],
                    'name' => $match['awayTeamName'],
                    'flag' => $match['awayTeamFlag']
                ] : null
            ];
            
            jsonResponse($formattedMatch);
            
        } catch (Exception $e) {
            error_log('Error getting match: ' . $e->getMessage());
            errorResponse('Failed to get match', 500);
        }
    }
}

// Route handling - simplified for direct access
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller = new MatchController();
    
    // Check if this is a specific match request
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', $path);
    
    // Look for numeric ID in path
    $matchId = null;
    foreach ($pathParts as $part) {
        if (is_numeric($part)) {
            $matchId = (int)$part;
            break;
        }
    }
    
    if ($matchId) {
        $controller->getMatchById($matchId);
    } else {
        $controller->getAllMatches();
    }
} else {
    errorResponse('Method not allowed', 405);
}
?>
