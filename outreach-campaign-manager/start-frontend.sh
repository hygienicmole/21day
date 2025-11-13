#!/bin/bash

echo "================================================"
echo "Starting Outreach Campaign Manager - FRONTEND"
echo "================================================"
echo ""

cd "$(dirname "$0")/frontend"

echo "🚀 Starting frontend development server..."
echo "📍 Frontend will be available at: http://localhost:5173"
echo ""
echo "⚠️  Make sure the backend is running first!"
echo "   (Run ./start-backend.sh in another terminal)"
echo ""
echo "🔐 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop"
echo "================================================"
echo ""

npm run dev
