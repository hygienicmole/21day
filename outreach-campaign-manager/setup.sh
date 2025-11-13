#!/bin/bash

echo "=========================================================="
echo "  Multi-Channel Outreach Campaign Manager - SETUP"
echo "=========================================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "📍 Working directory: $SCRIPT_DIR"
echo ""

# Check Node.js installation
echo "1️⃣  Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Backend setup
echo "2️⃣  Setting up BACKEND..."
cd "$SCRIPT_DIR/backend"

if [ -d "node_modules" ]; then
    echo "⚠️  node_modules already exists, skipping installation"
else
    echo "📦 Installing backend dependencies (this may take a minute)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Backend dependency installation failed!"
        exit 1
    fi
fi

echo "✅ Backend dependencies installed"
echo ""

# Initialize database
echo "3️⃣  Setting up DATABASE..."
if [ -f "database.db" ]; then
    echo "⚠️  Database already exists"
    read -p "   Do you want to reset it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f database.db
        echo "🗑️  Deleted old database"
        node src/db.js
        node src/seed.js
    fi
else
    echo "🔧 Initializing database..."
    node src/db.js
    echo ""
    echo "🌱 Seeding database with sample data..."
    node src/seed.js
fi

echo "✅ Database ready"
echo ""

# Frontend setup
echo "4️⃣  Setting up FRONTEND..."
cd "$SCRIPT_DIR/frontend"

if [ -d "node_modules" ]; then
    echo "⚠️  node_modules already exists, skipping installation"
else
    echo "📦 Installing frontend dependencies (this may take a minute)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Frontend dependency installation failed!"
        exit 1
    fi
fi

echo "✅ Frontend dependencies installed"
echo ""

# Final summary
cd "$SCRIPT_DIR"

echo "=========================================================="
echo "  ✅ SETUP COMPLETE!"
echo "=========================================================="
echo ""
echo "🚀 How to start the application:"
echo ""
echo "Option 1 - Use the startup scripts (RECOMMENDED):"
echo "  Terminal 1: ./start-backend.sh"
echo "  Terminal 2: ./start-frontend.sh"
echo ""
echo "Option 2 - Manual startup:"
echo "  Terminal 1:"
echo "    cd backend"
echo "    npm start"
echo ""
echo "  Terminal 2:"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "=========================================================="
echo "📱 After starting both servers:"
echo "   Open: http://localhost:5173"
echo "   Login: admin / admin123"
echo "=========================================================="
echo ""
