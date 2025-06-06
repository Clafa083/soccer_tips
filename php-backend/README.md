# PHP Backend Setup Guide

## 📋 Krav
- PHP 7.4 eller senare
- MySQL 5.7 eller senare  
- Apache/Nginx med mod_rewrite (för .htaccess)
- Composer (valfritt, för dependencies)

## 🚀 Lokal Setup

### 1. Kopiera PHP Backend
```bash
# Kopiera php-backend mappen till din webbserver
# För XAMPP: C:\xampp\htdocs\soccer_tips\php-backend
# För WAMP: C:\wamp64\www\soccer_tips\php-backend
```

### 2. Konfigurera Databas
Redigera `config/database.php`:
```php
private static $host = 'localhost';
private static $db_name = 'soccer_tips';
private static $username = 'root';
private static $password = '';  // Ditt MySQL lösenord
```

### 3. Skapa Databas och Tabeller
```sql
-- Kör dessa SQL-kommandon i phpMyAdmin eller MySQL console
CREATE DATABASE soccer_tips;
USE soccer_tips;

-- Kör alla migrations från backend/src/db/migrations/
-- 01_create_initial_tables.sql
-- 02_add_forum_tables.sql  
-- 03_create_knockout_scoring.sql
```

### 4. Seeda Databas
```bash
cd php-backend
php seed.php
```

### 5. Testa Installation
```bash
php test.php
```

## 🌐 Produktions-Deployment

### 1. Ladda upp filer
Ladda upp hela `php-backend` mappen till din webbserver.

### 2. Konfigurera Databas
Uppdatera `config/database.php` med dina produktions-databasinställningar.

### 3. Säkerhet
- Ändra JWT secret i `utils/auth.php`
- Se till att `.env` filer inte är publikt tillgängliga
- Konfigurera HTTPS

### 4. URL Structure
Med .htaccess ska dina API endpoints vara:
```
https://yourdomain.com/php-backend/api/teams
https://yourdomain.com/php-backend/api/matches
https://yourdomain.com/php-backend/api/auth/login
etc.
```

## 🔧 Frontend Konfiguration

Uppdatera `src/config/config.ts`:
```typescript
API_URL: import.meta.env.VITE_API_URL || (
    import.meta.env.MODE === 'production' 
        ? 'https://yourdomain.com/php-backend/api' 
        : 'http://localhost/soccer_tips/php-backend/api'
),
```

## 🧪 Testanvändare
Efter seeding finns dessa användare:
- admin@example.com (lösenord: password123) - Admin
- alice@example.com (lösenord: password123) - Vanlig användare
- bob@example.com (lösenord: password123) - Vanlig användare

## 📁 API Endpoints

### Authentication
- POST `/api/auth/register` - Registrera ny användare
- POST `/api/auth/login` - Logga in
- GET `/api/auth/me` - Hämta nuvarande användare

### Teams & Matches
- GET `/api/teams` - Hämta alla lag
- GET `/api/matches` - Hämta alla matcher
- GET `/api/matches/:id` - Hämta specifik match

### Betting
- GET `/api/bets` - Hämta användarens bets
- POST `/api/bets` - Skapa nytt bet
- GET `/api/bets/match/:id` - Hämta bets för match

### Leaderboard
- GET `/api/leaderboard` - Hämta leaderboard

### Forum
- GET `/api/forum` - Hämta forum posts
- POST `/api/forum` - Skapa nytt inlägg
- GET `/api/forum/:id` - Hämta post med replies
- POST `/api/forum/:id/replies` - Lägg till reply

### Admin (kräver admin-rättigheter)
- GET `/api/admin` - Admin dashboard data
- POST `/api/admin/matches/:id/finish` - Avsluta match

## 🔍 Felsökning

### Vanliga problem:
1. **CORS errors**: Kontrollera att headers är korrekt inställda
2. **Database connection**: Verifiera databasinställningar i config
3. **JWT tokens**: Kontrollera att secret key är samma överallt
4. **File permissions**: Se till att PHP kan läsa alla filer

### Debug tips:
- Aktivera PHP error reporting: `ini_set('display_errors', 1);`
- Kolla webbserver error logs
- Använd `test.php` för att verifiera setup
