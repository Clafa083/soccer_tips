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
    // Get system configuration
    try {
        $db = Database::getInstance()->getConnection();
        
        // Get specific config key if provided
        $configKey = $_GET['key'] ?? null;
        
        if ($configKey) {
            $stmt = $db->prepare('SELECT * FROM system_config WHERE config_key = ?');
            $stmt->execute([$configKey]);
            $config = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$config) {
                http_response_code(404);
                echo json_encode(['error' => 'Configuration key not found']);
                exit();
            }
            
            echo json_encode($config);
        } else {
            // Get all configuration
            $stmt = $db->prepare('SELECT * FROM system_config ORDER BY config_key');
            $stmt->execute();
            $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($configs);
        }
        
    } catch (Exception $e) {
        error_log('Error getting system config: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get system configuration: ' . $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    // Update system configuration - require admin authentication
    try {
        // Verify admin authentication
        $userData = authenticateToken();
        if (!$userData || $userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }
        
        $db = Database::getInstance()->getConnection();
        
        // Get config key from URL
        $configKey = $_GET['key'] ?? null;
        if (!$configKey) {
            http_response_code(400);
            echo json_encode(['error' => 'Configuration key is required']);
            exit();
        }
        
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['config_value'])) {
            http_response_code(400);
            echo json_encode(['error' => 'config_value is required']);
            exit();
        }
        
        // Check if config exists
        $stmt = $db->prepare('SELECT id FROM system_config WHERE config_key = ?');
        $stmt->execute([$configKey]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Configuration key not found']);
            exit();
        }
        
        // Update configuration
        $stmt = $db->prepare('UPDATE system_config SET config_value = ?, updated_at = NOW() WHERE config_key = ?');
        $stmt->execute([$input['config_value'], $configKey]);
        
        // Log the change
        error_log("Admin {$userData['name']} updated system config '{$configKey}' to '{$input['config_value']}'");
        
        http_response_code(200);
        echo json_encode(['message' => 'Configuration updated successfully']);
        
    } catch (Exception $e) {
        error_log('Error updating system config: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update system configuration: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
