<?php
// Simple PHP backend for VM-Tips if Node.js is not available on one.com
// This provides basic API functionality for the React frontend

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host = 'familjenfalth.se.mysql';
$username = 'familjenfalth_senr2';
$password = 'kesokeso';
$database = 'familjenfalth_senr2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Simple routing
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);

// Basic JWT simulation (not secure, just for demo)
function checkAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        if ($token === 'mock-jwt-token-admin') {
            return ['userId' => 1, 'isAdmin' => true];
        } elseif ($token === 'mock-jwt-token-user') {
            return ['userId' => 2, 'isAdmin' => false];
        }
    }
    
    return null;
}

// Routes
switch ($path) {
    case '/teams':
        if ($method === 'GET') {
            $stmt = $pdo->query('SELECT * FROM teams ORDER BY `group`, name');
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;
        
    case '/matches':
        if ($method === 'GET') {
            $sql = 'SELECT m.*, 
                           ht.name as homeTeamName, ht.flag as homeTeamFlag,
                           at.name as awayTeamName, at.flag as awayTeamFlag
                    FROM matches m
                    LEFT JOIN teams ht ON m.homeTeamId = ht.id
                    LEFT JOIN teams at ON m.awayTeamId = at.id
                    ORDER BY m.matchTime';
            $stmt = $pdo->query($sql);
            $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format matches with team objects
            $formattedMatches = array_map(function($match) {
                return [
                    'id' => (int)$match['id'],
                    'homeTeamId' => $match['homeTeamId'] ? (int)$match['homeTeamId'] : null,
                    'awayTeamId' => $match['awayTeamId'] ? (int)$match['awayTeamId'] : null,
                    'homeScore' => $match['homeScore'] ? (int)$match['homeScore'] : null,
                    'awayScore' => $match['awayScore'] ? (int)$match['awayScore'] : null,
                    'matchTime' => $match['matchTime'],
                    'matchType' => $match['matchType'],
                    'group' => $match['group'],
                    'homeTeam' => $match['homeTeamName'] ? [
                        'id' => (int)$match['homeTeamId'],
                        'name' => $match['homeTeamName'],
                        'flag' => $match['homeTeamFlag']
                    ] : null,
                    'awayTeam' => $match['awayTeamName'] ? [
                        'id' => (int)$match['awayTeamId'],
                        'name' => $match['awayTeamName'],
                        'flag' => $match['awayTeamFlag']
                    ] : null
                ];
            }, $matches);
            
            echo json_encode($formattedMatches);
        }
        break;
        
    case '/auth/login':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            
            // Simple hardcoded login for demo
            if ($email === 'admin@vm-tips.se' && $password === 'admin123') {
                echo json_encode([
                    'token' => 'mock-jwt-token-admin',
                    'user' => [
                        'id' => 1,
                        'email' => 'admin@vm-tips.se',
                        'name' => 'Admin User',
                        'isAdmin' => true,
                        'imageUrl' => null,
                        'createdAt' => date('c')
                    ]
                ]);
            } elseif ($email === 'test@vm-tips.se' && $password === 'test123') {
                echo json_encode([
                    'token' => 'mock-jwt-token-user',
                    'user' => [
                        'id' => 2,
                        'email' => 'test@vm-tips.se',
                        'name' => 'Test User',
                        'isAdmin' => false,
                        'imageUrl' => null,
                        'createdAt' => date('c')
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['message' => 'Invalid credentials']);
            }
        }
        break;
        
    case '/admin/stats':
        $user = checkAuth();
        if (!$user || !$user['isAdmin']) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            break;
        }
        
        // Basic stats
        echo json_encode([
            'totalUsers' => 2,
            'totalMatches' => 20,
            'totalBets' => 15,
            'finishedMatches' => 5,
            'averagePoints' => 1.5,
            'topScorer' => [
                'name' => 'Test User',
                'totalPoints' => 12
            ]
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>