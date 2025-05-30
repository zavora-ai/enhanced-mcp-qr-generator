/**
 * QR Code generation tool
 */
import { QRCodeOptions, QRCodeResult } from '../types';
import { ServerConfig } from '../config';
/**
 * Generate a QR code from text or URL
 * @param text Text or URL to encode in the QR code
 * @param options QR code generation options
 * @param config Server configuration
 * @returns Generated QR code result
 */
export declare function generateQR(text: string, options?: QRCodeOptions, config?: ServerConfig): Promise<QRCodeResult>;
/**
 * Save a QR code to a file
 * @param qrResult QR code result
 * @param outputPath Output file path
 * @returns Path to saved file
 */
export declare function saveQRToFile(qrResult: QRCodeResult, outputPath: string): Promise<string>;
/**
 * Generate a QR code and save it to a file
 * @param text Text or URL to encode
 * @param outputPath Output file path
 * @param options QR code options
 * @param config Server configuration
 * @returns Path to saved file
 */
export declare function generateAndSaveQR(text: string, outputPath: string, options?: QRCodeOptions, config?: ServerConfig): Promise<string>;
/**
 * Generate a QR code with a unique filename
 * @param text Text or URL to encode
 * @param directory Output directory
 * @param options QR code options
 * @param config Server configuration
 * @returns Path to saved file
 */
export declare function generateQRWithUniqueFilename(text: string, directory: string, options?: QRCodeOptions, config?: ServerConfig): Promise<string>;
