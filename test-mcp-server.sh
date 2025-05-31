#!/bin/bash

# Test script for Enhanced MCP QR Generator Server
# This script tests various endpoints and tools of the MCP server

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server URL
SERVER_URL="http://localhost:9998"

echo -e "${BLUE}=== Enhanced MCP QR Generator Server Test ===${NC}"
echo "Testing server at $SERVER_URL"
echo

# Test 1: Health endpoint
echo -e "${BLUE}Test 1: Health Endpoint${NC}"
HEALTH_RESPONSE=$(curl -s $SERVER_URL/health)
if [[ $HEALTH_RESPONSE == *"status"*"ok"* ]]; then
  echo -e "${GREEN}✓ Health endpoint is working${NC}"
  echo "Response: $HEALTH_RESPONSE"
else
  echo -e "${RED}✗ Health endpoint failed${NC}"
  echo "Response: $HEALTH_RESPONSE"
fi
echo

# Test 2: List tools
echo -e "${BLUE}Test 2: List Tools${NC}"
TOOLS_RESPONSE=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }')
if [[ $TOOLS_RESPONSE == *"tools"* ]]; then
  echo -e "${GREEN}✓ Tools list endpoint is working${NC}"
  echo "Found tools:"
  echo $TOOLS_RESPONSE | grep -o '"name":"[^"]*"' | cut -d'"' -f4
else
  echo -e "${RED}✗ Tools list endpoint failed${NC}"
  echo "Response: $TOOLS_RESPONSE"
fi
echo

# Test 3: List resources
echo -e "${BLUE}Test 3: List Resources${NC}"
RESOURCES_RESPONSE=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "resources/list"
  }')
if [[ $RESOURCES_RESPONSE == *"resources"* ]]; then
  echo -e "${GREEN}✓ Resources list endpoint is working${NC}"
  echo "Found resources:"
  echo $RESOURCES_RESPONSE | grep -o '"name":"[^"]*"' | cut -d'"' -f4
else
  echo -e "${RED}✗ Resources list endpoint failed${NC}"
  echo "Response: $RESOURCES_RESPONSE"
fi
echo

# Test 4: Get documentation resource
echo -e "${BLUE}Test 4: Get Documentation Resource${NC}"
DOC_RESPONSE=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/read",
    "params": {
      "uri": "qr-docs://guide"
    }
  }')
if [[ $DOC_RESPONSE == *"QR Code Generation Guide"* ]]; then
  echo -e "${GREEN}✓ Documentation resource is available${NC}"
  echo "Documentation found"
else
  echo -e "${RED}✗ Documentation resource failed${NC}"
  echo "Response: $DOC_RESPONSE"
fi
echo

# Test 5: Generate QR code (terminal format for easy testing)
echo -e "${BLUE}Test 5: Generate QR Code (Terminal Format)${NC}"
QR_RESPONSE=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "generate_qr",
      "arguments": {
        "text": "https://example.com",
        "format": "terminal"
      }
    }
  }')
if [[ $QR_RESPONSE == *"content"* ]]; then
  echo -e "${GREEN}✓ QR code generation is working${NC}"
  echo "QR code generated:"
  echo $QR_RESPONSE | grep -o '"text":"[^"]*"' | head -1 | cut -d'"' -f4
else
  echo -e "${RED}✗ QR code generation failed${NC}"
  echo "Response: $QR_RESPONSE"
fi
echo

# Test 6: Save QR code to file
echo -e "${BLUE}Test 6: Save QR Code to File${NC}"
mkdir -p ./output
SAVE_RESPONSE=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "save_qr",
      "arguments": {
        "text": "https://example.com",
        "outputPath": "./output/test-qr.png"
      }
    }
  }')
if [[ $SAVE_RESPONSE == *"saved"* ]]; then
  echo -e "${GREEN}✓ QR code saved successfully${NC}"
  echo "Response: $SAVE_RESPONSE"
  if [ -f "./output/test-qr.png" ]; then
    echo -e "${GREEN}✓ File exists at ./output/test-qr.png${NC}"
  else
    echo -e "${RED}✗ File not found at ./output/test-qr.png${NC}"
  fi
else
  echo -e "${RED}✗ QR code save failed${NC}"
  echo "Response: $SAVE_RESPONSE"
fi
echo

# Test 7: Invalid request
echo -e "${BLUE}Test 7: Invalid Request${NC}"
INVALID_RESPONSE=$(curl -s -X POST $SERVER_URL \
  -H "Content-Type: application/json" \
  -d '{
    "invalid": "request"
  }')
if [[ $INVALID_RESPONSE == *"error"* ]]; then
  echo -e "${GREEN}✓ Server correctly handles invalid requests${NC}"
  echo "Error response received as expected"
else
  echo -e "${RED}✗ Server did not properly handle invalid request${NC}"
  echo "Response: $INVALID_RESPONSE"
fi
echo

echo -e "${BLUE}=== Test Summary ===${NC}"
echo "All tests completed. Check the results above for any failures."
echo "Server log file should be available at: ./server.log"
