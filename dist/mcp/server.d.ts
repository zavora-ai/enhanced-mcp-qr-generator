/**
 * MCP Server implementation for QR code generation
 */
import { ServerConfig } from '../config';
/**
 * MCP Server for QR code generation
 */
export declare class McpServer {
    private server;
    private config;
    private httpServer;
    /**
     * Create a new MCP Server
     * @param config Server configuration
     */
    constructor(config: ServerConfig);
    /**
     * Register MCP tools
     */
    private registerTools;
    /**
     * Handle generate QR code tool call
     * @param toolCall Tool call
     * @returns Tool result
     */
    private handleGenerateQR;
    /**
     * Handle save QR code tool call
     * @param toolCall Tool call
     * @returns Tool result
     */
    private handleSaveQR;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
}
