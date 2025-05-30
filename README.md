# Enhanced MCP QR Generator

A powerful and flexible MCP (Model Context Protocol) server for generating QR codes from URLs and text.

Developed by [James Karanja](https://www.zavora.ai) at Zavora AI.

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

## Quick Start

### As a Library

```typescript
import { generateQR, saveQRToFile } from 'enhanced-mcp-qr-generator';

// Generate a simple QR code
const qrCode = await generateQR('https://example.com');
console.log(qrCode.data); // Base64 encoded PNG

// Generate a customized QR code
const customQR = await generateQR('https://example.com', {
  format: 'svg',
  size: 500,
  margin: 2,
  errorCorrectionLevel: 'H',
  color: '#0000ff',
  backgroundColor: '#ffffff'
});

// Save QR code to file
await saveQRToFile(customQR, '/path/to/qrcode.svg');

// Generate QR code with logo
const qrWithLogo = await generateQR('https://example.com', {
  format: 'png',
  size: 500,
  logo: {
    image: 'https://example.com/logo.png',
    size: 20 // 20% of QR code size
  }
});
```

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

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
