/**
 * QR Code generation tool
 */

import * as QRCode from 'qrcode';
import sharp from 'sharp';
import { QRCodeOptions, QRCodeResult } from '../types';
import { ServerConfig, defaultConfig } from '../config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Generate a QR code from text or URL
 * @param text Text or URL to encode in the QR code
 * @param options QR code generation options
 * @param config Server configuration
 * @returns Generated QR code result
 */
export async function generateQR(
  text: string,
  options: QRCodeOptions = {},
  config: ServerConfig = defaultConfig
): Promise<QRCodeResult> {
  try {
    // Validate input
    if (!text || text.trim() === '') {
      throw new Error('Text is required');
    }

    // Apply default options
    const opts = {
      errorCorrectionLevel: options.errorCorrectionLevel || config.defaultErrorCorrectionLevel,
      format: options.format || config.defaultFormat,
      size: options.size || config.defaultSize,
      margin: options.margin !== undefined ? options.margin : config.defaultMargin,
      color: options.color || config.defaultColor,
      backgroundColor: options.backgroundColor || config.defaultBackgroundColor,
      logo: options.logo
    };

    // Validate size
    if (opts.size > config.maxQRCodeSize) {
      throw new Error(`QR code size exceeds maximum (${config.maxQRCodeSize}px)`);
    }

    // Generate QR code based on format
    let data: string;
    let mimeType: string;

    switch (opts.format) {
      case 'svg':
        data = await generateSvgQR(text, opts);
        mimeType = 'image/svg+xml';
        break;
      case 'terminal':
        data = await generateTerminalQR(text, opts);
        mimeType = 'text/plain';
        break;
      case 'base64':
        data = await generateBase64QR(text, opts);
        mimeType = 'text/plain';
        break;
      case 'png':
      default:
        data = await generatePngQR(text, opts);
        mimeType = 'image/png';
        break;
    }

    // Add logo if specified
    if (opts.logo && opts.format !== 'terminal' && opts.format !== 'base64') {
      data = await addLogoToQR(data, opts.logo, opts.format, config);
    }

    return {
      data,
      mimeType,
      format: opts.format,
      size: opts.size,
      content: text,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`QR code generation error: ${(error as Error).message}`);
  }
}

/**
 * Generate a PNG QR code
 * @param text Text to encode
 * @param options QR code options
 * @returns Base64 encoded PNG
 */
async function generatePngQR(text: string, options: QRCodeOptions): Promise<string> {
  const qrOptions: QRCode.QRCodeToBufferOptions = {
    type: 'png',
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.color || '#000000',
      light: options.backgroundColor || '#ffffff'
    }
  };

  const buffer = await QRCode.toBuffer(text, qrOptions);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Generate an SVG QR code
 * @param text Text to encode
 * @param options QR code options
 * @returns SVG string
 */
async function generateSvgQR(text: string, options: QRCodeOptions): Promise<string> {
  const qrOptions: QRCode.QRCodeToStringOptions = {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.size,
    color: {
      dark: options.color || '#000000',
      light: options.backgroundColor || '#ffffff'
    }
  };

  return await QRCode.toString(text, qrOptions);
}

/**
 * Generate a terminal-friendly QR code
 * @param text Text to encode
 * @param options QR code options
 * @returns ASCII QR code
 */
async function generateTerminalQR(text: string, options: QRCodeOptions): Promise<string> {
  const qrOptions: QRCode.QRCodeToStringOptions = {
    type: 'terminal',
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    small: true
  };

  return await QRCode.toString(text, qrOptions);
}

/**
 * Generate a base64 QR code
 * @param text Text to encode
 * @param options QR code options
 * @returns Base64 string
 */
async function generateBase64QR(text: string, options: QRCodeOptions): Promise<string> {
  const qrOptions: QRCode.QRCodeToStringOptions = {
    type: 'utf8',
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin
  };

  const qrString = await QRCode.toString(text, qrOptions);
  return Buffer.from(qrString).toString('base64');
}

/**
 * Add a logo to the center of a QR code
 * @param qrData QR code data
 * @param logo Logo options
 * @param format QR code format
 * @param config Server configuration
 * @returns QR code with logo
 */
async function addLogoToQR(
  qrData: string,
  logo: { image: string; size?: number },
  format: string,
  config: ServerConfig
): Promise<string> {
  if (format === 'svg') {
    // For SVG, we need to embed the logo as a data URL
    return addLogoToSvg(qrData, logo);
  } else {
    // For PNG, we use sharp to composite the images
    return addLogoToPng(qrData, logo, config);
  }
}

/**
 * Add a logo to an SVG QR code
 * @param svgData SVG QR code
 * @param logo Logo options
 * @returns SVG with logo
 */
async function addLogoToSvg(
  svgData: string,
  logo: { image: string; size?: number }
): Promise<string> {
  // Extract viewBox dimensions
  const viewBoxMatch = svgData.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (!viewBoxMatch) {
    throw new Error('Could not extract viewBox from SVG');
  }

  const width = parseInt(viewBoxMatch[1]);
  const height = parseInt(viewBoxMatch[2]);

  // Calculate logo size and position
  const logoSize = logo.size
    ? (logo.size / 100) * Math.min(width, height)
    : Math.min(width, height) * 0.2;
  const logoX = (width - logoSize) / 2;
  const logoY = (height - logoSize) / 2;

  // Insert logo image before closing svg tag
  const logoSvg = `<image href="${logo.image}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />`;
  return svgData.replace('</svg>', `${logoSvg}</svg>`);
}

/**
 * Add a logo to a PNG QR code
 * @param pngData Base64 encoded PNG
 * @param logo Logo options
 * @param config Server configuration
 * @returns PNG with logo
 */
async function addLogoToPng(
  pngData: string,
  logo: { image: string; size?: number },
  config: ServerConfig
): Promise<string> {
  // Extract base64 data
  const base64Data = pngData.replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(base64Data, 'base64');

  // Get logo buffer
  let logoBuffer: Buffer;
  if (logo.image.startsWith('data:')) {
    // Logo is a data URL
    const logoBase64 = logo.image.split(',')[1];
    logoBuffer = Buffer.from(logoBase64, 'base64');
  } else if (logo.image.startsWith('http')) {
    // Logo is a URL
    logoBuffer = await fetchLogoFromUrl(logo.image, config);
  } else {
    // Logo is a file path
    logoBuffer = fs.readFileSync(logo.image);
  }

  // Get QR code dimensions
  const qrImage = sharp(qrBuffer);
  const qrMetadata = await qrImage.metadata();
  const qrWidth = qrMetadata.width || 300;
  const qrHeight = qrMetadata.height || 300;

  // Resize logo
  const logoSize = logo.size
    ? (logo.size / 100) * Math.min(qrWidth, qrHeight)
    : Math.min(qrWidth, qrHeight) * 0.2;
  const resizedLogo = await sharp(logoBuffer)
    .resize(Math.round(logoSize), Math.round(logoSize), {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();

  // Calculate logo position
  const logoX = Math.round((qrWidth - logoSize) / 2);
  const logoY = Math.round((qrHeight - logoSize) / 2);

  // Composite images
  const compositeBuffer = await qrImage
    .composite([
      {
        input: resizedLogo,
        top: logoY,
        left: logoX
      }
    ])
    .toBuffer();

  return `data:image/png;base64,${compositeBuffer.toString('base64')}`;
}

/**
 * Fetch a logo from a URL
 * @param url Logo URL
 * @param config Server configuration
 * @returns Logo buffer
 */
async function fetchLogoFromUrl(url: string, config: ServerConfig): Promise<Buffer> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check if domain is allowed
    if (config.allowedDomains !== null && !config.allowedDomains.includes(hostname)) {
      throw new Error(`Domain not allowed: ${hostname}`);
    }

    // Check if domain is disallowed
    if (config.disallowedDomains.includes(hostname)) {
      throw new Error(`Domain not allowed: ${hostname}`);
    }

    // Fetch logo
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // Check size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > config.maxLogoSize) {
      throw new Error(`Logo size exceeds maximum (${config.maxLogoSize} bytes)`);
    }

    // Get buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Error fetching logo: ${(error as Error).message}`);
  }
}

/**
 * Save a QR code to a file
 * @param qrResult QR code result
 * @param outputPath Output file path
 * @returns Path to saved file
 */
export async function saveQRToFile(qrResult: QRCodeResult, outputPath: string): Promise<string> {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file based on format
    if (qrResult.format === 'png') {
      const base64Data = qrResult.data.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
    } else if (qrResult.format === 'svg') {
      fs.writeFileSync(outputPath, qrResult.data);
    } else {
      fs.writeFileSync(outputPath, qrResult.data);
    }

    return outputPath;
  } catch (error) {
    throw new Error(`Error saving QR code: ${(error as Error).message}`);
  }
}

/**
 * Generate a QR code and save it to a file
 * @param text Text or URL to encode
 * @param outputPath Output file path
 * @param options QR code options
 * @param config Server configuration
 * @returns Path to saved file
 */
export async function generateAndSaveQR(
  text: string,
  outputPath: string,
  options: QRCodeOptions = {},
  config: ServerConfig = defaultConfig
): Promise<string> {
  // Generate QR code
  const qrResult = await generateQR(text, options, config);

  // Save to file
  return await saveQRToFile(qrResult, outputPath);
}

/**
 * Generate a QR code with a unique filename
 * @param text Text or URL to encode
 * @param directory Output directory
 * @param options QR code options
 * @param config Server configuration
 * @returns Path to saved file
 */
export async function generateQRWithUniqueFilename(
  text: string,
  directory: string,
  options: QRCodeOptions = {},
  config: ServerConfig = defaultConfig
): Promise<string> {
  // Generate a unique filename based on text and options
  const hash = crypto
    .createHash('md5')
    .update(text + JSON.stringify(options))
    .digest('hex');
  const format = options.format || config.defaultFormat;
  const extension = format === 'svg' ? 'svg' : format === 'png' ? 'png' : 'txt';
  const filename = `qr-${hash}.${extension}`;
  const outputPath = path.join(directory, filename);

  // Generate and save QR code
  return await generateAndSaveQR(text, outputPath, options, config);
}
