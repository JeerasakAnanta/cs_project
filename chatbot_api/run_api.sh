# Start FastAPI server
echo "--------------- Start ChatBots  API -----------------"
uvicorn chatbot_api:app --host 0.0.0.0 --port 8003 --reload
echo "-----------------------------------------------------"