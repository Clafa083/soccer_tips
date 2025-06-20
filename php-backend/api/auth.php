<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = Database::getInstance()->getConnection();// POST /api/auth/login - Login user
if ($_SERVER['REQUEST_METHOD'] === 'POST' && 
    preg_match('/\/login$/', $_SERVER['REQUEST_URI'])) {
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit();
    }
    
    try {
        $stmt = $db->prepare("SELECT id, username, name, email, password_hash, role, image_url FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit();
        }
        
        $token = generateJWT($user['id']);
          echo json_encode([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'image_url' => $user['image_url']
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
    }
}

// POST /api/auth/register - Register new user
else if ($_SERVER['REQUEST_METHOD'] === 'POST' && 
         preg_match('/\/register$/', $_SERVER['REQUEST_URI'])) {
    
    $input = json_decode(file_get_contents('php://input'), true);
      if (!isset($input['email']) || !isset($input['password']) || !isset($input['username']) || !isset($input['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email, password, username and name are required']);
        exit();
    }
    
    if (strlen($input['password']) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit();
    }
    
    try {
        // Check if user exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$input['email'], $input['username']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'User already exists']);
            exit();
        }
          // Create user
        $password_hash = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("
            INSERT INTO users (username, name, email, password_hash, password, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'user', NOW(), NOW())
        ");
        $stmt->execute([$input['username'], $input['name'], $input['email'], $password_hash, $password_hash]);
        
        $user_id = $db->lastInsertId();
        $token = generateJWT($user_id);
        
        http_response_code(201);        echo json_encode([
            'token' => $token,
            'user' => [
                'id' => $user_id,
                'username' => $input['username'],
                'name' => $input['name'],
                'email' => $input['email'],
                'role' => 'user',
                'image_url' => null
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }
}

// GET /api/auth/me - Get current user
else if ($_SERVER['REQUEST_METHOD'] === 'GET' && 
         preg_match('/\/me$/', $_SERVER['REQUEST_URI'])) {
    
    $user = authenticateToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    
    echo json_encode(['user' => $user]);
}

// Fallback: Handle direct calls with query parameters
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? 'login';
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'register') {
        // Handle registration
        if (!isset($input['email']) || !isset($input['password']) || !isset($input['username']) || !isset($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email, password, username and name are required']);
            exit();
        }
        
        if (strlen($input['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            exit();
        }
        
        try {
            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
            $stmt->execute([$input['email'], $input['username']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'User already exists']);
                exit();
            }
            
            // Create user
            $password_hash = password_hash($input['password'], PASSWORD_BCRYPT);
            $stmt = $db->prepare("
                INSERT INTO users (username, name, email, password_hash, password, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'user', NOW(), NOW())
            ");
            $stmt->execute([$input['username'], $input['name'], $input['email'], $password_hash, $password_hash]);
            
            $user_id = $db->lastInsertId();
            $token = generateJWT($user_id);
            
            http_response_code(201);
            echo json_encode([
                'token' => $token,
                'user' => [
                    'id' => $user_id,
                    'username' => $input['username'],
                    'name' => $input['name'],
                    'email' => $input['email'],
                    'role' => 'user',
                    'image_url' => null
                ]
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
        
    } else {
        // Handle login (default)
        if (!isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit();
        }
        
        try {
            $stmt = $db->prepare("SELECT id, username, name, email, password_hash, role, image_url FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !password_verify($input['password'], $user['password_hash'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                exit();
            }
            
            $token = generateJWT($user['id']);
            
            echo json_encode([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'image_url' => $user['image_url']
                ]
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
        }
    }
}

// Handle GET for current user with fallback
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = authenticateToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    
    echo json_encode(['user' => $user]);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
