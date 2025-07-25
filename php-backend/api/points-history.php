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
        $stmt = $db->prepare('SELECT * FROM matches WHERE matchType = "GROUP" ORDER BY id ASC');
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
        // Lägg till en sista "virtuell match" för specialtips & slutspel
        $lastDate = !empty($matches) ? end($matches)['matchTime'] : date('Y-m-d H:i:s');
        $matchSummaries[] = [
            'id' => -1,
            'home_team' => null,
            'away_team' => null,
            'home_team_name' => null,
            'away_team_name' => null,
            'home_score' => null,
            'away_score' => null,
            'date' => date('Y-m-d H:i:s', strtotime($lastDate . ' +1 hour')),
            'match_type' => 'EXTRA',
            'group' => '',
            'display_name' => 'Slutspel & Specialtips'
        ];

        // Bygg poänghistorik för varje användare
        $userHistories = [];
        foreach ($users as $user) {
            $userId = $user['id'];
            $history = [];
            $cumulative = 0;
            // Hämta knockout_points för användaren
            $knockoutStmt = $db->prepare("SELECT SUM(points) as knockout_points FROM knockout_predictions WHERE user_id = ?");
            $knockoutStmt->execute([$userId]);
            $knockoutRow = $knockoutStmt->fetch(PDO::FETCH_ASSOC);
            $knockoutPoints = $knockoutRow && $knockoutRow['knockout_points'] !== null ? (int)$knockoutRow['knockout_points'] : 0;
            // Summera special_bets för användaren
            $userSpecialPoints = 0;
            foreach ($specialBets as $specialBet) {
                if ($specialBet['user_id'] == $userId) {
                    $userSpecialPoints += (int)$specialBet['points'];
                }
            }
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
            // Lägg till en sista datapunkt för knockout och specialtips
            $cumulative += $knockoutPoints + $userSpecialPoints;
            $history[] = [
                'match_id' => -1,
                'points_earned' => $knockoutPoints + $userSpecialPoints,
                'cumulative_points' => $cumulative
            ];
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
