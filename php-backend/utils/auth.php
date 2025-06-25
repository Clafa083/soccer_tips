<?php
require_once __DIR__ . '/../config/database.php';

function authenticateToken() {
    $token = null;
    
    // Try to get token from Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
                 (isset($headers['authorization']) ? $headers['authorization'] : null);
    
    if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
    
    // Fallback: Try X-Authorization header
    if (!$token) {
        $xAuthHeader = isset($headers['X-Authorization']) ? $headers['X-Authorization'] : 
                      (isset($headers['x-authorization']) ? $headers['x-authorization'] : null);
        
        if ($xAuthHeader && preg_match('/Bearer\s+(.*)$/i', $xAuthHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    // Fallback: Try query parameter
    if (!$token && isset($_GET['token'])) {
        $token = $_GET['token'];
    }
    
    // Fallback: Try POST data
    if (!$token && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['token'])) {
            $token = $input['token'];
        }
    }
    
    if (!$token) {
        error_log("DEBUG: No authentication token found");
        return null;
    }    try {
        // Decode JWT token manually
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            error_log("DEBUG: Invalid token format");
            return null;
        }
        
        [$header, $payload, $signature] = $parts;
        
        // Verify signature
        $expectedSignature = base64url_encode(hash_hmac(
            'sha256',
            $header . '.' . $payload,
            getJWTSecret(),
            true
        ));
        
        if (!hash_equals($signature, $expectedSignature)) {
            error_log("DEBUG: Token signature verification failed");
            return null;
        }
        
        $payloadData = json_decode(base64url_decode($payload), true);
        if (!$payloadData || !isset($payloadData['userId'])) {
            error_log("DEBUG: Invalid token payload");
            return null;
        }
        
        // Verify token hasn't expired
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            error_log("DEBUG: Token expired");
            return null;
        }
        
        // Get user from database
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, username, name, email, role, image_url, created_at FROM users WHERE id = ?");        $stmt->execute([$payloadData['userId']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            error_log("DEBUG: User not found in database for ID: " . $payloadData['userId']);
            return null;
        }
        
        return $user;
        
    } catch (Exception $e) {
        error_log("DEBUG: Token processing exception: " . $e->getMessage());
        return null;
    }
}

function generateJWT($userId) {
    // Get user role from database
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $role = $user ? $user['role'] : 'user';
    
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'userId' => $userId,
        'role' => $role,
        'exp' => time() + (24 * 60 * 60), // 24 hours
        'iat' => time()
    ]);
    
    $headerEncoded = base64url_encode($header);
    $payloadEncoded = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, getJWTSecret(), true);
    $signatureEncoded = base64url_encode($signature);
    
    return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function getJWTSecret() {
    // In production, this should be in environment variables
    return 'your-secret-key-change-this-in-production';
}
?>
