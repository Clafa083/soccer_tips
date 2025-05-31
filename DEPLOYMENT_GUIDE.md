# 🚀 VM-Tips Deployment Guide för one.com

## Steg 1: Bygga produktionsfilerna

```bash
# I projektmappen
npm run build          # Bygg frontend
cd backend
npm run build          # Bygg backend
```

## Steg 2: Förbered filer för upload

### A) Frontend (React-appen)
Kopiera innehållet från `dist/` mappen till one.com public_html:
- `dist/index.html` → `public_html/index.html`
- `dist/assets/` → `public_html/assets/`
- Alla andra filer från `dist/`

### B) Backend API (välj en metod)

#### Alternativ 1: PHP Backend (Enklast)
Ladda upp `php-backend.php` som `api.php` i public_html:
```
public_html/api.php
```

#### Alternativ 2: Node.js Backend (Om tillgängligt)
```
public_html/backend/
├── dist/ (från backend/dist/)
├── package.json
├── .env
└── node_modules/ (kör npm install --production)
```

### C) Konfigurationsfiler

Skapa `.htaccess` i public_html:
```apache
RewriteEngine On

# API-routes till PHP backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ api.php [QSA,L]

# React Router (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Säkerhet
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY

# Komprimering
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

## Steg 3: Databas-setup

Skapa `setup.php` och ladda upp:
```php
<?php
// Database setup för VM-Tips
$host = 'familjenfalth.se.mysql';
$username = 'familjenfalth_senr2';
$password = 'kesokeso';
$database = 'familjenfalth_senr2';

$pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);

// Skapa tabeller (kör SQL från migrations)
// [SQL-kod här]

echo "Database setup complete!";
?>
```

Besök `https://www.familjenfalth.se/setup.php` för att skapa tabellerna.

## Steg 4: Testa applikationen

1. Gå till `https://www.familjenfalth.se/`
2. Logga in som admin: `admin@vm-tips.se` / `admin123`
3. Testa admin-panelen

## Filstruktur på servern:
```
public_html/
├── index.html (React app)
├── assets/ (CSS, JS, bilder)
├── api.php (PHP backend)
├── setup.php (databas-setup)
├── .htaccess (URL-routing)
└── backend/ (optional Node.js)
```

## Felsökning:

**Problem: Sidan laddar inte**
- Kontrollera att index.html finns i public_html
- Kontrollera .htaccess-regler

**Problem: API fungerar inte**
- Kontrollera att api.php finns och är åtkomlig
- Kontrollera databasanslutning

**Problem: Routing fungerar inte**
- Kontrollera .htaccess-regler
- Verifiera att mod_rewrite är aktivt

## Admin-funktioner efter deployment:

✅ **Lag-hantering**: Lägg till VM-lag
✅ **Match-skapande**: Skapa alla VM-matcher  
✅ **Resultat-inmatning**: Mata in matchresultat
✅ **Poängberäkning**: Beräkna alla användares poäng
✅ **Användarhantering**: Hantera registrerade användare
✅ **Leaderboard**: Visa topplistan

Din VM-tipset är nu redo för 2024! 🏆