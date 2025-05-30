/**
 * Health check endpoint for the Enhanced MCP QR Generator
 */
/// <reference types="node" />
import http from 'http';
/**
 * Simple health check endpoint handler
 * @param _req - HTTP request
 * @param res - HTTP response
 */
export declare function healthHandler(_req: http.IncomingMessage, res: http.ServerResponse): void;
