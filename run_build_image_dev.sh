#!/bin/bash
# author: jeersak
# date: 27/11/2024

start_time=$(date +%H:%M:%S)

# Start the chatbot
echo  "start time: ${start_time}"
echo "----------------  Start Build Image ------------------------"
echo "                  ${start_time}                           "
echo "----------------------------------------------------------"

# down compose and build
docker compose down

# Build image 
docker build -t chatbot_webui_cs_project:0.1.0 ./chatbot_web/.
docker build -t chatbot_api_cs_project:0.1.0 ./chatbot_api/.
docker build -t chatbot_pdf_management_api:0.1.0 ./chatbot_pdf_management_api/.

#Start  compose
docker compose up -d    

end_time=$(date +%H:%M:%S)

echo "----------------  End build Image ------------------------"
echo "                  ${end_time}                             "
echo "----------------------------------------------------------"