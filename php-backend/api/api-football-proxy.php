<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// API-Football konfiguration
$api_key = 'a5668422fbbe4557d37ac2f71b328a42';

// Använd V3 API eftersom V2 inte längre är tillgängligt för free plan
$base_url = 'https://v3.football.api-sports.io/';

// Hämta endpoint från query parametern
$endpoint = $_GET['endpoint'] ?? '';

if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Endpoint parameter is required']);
    exit();
}

// Bygg den fullständiga URL:en
$url = $base_url . $endpoint;

// Logga för debugging
error_log("API-Football Proxy: Making request to $url");

try {
    // Använd cURL för V3 API
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-RapidAPI-Key: ' . $api_key,
        'X-RapidAPI-Host: v3.football.api-sports.io'
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    
    curl_close($ch);
    
    if ($response === false || !empty($curl_error)) {
        throw new Exception('cURL error: ' . $curl_error);
    }
    
    if ($http_code !== 200) {
        throw new Exception('API returned HTTP status: ' . $http_code . '. Response: ' . substr($response, 0, 500));
    }

    // Kontrollera att svaret är giltig JSON
    $decoded = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from API');
    }

    // Kontrollera om API:et returnerade ett fel
    if (isset($decoded['api']['error'])) {
        throw new Exception('API Error: ' . $decoded['api']['error']);
    }

    // Returnera det decodade svaret
    echo $response;

} catch (Exception $e) {
    error_log("API-Football Proxy Error: " . $e->getMessage());
    error_log("API-Football Proxy Response preview: " . substr($response ?? 'null', 0, 200));
    error_log("API-Football Proxy HTTP Code: " . ($http_code ?? 'unknown'));
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Proxy error: ' . $e->getMessage(),
        'endpoint' => $endpoint,
        'debug_info' => [
            'http_code' => $http_code ?? null,
            'response_preview' => substr($response ?? 'null', 0, 200),
            'curl_error' => $curl_error ?? null
        ]
    ]);
}
?>
