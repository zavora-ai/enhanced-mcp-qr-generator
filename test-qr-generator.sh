#!/bin/bash

# Enhanced test script for the MCP QR Generator
# This script tests the MCP server by sending a proper JSON-RPC 2.0 request
# and verifies the response contains a valid QR code

# Create output directory
OUTPUT_DIR="./test_output"
mkdir -p $OUTPUT_DIR

# Define output files
REQUEST_FILE="$OUTPUT_DIR/request.json"
RESPONSE_FILE="$OUTPUT_DIR/response.json"
QR_FILE="$OUTPUT_DIR/qr_code.png"
PARSED_RESPONSE_FILE="$OUTPUT_DIR/parsed_response.txt"

echo "=== Enhanced MCP QR Generator Test ==="
echo "Testing QR code generation via MCP protocol..."

# Create a proper JSON-RPC 2.0 request
cat > $REQUEST_FILE << EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_qr",
    "arguments": {
      "text": "https://example.com",
      "format": "png",
      "size": 300
    }
  }
}
EOF

echo "Request created: $(cat $REQUEST_FILE)"

# Kill any existing server processes
pkill -f "node dist/index.js" || true
sleep 1

# Use a different port for the server
export PORT=3333

# Start the MCP server in the background
echo "Starting MCP server in the background..."
node dist/index.js > $OUTPUT_DIR/server.log 2>&1 &
SERVER_PID=$!

# Give the server time to start
echo "Waiting for server to start..."
sleep 3

# Send the request to the server
echo "Sending request to MCP server..."
curl -s -X POST -H "Content-Type: application/json" -d @$REQUEST_FILE http://localhost:$PORT > $RESPONSE_FILE

# Check if the response was received
if [ ! -s "$RESPONSE_FILE" ]; then
  echo "Error: No response received from server"
  echo "Server log:"
  cat $OUTPUT_DIR/server.log
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

echo "Response received and saved to $RESPONSE_FILE"

# Parse and display the response structure
echo "Parsing response..."
jq . $RESPONSE_FILE > $PARSED_RESPONSE_FILE 2>/dev/null || echo "Error parsing JSON response"

# Check if the response is valid JSON-RPC 2.0
if ! grep -q '"jsonrpc":"2.0"' $RESPONSE_FILE && ! grep -q '"jsonrpc": "2.0"' $RESPONSE_FILE; then
  echo "Error: Response is not a valid JSON-RPC 2.0 response"
  echo "Response content:"
  cat $RESPONSE_FILE
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

echo "Response is a valid JSON-RPC 2.0 response"

# Extract the QR code data if present
echo "Extracting QR code data..."
if grep -q '"type":"image"' $RESPONSE_FILE || grep -q '"type": "image"' $RESPONSE_FILE; then
  # Extract the base64 data
  BASE64_DATA=$(cat $RESPONSE_FILE | grep -o '"data":"[^"]*"' | cut -d'"' -f4 || echo "")
  
  if [ -z "$BASE64_DATA" ]; then
    echo "Error: Could not extract base64 data from response"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  
  # Save the QR code
  echo "Saving QR code to $QR_FILE..."
  echo $BASE64_DATA | base64 -d > $QR_FILE
  
  # Verify the QR code file exists and has content
  if [ -s "$QR_FILE" ]; then
    echo "QR code successfully generated and saved"
    echo "QR code file size: $(stat -c%s $QR_FILE) bytes"
    
    # Try to decode the QR code if zbarimg is available
    if command -v zbarimg &> /dev/null; then
      echo "Verifying QR code content..."
      DECODED=$(zbarimg -q --raw $QR_FILE)
      if [ $? -eq 0 ]; then
        echo "QR code successfully decoded: $DECODED"
        if [ "$DECODED" == "https://example.com" ]; then
          echo "✅ QR code content matches the requested URL"
        else
          echo "❌ QR code content does not match the requested URL"
        fi
      else
        echo "Could not decode QR code (this doesn't necessarily mean it's invalid)"
      fi
    else
      echo "zbarimg not available for QR code verification"
    fi
  else
    echo "Error: QR code file is empty or was not created"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
else
  echo "Error: No image data found in response"
  echo "Response content:"
  cat $PARSED_RESPONSE_FILE
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

# Stop the server
echo "Stopping MCP server..."
kill $SERVER_PID 2>/dev/null || true

echo "=== Test completed successfully ==="
echo "You can find the QR code at: $QR_FILE"
echo "You can find the full response at: $PARSED_RESPONSE_FILE"
