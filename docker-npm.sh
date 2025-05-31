#!/bin/bash

# Script to run npm commands in a Docker container with proper permissions
# This avoids permission issues by running npm as the same user inside the container

set -e  # Exit on any error

# Get current user and group IDs
USER_ID=$(id -u)
GROUP_ID=$(id -g)
USER_NAME=$(whoami)

# Command to run
NPM_COMMAND="$@"

if [ -z "$NPM_COMMAND" ]; then
    echo "Usage: $0 <npm command>"
    echo "Example: $0 install"
    echo "Example: $0 ci"
    exit 1
fi

echo "=== Running npm $NPM_COMMAND in Docker container ==="
echo "User: $USER_NAME (UID: $USER_ID, GID: $GROUP_ID)"

# Run npm command in a Docker container with current user permissions
docker run --rm \
    -v "$(pwd):/app" \
    -w /app \
    -u $USER_ID:$GROUP_ID \
    -e HOME=/tmp \
    node:18-alpine \
    npm $NPM_COMMAND

echo "=== npm $NPM_COMMAND completed ==="
