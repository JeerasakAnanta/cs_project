#!/bin/bash

# LannaFinChat Deployment Script
# Usage: ./deploy.sh [dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is specified
ENVIRONMENT=${1:-prod}

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    print_error "Invalid environment. Use 'dev' or 'prod'"
    exit 1
fi

print_status "Starting LannaFinChat deployment for $ENVIRONMENT environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [[ ! -f .env ]]; then
    print_error ".env file not found. Please create it from .env.example"
    exit 1
fi

# Load environment variables
print_status "Loading environment variables..."
source .env

# Validate required environment variables
print_status "Validating environment variables..."
required_vars=("OPENAI_API_KEY" "DB_PASSWORD" "ACCESS_SECRET" "REFRESH_SECRET")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Remove old images (optional)
if [[ "$ENVIRONMENT" == "prod" ]]; then
    print_status "Cleaning up old images..."
    docker system prune -f || true
fi

# Build and start services
print_status "Building and starting services..."
if [[ "$ENVIRONMENT" == "prod" ]]; then
    docker-compose -f docker-compose.prod.yml up -d --build
else
    docker-compose -f docker-compose.yml up -d --build
fi

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
services=("postgres" "qdrant" "backend" "frontend")
for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps $service | grep -q "healthy"; then
        print_success "$service is healthy"
    else
        print_warning "$service health check failed"
    fi
done

# Show service status
print_status "Service status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs for debugging
print_status "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

print_success "Deployment completed!"
print_status "Frontend: http://localhost"
print_status "Backend API: http://localhost:8003"
print_status "Qdrant: http://localhost:6333"

# Show useful commands
echo ""
print_status "Useful commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  Update services: ./deploy.sh $ENVIRONMENT" 