<?php
require_once __DIR__ . '/../config/database.php';

function authenticateToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
                 (isset($headers['authorization']) ? $headers['authorization'] : null);
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    
    try {
        // Decode JWT token manually (simplified version)
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        $payload = json_decode(base64_decode($parts[1]), true);
        if (!$payload || !isset($payload['userId'])) {
            return null;
        }
        
        // Verify token hasn't expired
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }
          // Get user from database
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, username, name, email, role, image_url FROM users WHERE id = ?");
        $stmt->execute([$payload['userId']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user ?: null;
        
    } catch (Exception $e) {
        return null;
    }
}

function generateJWT($userId) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'userId' => $userId,
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

function getJWTSecret() {
    // In production, this should be in environment variables
    return 'your-secret-key-change-this-in-production';
}
?>
