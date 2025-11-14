#!/bin/bash

# Docker Build and Push Script
# This script builds and pushes the frontend Docker image to Docker Hub

set -e  # Exit on error

# Configuration
DOCKER_USERNAME="jeerasakanant"
IMAGE_NAME="frontend-cs-project"
VERSION=$(cat package.json | grep '"version"' | cut -d '"' -f 4)
REGISTRY="docker.io"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  Docker Build and Push Script${NC}"
echo -e "${BLUE}===========================================${NC}"

# Print configuration
echo -e "\n${GREEN}Configuration:${NC}"
echo -e "  Docker Username: ${DOCKER_USERNAME}"
echo -e "  Image Name: ${IMAGE_NAME}"
echo -e "  Version: ${VERSION}"
echo -e "  Registry: ${REGISTRY}"

# Confirm before proceeding
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}Build cancelled${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Build the Docker image
echo -e "\n${GREEN}Step 1: Building Docker image...${NC}"
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} .
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:latest .

echo -e "${GREEN}✓ Build complete${NC}"

# Login to Docker Hub
echo -e "\n${GREEN}Step 2: Logging in to Docker Hub...${NC}"
if docker login; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}Error: Docker login failed${NC}"
    exit 1
fi

# Push the image with version tag
echo -e "\n${GREEN}Step 3: Pushing image with version tag (${VERSION})...${NC}"
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
echo -e "${GREEN}✓ Version ${VERSION} pushed${NC}"

# Push the image with latest tag
echo -e "\n${GREEN}Step 4: Pushing image with latest tag...${NC}"
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
echo -e "${GREEN}✓ Latest tag pushed${NC}"

# Display summary
echo -e "\n${BLUE}===========================================${NC}"
echo -e "${GREEN}✓ Successfully built and pushed:${NC}"
echo -e "  ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo -e "  ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
echo -e "\n${BLUE}Docker Hub URL:${NC}"
echo -e "  https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
echo -e "${BLUE}===========================================${NC}"

# Display pull command
echo -e "\n${GREEN}To pull this image:${NC}"
echo -e "  docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo -e "  docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

