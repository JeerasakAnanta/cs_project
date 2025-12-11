#!/bin/bash

# Build the Docker image
echo "Building Frontend Docker Image..."
docker build -t frontend-cs-project .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build Successful!"
    echo "To run the image: docker run -p 8000:8000 frontend-cs-project"
else
    echo "❌ Build Failed!"
    exit 1
fi
