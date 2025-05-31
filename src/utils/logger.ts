/**
 * Logger utility for the Enhanced MCP QR Generator
 */

import * as fs from 'fs';
import * as path from 'path';
import { ServerConfig } from '../config';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Logger class
 */
export class Logger {
  private logFile: string;
  private enableConsole: boolean;
  private logLevel: LogLevel;

  /**
   * Create a new logger
   * @param config Server configuration
   * @param logFile Path to log file (default: server.log)
   */
  constructor(config: ServerConfig, logFile: string = 'server.log') {
    this.logFile = path.resolve(process.cwd(), logFile);
    this.enableConsole = config.enableLogging;
    this.logLevel = config.logLevel as LogLevel;
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Initialize log file with header
    const timestamp = new Date().toISOString();
    const header = `=== Enhanced MCP QR Generator Log Started at ${timestamp} ===\n`;
    fs.writeFileSync(this.logFile, header);
    
    this.info(`Logger initialized. Log level: ${this.logLevel}`);
  }

  /**
   * Format log message
   * @param level Log level
   * @param message Message to log
   * @returns Formatted log message
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Write log message to file and console
   * @param level Log level
   * @param message Message to log
   */
  private log(level: LogLevel, message: string): void {
    // Check if this log level should be logged
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex < currentLevelIndex) {
      return;
    }
    
    const formattedMessage = this.formatMessage(level, message);
    
    // Write to file
    fs.appendFileSync(this.logFile, formattedMessage + '\n');
    
    // Write to console if enabled
    if (this.enableConsole) {
      if (level === LogLevel.ERROR) {
        console.error(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  /**
   * Log debug message
   * @param message Message to log
   */
  public debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Log info message
   * @param message Message to log
   */
  public info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Log warning message
   * @param message Message to log
   */
  public warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  /**
   * Log error message
   * @param message Message to log
   */
  public error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  /**
   * Log HTTP request
   * @param method HTTP method
   * @param url URL
   * @param statusCode Status code
   * @param responseTime Response time in ms
   */
  public logRequest(method: string, url: any, statusCode: number, responseTime: number): void {
    const urlStr = url || '/';
    this.info(`${method} ${urlStr} ${statusCode} ${responseTime}ms`);
  }

  /**
   * Log JSON-RPC request
   * @param method JSON-RPC method
   * @param id Request ID
   * @param params Request parameters
   */
  public logRpcRequest(method: string, id: string | number, params: any): void {
    this.debug(`RPC Request [${id}]: ${method} ${JSON.stringify(params)}`);
  }

  /**
   * Log JSON-RPC response
   * @param id Request ID
   * @param result Response result
   * @param error Response error
   */
  public logRpcResponse(id: string | number, result?: any, error?: any): void {
    if (error) {
      this.error(`RPC Response [${id}]: Error ${JSON.stringify(error)}`);
    } else {
      this.debug(`RPC Response [${id}]: Success`);
    }
  }
}
