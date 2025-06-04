#!/bin/bash

# Production startup script for VM Tips Soccer App
echo "Starting VM Tips Soccer App in production mode..."

# Check if backend is built
if [ ! -d "backend/dist" ]; then
    echo "Backend not built. Building now..."
    cd backend
    npm run build
    cd ..
fi

# Check if frontend is built
if [ ! -d "dist" ]; then
    echo "Frontend not built. Building now..."
    npm run build
fi

# Copy production environment file
if [ -f ".env.production" ]; then
    cp .env.production backend/.env
    echo "Production environment configured"
fi

echo "Production build complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: Serve the 'dist' folder with a web server"
echo ""
echo "Example with Python HTTP server:"
echo "cd dist && python -m http.server 5173"
echo ""
echo "Example with Node.js serve:"
echo "npx serve dist -p 5173"
