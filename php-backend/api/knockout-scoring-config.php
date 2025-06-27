<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

// Set JSON headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Check for method override
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    // Get knockout scoring configuration
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare('SELECT * FROM knockout_scoring_config ORDER BY FIELD(match_type, "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "FINAL")');
        $stmt->execute();
        $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($configs);
        
    } catch (Exception $e) {
        error_log('Error getting knockout scoring config: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get knockout scoring configuration: ' . $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    // Update knockout scoring configuration - require admin authentication
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
        if (!isset($input['configs']) || !is_array($input['configs'])) {
            http_response_code(400);
            echo json_encode(['error' => 'configs array is required']);
            exit();
        }
        
        // Begin transaction
        $db->beginTransaction();
        
        try {
            foreach ($input['configs'] as $config) {
                if (!isset($config['id']) || !isset($config['points_per_correct_team'])) {
                    throw new Exception('Each config must have id and points_per_correct_team');
                }
                
                // Validate points
                $points = (int)$config['points_per_correct_team'];
                if ($points < 0 || $points > 100) {
                    throw new Exception('Points must be between 0 and 100');
                }
                
                // Update configuration
                $stmt = $db->prepare('UPDATE knockout_scoring_config SET points_per_correct_team = ?, updated_at = NOW() WHERE id = ?');
                $stmt->execute([$points, $config['id']]);
                
                if ($stmt->rowCount() === 0) {
                    throw new Exception('Configuration with id ' . $config['id'] . ' not found');
                }
            }
            
            $db->commit();
            
            // Log the change
            error_log("Admin {$userData['name']} updated knockout scoring configuration");
            
            http_response_code(200);
            echo json_encode(['message' => 'Knockout scoring configuration updated successfully']);
            
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
        
    } catch (Exception $e) {
        error_log('Error updating knockout scoring config: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update knockout scoring configuration: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
