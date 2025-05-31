# Enhanced MCP QR Generator

A powerful and flexible MCP (Model Context Protocol) server for generating QR codes from URLs and text.

Developed by [James Karanja](https://www.zavora.ai) at Zavora AI.

[![CI/CD Pipeline](https://github.com/zavora-ai/enhanced-mcp-qr-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/zavora-ai/enhanced-mcp-qr-generator/actions/workflows/ci.yml)

## Features

- **QR Code Generation**: Create QR codes from any text or URL
- **Multiple Output Formats**: Generate QR codes as PNG, SVG, base64, or terminal ASCII art
- **Customization Options**: Control size, margins, colors, and error correction levels
- **Logo Integration**: Add custom logos to the center of QR codes
- **File Saving**: Save generated QR codes to files with custom or auto-generated names
- **MCP Integration**: Full Model Context Protocol support for AI assistants
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Health Monitoring**: Built-in health check endpoint

## Installation

```bash
npm install enhanced-mcp-qr-generator
```

## Server Architecture

The Enhanced MCP QR Generator uses a single HTTP server that handles:

1. **JSON-RPC Requests**: For MCP protocol communication
2. **Health Check Endpoint**: Available at `/health` for monitoring

### Port Configuration

The server uses port 9999 by default. You can change this by:

1. Setting the `PORT` environment variable
2. When using Docker, updating the `PORT` environment variable in docker-compose.yml
3. When using Docker, updating the port mapping in docker-compose.yml

Example:
```bash
# Run with a custom port
PORT=8080 npx enhanced-mcp-qr-generator
```

### Configuration Precedence

Configuration values are determined in the following order (highest priority first):

1. Command line arguments
2. Environment variables
3. Default values from config.ts

### As an MCP Server

```bash
# Run directly from command line
npx enhanced-mcp-qr-generator

# With custom options
npx enhanced-mcp-qr-generator --error-correction-level=H --format=svg --size=500
```

## MCP Integration

The Enhanced MCP QR Generator implements the Model Context Protocol (MCP), allowing it to be used with various AI assistants and tools.

### Available MCP Tools

- **generate_qr**: Generate a QR code from text or URL
- **save_qr**: Generate a QR code and save it to a file

### Using with AI Assistants

#### Amazon Q CLI

To use with Amazon Q CLI, create an MCP configuration file:

```bash
# Create a configuration directory if it doesn't exist
mkdir -p ~/.aws/amazonq

# Create the MCP configuration file
cat > ~/.aws/amazonq/mcp.json << EOF
{
  "mcpServers": {
    "qr-generator": {
      "command": "npx",
      "args": ["-y", "enhanced-mcp-qr-generator"]
    }
  }
}
EOF

# Start Amazon Q with MCP support enabled
q chat
```

You can also place the configuration in your project directory at `.amazonq/mcp.json` to share it with your team.

#### Claude Desktop

To use with Claude Desktop, create an MCP configuration file:

```json
{
  "mcpServers": {
    "qr-generator": {
      "command": "npx",
      "args": ["-y", "enhanced-mcp-qr-generator"]
    }
  }
}
```

Add this configuration to your Claude Desktop settings file.

You can then use the QR generator tools in your conversation:

```
> Can you generate a QR code for my website https://example.com?
```

### Docker Configuration

You can also run the server using Docker:

```json
{
  "mcpServers": {
    "qr-generator": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "zavorai/enhanced-mcp-qr-generator"]
    }
  }
}
```

## Configuration

Create a custom configuration to control server behavior:

```typescript
import { generateQR, ServerConfig } from 'enhanced-mcp-qr-generator';

const config: ServerConfig = {
  defaultErrorCorrectionLevel: 'H',
  defaultFormat: 'svg',
  defaultSize: 500,
  defaultMargin: 2,
  defaultColor: '#000000',
  defaultBackgroundColor: '#ffffff',
  maxQRCodeSize: 2000,
  maxLogoSize: 2 * 1024 * 1024, // 2MB
  // ... other options
};

// Use the configuration with any operation
const qrCode = await generateQR('https://example.com', {}, config);
```

### Command Line Options

When running as an MCP server, the following command line options are available:

```
--error-correction-level=<L|M|Q|H>  Set error correction level
--format=<png|svg|base64|terminal>  Set output format
--size=<pixels>                     Set QR code size
--margin=<modules>                  Set margin size
--color=<color>                     Set QR code color
--background-color=<color>          Set background color
```

## API Documentation

### generateQR(text, options, config)

Generates a QR code from text or URL.

- **text**: Text or URL to encode in the QR code
- **options**: QR code generation options
  - **errorCorrectionLevel**: Error correction level ('L', 'M', 'Q', 'H')
  - **format**: Output format ('png', 'svg', 'base64', 'terminal')
  - **size**: Size of QR code in pixels
  - **margin**: Margin around the QR code in modules
  - **color**: Color of the QR code (dark modules)
  - **backgroundColor**: Background color of the QR code (light modules)
  - **logo**: Logo options
    - **image**: URL or base64 encoded image
    - **size**: Size of the logo as a percentage of the QR code size
- **config**: Server configuration (optional)

Returns a QRCodeResult object:
- **data**: Generated QR code data
- **mimeType**: MIME type of the generated QR code
- **format**: Format of the generated QR code
- **size**: Size of the generated QR code in pixels
- **content**: Original text or URL encoded in the QR code
- **timestamp**: Timestamp when the QR code was generated

### saveQRToFile(qrResult, outputPath)

Saves a QR code to a file.

- **qrResult**: QR code result from generateQR
- **outputPath**: Output file path

Returns the path to the saved file.

## MCP Protocol Implementation

This project implements the Model Context Protocol (MCP) specification, providing a standardized way for AI assistants to generate QR codes. The implementation follows the JSON-RPC 2.0 format required by MCP.

### Tool Specifications

The MCP server provides two tools:

1. **generate_qr**: Generates a QR code and returns it in the specified format
   - Input: Text/URL, format options, styling options
   - Output: QR code data with metadata

2. **save_qr**: Generates a QR code and saves it to a file
   - Input: Text/URL, output path, format options, styling options
   - Output: File path and metadata

### JSON-RPC Format

All requests and responses follow the JSON-RPC 2.0 format:

```json
// Example request
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

// Example response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "image",
        "data": "base64-encoded-data",
        "mimeType": "image/png"
      }
    ],
    "structuredContent": {
      "format": "png",
      "size": 300,
      "content": "https://example.com",
      "timestamp": "2025-05-30T21:00:00Z"
    }
  }
}
```

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Building

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Testing

The project includes both unit tests and integration tests:

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
