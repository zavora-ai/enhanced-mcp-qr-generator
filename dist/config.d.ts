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
    cacheTTL: number;
    rateLimiting: {
        enabled: boolean;
        maxRequests: number;
        timeWindow: number;
    };
    allowedDomains: string[] | null;
    disallowedDomains: string[];
    maxLogoSize: number;
}
/**
 * Default server configuration
 */
export declare const defaultConfig: ServerConfig;
/**
 * Parse command line arguments
 * @param args Command line arguments
 * @returns Parsed arguments
 */
export declare function parseCommandLineArgs(args: string[]): CommandLineArgs;
/**
 * Load configuration from environment variables or config file
 */
export declare function loadConfig(args?: CommandLineArgs): ServerConfig;
