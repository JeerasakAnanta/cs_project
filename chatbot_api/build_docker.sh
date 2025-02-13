docker build -t chatbot_api_fix:0.1.0  .  

docker run --rm --name chatbot --env-file ./.env -p 8003:8003 chatbot_api_fix:0.1.0 