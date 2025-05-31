#!/bin/bash

# Script to fix node_modules permissions securely
# This script will:
# 1. Check current ownership
# 2. Create a backup of package.json and package-lock.json
# 3. Remove node_modules directory
# 4. Reinstall dependencies with correct permissions
# 5. Verify the fix

set -e  # Exit on any error

echo "=== Enhanced MCP QR Generator Permissions Fix ==="
echo "This script will fix permission issues in the node_modules directory"

# Check if running as root and exit if true
if [ "$(id -u)" = "0" ]; then
   echo "Error: This script should not be run as root or with sudo"
   echo "Please run as your regular user account"
   exit 1
fi

# Get current directory and user
CURRENT_DIR=$(pwd)
CURRENT_USER=$(whoami)
echo "Current user: $CURRENT_USER"
echo "Current directory: $CURRENT_DIR"

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Create backup of important files
echo "Creating backup of package.json and package-lock.json..."
cp package.json package.json.bak
if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.bak
fi

# Check current ownership of node_modules
echo "Checking current ownership of node_modules..."
if [ -d "node_modules" ]; then
    OWNER=$(stat -c '%U' node_modules)
    echo "Current owner of node_modules: $OWNER"
    
    # Count files owned by root
    ROOT_FILES=$(find node_modules -user root | wc -l)
    echo "Files owned by root: $ROOT_FILES"
    
    # Remove node_modules
    echo "Removing node_modules directory..."
    rm -rf node_modules
else
    echo "node_modules directory not found, will create fresh installation"
fi

# Reinstall dependencies
echo "Reinstalling dependencies with correct permissions..."
npm ci

# Verify fix
echo "Verifying fix..."
if [ -d "node_modules" ]; then
    NEW_OWNER=$(stat -c '%U' node_modules)
    echo "New owner of node_modules: $NEW_OWNER"
    
    # Count files owned by root
    NEW_ROOT_FILES=$(find node_modules -user root | wc -l)
    echo "Files owned by root after fix: $NEW_ROOT_FILES"
    
    if [ "$NEW_ROOT_FILES" -eq "0" ]; then
        echo "Success! All files are now owned by $NEW_OWNER"
    else
        echo "Warning: Some files are still owned by root"
        echo "You may need to manually fix these with: sudo chown -R $CURRENT_USER:$CURRENT_USER node_modules"
    fi
else
    echo "Error: node_modules directory not created during installation"
    exit 1
fi

# Rebuild the project
echo "Rebuilding the project..."
npm run build

echo "Permission fix completed!"
