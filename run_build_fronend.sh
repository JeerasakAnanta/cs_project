#!/bin/bash 

# Source the .env file
source .env

# Build docker image for frontend 
echo "CHATBOT_WEBUI_TAGS: ${CHATBOT_WEBUI_TAGS}"
echo "Building docker image for frontend..."
echo "-------------------------------------------------"
docker build -t chatbot_webui_cs_project:${CHATBOT_WEBUI_TAGS} ./frontend/.


echo "-------------------------------------------------"
echo "Docker image for frontend built successfully!"
echo "-------------------------------------------------"

# run docker image 
docker run  --rm -p 8000:80 --name chatbot_webui_cs_project chatbot_webui_cs_project:${CHATBOT_WEBUI_TAGS}
echo "-------------------------------------------------"
echo "Docker image for frontend running successfully!"
echo "-------------------------------------------------"
