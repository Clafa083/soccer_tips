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
        try {            $matches = Database::getInstance()->query('
                SELECT 
                    m.*,
                    ht.name as homeTeamName, ht.flag_url as homeTeamFlag,
                    at.name as awayTeamName, at.flag_url as awayTeamFlag
                FROM matches m
                LEFT JOIN teams ht ON m.home_team_id = ht.id
                LEFT JOIN teams at ON m.away_team_id = at.id
                ORDER BY m.matchTime ASC
            ');
              // Transform data to match frontend expectations
            $formattedMatches = array_map(function($match) {
                return [
                    'id' => (int)$match['id'],
                    'home_team_id' => $match['home_team_id'],
                    'away_team_id' => $match['away_team_id'],
                    'matchTime' => $match['matchTime'],
                    'matchType' => $match['matchType'],
                    'group' => $match['group'],
                    'home_score' => $match['home_score'],
                    'away_score' => $match['away_score'],
                    'status' => $match['status'],
                    'created_at' => $match['created_at'],
                    'updated_at' => $match['updated_at'],
                    'homeTeam' => $match['home_team_id'] ? [
                        'id' => (int)$match['home_team_id'],
                        'name' => $match['homeTeamName'],
                        'flag_url' => $match['homeTeamFlag']
                    ] : null,
                    'awayTeam' => $match['away_team_id'] ? [
                        'id' => (int)$match['away_team_id'],
                        'name' => $match['awayTeamName'],
                        'flag_url' => $match['awayTeamFlag']
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
        try {            $matches = Database::getInstance()->query('
                SELECT 
                    m.*,
                    ht.name as homeTeamName, ht.flag_url as homeTeamFlag,
                    at.name as awayTeamName, at.flag_url as awayTeamFlag
                FROM matches m
                LEFT JOIN teams ht ON m.home_team_id = ht.id
                LEFT JOIN teams at ON m.away_team_id = at.id
                WHERE m.id = ?
            ', [$matchId]);
            
            if (empty($matches)) {
                errorResponse('Match not found', 404);
            }
              $match = $matches[0];
            $formattedMatch = [
                'id' => (int)$match['id'],
                'home_team_id' => $match['home_team_id'],
                'away_team_id' => $match['away_team_id'],
                'matchTime' => $match['matchTime'],
                'matchType' => $match['matchType'],
                'group' => $match['group'],
                'home_score' => $match['home_score'],
                'away_score' => $match['away_score'],
                'status' => $match['status'],
                'created_at' => $match['created_at'],
                'updated_at' => $match['updated_at'],
                'homeTeam' => $match['home_team_id'] ? [
                    'id' => (int)$match['home_team_id'],
                    'name' => $match['homeTeamName'],
                    'flag_url' => $match['homeTeamFlag']
                ] : null,
                'awayTeam' => $match['away_team_id'] ? [
                    'id' => (int)$match['away_team_id'],
                    'name' => $match['awayTeamName'],
                    'flag_url' => $match['awayTeamFlag']
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
