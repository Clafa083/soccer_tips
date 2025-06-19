<?php
require_once __DIR__ . '/../config/database.php';

// Set JSON headers directly without using functions
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple matches endpoint without using jsonResponse()
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = Database::getInstance()->getConnection();
        
        // Simple query to get matches
        $stmt = $db->prepare("SELECT * FROM matches ORDER BY id ASC LIMIT 10");
        $stmt->execute();
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure we have an array
        if (!is_array($matches)) {
            $matches = [];
        }
        
        // Format matches for frontend
        $formattedMatches = array_map(function($match) {
            return [
                'id' => (int)($match['id'] ?? 0),
                'home_team_id' => $match['home_team_id'] ?? null,
                'away_team_id' => $match['away_team_id'] ?? null,
                'matchTime' => $match['matchTime'] ?? $match['match_time'] ?? date('Y-m-d H:i:s'),
                'matchType' => $match['matchType'] ?? $match['match_type'] ?? 'GROUP',
                'group' => $match['group'] ?? null,
                'home_score' => $match['home_score'] ?? null,
                'away_score' => $match['away_score'] ?? null,
                // Add camelCase versions for compatibility
                'homeScore' => $match['home_score'] ?? null,
                'awayScore' => $match['away_score'] ?? null,
                'homeTeamId' => $match['home_team_id'] ?? null,
                'awayTeamId' => $match['away_team_id'] ?? null,
                'status' => $match['status'] ?? 'scheduled',
                'created_at' => $match['created_at'] ?? date('Y-m-d H:i:s'),
                'updated_at' => $match['updated_at'] ?? date('Y-m-d H:i:s'),
                'homeTeam' => null,
                'awayTeam' => null
            ];
        }, $matches);
        
        // Output JSON directly without using jsonResponse()
        http_response_code(200);
        echo json_encode($formattedMatches);
        
    } catch (Exception $e) {
        error_log('Error getting matches: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get matches: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
