<?php
// User special bets API endpoints

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

error_log("DEBUG user-special-bets.php: Method = " . $method);

try {
    switch ($method) {
        case 'GET':
            $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
            if ($user_id > 0) {
                getUserSpecialBets($user_id);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'User ID required']);
            }
            break;

        case 'POST':
            createOrUpdateUserSpecialBet();
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

function getUserSpecialBets($user_id) {
    try {
        $db = Database::getInstance()->getConnection();
        
        $query = "
            SELECT 
                usb.id,
                usb.user_id,
                usb.special_bet_id,
                usb.selected_option,
                usb.points,
                usb.created_at,
                usb.updated_at,
                sb.question,
                sb.options,
                sb.correct_option,
                sb.points as max_points,
                sb.is_active
            FROM user_special_bets usb
            LEFT JOIN special_bets sb ON usb.special_bet_id = sb.id
            WHERE usb.user_id = ?
            ORDER BY sb.id ASC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        
        $user_special_bets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Parse JSON options field
        foreach ($user_special_bets as &$bet) {
            if ($bet['options']) {
                $bet['options'] = json_decode($bet['options'], true);
            } else {
                $bet['options'] = [];
            }
            $bet['is_active'] = (bool)$bet['is_active'];
        }
        
        echo json_encode($user_special_bets);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function createOrUpdateUserSpecialBet() {
    // Debug: Log authentication attempt
    error_log('createOrUpdateUserSpecialBet called');
    
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
      $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['special_bet_id']) || !isset($input['selected_option'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Special bet ID and selected option are required']);
        return;
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Check if special bet exists and is active
        $stmt = $db->prepare("SELECT * FROM special_bets WHERE id = ? AND is_active = 1");
        $stmt->execute([$input['special_bet_id']]);
        $special_bet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$special_bet) {
            http_response_code(404);
            echo json_encode(['error' => 'Active special bet not found']);
            return;
        }
        
        // Validate that selected option is in the available options
        $options = json_decode($special_bet['options'], true);
        if (!in_array($input['selected_option'], $options)) {
            http_response_code(400);
            echo json_encode(['error' => 'Selected option is not valid']);
            return;
        }
        
        // Calculate points if correct option is set
        $points = 0;
        if ($special_bet['correct_option']) {
            if (strcasecmp(trim($input['selected_option']), trim($special_bet['correct_option'])) === 0) {
                $points = $special_bet['points'];
            }
        }
        
        // Check if user already has a bet for this special bet
        $stmt = $db->prepare("SELECT id FROM user_special_bets WHERE user_id = ? AND special_bet_id = ?");
        $stmt->execute([$user['id'], $input['special_bet_id']]);
        $existing_bet = $stmt->fetch(PDO::FETCH_ASSOC);
          if ($existing_bet) {
            // Update existing bet
            $stmt = $db->prepare("
                UPDATE user_special_bets 
                SET selected_option = ?, points = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$input['selected_option'], $points, $existing_bet['id']]);
            $user_special_bet_id = $existing_bet['id'];
        } else {
            // Create new bet
            $stmt = $db->prepare("
                INSERT INTO user_special_bets (user_id, special_bet_id, selected_option, points)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$user['id'], $input['special_bet_id'], $input['selected_option'], $points]);
            $user_special_bet_id = $db->lastInsertId();
        }
        
        // Return the created/updated user special bet
        $stmt = $db->prepare("
            SELECT 
                usb.*,
                sb.question,
                sb.options,
                sb.correct_option,
                sb.points as max_points,
                sb.is_active
            FROM user_special_bets usb
            LEFT JOIN special_bets sb ON usb.special_bet_id = sb.id
            WHERE usb.id = ?
        ");
        $stmt->execute([$user_special_bet_id]);
        $user_special_bet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user_special_bet['options']) {
            $user_special_bet['options'] = json_decode($user_special_bet['options'], true);
        } else {
            $user_special_bet['options'] = [];
        }
        $user_special_bet['is_active'] = (bool)$user_special_bet['is_active'];
        
        echo json_encode($user_special_bet);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>