#!/bin/bash

# Backend Development Script
# This script runs the backend in development mode

echo "🚀 Starting Backend Development Server..."

# Check if we're in the correct directory
if [ ! -f "chat_api/pyproject.toml" ]; then
    echo "❌ Error: chat_api/pyproject.toml not found. Please run this script from the project root."
    exit 1
fi

# Navigate to chat_api directory
cd chat_api

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies if needed
if [ ! -f "uv.lock" ] || [ ! -d ".venv/lib/python3.13/site-packages" ]; then
    echo "📦 Installing backend dependencies..."
    uv sync
fi

# Set environment variables for development
export DEBUG=true
export ENVIRONMENT=development

# Start the FastAPI development server
echo "🌐 Starting FastAPI development server..."
echo "📱 Backend API will be available at: http://localhost:8001"
echo "📚 API documentation will be available at: http://localhost:8001/docs"
echo "📚 ReDoc documentation will be available at: http://localhost:8001/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the FastAPI server with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload 