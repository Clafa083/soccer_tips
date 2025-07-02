<?php
// Special bets API endpoints

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../utils/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle _method override for servers that don't support PUT/DELETE
if ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

error_log("DEBUG special-bets.php: Method = " . $method);

try {
    switch ($method) {
        case 'GET':
            getSpecialBets();
            break;

        case 'POST':
            createSpecialBet();
            break;

        case 'PUT':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($id > 0) {
                updateSpecialBet($id);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID required for update']);
            }
            break;

        case 'DELETE':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($id > 0) {
                deleteSpecialBet($id);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID required for delete']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}

function getSpecialBets() {
    try {
        $db = Database::getInstance()->getConnection();
        
        $query = "SELECT * FROM special_bets WHERE is_active = 1 ORDER BY id ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $special_bets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Parse JSON options field and handle correct_option
        foreach ($special_bets as &$bet) {
            if ($bet['options']) {
                $bet['options'] = json_decode($bet['options'], true);
            } else {
                $bet['options'] = [];
            }
            $bet['is_active'] = (bool)$bet['is_active'];
            
            // Only include correct_option for admin users
            $user = authenticateToken();
            if (!$user || $user['role'] !== 'admin') {
                unset($bet['correct_option']);
            }
        }
        
        echo json_encode($special_bets);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function createSpecialBet() {
    // Debug: Log authentication attempt
    error_log('createSpecialBet called');
    
    // Get all headers for debugging
    $headers = getallheaders();
    error_log('Headers: ' . print_r($headers, true));
    
    // Try to authenticate
    $user = authenticateToken();
    error_log('User from auth: ' . print_r($user, true));
    
    if (!$user) {
        error_log('No user found from authentication');
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    if ($user['role'] !== 'admin') {
        error_log('User is not admin: ' . $user['role']);
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        return;
    }
      $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['question']) || !isset($input['points']) || !isset($input['options'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Question, points, and options are required']);
        return;
    }
    
    if (!is_array($input['options']) || empty($input['options'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Options must be a non-empty array']);
        return;
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $options = json_encode($input['options']);
        $correct_option = isset($input['correct_option']) ? $input['correct_option'] : null;
        $is_active = isset($input['is_active']) ? $input['is_active'] : true;
        
        $query = "
            INSERT INTO special_bets (question, options, correct_option, points, is_active)
            VALUES (?, ?, ?, ?, ?)
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $input['question'],
            $options,
            $correct_option,
            $input['points'],
            $is_active
        ]);
        
        $special_bet_id = $db->lastInsertId();
          // Return the created special bet
        $stmt = $db->prepare("SELECT * FROM special_bets WHERE id = ?");
        $stmt->execute([$special_bet_id]);
        $special_bet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($special_bet['options']) {
            $special_bet['options'] = json_decode($special_bet['options'], true);
        } else {
            $special_bet['options'] = [];
        }
        $special_bet['is_active'] = (bool)$special_bet['is_active'];
        
        echo json_encode($special_bet);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function updateSpecialBet($id) {
    // Require admin authentication
    $user = authenticateToken();
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $updates = [];
        $values = [];
          if (isset($input['question'])) {
            $updates[] = "question = ?";
            $values[] = $input['question'];
        }
        
        if (isset($input['options'])) {
            if (!is_array($input['options']) || empty($input['options'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Options must be a non-empty array']);
                return;
            }
            $updates[] = "options = ?";
            $values[] = json_encode($input['options']);
        }
        
        if (isset($input['correct_option'])) {
            $updates[] = "correct_option = ?";
            $values[] = $input['correct_option'];
        }
        
        if (isset($input['points'])) {
            $updates[] = "points = ?";
            $values[] = $input['points'];
        }
        
        if (isset($input['is_active'])) {
            $updates[] = "is_active = ?";
            $values[] = $input['is_active'];
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields to update']);
            return;
        }
        
        $values[] = $id;
        
        $query = "UPDATE special_bets SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute($values);
          // Calculate points for existing user bets if correct_option was updated
        if (isset($input['correct_option'])) {
            calculateSpecialBetPoints($id);
        }
        
        // Return the updated special bet
        $stmt = $db->prepare("SELECT * FROM special_bets WHERE id = ?");
        $stmt->execute([$id]);
        $special_bet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($special_bet) {
            if ($special_bet['options']) {
                $special_bet['options'] = json_decode($special_bet['options'], true);
            } else {
                $special_bet['options'] = [];
            }
            $special_bet['is_active'] = (bool)$special_bet['is_active'];
            echo json_encode($special_bet);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Special bet not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function deleteSpecialBet($id) {
    // Require admin authentication
    $user = authenticateToken();
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        return;
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Start transaction to ensure both operations succeed or fail together
        $db->beginTransaction();
        
        // First delete all user bets for this special bet
        $stmt = $db->prepare("DELETE FROM user_special_bets WHERE special_bet_id = ?");
        $user_bets_deleted = $stmt->execute([$id]);
        $user_bets_count = $stmt->rowCount();
        
        // Then delete the special bet itself
        $stmt = $db->prepare("DELETE FROM special_bets WHERE id = ?");
        $special_bet_deleted = $stmt->execute([$id]);
        $special_bet_count = $stmt->rowCount();
        
        if ($special_bet_count > 0) {
            // Commit transaction
            $db->commit();
            echo json_encode([
                'message' => 'Special bet deleted successfully',
                'user_bets_deleted' => $user_bets_count
            ]);
        } else {
            // Rollback transaction
            $db->rollBack();
            http_response_code(404);
            echo json_encode(['error' => 'Special bet not found']);
        }
    } catch (PDOException $e) {
        // Rollback transaction on error
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function calculateSpecialBetPoints($special_bet_id) {
    try {
        $db = Database::getInstance()->getConnection();
        
        // Get the special bet with correct option
        $stmt = $db->prepare("SELECT correct_option, points FROM special_bets WHERE id = ?");
        $stmt->execute([$special_bet_id]);
        $special_bet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$special_bet || !$special_bet['correct_option']) {
            return;
        }
        
        $correct_option = $special_bet['correct_option'];
        $max_points = $special_bet['points'];
        
        // Get all user bets for this special bet
        $stmt = $db->prepare("SELECT id, selected_option FROM user_special_bets WHERE special_bet_id = ?");
        $stmt->execute([$special_bet_id]);
        $user_bets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($user_bets as $user_bet) {
            $points = 0;
            
            // Check if user's selected option matches correct option (case-insensitive)
            if (strcasecmp(trim($user_bet['selected_option']), trim($correct_option)) === 0) {
                $points = $max_points;
            }
            
            // Update user bet points
            $update_stmt = $db->prepare("UPDATE user_special_bets SET points = ? WHERE id = ?");
            $update_stmt->execute([$points, $user_bet['id']]);
        }
    } catch (PDOException $e) {
        error_log('Error calculating special bet points: ' . $e->getMessage());
    }
}
?>