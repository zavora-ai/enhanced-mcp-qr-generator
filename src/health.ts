/**
 * Health check endpoint for the Enhanced MCP QR Generator
 */

import http from 'http';
import { version } from '../package.json';

/**
 * Simple health check endpoint handler
 * @param _req - HTTP request
 * @param res - HTTP response
 */
export function healthHandler(_req: http.IncomingMessage, res: http.ServerResponse): void {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: version,
    uptime: process.uptime()
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(healthStatus));
}
