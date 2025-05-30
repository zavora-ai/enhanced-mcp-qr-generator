#!/usr/bin/env node
"use strict";
/**
 * Enhanced MCP QR Generator
 * Main server implementation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const config_1 = require("./config");
const server_1 = require("./mcp/server");
const http_1 = __importDefault(require("http"));
const health_1 = require("./health");
/**
 * Initialize and start the MCP QR Generator
 */
function startServer(config) {
    // Log startup information
    console.error(`Enhanced MCP QR Generator v${process.env.npm_package_version || '1.0.0'} starting...`);
    console.error(`Configuration:`);
    console.error(`  Default Error Correction Level: ${config.defaultErrorCorrectionLevel}`);
    console.error(`  Default Format: ${config.defaultFormat}`);
    console.error(`  Default Size: ${config.defaultSize}px`);
    console.error(`  Default Margin: ${config.defaultMargin}`);
    console.error(`  Default Colors: ${config.defaultColor} / ${config.defaultBackgroundColor}`);
    console.error(`  Max QR Code Size: ${config.maxQRCodeSize}px`);
    console.error(`  Max Logo Size: ${config.maxLogoSize} bytes`);
    // Create and start MCP server
    const server = new server_1.McpServer(config);
    server.start().catch(error => {
        console.error('Server failed to start:', error);
        process.exit(1);
    });
    // Create health check server
    const healthServer = http_1.default.createServer((req, res) => {
        if (req.url === '/health') {
            (0, health_1.healthHandler)(req, res);
        }
        else {
            res.writeHead(404);
            res.end('Not found');
        }
    });
    // Start health check server
    healthServer.listen(3000, () => {
        console.error('Health check endpoint available at http://localhost:3000/health');
    });
    // Handle process termination
    process.on('SIGINT', async () => {
        console.error('Received SIGINT. Shutting down...');
        await server.stop();
        healthServer.close();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.error('Received SIGTERM. Shutting down...');
        await server.stop();
        healthServer.close();
        process.exit(0);
    });
}
exports.startServer = startServer;
// Export all tools and utilities
__exportStar(require("./tools/generateQR"), exports);
__exportStar(require("./types"), exports);
// When run directly, start the server
if (require.main === module) {
    // Parse command line arguments
    const args = (0, config_1.parseCommandLineArgs)(process.argv.slice(2));
    // Load configuration
    const config = (0, config_1.loadConfig)(args);
    // Start server
    startServer(config);
}
//# sourceMappingURL=index.js.map