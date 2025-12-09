#!/usr/bin/env bash
# Simple build+run helper for the chat_api Docker image
# Place this file at chat_api/docker-build.sh and make executable: chmod +x chat_api/docker-build.sh

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dockerfile="$script_dir/Dockerfile"
context="$script_dir"

IMAGE_NAME="${IMAGE_NAME:-cs_fastapi_app}"
TAG="${TAG:-latest}"
FULL_IMAGE="${IMAGE_NAME}:${TAG}"
CONTAINER_NAME="${CONTAINER_NAME:-cs_fastapi_app}"
HOST_PORT="${HOST_PORT:-8002}"   # host port to map to container's exposed port
CONTAINER_PORT="${CONTAINER_PORT:-8003}" # default CMD in Dockerfile listens on 8003

usage() {
    cat <<EOF
Usage: $(basename "$0") [command] [options]

Commands:
    build        Build the Docker image (default if no command provided)
    run          Build (if needed) and run the container (detached)
    rebuild      Build with --no-cache then run (useful for clean rebuild)
    push         Push image to remote registry (requires docker login)

Environment variables / options:
    IMAGE_NAME    Image name (default: ${IMAGE_NAME})
    TAG           Image tag (default: ${TAG})
    CONTAINER_NAME Container name (default: ${CONTAINER_NAME})
    HOST_PORT     Host port to bind to (default: ${HOST_PORT})
    CONTAINER_PORT Container port inside container (default: ${CONTAINER_PORT})

Examples:
    IMAGE_NAME=myorg/cs_fastapi_app TAG=dev $(basename "$0") build
    $(basename "$0") run
EOF
}

do_build() {
    echo "Building image ${FULL_IMAGE} from ${dockerfile} ..."
    docker build -f "$dockerfile" -t "$FULL_IMAGE" "$context"
    echo "Built ${FULL_IMAGE}"
}

do_rebuild() {
    echo "Rebuilding (no cache) image ${FULL_IMAGE} ..."
    docker build --no-cache -f "$dockerfile" -t "$FULL_IMAGE" "$context"
    echo "Rebuilt ${FULL_IMAGE}"
}

do_run() {
    # stop existing container if running
    if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
        echo "Removing existing container ${CONTAINER_NAME} ..."
        docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    fi

    echo "Running container ${CONTAINER_NAME} -> ${HOST_PORT}:${CONTAINER_PORT}"
    docker run -d --name "$CONTAINER_NAME" -p "${HOST_PORT}:${CONTAINER_PORT}" "$FULL_IMAGE"
    echo "Container started (name=${CONTAINER_NAME})"
}

do_push() {
    echo "Pushing ${FULL_IMAGE} ..."
    docker push "$FULL_IMAGE"
    echo "Pushed ${FULL_IMAGE}"
}

cmd="${1:-build}"

case "$cmd" in
    -h|--help|help) usage; exit 0 ;;
    build) do_build ;;
    rebuild) do_rebuild; do_run ;;
    run) 
        # build if image doesn't exist
        if ! docker image inspect "$FULL_IMAGE" >/dev/null 2>&1; then
            do_build
        fi
        do_run
        ;;
    push) do_push ;;
    *) echo "Unknown command: $cmd"; usage; exit 1 ;;
esac
