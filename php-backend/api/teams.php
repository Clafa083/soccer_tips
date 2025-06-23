<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

// Set JSON headers directly without using functions
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Check for method override (for servers that don't support PUT/DELETE)
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    try {
        $db = Database::getInstance()->getConnection();
        
        // Check if this is a group request
        $group = $_GET['group'] ?? null;
        
        if ($group) {
            // Get teams by group
            $stmt = $db->prepare('SELECT * FROM teams WHERE `group` = ? ORDER BY name');
            $stmt->execute([$group]);
        } else {
            // Get all teams
            $stmt = $db->prepare('SELECT * FROM teams ORDER BY `group`, name');
            $stmt->execute();
        }
        
        $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure we have an array
        if (!is_array($teams)) {
            $teams = [];
        }
        
        // Format teams for frontend
        $formattedTeams = array_map(function($team) {
            return [
                'id' => (int)($team['id'] ?? 0),
                'name' => $team['name'] ?? 'Unknown Team',
                'group' => $team['group'] ?? null,
                'flag_url' => $team['flag_url'] ?? null,
                'created_at' => $team['created_at'] ?? date('Y-m-d H:i:s'),
                'updated_at' => $team['updated_at'] ?? date('Y-m-d H:i:s')
            ];
        }, $teams);
        
        http_response_code(200);
        echo json_encode($formattedTeams);
        
    } catch (Exception $e) {
        error_log('Error getting teams: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get teams: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST' && !isset($_GET['_method'])) {    // Create new team - require authentication
    try {
        // Verify admin authentication
        $userData = authenticateToken();
        if (!$userData || $userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }
        
        $db = Database::getInstance()->getConnection();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($input['name']) || empty(trim($input['name']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Team name is required']);
            exit();
        }
        
        // Prepare insert statement
        $stmt = $db->prepare("
            INSERT INTO teams (name, `group`, flag_url, created_at, updated_at) 
            VALUES (?, ?, ?, NOW(), NOW())
        ");
        
        $stmt->execute([
            trim($input['name']),
            $input['group'] ?? null,
            $input['flag'] ?? $input['flag_url'] ?? null
        ]);
        
        $teamId = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode(['message' => 'Team created successfully', 'id' => $teamId]);
        
    } catch (Exception $e) {
        error_log('Error creating team: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create team: ' . $e->getMessage()]);
    }
} elseif ($method === 'PUT') {    // Update existing team - require authentication
    try {
        // Verify admin authentication
        $userData = authenticateToken();
        if (!$userData || $userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }
        
        $db = Database::getInstance()->getConnection();
        
        // Get team ID from URL query parameter
        $teamId = null;
        if (isset($_GET['id'])) {
            $teamId = (int)$_GET['id'];
        }
        
        if (!$teamId) {
            http_response_code(400);
            echo json_encode(['error' => 'Team ID is required']);
            exit();
        }
        
        // Get JSON input - handle PUT requests like matches.php
        $rawInput = '';
        $input = [];
        
        if ($_SERVER['REQUEST_METHOD'] === 'PUT' || ($method === 'PUT' && $_SERVER['REQUEST_METHOD'] === 'POST')) {
            $rawInput = file_get_contents('php://input');
            
            if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) {
                $input = $_POST;
                unset($input['_method']);
            }
            
            if (!empty($rawInput) && empty($input)) {
                $jsonInput = json_decode($rawInput, true);
                if ($jsonInput !== null) {
                    $input = $jsonInput;
                    unset($input['_method']);
                } else {
                    parse_str($rawInput, $input);
                    unset($input['_method']);
                }
            }
            
            if (!is_array($input) || empty($input)) {
                $input = array_merge($_GET, $_POST);
                unset($input['_method'], $input['id'], $input['token']);
            }
        }
        
        // Debug logging
        error_log('=== TEAM UPDATE DEBUG START ===');
        error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
        error_log('Detected Method: ' . $method);
        error_log('Team ID: ' . $teamId);
        error_log('Raw Input: ' . $rawInput);
        error_log('Decoded Input: ' . json_encode($input));
        error_log('=== TEAM UPDATE DEBUG END ===');
        
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Could not parse input data']);
            exit();
        }
        
        // Check if team exists
        $stmt = $db->prepare("SELECT id FROM teams WHERE id = ?");
        $stmt->execute([$teamId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Team not found']);
            exit();
        }
        
        // Prepare update statement
        $updateFields = [];
        $updateValues = [];
        
        if (isset($input['name']) && !empty(trim($input['name']))) {
            $updateFields[] = 'name = ?';
            $updateValues[] = trim($input['name']);
        }
        if (isset($input['group'])) {
            $updateFields[] = '`group` = ?';
            $updateValues[] = $input['group'];
        }
        if (isset($input['flag']) || isset($input['flag_url'])) {
            $updateFields[] = 'flag_url = ?';
            $updateValues[] = $input['flag'] ?? $input['flag_url'];
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode([
                'error' => 'No fields to update',
                'received_input' => $input,
                'expected_fields' => ['name', 'group', 'flag', 'flag_url']
            ]);
            exit();
        }
        
        $updateFields[] = 'updated_at = NOW()';
        $updateValues[] = $teamId;
        
        $sql = "UPDATE teams SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        http_response_code(200);
        echo json_encode(['message' => 'Team updated successfully']);
        
    } catch (Exception $e) {
        error_log('Error updating team: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update team: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {    // Delete team - require authentication
    try {
        // Verify admin authentication
        $userData = authenticateToken();
        if (!$userData || $userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }
        
        $db = Database::getInstance()->getConnection();
        
        // Get team ID from URL query parameter
        $teamId = null;
        if (isset($_GET['id'])) {
            $teamId = (int)$_GET['id'];
        }
        
        if (!$teamId) {
            http_response_code(400);
            echo json_encode(['error' => 'Team ID is required']);
            exit();
        }
        
        // Check if team exists
        $stmt = $db->prepare("SELECT id FROM teams WHERE id = ?");
        $stmt->execute([$teamId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Team not found']);
            exit();
        }
        
        // Delete team
        $stmt = $db->prepare("DELETE FROM teams WHERE id = ?");
        $stmt->execute([$teamId]);
        
        http_response_code(200);
        echo json_encode(['message' => 'Team deleted successfully']);
        
    } catch (Exception $e) {
        error_log('Error deleting team: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete team: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
