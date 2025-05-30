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
}
const generateQR_1 = require("../tools/generateQR");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
/**
 * MCP Server for QR code generation
 */
class McpServer {
    /**
     * Create a new MCP Server
     * @param config Server configuration
     */
    constructor(config) {
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
            return {
                result: qrResult
            };
        }
        catch (error) {
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
                    path: savedPath,
                    format: qrResult.format,
                    size: qrResult.size
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
        await this.server.start();
        console.error(`Enhanced MCP QR Generator started`);
    }
    /**
     * Stop the MCP server
     */
    async stop() {
        await this.server.stop();
        console.error('Enhanced MCP QR Generator stopped');
    }
    /**
     * Get all registered tools
     * @returns List of tools
     */
    getTools() {
        return this.server.getTools();
    }
}
exports.McpServer = McpServer;
//# sourceMappingURL=server.js.map