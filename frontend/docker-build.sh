#!/bin/bash

# Docker Build Script (Build Only)
# This script only builds the Docker image without pushing

set -e  # Exit on error

# Configuration
DOCKER_USERNAME="jeerasakanant"
IMAGE_NAME="frontend-cs-project"
VERSION=$(cat package.json | grep '"version"' | cut -d '"' -f 4)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  Docker Build Script${NC}"
echo -e "${BLUE}===========================================${NC}"

# Print configuration
echo -e "\n${GREEN}Configuration:${NC}"
echo -e "  Docker Username: ${DOCKER_USERNAME}"
echo -e "  Image Name: ${IMAGE_NAME}"
echo -e "  Version: ${VERSION}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Build the Docker image
echo -e "\n${GREEN}Building Docker image...${NC}"
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} .
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:latest .

echo -e "\n${GREEN}✓ Build complete${NC}"

# Display summary
echo -e "\n${BLUE}===========================================${NC}"
echo -e "${GREEN}✓ Successfully built:${NC}"
echo -e "  ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo -e "  ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
echo -e "${BLUE}===========================================${NC}"

# Display run command
echo -e "\n${GREEN}To run this image locally:${NC}"
echo -e "  docker run -p 8002:80 ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

