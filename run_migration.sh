#!/bin/bash

# Database Migration Script for Guest Mode Machine Separation
# This script adds machine_id column to guest_conversations table

echo "🚀 Starting Database Migration for Guest Mode Machine Separation..."
echo ""

# Check if we're in the correct directory
if [ ! -f "chat_api/alembic.ini" ]; then
    echo "❌ Error: alembic.ini not found. Please run this script from the project root."
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
    echo "📦 Installing dependencies..."
    uv sync
fi

# Check if alembic is installed
if ! python -c "import alembic" 2>/dev/null; then
    echo "📦 Installing alembic..."
    pip install alembic
fi

# Run migration
echo "🔄 Running database migration..."
echo "This will add machine_id column to guest_conversations table"
echo ""

# Check current migration status
echo "📊 Current migration status:"
alembic current

echo ""
echo "🔄 Applying migration..."
alembic upgrade head

# Check migration status after upgrade
echo ""
echo "📊 Migration status after upgrade:"
alembic current

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📋 Summary of changes:"
echo "   - Added machine_id column to guest_conversations table"
echo "   - Created index on machine_id for better performance"
echo "   - Guest mode conversations will now be separated by machine"
echo ""
echo "🔄 Please restart your backend service to apply changes:"
echo "   docker-compose restart backend"
echo "   or"
echo "   cd chat_api && uvicorn app.main:app --reload"
echo ""
echo "🎉 Guest Mode Machine Separation is now ready!" 