#!/bin/bash
# Start  Run FastAPI server for development 
echo "--------------- Start ChatBots  API -----------------"
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
echo "-----------------------------------------------------"