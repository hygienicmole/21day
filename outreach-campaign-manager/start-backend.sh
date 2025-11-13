#!/bin/bash

echo "================================================"
echo "Starting Outreach Campaign Manager - BACKEND"
echo "================================================"
echo ""

cd "$(dirname "$0")/backend"

# Check if database exists
if [ ! -f "database.db" ]; then
    echo "⚠️  Database not found. Initializing..."
    node src/db.js
    node src/seed.js
    echo ""
fi

echo "🚀 Starting backend server..."
echo "📍 Backend will be available at: http://localhost:3000"
echo "📊 API endpoints at: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop"
echo "================================================"
echo ""

npm start
