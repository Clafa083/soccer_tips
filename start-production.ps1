# Production startup script for VM Tips Soccer App
Write-Host "Starting VM Tips Soccer App in production mode..." -ForegroundColor Green

# Check if backend is built
if (-not (Test-Path "backend\dist")) {
    Write-Host "Backend not built. Building now..." -ForegroundColor Yellow
    Set-Location backend
    npm run build
    Set-Location ..
}

# Check if frontend is built
if (-not (Test-Path "dist")) {
    Write-Host "Frontend not built. Building now..." -ForegroundColor Yellow
    npm run build
}

# Copy production environment file
if (Test-Path ".env.production") {
    Copy-Item ".env.production" "backend\.env" -Force
    Write-Host "Production environment configured" -ForegroundColor Green
}

Write-Host "Production build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. Backend: cd backend && npm start" -ForegroundColor White
Write-Host "2. Frontend: Serve the 'dist' folder with a web server" -ForegroundColor White
Write-Host ""
Write-Host "Example with Python HTTP server:" -ForegroundColor Yellow
Write-Host "cd dist && python -m http.server 5173" -ForegroundColor White
Write-Host ""
Write-Host "Example with Node.js serve:" -ForegroundColor Yellow
Write-Host "npx serve dist -p 5173" -ForegroundColor White
