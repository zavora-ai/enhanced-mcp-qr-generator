/**
 * TypeScript type definitions for the Enhanced MCP QR Generator
 */

/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  /**
   * Error correction level
   * L: Low (7%)
   * M: Medium (15%)
   * Q: Quartile (25%)
   * H: High (30%)
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  
  /**
   * Output format
   */
  format?: 'png' | 'svg' | 'base64' | 'terminal';
  
  /**
   * Size of QR code in pixels (for PNG) or viewBox (for SVG)
   */
  size?: number;
  
  /**
   * Margin around the QR code in modules
   */
  margin?: number;
  
  /**
   * Color of the QR code (dark modules)
   */
  color?: string;
  
  /**
   * Background color of the QR code (light modules)
   */
  backgroundColor?: string;
  
  /**
   * Add a logo to the center of the QR code
   */
  logo?: {
    /**
     * URL or base64 encoded image
     */
    image: string;
    
    /**
     * Size of the logo as a percentage of the QR code size (1-100)
     */
    size?: number;
  };
}

/**
 * QR Code generation result
 */
export interface QRCodeResult {
  /**
   * Generated QR code data
   * - For PNG: base64 encoded string
   * - For SVG: SVG string
   * - For terminal: ASCII string
   */
  data: string;
  
  /**
   * MIME type of the generated QR code
   */
  mimeType: string;
  
  /**
   * Format of the generated QR code
   */
  format: string;
  
  /**
   * Size of the generated QR code in pixels
   */
  size: number;
  
  /**
   * Original text or URL encoded in the QR code
   */
  content: string;
  
  /**
   * Timestamp when the QR code was generated
   */
  timestamp: number;
}

/**
 * Command line arguments
 */
export interface CommandLineArgs {
  text?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  format?: 'png' | 'svg' | 'base64' | 'terminal';
  size?: number;
  margin?: number;
  color?: string;
  backgroundColor?: string;
  logo?: string;
  logoSize?: number;
  output?: string;
}
