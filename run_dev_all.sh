#!/bin/bash

# Full Development Script
# This script runs both frontend and backend in development mode simultaneously

echo "🚀 Starting Full Development Environment..."
echo ""

# Check if we're in the correct directory
if [ ! -f "frontend/package.json" ] || [ ! -f "chat_api/pyproject.toml" ]; then
    echo "❌ Error: Required files not found. Please run this script from the project root."
    exit 1
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all development servers..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting Backend Server..."
cd chat_api

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies if needed
if [ ! -f "uv.lock" ] || [ ! -d ".venv/lib/python3.13/site-packages" ]; then
    echo "📦 Installing backend dependencies..."
    uv sync
fi

# Set environment variables for development
export DEBUG=true
export ENVIRONMENT=development

# Start backend server in background
echo "🌐 Starting FastAPI server on http://localhost:8001"
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to root and start frontend
cd ..

echo "🔧 Starting Frontend Server..."
cd frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend server in background
echo "🌐 Starting Vite server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
echo ""
echo "✅ Development servers are running!"
echo "📱 Frontend: http://localhost:5173"
echo "📱 Backend API: http://localhost:8001"
echo "📚 API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID 