#!/usr/bin/env node

/**
 * Enhanced MCP QR Generator
 * Main server implementation
 */

import { ServerConfig, parseCommandLineArgs, loadConfig } from './config';
import { McpServer } from './mcp/server';
import { version } from '../package.json';

/**
 * Initialize and start the MCP QR Generator
 */
export function startServer(config: ServerConfig) {
  // Log startup information
  console.error(
    `Enhanced MCP QR Generator v${version} starting...`
  );
  console.error(`Configuration:`);
  console.error(`  Default Error Correction Level: ${config.defaultErrorCorrectionLevel}`);
  console.error(`  Default Format: ${config.defaultFormat}`);
  console.error(`  Default Size: ${config.defaultSize}px`);
  console.error(`  Default Margin: ${config.defaultMargin}`);
  console.error(`  Default Colors: ${config.defaultColor} / ${config.defaultBackgroundColor}`);
  console.error(`  Max QR Code Size: ${config.maxQRCodeSize}px`);
  console.error(`  Max Logo Size: ${config.maxLogoSize} bytes`);

  // Create and start MCP server
  const server = new McpServer(config);
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });

  console.error(`Health check endpoint available at http://${config.host}:${config.port}/health`);

  // Handle process termination
  process.on('SIGINT', async () => {
    console.error('Received SIGINT. Shutting down...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM. Shutting down...');
    await server.stop();
    process.exit(0);
  });
}

// Export all tools and utilities
export * from './tools/generateQR';
export * from './types';

// When run directly, start the server
if (require.main === module) {
  // Parse command line arguments
  const args = parseCommandLineArgs(process.argv.slice(2));

  // Load configuration
  const config = loadConfig(args);

  // Start server
  startServer(config);
}
