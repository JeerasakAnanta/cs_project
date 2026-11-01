# Root justfile for LannaFinChat monorepo
# Orchestrates both server/ and client/ subprojects

# Default target - list available commands
default:
    @just --list

# ====================
# Development Tasks
# ====================

# Install all dependencies (server + client)
deps:
    @echo "Installing server dependencies..."
    just -f server/justfile -d server deps
    @echo "Installing client dependencies..."
    just -f client/justfile -d client install

# Update all dependencies to latest allowed versions (server + client)
update:
    @echo "Updating server dependencies..."
    cd server && uv lock --upgrade && uv sync
    @echo "Updating client dependencies..."
    cd client && npm update

# Run database migrations
migrate:
    @echo "Running database migrations..."
    just -f server/justfile -d server migrate

# Create a new migration (usage: just new-migration "message")
new-migration message:
    @echo "Creating new migration..."
    just -f server/justfile -d server new-migration "{{ message }}"

# Run development servers (both)
dev:
    @echo "Starting development servers..."
    @echo "Server: http://localhost:8001"
    @echo "Client: http://localhost:5173"
    @echo ""
    @just -f server/justfile -d server dev & just -d client dev

# Run server only
dev-server:
    just -f server/justfile -d server dev

# Run client only
dev-client:
    just -f client/justfile -d client dev

# ====================
# Build Tasks
# ====================

# Build both projects
build:
    @echo "Building server..."
    just -f server/justfile -d server docker-build
    @echo "Building client..."
    just -f client/justfile -d client build

# Build client only
build-client:
    just -f client/justfile -d client build

# Build server docker image only
build-server:
    just -f server/justfile -d server docker-build

# ====================
# Docker Tasks
# ====================

# Build all Docker images
docker-build: build
    @echo "✓ All Docker images built"

# Push all Docker images
docker-push:
    @echo "Pushing client image..."
    just -f client/justfile -d client docker-push

# Start all services with docker-compose
docker-compose-up:
    docker-compose up -d

# Stop all docker-compose services
docker-compose-down:
    docker-compose down

# View docker-compose logs
docker-compose-logs service="":
    docker-compose logs -f {{ service }}

# ====================
# Indexing Tasks
# ====================

# Index PDF documents into Qdrant
index-docs:
    @echo "Indexing PDF documents..."
    just -f server/justfile -d server index-docs

# ====================
# Quality Checks
# ====================

# Run all checks (format, lint, build) for client
check:
    just -f client/justfile -d client check

# Clean build artifacts
clean:
    @echo "Cleaning client..."
    just -f client/justfile -d client clean

# ====================
# Combined Tasks
# ====================

# Full setup: install deps, migrate, index docs
setup: deps migrate index-docs
    @echo "✓ Full setup complete!"

# Quick verify: check client + build server
verify: check build-server
    @echo "✓ Verification complete"

# Clean and rebuild everything
rebuild: clean deps build
    @echo "✓ Rebuild complete"
