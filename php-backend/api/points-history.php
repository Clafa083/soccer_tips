<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = Database::getInstance()->getConnection();
        // Hämta alla matcher
        $stmt = $db->prepare('SELECT * FROM matches ORDER BY id ASC');
        $stmt->execute();
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Hämta alla användare
        $stmt = $db->prepare('SELECT id, name, username, image_url FROM users');
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Hämta alla bets
        $stmt = $db->prepare('SELECT * FROM bets');
        $stmt->execute();
        $bets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Hämta alla special bets (t.ex. knockout/final)
        $stmt = $db->prepare('SELECT * FROM user_special_bets');
        $stmt->execute();
        $specialBets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Bygg matchlistan för frontend
        $matchSummaries = array_map(function($match) use ($db) {
            // Hämta lagnamn från teams-tabellen
            $homeName = '';
            $awayName = '';
            if (!empty($match['home_team_id'])) {
                $stmt = $db->prepare('SELECT name FROM teams WHERE id = ?');
                $stmt->execute([$match['home_team_id']]);
                $homeName = $stmt->fetchColumn() ?: $match['home_team_id'];
            }
            if (!empty($match['away_team_id'])) {
                $stmt = $db->prepare('SELECT name FROM teams WHERE id = ?');
                $stmt->execute([$match['away_team_id']]);
                $awayName = $stmt->fetchColumn() ?: $match['away_team_id'];
            }
            return [
                'id' => (int)$match['id'],
                'home_team' => $match['home_team_id'],
                'away_team' => $match['away_team_id'],
                'home_team_name' => $homeName,
                'away_team_name' => $awayName,
                'home_score' => $match['home_score'],
                'away_score' => $match['away_score'],
                'date' => $match['matchTime'],
                'match_type' => $match['matchType'] ?? '',
                'group' => $match['group'] ?? '',
                'display_name' => $match['matchType'] . ' #' . $match['id']
            ];
        }, $matches);

        // Bygg poänghistorik för varje användare
        $userHistories = [];
        foreach ($users as $user) {
            $userId = $user['id'];
            $history = [];
            $cumulative = 0;
            foreach ($matches as $match) {
                $matchId = $match['id'];
                $points = 0;
                // Poäng från vanliga bets om matchen är slutförd
                if ($match['status'] === 'finished') {
                    foreach ($bets as $bet) {
                        if ($bet['user_id'] == $userId && $bet['match_id'] == $matchId) {
                            $points += (int)$bet['points'];
                        }
                    }
                }
                // Poäng från slutspelsmatcher där lag är satta (t.ex. knockout/final), även om matchen INTE är slutförd
                if ($match['matchType'] !== 'GROUP' && ($match['home_team_id'] || $match['away_team_id'])) {
                    foreach ($bets as $bet) {
                        if ($bet['user_id'] == $userId && $bet['match_id'] == $matchId) {
                            $points += (int)$bet['points'];
                        }
                    }
                    foreach ($specialBets as $specialBet) {
                        if (
                            isset($specialBet['match_id']) &&
                            $specialBet['user_id'] == $userId &&
                            $specialBet['match_id'] == $matchId
                        ) {
                            $points += (int)$specialBet['points'];
                        }
                    }
                }
                $cumulative += $points;
                $history[] = [
                    'match_id' => $matchId,
                    'points_earned' => $points,
                    'cumulative_points' => $cumulative
                ];
            }
            $userHistories[] = [
                'id' => $userId,
                'name' => $user['name'],
                'username' => $user['username'],
                'image_url' => $user['image_url'],
                'total_points' => $cumulative,
                'points_history' => $history
            ];
        }

        echo json_encode([
            'users' => $userHistories,
            'matches' => $matchSummaries
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
