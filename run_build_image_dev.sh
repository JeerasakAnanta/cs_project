#!/bin/bash
# author: Jeerasak Ananta
# date: 27/11/2024

# version: 0.1.0

start_time=$(date +%H:%M:%S)

# Read .env file from
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
docker-compose down

# copy  dpendency pypoetry
# move pyproject.toml

# copy pyproject   to  chatbot backend
cp -r ./pyproject.toml ./chatbot_api/pyproject.toml

# PDF Management
cp -r ./pyproject.toml ./chatbot_pdf_management_api/pyproject.toml

#  file requirements.txt  
cp -r ./requirements.txt ./chatbot_api/requirements.txt
cp -r ./requirements.txt ./chatbot_pdf_management_api/requirements.txt


echo "------------------------------------------------------------"
echo "                  Copy Dpendency Pypoetry Done              " 
echo "------------------------------------------------------------"

# Build docker image

# docker build -t chatbot_webui_cs_project:${CHATBOT_WEBUI} ./chatbot_web/.
docker build -t chatbot_api_cs_project:${CHATBOT_API} ./chatbot_api/.
# docker build -t chatbot_pdf_management_api:${PDF_MANAGEMENT_API} ./chatbot_pdf_management_api/.

echo "------------------------------------------------------------"
echo "                   Start Build Docker Image  Done           " 
echo "------------------------------------------------------------"


# Start  compose
docker-compose up -d

echo "------------------------------------------------------------"
echo "                 Docker Compose Done                        " 
echo "------------------------------------------------------------"

echo "------------------------------------------------------------"
echo "                 Summary Container Port                     " 
echo "------------------------------------------------------------"
echo " WebChatbotUI    : http://localhost:80"
echo " Chat API        : http://localhost:8003"
echo " PDF             : http://localhost:8004"
echo " Qdrant VecterDB : http://localhost:6333"                      
echo "------------------------------------------------------------"

end_time=$(date +%H:%M:%S)

echo "----------------  End build Image ------------------------"
echo "                  ${end_time}                             "
echo "----------------------------------------------------------" 