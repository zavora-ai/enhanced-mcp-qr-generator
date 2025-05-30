/**
 * MCP Server implementation for QR code generation
 */
interface MCPToolCall {
    parameters: Record<string, any>;
}
interface MCPToolResult {
    result?: any;
    error?: string;
}
interface MCPTool {
    name: string;
    description: string;
    inputSchema: any;
    handler: (toolCall: MCPToolCall) => Promise<MCPToolResult>;
}
import { ServerConfig } from '../config';
/**
 * MCP Server for QR code generation
 */
export declare class McpServer {
    private server;
    private config;
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
    /**
     * Get all registered tools
     * @returns List of tools
     */
    getTools(): MCPTool[];
}
export {};
