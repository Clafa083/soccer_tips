#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building VM-Tips for production deployment...\n');

// Create deployment directory
const deployDir = path.join(__dirname, 'deploy');
if (fs.existsSync(deployDir)) {
    console.log('Cleaning previous build...');
    fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir);

// 1. Build frontend
console.log('📦 Building frontend...');
try {
    execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Frontend build complete\n');
} catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
}

// 2. Build backend
console.log('📦 Building backend...');
try {
    execSync('npm run build', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
    console.log('✅ Backend build complete\n');
} catch (error) {
    console.error('❌ Backend build failed:', error.message);
    process.exit(1);
}

// 3. Copy frontend dist to deploy directory
console.log('📁 Copying frontend files...');
const frontendDist = path.join(__dirname, 'dist');
const deployFrontend = path.join(deployDir, 'public');
fs.cpSync(frontendDist, deployFrontend, { recursive: true });
console.log('✅ Frontend files copied\n');

// 4. Copy backend files to deploy directory
console.log('📁 Copying backend files...');
const backendFiles = [
    'dist',
    'package.json',
    '.env',
    'node_modules' // We'll need this for production
];

const deployBackend = path.join(deployDir, 'backend');
fs.mkdirSync(deployBackend);

backendFiles.forEach(file => {
    const sourcePath = path.join(__dirname, 'backend', file);
    const destPath = path.join(deployBackend, file);
    
    if (fs.existsSync(sourcePath)) {
        if (file === 'node_modules') {
            console.log('⏳ Copying node_modules (this may take a while)...');
        }
        fs.cpSync(sourcePath, destPath, { recursive: true });
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️  ${file} not found, skipping`);
    }
});

// 5. Create PHP entry point for one.com
console.log('\n📝 Creating PHP entry points...');

// Main index.php that serves the React app
const indexPhp = `<?php
// VM-Tips Application Entry Point
$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// API requests go to Node.js backend
if (strpos($requestPath, '/api/') === 0) {
    // Proxy to Node.js backend
    $backendUrl = 'http://localhost:3001' . $requestUri;
    
    // Forward the request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $backendUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
    
    // Forward headers
    $headers = [];
    foreach (getallheaders() as $name => $value) {
        if (strtolower($name) !== 'host') {
            $headers[] = "$name: $value";
        }
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    // Forward POST data
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    
    curl_close($ch);
    
    // Return response
    http_response_code($httpCode);
    if ($contentType) {
        header('Content-Type: ' . $contentType);
    }
    echo $response;
    exit;
}

// Serve React app for all other requests
$indexFile = __DIR__ . '/public/index.html';
if (file_exists($indexFile)) {
    readfile($indexFile);
} else {
    http_response_code(404);
    echo 'Application not found. Please ensure the build files are uploaded correctly.';
}
?>`;

fs.writeFileSync(path.join(deployDir, 'index.php'), indexPhp);

// Create .htaccess for URL rewriting
const htaccess = `RewriteEngine On

# Handle API requests (proxy to Node.js)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ index.php [QSA,L]

# Handle static files
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ public/$1 [L]

# Handle React Router (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>`;

fs.writeFileSync(path.join(deployDir, '.htaccess'), htaccess);

// Create database setup script
const setupScript = `<?php
// Database setup script for VM-Tips
// Run this once after uploading to create database tables

require_once 'backend/setup-database.php';
?>`;

fs.writeFileSync(path.join(deployDir, 'setup-database-web.php'), setupScript);

// Create backend database setup PHP script
const backendSetupPhp = `<?php
// Database setup for VM-Tips on one.com

$host = 'familjenfalth.se.mysql';
$username = 'familjenfalth_senr2';
$password = 'kesokeso';
$database = 'familjenfalth_senr2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Setting up VM-Tips Database</h1>";
    
    // Read and execute SQL files
    $sqlFiles = [
        '01_create_auth_tables.sql',
        '02_create_vm_tables.sql'
    ];
    
    foreach ($sqlFiles as $file) {
        $sqlPath = __DIR__ . '/dist/db/migrations/' . $file;
        if (file_exists($sqlPath)) {
            echo "<h3>Executing $file...</h3>";
            $sql = file_get_contents($sqlPath);
            
            // Split SQL into individual statements
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    try {
                        $pdo->exec($statement);
                        echo "<p>✅ Statement executed successfully</p>";
                    } catch (PDOException $e) {
                        echo "<p>⚠️ Warning: " . htmlspecialchars($e->getMessage()) . "</p>";
                    }
                }
            }
        } else {
            echo "<p>❌ File $file not found</p>";
        }
    }
    
    // Create admin user
    $adminEmail = 'admin@vm-tips.se';
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute([$adminEmail, 'Admin User', $adminPassword, 1]);
    
    if ($result) {
        echo "<h3>✅ Admin user created</h3>";
        echo "<p>Email: admin@vm-tips.se</p>";
        echo "<p>Password: admin123</p>";
    }
    
    echo "<h3>🎉 Database setup complete!</h3>";
    echo "<p><a href='/'>Go to VM-Tips application</a></p>";
    
} catch (PDOException $e) {
    echo "<h1>❌ Database Setup Failed</h1>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>`;

fs.writeFileSync(path.join(deployBackend, 'setup-database.php'), backendSetupPhp);

// Create start script for Node.js backend
const startScript = `#!/bin/bash
# Start script for VM-Tips backend on one.com

cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Start the application
echo "Starting VM-Tips backend..."
node dist/index.js`;

fs.writeFileSync(path.join(deployBackend, 'start.sh'), startScript);
fs.chmodSync(path.join(deployBackend, 'start.sh'), 0o755);

// Create README for deployment
const deploymentReadme = `# VM-Tips Deployment Guide

## Files in this directory:

### Frontend (public/)
- React application built and ready to serve
- All static assets included

### Backend (backend/)
- Node.js application compiled to JavaScript
- All dependencies included in node_modules/
- Environment configuration in .env

### Setup Files
- index.php - Main entry point for the application
- .htaccess - URL rewriting and API proxying
- setup-database-web.php - Web-based database setup

## Deployment Steps:

1. **Upload all files** to your one.com public_html directory
2. **Run database setup** by visiting: https://www.familjenfalth.se/setup-database-web.php
3. **Start Node.js backend** (if one.com supports it) or use PHP proxy
4. **Test the application** by visiting: https://www.familjenfalth.se/

## Admin Access:
- Email: admin@vm-tips.se
- Password: admin123

## File Structure on Server:
\`\`\`
public_html/
├── index.php (entry point)
├── .htaccess (URL rewriting)
├── setup-database-web.php (database setup)
├── public/ (React app)
│   ├── index.html
│   ├── assets/
│   └── ...
└── backend/ (Node.js API)
    ├── dist/ (compiled JS)
    ├── node_modules/
    ├── package.json
    ├── .env
    └── start.sh
\`\`\`

## Notes:
- The PHP proxy handles API requests if Node.js isn't available
- All database credentials are configured for one.com
- CORS is set up for production domain
`;

fs.writeFileSync(path.join(deployDir, 'README-DEPLOYMENT.md'), deploymentReadme);

console.log('\n🎉 Production build complete!');
console.log('\n📂 Files ready for upload in the "deploy" directory:');
console.log('   - Frontend: deploy/public/');
console.log('   - Backend: deploy/backend/');
console.log('   - Setup: deploy/setup-database-web.php');
console.log('   - Entry: deploy/index.php');
console.log('   - Config: deploy/.htaccess');
console.log('\n📖 See deploy/README-DEPLOYMENT.md for upload instructions');
console.log('\n🚀 Ready to upload to one.com!');