#!/bin/bash

# Mark Siazon's Macaroon Market - Development Startup Script

echo "🚀 Starting Mark Siazon's Macaroon Market Development Environment"
echo "=================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies if not already installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "🔧 Dependencies are ready"

# Verify directories exist
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found!"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating backend .env file..."
    cp .env backend/.env
    echo "✅ Backend .env file created"
fi

echo ""
echo "🎯 Starting servers..."
echo "📊 Backend API: http://localhost:3001/api"
echo "🌐 Frontend:    http://localhost:3000"
echo "🏥 Health:      http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers using concurrently or in background
if npm list -g concurrently &> /dev/null; then
    echo "Using concurrently to start both servers..."
    npm run dev
else
    echo "Starting servers individually..."
    
    # Start backend in background
    echo "🚀 Starting backend server..."
    (cd backend && node server-inmemory.js) &
    BACKEND_PID=$!
    
    # Wait a moment for backend to start
    sleep 2
    
    # Start frontend in background
    echo "🚀 Starting frontend server..."
    (cd frontend && npx serve -s . -l 3000) &
    FRONTEND_PID=$!
    
    echo "✅ Both servers are running!"
    echo "Backend PID: $BACKEND_PID"
    echo "Frontend PID: $FRONTEND_PID"
    
    # Function to cleanup on exit
    cleanup() {
        echo ""
        echo "🛑 Shutting down servers..."
        kill $BACKEND_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Servers stopped"
        exit 0
    }
    
    # Set trap to cleanup on script exit
    trap cleanup SIGINT SIGTERM
    
    # Keep script running
    wait
fi