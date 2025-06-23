<?php
require_once __DIR__ . '/../config/database.php';

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

// Simple matches endpoint without using jsonResponse()
if ($method === 'GET') {
    try {
        $db = Database::getInstance()->getConnection();        // Query to get matches with team names and flags
        $stmt = $db->prepare("
            SELECT 
                m.*,
                ht.name as home_team_name,
                ht.flag_url as home_team_flag_url,
                ht.id as home_team_id_real,
                at.name as away_team_name,
                at.flag_url as away_team_flag_url,
                at.id as away_team_id_real
            FROM matches m 
            LEFT JOIN teams ht ON m.home_team_id = ht.id
            LEFT JOIN teams at ON m.away_team_id = at.id
            ORDER BY m.id ASC 
            LIMIT 10
        ");
        $stmt->execute();
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure we have an array
        if (!is_array($matches)) {
            $matches = [];
        }
        
        // Format matches for frontend
        $formattedMatches = array_map(function($match) {
            return [
                'id' => (int)($match['id'] ?? 0),
                'home_team_id' => $match['home_team_id'] ?? null,
                'away_team_id' => $match['away_team_id'] ?? null,
                'matchTime' => $match['matchTime'] ?? $match['match_time'] ?? date('Y-m-d H:i:s'),
                'matchType' => $match['matchType'] ?? $match['match_type'] ?? 'GROUP',
                'group' => $match['group'] ?? null,
                'home_score' => $match['home_score'] ?? null,
                'away_score' => $match['away_score'] ?? null,
                // Add camelCase versions for compatibility
                'homeScore' => $match['home_score'] ?? null,
                'awayScore' => $match['away_score'] ?? null,
                'homeTeamId' => $match['home_team_id'] ?? null,
                'awayTeamId' => $match['away_team_id'] ?? null,
                'status' => $match['status'] ?? 'scheduled',
                'created_at' => $match['created_at'] ?? date('Y-m-d H:i:s'),
                'updated_at' => $match['updated_at'] ?? date('Y-m-d H:i:s'),                // Add team objects with names and flags
                'homeTeam' => $match['home_team_id'] ? [
                    'id' => (int)$match['home_team_id'],
                    'name' => $match['home_team_name'] ?? 'Unknown Team',
                    'flag_url' => $match['home_team_flag_url'] ?? null,
                    'group' => null // Group info not needed here
                ] : null,
                'awayTeam' => $match['away_team_id'] ? [
                    'id' => (int)$match['away_team_id'],
                    'name' => $match['away_team_name'] ?? 'Unknown Team',
                    'flag_url' => $match['away_team_flag_url'] ?? null,
                    'group' => null // Group info not needed here
                ] : null
            ];
        }, $matches);
        
        // Output JSON directly without using jsonResponse()
        http_response_code(200);
        echo json_encode($formattedMatches);
        
    } catch (Exception $e) {
        error_log('Error getting matches: ' . $e->getMessage());
        http_response_code(500);        echo json_encode(['error' => 'Failed to get matches: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST' && !isset($_GET['_method'])) {
    // Create new match
    try {
        $db = Database::getInstance()->getConnection();
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($input['matchTime']) || !isset($input['matchType'])) {
            http_response_code(400);
            echo json_encode(['error' => 'matchTime and matchType are required']);
            exit();
        }
        
        // Prepare insert statement
        $stmt = $db->prepare("
            INSERT INTO matches (home_team_id, away_team_id, matchTime, matchType, `group`, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 'scheduled', NOW(), NOW())
        ");
          $stmt->execute([
            $input['home_team_id'] ?? $input['homeTeamId'] ?? null,
            $input['away_team_id'] ?? $input['awayTeamId'] ?? null,
            $input['matchTime'],
            $input['matchType'],
            $input['group'] ?? null
        ]);        
        $matchId = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode(['message' => 'Match created successfully', 'id' => $matchId]);
        
    } catch (Exception $e) {
        error_log('Error creating match: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create match: ' . $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    // Update existing match
    try {
        $db = Database::getInstance()->getConnection();
        
        // Get match ID from URL query parameter or path
        $matchId = null;
        if (isset($_GET['id'])) {
            $matchId = (int)$_GET['id'];
        } else {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $pathParts = explode('/', $path);
            foreach ($pathParts as $part) {
                if (is_numeric($part)) {
                    $matchId = (int)$part;
                    break;
                }
            }
        }
        
        if (!$matchId) {
            http_response_code(400);
            echo json_encode(['error' => 'Match ID is required']);
            exit();
        }        // Get JSON input - handle PUT and POST requests with method override
        $rawInput = '';
        $input = [];
        
        // For PUT requests or POST with _method=PUT
        if ($_SERVER['REQUEST_METHOD'] === 'PUT' || ($method === 'PUT' && $_SERVER['REQUEST_METHOD'] === 'POST')) {
            // Method 1: php://input (most common for JSON)
            $rawInput = file_get_contents('php://input');
            
            // Method 2: Try HTTP_RAW_POST_DATA (legacy)
            if (empty($rawInput) && isset($GLOBALS['HTTP_RAW_POST_DATA'])) {
                $rawInput = $GLOBALS['HTTP_RAW_POST_DATA'];
            }
            
            // Method 3: For POST requests, try $_POST first
            if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) {
                $input = $_POST;
                // Remove _method from input data
                unset($input['_method']);
            }
            
            // Method 4: Try to decode JSON from raw input
            if (!empty($rawInput) && empty($input)) {
                $jsonInput = json_decode($rawInput, true);
                if ($jsonInput !== null) {
                    $input = $jsonInput;
                    // Remove _method from input data if present
                    unset($input['_method']);
                } else {
                    // If JSON decode fails, try to parse as form data
                    parse_str($rawInput, $input);
                    unset($input['_method']);
                }
            }
            
            // Method 5: Fallback to combining GET and POST
            if (!is_array($input) || empty($input)) {
                $input = array_merge($_GET, $_POST);
                unset($input['_method'], $input['id'], $input['token']);
            }
        }
          // Debug: Log what we received
        error_log('=== PUT/UPDATE DEBUG START ===');
        error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
        error_log('Detected Method: ' . $method);
        error_log('Match ID: ' . $matchId);
        error_log('Raw Input: ' . $rawInput);
        error_log('Decoded Input: ' . json_encode($input));
        error_log('$_GET: ' . json_encode($_GET));
        error_log('$_POST: ' . json_encode($_POST));
        error_log('Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
        error_log('Content-Length: ' . ($_SERVER['CONTENT_LENGTH'] ?? 'not set'));
        error_log('=== PUT/UPDATE DEBUG END ===');
        
        // Ensure input is an array
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Could not parse input data',
                'received_type' => gettype($input),
                'raw_input' => $rawInput,
                'get_data' => $_GET,
                'post_data' => $_POST
            ]);
            exit();
        }
        
        // Check if match exists
        $stmt = $db->prepare("SELECT id FROM matches WHERE id = ?");
        $stmt->execute([$matchId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Match not found']);
            exit();
        }
        
        // Prepare update statement
        $updateFields = [];
        $updateValues = [];
          // Debug: Check each field individually
        error_log('Input array keys: ' . implode(', ', array_keys($input)));
        error_log('Checking homeTeamId: ' . (isset($input['homeTeamId']) ? 'found (' . $input['homeTeamId'] . ')' : 'not found'));
        error_log('Checking home_team_id: ' . (isset($input['home_team_id']) ? 'found (' . $input['home_team_id'] . ')' : 'not found'));
        error_log('Checking matchTime: ' . (isset($input['matchTime']) ? 'found (' . $input['matchTime'] . ')' : 'not found'));
        
        // Also check for common variations
        foreach ($input as $key => $value) {
            error_log("Key '$key' = '$value' (type: " . gettype($value) . ")");
        }          if (isset($input['homeTeamId']) || isset($input['home_team_id'])) {
            error_log('Adding home_team_id to update fields');
            $updateFields[] = 'home_team_id = ?';
            $updateValues[] = $input['homeTeamId'] ?? $input['home_team_id'];
        } else {
            error_log('homeTeamId/home_team_id not found in input');
        }
        if (isset($input['awayTeamId']) || isset($input['away_team_id'])) {
            error_log('Adding away_team_id to update fields');
            $updateFields[] = 'away_team_id = ?';
            $updateValues[] = $input['awayTeamId'] ?? $input['away_team_id'];
        } else {
            error_log('awayTeamId/away_team_id not found in input');
        }
        if (isset($input['matchTime'])) {
            error_log('Adding matchTime to update fields');
            $updateFields[] = 'matchTime = ?';
            $updateValues[] = $input['matchTime'];
        } else {
            error_log('matchTime not found in input');
        }
        if (isset($input['matchType'])) {
            $updateFields[] = 'matchType = ?';
            $updateValues[] = $input['matchType'];
        }
        if (isset($input['group'])) {
            $updateFields[] = '`group` = ?';
            $updateValues[] = $input['group'];
        }        if (isset($input['homeScore']) || isset($input['home_score'])) {
            $updateFields[] = 'home_score = ?';
            $updateValues[] = $input['homeScore'] ?? $input['home_score'];
        }
        if (isset($input['awayScore']) || isset($input['away_score'])) {
            $updateFields[] = 'away_score = ?';
            $updateValues[] = $input['awayScore'] ?? $input['away_score'];
        }
        if (isset($input['status'])) {
            $updateFields[] = 'status = ?';
            $updateValues[] = $input['status'];
        }
        
        error_log('Final updateFields: ' . json_encode($updateFields));
        error_log('Final updateValues: ' . json_encode($updateValues));
        
        if (empty($updateFields)) {
            error_log('No update fields found. Input keys: ' . implode(', ', array_keys($input)));
            http_response_code(400);
            echo json_encode([
                'error' => 'No fields to update',
                'received_input' => $input,
                'available_keys' => array_keys($input),
                'expected_fields' => ['homeTeamId', 'home_team_id', 'awayTeamId', 'away_team_id', 'matchTime', 'matchType', 'group', 'homeScore', 'home_score', 'awayScore', 'away_score', 'status'],
                'debug_info' => [
                    'homeTeamId_exists' => isset($input['homeTeamId']),
                    'home_team_id_exists' => isset($input['home_team_id']),
                    'matchTime_exists' => isset($input['matchTime'])
                ]
            ]);
            exit();
        }
        
        $updateFields[] = 'updated_at = NOW()';
        $updateValues[] = $matchId;
        
        $sql = "UPDATE matches SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        http_response_code(200);
        echo json_encode(['message' => 'Match updated successfully']);
        
    } catch (Exception $e) {
        error_log('Error updating match: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update match: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    // Delete match
    try {
        $db = Database::getInstance()->getConnection();
        
        // Get match ID from URL query parameter or path
        $matchId = null;
        if (isset($_GET['id'])) {
            $matchId = (int)$_GET['id'];
        } else {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $pathParts = explode('/', $path);
            foreach ($pathParts as $part) {
                if (is_numeric($part)) {
                    $matchId = (int)$part;
                    break;
                }
            }
        }
        
        if (!$matchId) {
            http_response_code(400);
            echo json_encode(['error' => 'Match ID is required']);
            exit();
        }
        
        // Check if match exists
        $stmt = $db->prepare("SELECT id FROM matches WHERE id = ?");
        $stmt->execute([$matchId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Match not found']);
            exit();
        }
        
        // Delete match
        $stmt = $db->prepare("DELETE FROM matches WHERE id = ?");
        $stmt->execute([$matchId]);
        
        http_response_code(200);
        echo json_encode(['message' => 'Match deleted successfully']);
        
    } catch (Exception $e) {
        error_log('Error deleting match: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete match: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
