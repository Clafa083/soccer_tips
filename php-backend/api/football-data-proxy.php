<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication and admin rights
$user = authenticateToken();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    $competitionCode = $_GET['competition'] ?? '';
    
    // Football-Data.org API configuration
    $apiKey = '347cb842461d4337a96740741e9cb1a6';
    $baseUrl = 'https://api.football-data.org/v4';
    
    try {
        switch ($action) {
            case 'competitions':
                $url = $baseUrl . '/competitions';
                break;
                
            case 'teams':
                if (empty($competitionCode)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Competition code required']);
                    exit();
                }
                $url = $baseUrl . '/competitions/' . urlencode($competitionCode) . '/teams';
                break;
                
            case 'matches':
                if (empty($competitionCode)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Competition code required']);
                    exit();
                }
                $url = $baseUrl . '/competitions/' . urlencode($competitionCode) . '/matches';
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
                exit();
        }
        
        // Make the API request
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'X-Auth-Token: ' . $apiKey,
                    'User-Agent: Soccer-Tips-App/1.0'
                ],
                'timeout' => 30
            ]
        ]);
        
        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            $error = error_get_last();
            throw new Exception('Failed to fetch data from Football-Data.org: ' . ($error['message'] ?? 'Unknown error'));
        }
        
        // Check if we got a valid JSON response
        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from Football-Data.org');
        }
        
        // Check for API errors
        if (isset($data['errorCode'])) {
            throw new Exception('Football-Data.org API error: ' . ($data['message'] ?? 'Unknown error'));
        }
        
        // Return the data
        echo $response;
        
    } catch (Exception $e) {
        error_log('Football-Data.org API Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to fetch data from Football-Data.org',
            'details' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
