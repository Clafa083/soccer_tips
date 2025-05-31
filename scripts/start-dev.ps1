$ErrorActionPreference = "Stop"

function Start-Database {
    Write-Host "Starting MySQL database container..."
    docker-compose up -d mysql
    
    # Wait for database to be ready
    Write-Host "Waiting for database to be ready..."
    $attempts = 0
    $maxAttempts = 30
    
    while ($attempts -lt $maxAttempts) {
        try {
            $result = docker exec vm_tips_db mysqladmin ping -h localhost -u root -proot
            if ($result -match "mysqld is alive") {
                Write-Host "Database is ready!"
                return $true
            }
        }
        catch {
            Write-Host "Database not ready yet, waiting..."
            Start-Sleep -Seconds 2
            $attempts++
        }
    }
    
    Write-Error "Database failed to start properly"
    return $false
}

function Start-Development {
    if (Start-Database) {
        Set-Location backend
        Write-Host "Running database migrations..."
        npm run db:setup
        
        Write-Host "Starting development server..."
        npm run dev
    }
}

# Run the development environment
Start-Development
