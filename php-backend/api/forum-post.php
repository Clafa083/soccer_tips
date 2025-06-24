<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = Database::getInstance()->getConnection();

// GET /api/forum-post.php?id={id} - Get specific forum post with replies
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        exit();
    }
    
    $post_id = $_GET['id'];
    
    try {
        // Get the main post
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
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'Post not found']);
            exit();
        }
        
        // Get replies
        $stmt = $db->prepare("
            SELECT 
                fr.id,
                fr.content,
                fr.created_at,
                u.id as user_id,
                u.username,
                u.image_url
            FROM forum_replies fr
            JOIN users u ON fr.user_id = u.id
            WHERE fr.post_id = ?
            ORDER BY fr.created_at ASC
        ");
        
        $stmt->execute([$post_id]);
        $replies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $post['replies'] = $replies;
        $post['reply_count'] = count($replies);
        
        echo json_encode($post);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// POST /api/forum-post.php - Add reply to forum post
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $user = authenticateToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['content']) || !isset($input['post_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Content and post_id are required']);
        exit();
    }
    
    $post_id = $input['post_id'];
    
    try {
        $db->beginTransaction();
        
        // Insert the reply
        $stmt = $db->prepare("
            INSERT INTO forum_replies (post_id, user_id, content, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $post_id,
            $user['id'],
            $input['content']
        ]);
        
        $reply_id = $db->lastInsertId();
        
        // Update the post's updated_at timestamp
        $stmt = $db->prepare("
            UPDATE forum_posts 
            SET updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$post_id]);
        
        $db->commit();
        
        // Get the created reply with user info
        $stmt = $db->prepare("
            SELECT 
                fr.id,
                fr.content,
                fr.created_at,
                u.id as user_id,
                u.username,
                u.image_url
            FROM forum_replies fr
            JOIN users u ON fr.user_id = u.id
            WHERE fr.id = ?
        ");
        
        $stmt->execute([$reply_id]);
        $reply = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode($reply);
        
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
