<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

try {
    $db = Database::getInstance()->getConnection();

    if ($method === 'GET') {
        // Get site content by key or all content
        if (isset($_GET['key'])) {
            $stmt = $db->prepare("SELECT * FROM site_content WHERE content_key = ?");
            $stmt->execute([$_GET['key']]);
            $content = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$content) {
                http_response_code(404);
                echo json_encode(['error' => 'Content not found']);
                exit();
            }
            
            echo json_encode($content);
        } else {
            // Get all content
            $stmt = $db->prepare("SELECT * FROM site_content ORDER BY content_key");
            $stmt->execute();
            $content = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($content);
        }
    } 
    elseif ($method === 'PUT') {
        // Update content (admin only)
        $user = authenticateToken();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $contentKey = $_GET['key'] ?? null;

        if (!$contentKey || !$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Content key and data required']);
            exit();
        }

        $stmt = $db->prepare("
            UPDATE site_content 
            SET title = ?, content = ?, content_type = ?, updated_at = NOW()
            WHERE content_key = ?
        ");
        $stmt->execute([
            $input['title'],
            $input['content'],
            $input['content_type'] ?? 'html',
            $contentKey
        ]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Content not found']);
            exit();
        }

        // Return updated content
        $stmt = $db->prepare("SELECT * FROM site_content WHERE content_key = ?");
        $stmt->execute([$contentKey]);
        $content = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($content);
    }
    elseif ($method === 'POST') {
        // Create new content (admin only)
        $user = authenticateToken();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['content_key'], $input['title'], $input['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'content_key, title, and content are required']);
            exit();
        }

        $stmt = $db->prepare("
            INSERT INTO site_content (content_key, title, content, content_type)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['content_key'],
            $input['title'],
            $input['content'],
            $input['content_type'] ?? 'html'
        ]);

        $contentId = $db->lastInsertId();
        
        // Return created content
        $stmt = $db->prepare("SELECT * FROM site_content WHERE id = ?");
        $stmt->execute([$contentId]);
        $content = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($content);
    }
    elseif ($method === 'DELETE') {
        // Delete content (admin only)
        $user = authenticateToken();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }

        $contentKey = $_GET['key'] ?? null;
        if (!$contentKey) {
            http_response_code(400);
            echo json_encode(['error' => 'Content key required']);
            exit();
        }

        $stmt = $db->prepare("DELETE FROM site_content WHERE content_key = ?");
        $stmt->execute([$contentKey]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Content not found']);
            exit();
        }

        echo json_encode(['message' => 'Content deleted successfully']);
    }
    else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    error_log("Site content API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>
