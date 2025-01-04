#!/bin/bash
# author: jeersak
# date: 27/11/2024

start_time=$(date +%H:%M:%S)

# Read .env file
# Load variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start the chatbot
echo  "start time: ${start_time}"
echo "----------------  Start Build Image ------------------------"
echo "                  ${start_time}                             "
echo "------------------------------------------------------------"

# down compose and build
docker compose down

# copy  dpendency pypoetry 


cp -r ./pyproject.toml ./chatbot_api/pyproject.toml
cp -r ./pyproject.toml ./chatbot_pdf_management_api/pyproject.toml

echo "------------------------------------------------------------"
echo "                  Copy Dpendency Pypoetry Done              " 
echo "------------------------------------------------------------"

# Build image 
docker build -t chatbot_webui_cs_project:${CHATBOT_WEBUI} ./chatbot_web/.
docker build -t chatbot_api_cs_project:${CHATBOT_API} ./chatbot_api/.
docker build -t chatbot_pdf_management_api:${PDF_MANAGEMENT_API} ./chatbot_pdf_management_api/.

echo "------------------------------------------------------------"
echo "                   Start Build Docker Image  Done           " 
echo "------------------------------------------------------------"


#Start  compose
docker compose up -d    

echo "------------------------------------------------------------"
echo "                  docker compose up Done                    " 
echo "------------------------------------------------------------"

end_time=$(date +%H:%M:%S)

echo "----------------  End build Image ------------------------"
echo "                  ${end_time}                             "
echo "----------------------------------------------------------" 