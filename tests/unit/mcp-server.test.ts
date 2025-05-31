/**
 * Unit tests for MCP server implementation
 */

import { McpServer } from '../../src/mcp/server';
import { ServerConfig } from '../../src/config';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk', () => {
  const mockBuild = jest.fn().mockReturnValue({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined)
  });

  return {
    McpServerBuilder: jest.fn().mockImplementation(() => ({
      addFeature: jest.fn(),
      build: mockBuild
    })),
    Tool: jest.fn().mockImplementation((name, description, schema) => ({
      name,
      description,
      schema
    })),
    CallToolResult: jest.fn().mockImplementation((result, isError) => ({
      result,
      isError
    })),
    McpServerFeatures: {
      SyncToolSpecification: jest.fn().mockImplementation((tool, handler) => ({
        tool,
        handler
      }))
    }
  };
});

// Mock the QR code generation tools
jest.mock('../../src/tools/generateQR', () => ({
  generateQR: jest.fn().mockResolvedValue({
    data: 'mock-qr-data',
    mimeType: 'image/png',
    format: 'png',
    size: 300,
    content: 'https://example.com',
    timestamp: 1622548800000
  }),
  saveQRToFile: jest.fn().mockResolvedValue('/path/to/saved/qr.png')
}));

describe('MCP Server', () => {
  let server;
  let config;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a test configuration
    config = {
      defaultErrorCorrectionLevel: 'M',
      defaultFormat: 'png',
      defaultSize: 300,
      defaultMargin: 4,
      defaultColor: '#000000',
      defaultBackgroundColor: '#ffffff',
      maxQRCodeSize: 2000,
      maxLogoSize: 1024 * 1024,
      port: 3000,
      host: 'localhost',
      maxConcurrentRequests: 10,
      enableLogging: false,
      logLevel: 'info',
      cacheEnabled: false,
      cacheTTL: 3600,
      rateLimiting: {
        enabled: false,
        maxRequests: 100,
        timeWindow: 60
      },
      allowedDomains: null,
      disallowedDomains: []
    };

    // Create server instance
    server = new McpServer(config);
  });

  test('should create an MCP server with the provided configuration', () => {
    expect(server).toBeDefined();
  });

  test('should start the server successfully', async () => {
    await expect(server.start()).resolves.not.toThrow();
  });

  test('should stop the server successfully', async () => {
    await expect(server.stop()).resolves.not.toThrow();
  });

  test('should not throw when starting an already running server', async () => {
    await server.start();
    await expect(server.start()).resolves.not.toThrow();
  });

  test('should not throw when stopping a server that is not running', async () => {
    await expect(server.stop()).resolves.not.toThrow();
  });
});
