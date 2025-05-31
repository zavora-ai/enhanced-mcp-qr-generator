/**
 * Unit tests for QR code generation tool
 */

import { generateQR } from '../../src/tools/generateQR';
import { QRCodeOptions } from '../../src/types';
import { ServerConfig } from '../../src/config';

// Mock QRCode library
jest.mock('qrcode', () => ({
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-qr-code')),
  toString: jest.fn().mockImplementation((_text, options) => {
    if (options.type === 'svg') {
      return Promise.resolve('<svg>Mock SVG QR Code</svg>');
    } else if (options.type === 'terminal') {
      return Promise.resolve('Mock Terminal QR Code');
    } else {
      return Promise.resolve('Mock QR Code');
    }
  })
}));

// Mock sharp library
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    composite: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-composite-image')),
    metadata: jest.fn().mockResolvedValue({ width: 300, height: 300 })
  }));
});

describe('QR Code Generation Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generateQR should generate a PNG QR code by default', async () => {
    const result = await generateQR('https://example.com');

    expect(result.format).toBe('png');
    expect(result.data).toContain('data:image/png;base64,');
    expect(result.mimeType).toBe('image/png');
    expect(result.content).toBe('https://example.com');
  });

  test('generateQR should generate an SVG QR code when specified', async () => {
    const options: QRCodeOptions = {
      format: 'svg'
    };

    const result = await generateQR('https://example.com', options);

    expect(result.format).toBe('svg');
    expect(result.data).toContain('<svg>');
    expect(result.mimeType).toBe('image/svg+xml');
  });

  test('generateQR should generate a terminal QR code when specified', async () => {
    const options: QRCodeOptions = {
      format: 'terminal'
    };

    const result = await generateQR('https://example.com', options);

    expect(result.format).toBe('terminal');
    expect(result.data).toBe('Mock Terminal QR Code');
    expect(result.mimeType).toBe('text/plain');
  });

  test('generateQR should throw error for empty text', async () => {
    await expect(generateQR('')).rejects.toThrow('Text is required');
  });

  test('generateQR should respect size limits', async () => {
    const options: QRCodeOptions = {
      size: 2000
    };

    const config: ServerConfig = {
      maxQRCodeSize: 1000,
      defaultErrorCorrectionLevel: 'M',
      defaultFormat: 'png',
      defaultSize: 300,
      defaultMargin: 4,
      defaultColor: '#000000',
      defaultBackgroundColor: '#ffffff',
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
      disallowedDomains: [],
      maxLogoSize: 1024 * 1024
    };

    await expect(generateQR('https://example.com', options, config)).rejects.toThrow(
      'QR code size exceeds maximum'
    );
  });
});
