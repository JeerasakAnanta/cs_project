# script to build and run docker image  
# code by jeerasak ss4
#!/bin/bash

# build docker image 
docker build -t pdf-management-api . 

#  run docker image 
docker run -d --name pdf-management-api -p 8004:8004 pdf-management-api