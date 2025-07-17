#!/bin/bash

# Frontend Development Script
# This script runs the frontend in development mode

echo "🚀 Starting Frontend Development Server..."

# Check if we're in the correct directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: frontend/package.json not found. Please run this script from the project root."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting Vite development server..."
echo "📱 Frontend will be available at: http://localhost:5173"
echo "📱 Preview will be available at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev 