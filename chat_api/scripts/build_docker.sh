#!/bin/bash  
# code by jeerasak ss4 

echo  "====================================="
echo  "        build docker image           " 
echo  "====================================="
docker build -t cs_fastapi_app .

echo  "====================================="
echo "         running docker image         " 
echo  "====================================="

docker run --rm -d  --env-file ./.env --name cs_fastapi_app -p 8002:8002 cs_fastapi_app 
echo  "====================================="