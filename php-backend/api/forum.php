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

$db = Database::getInstance()->getConnection();

// GET /api/forum - Get forum posts
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->prepare("
            SELECT 
                fp.id,
                fp.title,
                fp.content,
                fp.created_at,
                fp.updated_at,
                u.id as user_id,
                u.username,
                u.image_url,
                (SELECT COUNT(*) FROM forum_replies fr WHERE fr.post_id = fp.id) as reply_count
            FROM forum_posts fp
            JOIN users u ON fp.user_id = u.id
            ORDER BY fp.updated_at DESC
        ");
        
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($posts as &$post) {
            $post['reply_count'] = (int)$post['reply_count'];
        }
        
        echo json_encode($posts);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// POST /api/forum - Create new forum post
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = authenticateToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['title']) || !isset($input['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and content are required']);
        exit();
    }
    
    try {
        $stmt = $db->prepare("
            INSERT INTO forum_posts (user_id, title, content, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
        ");
        
        $stmt->execute([
            $user['id'],
            $input['title'],
            $input['content']
        ]);
        
        $post_id = $db->lastInsertId();
        
        // Get the created post with user info
        $stmt = $db->prepare("
            SELECT 
                fp.id,
                fp.title,
                fp.content,
                fp.created_at,
                fp.updated_at,
                u.id as user_id,
                u.username,
                u.image_url
            FROM forum_posts fp
            JOIN users u ON fp.user_id = u.id
            WHERE fp.id = ?
        ");
        
        $stmt->execute([$post_id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        $post['reply_count'] = 0;
        
        http_response_code(201);
        echo json_encode($post);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
