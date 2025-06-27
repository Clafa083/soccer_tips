<?php
// Simple PHP router for API endpoints
// This file handles routing when mod_rewrite is not available

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /eankbt/php-backend prefix if present
$path = preg_replace('/^\/eankbt\/php-backend/', '', $path);
// Also handle /php-backend prefix for local development
$path = preg_replace('/^\/php-backend/', '', $path);

// Route to appropriate API file
if (preg_match('/^\/api\/auth/', $path)) {
    require_once 'api/auth.php';
} elseif (preg_match('/^\/api\/teams/', $path)) {
    require_once 'api/teams.php';
} elseif (preg_match('/^\/api\/matches/', $path)) {
    require_once 'api/matches.php';
} elseif (preg_match('/^\/api\/bets/', $path)) {
    require_once 'api/bets.php';
} elseif (preg_match('/^\/api\/leaderboard/', $path)) {
    require_once 'api/leaderboard.php';
} elseif (preg_match('/^\/api\/admin/', $path)) {
    require_once 'api/admin.php';
} elseif (preg_match('/^\/api\/forum\/\d+\/replies/', $path)) {
    require_once 'api/forum-post.php';
} elseif (preg_match('/^\/api\/forum\/\d+/', $path)) {
    require_once 'api/forum-post.php';
} elseif (preg_match('/^\/api\/forum/', $path)) {
    require_once 'api/forum.php';
} else {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Endpoint not found']);
}
?>
