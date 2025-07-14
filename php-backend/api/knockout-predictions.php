<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = Database::getInstance()->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET: /api/knockout-predictions.php?user_id=42
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    if (!$userId) {
        echo json_encode(['error' => 'user_id required']);
        exit;
    }
    $stmt = $db->prepare('SELECT round, team_id FROM knockout_predictions WHERE user_id = ?');
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $result = [];
    foreach ($rows as $row) {
        $result[$row['round']][] = (int)$row['team_id'];
    }
    echo json_encode($result);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // POST: JSON { user_id, predictions: { ROUND_OF_16: [id, ...], ... } }
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = isset($input['user_id']) ? (int)$input['user_id'] : 0;
    $predictions = $input['predictions'] ?? [];
    if (!$userId || !is_array($predictions)) {
        echo json_encode(['error' => 'user_id and predictions required']);
        exit;
    }
    // Ta bort gamla predictions
    $stmt = $db->prepare('DELETE FROM knockout_predictions WHERE user_id = ?');
    $stmt->execute([$userId]);
    // Lägg in nya
    $stmt = $db->prepare('INSERT INTO knockout_predictions (user_id, round, team_id) VALUES (?, ?, ?)');
    foreach ($predictions as $round => $teamIds) {
        foreach ($teamIds as $teamId) {
            $stmt->execute([$userId, $round, $teamId]);
        }
    }
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
