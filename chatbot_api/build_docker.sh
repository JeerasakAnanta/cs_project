#!/bin/bash  
# code by jeerasak ss4 

echo  "====================================="
echo  "        build docker image           " 
echo  "====================================="
docker build -t my_fastapi_app .

echo  "====================================="
echo "         running docker image         " 
echo  "====================================="

docker run -d -p 8081:8081 my_fastapi_app