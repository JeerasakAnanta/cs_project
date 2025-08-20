#!/bin/bash

echo "🚀 Starting Conversation Migration Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "chat_api/app/main.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "Current directory: $(pwd)"
    echo "Expected to find: chat_api/app/main.py"
    exit 1
fi

echo "✅ Project structure verified"

# Check if virtual environment exists
if [ ! -d "chat_api/.venv" ]; then
    echo "❌ Error: Virtual environment not found at chat_api/.venv"
    echo "Please create the virtual environment first:"
    echo "cd chat_api && python -m venv .venv"
    exit 1
fi

echo "✅ Virtual environment found"

# Activate virtual environment and run migration
echo "🔄 Activating virtual environment and running migration..."
cd chat_api

# Activate virtual environment
source .venv/bin/activate

# Check if required packages are installed
echo "📦 Checking required packages..."
python -c "import sqlalchemy, fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: Required packages not installed"
    echo "Please install requirements: pip install -r requirements.txt"
    exit 1
fi

echo "✅ Required packages verified"

# Run migration script
echo "🔄 Running migration script..."
python migrate_conversations.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start the backend server: cd chat_api && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"
    echo "2. Start the frontend: cd frontend && npm run dev"
    echo "3. Open Admin Panel: http://localhost:3000/admin"
    echo "4. Go to 'ค้นหาการสนทนา' or 'วิเคราะห์การสนทนา' tabs"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error messages above"
    exit 1
fi 