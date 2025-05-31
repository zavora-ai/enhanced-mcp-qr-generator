/**
 * Unit tests for MCP server implementation
 */

import { McpServer } from '../../src/mcp/server';

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

  test('should have start and stop methods', () => {
    expect(typeof server.start).toBe('function');
    expect(typeof server.stop).toBe('function');
  });
});
