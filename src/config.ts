/**
 * Configuration management for the Enhanced MCP QR Generator
 */

import { CommandLineArgs } from './types';

/**
 * Server configuration options
 */
export interface ServerConfig {
  port: number;
  host: string;
  maxConcurrentRequests: number;
  defaultErrorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  defaultFormat: 'png' | 'svg' | 'base64' | 'terminal';
  defaultSize: number;
  defaultMargin: number;
  defaultColor: string;
  defaultBackgroundColor: string;
  maxQRCodeSize: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  cacheEnabled: boolean;
  cacheTTL: number; // in seconds
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    timeWindow: number; // in seconds
  };
  allowedDomains: string[] | null; // null means all domains allowed for logos
  disallowedDomains: string[];
  maxLogoSize: number; // in bytes
}

/**
 * Default server configuration
 * 
 * NOTE: These are the default values that can be overridden by environment variables.
 * The port value (DEFAULT_PORT) is the single source of truth for the application.
 */
// Define constants for default values to ensure consistency
export const DEFAULT_PORT = 9999;
export const DEFAULT_HOST = 'localhost';

export const defaultConfig: ServerConfig = {
  port: DEFAULT_PORT,
  host: DEFAULT_HOST,
  maxConcurrentRequests: 10,
  defaultErrorCorrectionLevel: 'M',
  defaultFormat: 'png',
  defaultSize: 300,
  defaultMargin: 4,
  defaultColor: '#000000',
  defaultBackgroundColor: '#ffffff',
  maxQRCodeSize: 1000,
  enableLogging: true,
  logLevel: 'info',
  cacheEnabled: true,
  cacheTTL: 3600, // 1 hour
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    timeWindow: 60 // 1 minute
  },
  allowedDomains: null,
  disallowedDomains: [],
  maxLogoSize: 1024 * 1024 // 1MB
};

/**
 * Parse command line arguments
 * @param args Command line arguments
 * @returns Parsed arguments
 */
export function parseCommandLineArgs(args: string[]): CommandLineArgs {
  const result: CommandLineArgs = {};

  result.text = getArgValue(args, '--text');
  result.errorCorrectionLevel = getArgValue(args, '--error-correction-level') as
    | 'L'
    | 'M'
    | 'Q'
    | 'H';
  result.format = getArgValue(args, '--format') as 'png' | 'svg' | 'base64' | 'terminal';
  result.size = parseInt(getArgValue(args, '--size') || '0');
  result.margin = parseInt(getArgValue(args, '--margin') || '0');
  result.color = getArgValue(args, '--color');
  result.backgroundColor = getArgValue(args, '--background-color');
  result.logo = getArgValue(args, '--logo');
  result.logoSize = parseInt(getArgValue(args, '--logo-size') || '0');
  result.output = getArgValue(args, '--output');

  return result;
}

/**
 * Get argument value from command line
 * @param args Command line arguments
 * @param argName Argument name
 * @returns Argument value or undefined
 */
function getArgValue(args: string[], argName: string): string | undefined {
  const index = args.findIndex(arg => arg.startsWith(argName));
  if (index === -1) return undefined;

  const arg = args[index];
  if (arg.includes('=')) {
    return arg.split('=')[1];
  }
  return args[index + 1];
}

/**
 * Validates port number to ensure it's within valid range
 * @param port Port number to validate
 * @returns Valid port number or throws error
 */
function validatePort(port: number): number {
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${port}. Port must be between 1 and 65535.`);
  }
  return port;
}

/**
 * Load configuration from environment variables or config file
 */
export function loadConfig(args?: CommandLineArgs): ServerConfig {
  // Start with default config
  const config = { ...defaultConfig };

  // Override with environment variables if present
  if (process.env.PORT) {
    try {
      config.port = validatePort(parseInt(process.env.PORT, 10));
    } catch (err) {
      const error = err as Error;
      console.error(`Error: ${error.message}`);
      console.error(`Using default port ${DEFAULT_PORT} instead.`);
    }
  }
  
  if (process.env.HOST) config.host = process.env.HOST;
  if (process.env.MAX_CONCURRENT_REQUESTS)
    config.maxConcurrentRequests = parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10);
  if (process.env.DEFAULT_ERROR_CORRECTION_LEVEL)
    config.defaultErrorCorrectionLevel = process.env.DEFAULT_ERROR_CORRECTION_LEVEL as
      | 'L'
      | 'M'
      | 'Q'
      | 'H';
  if (process.env.DEFAULT_FORMAT)
    config.defaultFormat = process.env.DEFAULT_FORMAT as 'png' | 'svg' | 'base64' | 'terminal';
  if (process.env.DEFAULT_SIZE) config.defaultSize = parseInt(process.env.DEFAULT_SIZE, 10);
  if (process.env.DEFAULT_MARGIN) config.defaultMargin = parseInt(process.env.DEFAULT_MARGIN, 10);
  if (process.env.DEFAULT_COLOR) config.defaultColor = process.env.DEFAULT_COLOR;
  if (process.env.DEFAULT_BACKGROUND_COLOR)
    config.defaultBackgroundColor = process.env.DEFAULT_BACKGROUND_COLOR;
  if (process.env.MAX_QR_CODE_SIZE)
    config.maxQRCodeSize = parseInt(process.env.MAX_QR_CODE_SIZE, 10);
  if (process.env.ENABLE_LOGGING) config.enableLogging = process.env.ENABLE_LOGGING === 'true';
  if (process.env.LOG_LEVEL)
    config.logLevel = process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error';
  if (process.env.CACHE_ENABLED) config.cacheEnabled = process.env.CACHE_ENABLED === 'true';
  if (process.env.CACHE_TTL) config.cacheTTL = parseInt(process.env.CACHE_TTL, 10);
  if (process.env.ALLOWED_DOMAINS) config.allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
  if (process.env.DISALLOWED_DOMAINS)
    config.disallowedDomains = process.env.DISALLOWED_DOMAINS.split(',');
  if (process.env.MAX_LOGO_SIZE) config.maxLogoSize = parseInt(process.env.MAX_LOGO_SIZE, 10);

  // Override with command line args if present
  if (args) {
    if (args.errorCorrectionLevel) config.defaultErrorCorrectionLevel = args.errorCorrectionLevel;
    if (args.format) config.defaultFormat = args.format;
    if (args.size) config.defaultSize = args.size;
    if (args.margin) config.defaultMargin = args.margin;
    if (args.color) config.defaultColor = args.color;
    if (args.backgroundColor) config.defaultBackgroundColor = args.backgroundColor;
  }

  return config;
}
