<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = Database::getInstance()->getConnection();

// Debug logging
error_log("AUTH.PHP - Method: " . $_SERVER['REQUEST_METHOD']);
error_log("AUTH.PHP - URI: " . $_SERVER['REQUEST_URI']);
error_log("AUTH.PHP - Action: " . ($_GET['action'] ?? 'no action'));

// Handle POST requests (login, register, forgot-password, reset-password)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("AUTH.PHP - POST Action: " . $action);
    error_log("AUTH.PHP - POST Data: " . json_encode($input));
    
    switch ($action) {
        case 'login':
            handleLogin($db, $input);
            break;
        case 'register':
            handleRegister($db, $input);
            break;
        case 'forgot-password':
            handleForgotPassword($db, $input);
            break;
        case 'reset-password':
            handleResetPassword($db, $input);
            break;
        default:
            handleLogin($db, $input); // Default to login if no action specified
            break;
    }
}

// Handle GET requests (get current user)
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = authenticateToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    echo json_encode(['user' => $user]);
}

// Handle PUT requests (update profile)
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = authenticateToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    handleUpdateProfile($db, $user);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

// Function to handle login
function handleLogin($db, $input) {
    error_log("AUTH.PHP - handleLogin called");
    
    if (!isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit();
    }
      try {
        $stmt = $db->prepare("SELECT id, username, name, email, password_hash, role, image_url, created_at FROM users WHERE email = ?");
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
                'image_url' => $user['image_url'],
                'created_at' => $user['created_at']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("AUTH.PHP - Login error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
    }
}

// Function to handle registration
function handleRegister($db, $input) {
    error_log("AUTH.PHP - handleRegister called");
    error_log("AUTH.PHP - Register input: " . json_encode($input));
    
    if (!isset($input['email']) || !isset($input['password']) || !isset($input['username']) || !isset($input['name'])) {
        error_log("AUTH.PHP - Missing required fields for registration");
        http_response_code(400);
        echo json_encode(['error' => 'Email, password, username and name are required']);
        exit();
    }
    
    if (strlen($input['password']) < 6) {
        error_log("AUTH.PHP - Password too short");
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit();
    }
    
    try {
        error_log("AUTH.PHP - Checking if user exists");
        // Check if user exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$input['email'], $input['username']]);
        if ($stmt->fetch()) {
            error_log("AUTH.PHP - User already exists");
            http_response_code(400);
            echo json_encode(['error' => 'User already exists']);
            exit();
        }
        
        error_log("AUTH.PHP - Creating new user");
        // Create user
        $password_hash = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("
            INSERT INTO users (username, name, email, password_hash, password, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'user', NOW(), NOW())
        ");
        $stmt->execute([$input['username'], $input['name'], $input['email'], $password_hash, $password_hash]);
          $user_id = $db->lastInsertId();
        error_log("AUTH.PHP - User created with ID: " . $user_id);
        
        // Get the created user data including created_at
        $stmt = $db->prepare("SELECT username, name, email, role, image_url, created_at FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $token = generateJWT($user_id);
        error_log("AUTH.PHP - JWT token generated");
        
        http_response_code(201);
        echo json_encode([
            'token' => $token,
            'user' => [
                'id' => $user_id,
                'username' => $userData['username'],
                'name' => $userData['name'],
                'email' => $userData['email'],
                'role' => $userData['role'],
                'image_url' => $userData['image_url'],
                'created_at' => $userData['created_at']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("AUTH.PHP - Registration error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }
}

// Function to handle forgot password
function handleForgotPassword($db, $input) {
    if (!isset($input['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        exit();
    }
    
    try {
        // Check if user exists
        $stmt = $db->prepare("SELECT id, name FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
          if ($user) {
            // Generate reset token
            $resetToken = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            // Store reset token in database
            $stmt = $db->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?) 
                                 ON DUPLICATE KEY UPDATE token = ?, expires_at = ?");
            $stmt->execute([$user['id'], $resetToken, $expires, $resetToken, $expires]);
              // Send email using mail() function with proper encoding
            $resetLink = "https://familjenfalth.se/eankbt/reset-password?token=" . $resetToken;
            $subject = "=?UTF-8?B?" . base64_encode("Återställ ditt lösenord - Soccer Tips") . "?=";
            
            // Create message with proper UTF-8 encoding
            $message = "Hej " . $user['name'] . ",\r\n\r\n";
            $message .= "Du har begärt att återställa ditt lösenord. Klicka på länken nedan för att återställa det:\r\n\r\n";
            $message .= $resetLink . "\r\n\r\n";
            $message .= "Länken är giltig i 1 timme.\r\n\r\n";
            $message .= "Om du inte begärde denna återställning kan du ignorera detta e-post.\r\n\r\n";
            $message .= "Vänliga hälsningar,\r\nSoccer Tips";
            
            // Set proper headers for UTF-8 encoding
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $headers .= "Content-Transfer-Encoding: 8bit\r\n";
            $headers .= "From: noreply@familjenfalth.se\r\n";
            $headers .= "Reply-To: noreply@familjenfalth.se\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
            
            // Send email
            mail($input['email'], $subject, $message, $headers);
        }
        
        // Always return success to prevent email enumeration
        echo json_encode(['message' => 'If the email exists, a password reset link has been sent']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Password reset request failed: ' . $e->getMessage()]);
    }
}

// Function to handle reset password
function handleResetPassword($db, $input) {
    if (!isset($input['token']) || !isset($input['new_password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Token and new password are required']);
        exit();
    }
    
    if (strlen($input['new_password']) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit();
    }
    
    try {
        // Verify reset token
        $stmt = $db->prepare("SELECT pr.user_id, u.email FROM password_resets pr 
                             JOIN users u ON pr.user_id = u.id 
                             WHERE pr.token = ? AND pr.expires_at > NOW()");
        $stmt->execute([$input['token']]);
        $reset = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reset) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired reset token']);
            exit();
        }
        
        // Update password
        $password_hash = password_hash($input['new_password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE users SET password_hash = ?, password = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$password_hash, $password_hash, $reset['user_id']]);
        
        // Delete used reset token
        $stmt = $db->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$reset['user_id']]);
        
        echo json_encode(['message' => 'Password reset successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Password reset failed: ' . $e->getMessage()]);
    }
}

// Function to handle profile update
function handleUpdateProfile($db, $user) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("AUTH.PHP - handleUpdateProfile called for user ID: " . $user['id']);
    error_log("AUTH.PHP - Update input data keys: " . implode(', ', array_keys($input ?? [])));
    
    if (isset($input['image_url'])) {
        error_log("AUTH.PHP - Image URL length: " . strlen($input['image_url']));
    }
    
    try {
        $updateFields = [];
        $updateValues = [];
        
        // Check which fields to update
        if (isset($input['name']) && trim($input['name']) !== '') {
            $updateFields[] = "name = ?";
            $updateValues[] = trim($input['name']);
        }
        
        if (isset($input['username']) && trim($input['username']) !== '') {
            // Check if username is taken by another user
            $stmt = $db->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
            $stmt->execute([trim($input['username']), $user['id']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Username already taken']);
                exit();
            }
            $updateFields[] = "username = ?";
            $updateValues[] = trim($input['username']);
        }
        
        if (isset($input['email']) && trim($input['email']) !== '') {
            // Check if email is taken by another user
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([trim($input['email']), $user['id']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Email already taken']);
                exit();
            }
            $updateFields[] = "email = ?";
            $updateValues[] = trim($input['email']);
        }
        
        if (isset($input['image_url'])) {
            $updateFields[] = "image_url = ?";
            $updateValues[] = $input['image_url'];
        }
        
        // Handle password change
        if (isset($input['new_password']) && trim($input['new_password']) !== '') {
            if (!isset($input['current_password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Current password required for password change']);
                exit();
            }
            
            // Verify current password
            $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!password_verify($input['current_password'], $currentUser['password_hash'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Current password is incorrect']);
                exit();
            }
            
            if (strlen($input['new_password']) < 6) {
                http_response_code(400);
                echo json_encode(['error' => 'New password must be at least 6 characters']);
                exit();
            }
            
            $password_hash = password_hash($input['new_password'], PASSWORD_BCRYPT);
            $updateFields[] = "password_hash = ?";
            $updateValues[] = $password_hash;
            $updateFields[] = "password = ?";
            $updateValues[] = $password_hash;
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields to update']);
            exit();
        }
        
        // Add updated_at
        $updateFields[] = "updated_at = NOW()";
        $updateValues[] = $user['id'];
        
        $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        // Get updated user data
        $stmt = $db->prepare("SELECT id, username, name, email, role, image_url, created_at, updated_at FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'message' => 'Profile updated successfully',
            'user' => $updatedUser
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Profile update failed: ' . $e->getMessage()]);
    }
}
?>
