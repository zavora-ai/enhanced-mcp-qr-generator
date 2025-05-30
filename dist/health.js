"use strict";
/**
 * Health check endpoint for the Enhanced MCP QR Generator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = void 0;
/**
 * Simple health check endpoint handler
 * @param _req - HTTP request
 * @param res - HTTP response
 */
function healthHandler(_req, res) {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthStatus));
}
exports.healthHandler = healthHandler;
//# sourceMappingURL=health.js.map