<?php
// PHP Backend - Teams Controller
// Replaces: backend/src/controllers/teamController.ts

require_once __DIR__ . '/../config/database.php';

class TeamController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getAllTeams() {
        try {
            $teams = Database::getInstance()->query(
                'SELECT * FROM teams ORDER BY `group`, name'
            );
            
            jsonResponse($teams);
            
        } catch (Exception $e) {
            error_log('Error getting teams: ' . $e->getMessage());
            errorResponse('Failed to get teams', 500);
        }
    }
    
    public function getTeamsByGroup($group) {
        try {
            $teams = Database::getInstance()->query(
                'SELECT * FROM teams WHERE `group` = ? ORDER BY name',
                [$group]
            );
            
            jsonResponse($teams);
            
        } catch (Exception $e) {
            error_log('Error getting teams by group: ' . $e->getMessage());
            errorResponse('Failed to get teams', 500);
        }
    }
}

// Route handling - simplified for direct access
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller = new TeamController();
    
    // Check if this is a group request
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (strpos($path, '/group/') !== false) {
        // Extract group from path like /api/teams/group/A
        $parts = explode('/group/', $path);
        if (count($parts) > 1) {
            $group = $parts[1];
            $controller->getTeamsByGroup($group);
        } else {
            $controller->getAllTeams();
        }
    } else {
        $controller->getAllTeams();
    }
} else {
    errorResponse('Method not allowed', 405);
}
?>
