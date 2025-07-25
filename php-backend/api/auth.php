<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

// Dynamisk CORS: tillåt credentials endast för din domän
header('Access-Control-Allow-Origin: https://familjenfalth.se');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
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
        send_json_error('Du måste vara inloggad för att se denna sida', 401);
    }
    echo json_encode(['user' => $user]);
}

// Handle PUT requests (update profile)
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = authenticateToken();
    if (!$user) {
        send_json_error('Du måste vara inloggad för att uppdatera din profil', 401);
    }
    handleUpdateProfile($db, $user);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Metoden stöds inte']);
}

// Helper: always send JSON error with correct headers
function send_json_error($msg, $code = 400) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit();
}

// Function to handle login
function handleLogin($db, $input) {
    error_log("AUTH.PHP - handleLogin called");
    
    if (!isset($input['email']) || !isset($input['password'])) {
        send_json_error('E-post och lösenord krävs', 400);
    }
      try {
        $stmt = $db->prepare("SELECT id, username, name, email, password_hash, role, image_url, created_at FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            send_json_error('Fel e-post eller lösenord', 400);
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
        echo json_encode(['error' => 'Ett fel uppstod vid inloggning: ' . $e->getMessage()]);
    }
}

// Function to handle registration
function handleRegister($db, $input) {
    error_log("AUTH.PHP - handleRegister called");
    error_log("AUTH.PHP - Register input: " . json_encode($input));
    
    if (!isset($input['email']) || !isset($input['password']) || !isset($input['username']) || !isset($input['name'])) {
        error_log("AUTH.PHP - Missing required fields for registration");
        send_json_error('E-post, lösenord, användarnamn och namn krävs', 400);
    }
    
    if (strlen($input['password']) < 6) {
        error_log("AUTH.PHP - Password too short");
        send_json_error('Lösenordet måste vara minst 6 tecken långt', 400);
    }
    
    try {
        error_log("AUTH.PHP - Checking if user exists");
        // Kontrollera om e-post redan finns
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        if ($stmt->fetch()) {
            error_log("AUTH.PHP - Email already exists");
            send_json_error('E-postadressen är redan registrerad', 400);
        }
        // Kontrollera om användarnamn redan finns
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$input['username']]);
        if ($stmt->fetch()) {
            error_log("AUTH.PHP - Username already exists");
            send_json_error('Användarnamnet är redan upptaget', 400);
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
        echo json_encode(['error' => 'Ett fel uppstod vid registrering: ' . $e->getMessage()]);
    }
}

// Function to handle forgot password
function handleForgotPassword($db, $input) {
    if (!isset($input['email'])) {
        send_json_error('E-postadress krävs', 400);
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
        echo json_encode(['message' => 'Om e-postadressen finns registrerad har ett återställningsmail skickats']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Kunde inte skicka återställningsmail: ' . $e->getMessage()]);
    }
}

// Function to handle reset password
function handleResetPassword($db, $input) {
    if (!isset($input['token']) || !isset($input['new_password'])) {
        send_json_error('Återställningslänk och nytt lösenord krävs', 400);
    }
    
    if (strlen($input['new_password']) < 6) {
        send_json_error('Lösenordet måste vara minst 6 tecken långt', 400);
    }
    
    try {
        // Verify reset token
        $stmt = $db->prepare("SELECT pr.user_id, u.email FROM password_resets pr 
                             JOIN users u ON pr.user_id = u.id 
                             WHERE pr.token = ? AND pr.expires_at > NOW()");
        $stmt->execute([$input['token']]);
        $reset = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reset) {
            send_json_error('Ogiltig eller utgången återställningslänk', 400);
        }
        
        // Update password
        $password_hash = password_hash($input['new_password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE users SET password_hash = ?, password = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$password_hash, $password_hash, $reset['user_id']]);
        
        // Delete used reset token
        $stmt = $db->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$reset['user_id']]);
        
        echo json_encode(['message' => 'Lösenordet har återställts']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Kunde inte återställa lösenordet: ' . $e->getMessage()]);
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
                send_json_error('Användarnamnet är redan upptaget', 400);
            }
            $updateFields[] = "username = ?";
            $updateValues[] = trim($input['username']);
        }
        
        if (isset($input['email']) && trim($input['email']) !== '') {
            // Check if email is taken by another user
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([trim($input['email']), $user['id']]);
            if ($stmt->fetch()) {
                send_json_error('E-postadressen är redan registrerad', 400);
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
                send_json_error('Nuvarande lösenord krävs för att byta lösenord', 400);
            }
            
            // Verify current password
            $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!password_verify($input['current_password'], $currentUser['password_hash'])) {
                send_json_error('Nuvarande lösenord är felaktigt', 400);
            }
            
            if (strlen($input['new_password']) < 6) {
                send_json_error('Nytt lösenord måste vara minst 6 tecken långt', 400);
            }
            
            $password_hash = password_hash($input['new_password'], PASSWORD_BCRYPT);
            $updateFields[] = "password_hash = ?";
            $updateValues[] = $password_hash;
            $updateFields[] = "password = ?";
            $updateValues[] = $password_hash;
        }
        
        if (empty($updateFields)) {
            send_json_error('Inga giltiga fält att uppdatera', 400);
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
        echo json_encode(['error' => 'Kunde inte uppdatera profilen: ' . $e->getMessage()]);
    }
}
?>
