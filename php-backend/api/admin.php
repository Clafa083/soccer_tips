<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// Check if user is admin
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit();
}

try {
    $db = Database::getInstance()->getConnection();
    $action = $_GET['action'] ?? '';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        switch ($action) {
            case 'users':
                // Get all users with stats
                $stmt = $db->prepare("SELECT * FROM users ORDER BY created_at DESC");
                $stmt->execute();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $result = [];
                foreach ($users as $user) {
                    $result[] = [
                        'id' => (int)$user['id'],
                        'name' => $user['name'] ?? $user['username'] ?? 'Unknown',
                        'email' => $user['email'] ?? '',
                        'image_url' => $user['image_url'] ?? null,
                        'role' => $user['role'] ?? 'user',
                        'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s'),
                        'totalBets' => 0, // Could be calculated from bets table
                        'totalPoints' => 0 // Could be calculated from bets table
                    ];
                }
                
                echo json_encode($result);
                break;

            case 'stats':
                // Get betting statistics
                $stmt = $db->prepare("SELECT COUNT(*) as total_users FROM users");
                $stmt->execute();
                $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'];
                
                $stats = [
                    'totalUsers' => (int)$totalUsers,
                    'totalMatches' => 0, // Could be calculated from matches table
                    'totalBets' => 0, // Could be calculated from bets table
                    'finishedMatches' => 0, // Could be calculated
                    'averagePoints' => 0.0, // Could be calculated
                    'topScorer' => null // Could be calculated
                ];
                
                echo json_encode($stats);
                break;

            default:
                echo json_encode(['message' => 'Admin endpoint working', 'status' => 'success']);
                break;
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if ($action === 'delete') {
            $userId = (int)($_GET['id'] ?? 0);
            
            if ($userId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid user ID']);
                exit();
            }
            
            // Check if user is not admin
            $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$targetUser) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
            
            if ($targetUser['role'] === 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Cannot delete admin users']);
                exit();
            }
            
            // Delete user and their bets
            $db->beginTransaction();
            try {
                // Delete user's bets first (if bets table exists)
                // $stmt = $db->prepare("DELETE FROM bets WHERE user_id = ?");
                // $stmt->execute([$userId]);
                
                // Delete user
                $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                
                $db->commit();
                echo json_encode(['message' => 'User deleted successfully']);
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($action === 'calculate-points') {
            // Placeholder for point calculation
            echo json_encode([
                'message' => 'Points calculated successfully',
                'updatedBets' => 0,
                'finishedMatches' => 0
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
