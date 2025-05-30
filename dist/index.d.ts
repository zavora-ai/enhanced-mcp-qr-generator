#!/usr/bin/env node
/**
 * Enhanced MCP QR Generator
 * Main server implementation
 */
import { ServerConfig } from './config';
/**
 * Initialize and start the MCP QR Generator
 */
export declare function startServer(config: ServerConfig): void;
export * from './tools/generateQR';
export * from './types';
