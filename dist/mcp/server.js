"use strict";
/**
 * MCP Server implementation for QR code generation
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServer = void 0;
class MCPServer {
    constructor() {
        this.tools = [];
    }
    registerTool(tool) {
        this.tools.push(tool);
    }
    async start() {
        // Mock implementation
        console.error('MCP Server started');
    }
    async stop() {
        // Mock implementation
        console.error('MCP Server stopped');
    }
    getTools() {
        return this.tools;
    }
    async handleRequest(requestBody) {
        try {
            const request = JSON.parse(requestBody);
            // Check if it's a valid JSON-RPC 2.0 request
            if (request.jsonrpc !== '2.0' || !request.method || request.id === undefined) {
                return JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id || null,
                    error: {
                        code: -32600,
                        message: 'Invalid Request'
                    }
                });
            }
            // Handle tools/call method
            if (request.method === 'tools/call') {
                const { name, arguments: args } = request.params;
                // Find the tool
                const tool = this.tools.find(t => t.name === name);
                if (!tool) {
                    return JSON.stringify({
                        jsonrpc: '2.0',
                        id: request.id,
                        error: {
                            code: -32601,
                            message: `Tool not found: ${name}`
                        }
                    });
                }
                // Call the tool
                const result = await tool.handler({ parameters: args });
                // Return the result
                if (result.error) {
                    return JSON.stringify({
                        jsonrpc: '2.0',
                        id: request.id,
                        error: {
                            code: -32000,
                            message: result.error
                        }
                    });
                }
                else {
                    return JSON.stringify({
                        jsonrpc: '2.0',
                        id: request.id,
                        result: result.result
                    });
                }
            }
            // Handle tools/list method
            if (request.method === 'tools/list') {
                return JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id,
                    result: {
                        tools: this.tools.map(tool => ({
                            name: tool.name,
                            description: tool.description,
                            inputSchema: tool.inputSchema
                        }))
                    }
                });
            }
            // Method not found
            return JSON.stringify({
                jsonrpc: '2.0',
                id: request.id,
                error: {
                    code: -32601,
                    message: `Method not found: ${request.method}`
                }
            });
        }
        catch (error) {
            return JSON.stringify({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: -32700,
                    message: 'Parse error'
                }
            });
        }
    }
}
const generateQR_1 = require("../tools/generateQR");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const http = __importStar(require("http"));
/**
 * MCP Server for QR code generation
 */
class McpServer {
    /**
     * Create a new MCP Server
     * @param config Server configuration
     */
    constructor(config) {
        this.httpServer = null;
        this.config = config;
        this.server = new MCPServer();
        // Register tools
        this.registerTools();
    }
    /**
     * Register MCP tools
     */
    registerTools() {
        // Generate QR code
        this.server.registerTool({
            name: 'generate_qr',
            description: 'Generate a QR code from text or URL',
            inputSchema: {
                type: 'object',
                properties: {
                    text: {
                        type: 'string',
                        description: 'Text or URL to encode in the QR code'
                    },
                    errorCorrectionLevel: {
                        type: 'string',
                        enum: ['L', 'M', 'Q', 'H'],
                        description: 'Error correction level (L: 7%, M: 15%, Q: 25%, H: 30%)'
                    },
                    format: {
                        type: 'string',
                        enum: ['png', 'svg', 'base64', 'terminal'],
                        description: 'Output format'
                    },
                    size: {
                        type: 'number',
                        description: 'Size of QR code in pixels (for PNG) or viewBox (for SVG)'
                    },
                    margin: {
                        type: 'number',
                        description: 'Margin around the QR code in modules'
                    },
                    color: {
                        type: 'string',
                        description: 'Color of the QR code (dark modules)'
                    },
                    backgroundColor: {
                        type: 'string',
                        description: 'Background color of the QR code (light modules)'
                    },
                    logo: {
                        type: 'string',
                        description: 'URL or base64 encoded image to add as logo in the center of the QR code'
                    },
                    logoSize: {
                        type: 'number',
                        description: 'Size of the logo as a percentage of the QR code size (1-100)'
                    }
                },
                required: ['text']
            },
            handler: this.handleGenerateQR.bind(this)
        });
        // Generate and save QR code
        this.server.registerTool({
            name: 'save_qr',
            description: 'Generate a QR code and save it to a file',
            inputSchema: {
                type: 'object',
                properties: {
                    text: {
                        type: 'string',
                        description: 'Text or URL to encode in the QR code'
                    },
                    outputPath: {
                        type: 'string',
                        description: 'Path where the QR code will be saved'
                    },
                    errorCorrectionLevel: {
                        type: 'string',
                        enum: ['L', 'M', 'Q', 'H'],
                        description: 'Error correction level (L: 7%, M: 15%, Q: 25%, H: 30%)'
                    },
                    format: {
                        type: 'string',
                        enum: ['png', 'svg', 'base64', 'terminal'],
                        description: 'Output format'
                    },
                    size: {
                        type: 'number',
                        description: 'Size of QR code in pixels (for PNG) or viewBox (for SVG)'
                    },
                    margin: {
                        type: 'number',
                        description: 'Margin around the QR code in modules'
                    },
                    color: {
                        type: 'string',
                        description: 'Color of the QR code (dark modules)'
                    },
                    backgroundColor: {
                        type: 'string',
                        description: 'Background color of the QR code (light modules)'
                    },
                    logo: {
                        type: 'string',
                        description: 'URL or base64 encoded image to add as logo in the center of the QR code'
                    },
                    logoSize: {
                        type: 'number',
                        description: 'Size of the logo as a percentage of the QR code size (1-100)'
                    }
                },
                required: ['text', 'outputPath']
            },
            handler: this.handleSaveQR.bind(this)
        });
    }
    /**
     * Handle generate QR code tool call
     * @param toolCall Tool call
     * @returns Tool result
     */
    async handleGenerateQR(toolCall) {
        try {
            const { text, errorCorrectionLevel, format, size, margin, color, backgroundColor, logo, logoSize } = toolCall.parameters;
            // Generate QR code
            const qrResult = await (0, generateQR_1.generateQR)(text, {
                errorCorrectionLevel,
                format,
                size,
                margin,
                color,
                backgroundColor,
                logo: logo ? { image: logo, size: logoSize } : undefined
            }, this.config);
            // Format the result based on the QR code format
            let content = [];
            if (qrResult.format === 'terminal' || qrResult.format === 'base64') {
                // For terminal or base64 format, return as text
                content = [
                    {
                        type: 'text',
                        text: qrResult.data
                    }
                ];
            }
            else {
                // For PNG or SVG, return as image with proper MIME type
                content = [
                    {
                        type: 'image',
                        data: qrResult.data.replace(/^data:image\/[^;]+;base64,/, ''),
                        mimeType: qrResult.mimeType
                    }
                ];
            }
            // Return the result
            return {
                result: {
                    content,
                    structuredContent: {
                        format: qrResult.format,
                        size: qrResult.size,
                        content: qrResult.content,
                        timestamp: qrResult.timestamp
                    }
                }
            };
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            return {
                error: error.message
            };
        }
    }
    /**
     * Handle save QR code tool call
     * @param toolCall Tool call
     * @returns Tool result
     */
    async handleSaveQR(toolCall) {
        try {
            const { text, outputPath, errorCorrectionLevel, format, size, margin, color, backgroundColor, logo, logoSize } = toolCall.parameters;
            // Resolve output path
            let resolvedPath = outputPath;
            if (outputPath.startsWith('~')) {
                resolvedPath = path.join(os.homedir(), outputPath.slice(1));
            }
            // Generate QR code
            const qrResult = await (0, generateQR_1.generateQR)(text, {
                errorCorrectionLevel,
                format,
                size,
                margin,
                color,
                backgroundColor,
                logo: logo ? { image: logo, size: logoSize } : undefined
            }, this.config);
            // Save to file
            const savedPath = await (0, generateQR_1.saveQRToFile)(qrResult, resolvedPath);
            return {
                result: {
                    content: [
                        {
                            type: 'text',
                            text: `QR code saved to ${savedPath}`
                        }
                    ],
                    structuredContent: {
                        path: savedPath,
                        format: qrResult.format,
                        size: qrResult.size
                    }
                }
            };
        }
        catch (error) {
            return {
                error: error.message
            };
        }
    }
    /**
     * Start the MCP server
     */
    async start() {
        try {
            // Create HTTP server to handle requests
            this.httpServer = http.createServer(async (req, res) => {
                if (req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', async () => {
                        try {
                            // Process the request using MCP server
                            const response = await this.server.handleRequest(body);
                            // Send the response
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(response);
                        }
                        catch (error) {
                            console.error('Error processing request:', error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                jsonrpc: '2.0',
                                id: null,
                                error: {
                                    code: -32603,
                                    message: 'Internal server error'
                                }
                            }));
                        }
                    });
                }
                else {
                    res.writeHead(405, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        jsonrpc: '2.0',
                        id: null,
                        error: {
                            code: -32600,
                            message: 'Method not allowed'
                        }
                    }));
                }
            });
            // Start the HTTP server
            this.httpServer.listen(this.config.port, this.config.host, () => {
                console.error(`MCP Server started on http://${this.config.host}:${this.config.port}`);
            });
            // Start the MCP server
            await this.server.start();
        }
        catch (error) {
            console.error('Failed to start MCP server:', error);
            throw error;
        }
    }
    /**
     * Stop the MCP server
     */
    async stop() {
        try {
            // Stop the MCP server
            await this.server.stop();
            // Close the HTTP server if it exists
            if (this.httpServer) {
                this.httpServer.close();
                this.httpServer = null;
            }
        }
        catch (error) {
            console.error('Failed to stop MCP server:', error);
            throw error;
        }
    }
}
exports.McpServer = McpServer;
//# sourceMappingURL=server.js.map