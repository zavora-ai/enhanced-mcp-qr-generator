/**
 * MCP Server implementation for QR code generation
 */

// Mock MCP SDK for development
// In a real implementation, this would be imported from '@modelcontextprotocol/sdk'
interface MCPToolCall {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>;
}

interface MCPToolResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
  error?: string;
}

interface MCPTool {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: any;
  handler: (toolCall: MCPToolCall) => Promise<MCPToolResult>;
}

class MCPServer {
  private tools: MCPTool[] = [];

  registerTool(tool: MCPTool): void {
    this.tools.push(tool);
  }

  async start(): Promise<void> {
    // Mock implementation
    console.error('MCP Server started');
  }

  async stop(): Promise<void> {
    // Mock implementation
    console.error('MCP Server stopped');
  }

  getTools(): MCPTool[] {
    return this.tools;
  }

  async handleRequest(requestBody: string): Promise<string> {
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
        } else {
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
    } catch (error) {
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

import { ServerConfig } from '../config';
import { generateQR, saveQRToFile } from '../tools/generateQR';
import * as os from 'os';
import * as path from 'path';
import * as http from 'http';

/**
 * MCP Server for QR code generation
 */
export class McpServer {
  private server: MCPServer;
  private config: ServerConfig;
  private httpServer: http.Server | null = null;

  /**
   * Create a new MCP Server
   * @param config Server configuration
   */
  constructor(config: ServerConfig) {
    this.config = config;
    this.server = new MCPServer();

    // Register tools
    this.registerTools();
  }

  /**
   * Register MCP tools
   */
  private registerTools() {
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
  private async handleGenerateQR(toolCall: MCPToolCall): Promise<MCPToolResult> {
    try {
      const {
        text,
        errorCorrectionLevel,
        format,
        size,
        margin,
        color,
        backgroundColor,
        logo,
        logoSize
      } = toolCall.parameters;

      // Generate QR code
      const qrResult = await generateQR(
        text,
        {
          errorCorrectionLevel,
          format,
          size,
          margin,
          color,
          backgroundColor,
          logo: logo ? { image: logo, size: logoSize } : undefined
        },
        this.config
      );

      // Format the result based on the QR code format
      let content: Array<{ type: string; text?: string; data?: string; mimeType?: string }> = [];

      if (qrResult.format === 'terminal' || qrResult.format === 'base64') {
        // For terminal or base64 format, return as text
        content = [
          {
            type: 'text',
            text: qrResult.data
          }
        ];
      } else {
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
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        error: (error as Error).message
      };
    }
  }

  /**
   * Handle save QR code tool call
   * @param toolCall Tool call
   * @returns Tool result
   */
  private async handleSaveQR(toolCall: MCPToolCall): Promise<MCPToolResult> {
    try {
      const {
        text,
        outputPath,
        errorCorrectionLevel,
        format,
        size,
        margin,
        color,
        backgroundColor,
        logo,
        logoSize
      } = toolCall.parameters;

      // Resolve output path
      let resolvedPath = outputPath;
      if (outputPath.startsWith('~')) {
        resolvedPath = path.join(os.homedir(), outputPath.slice(1));
      }

      // Generate QR code
      const qrResult = await generateQR(
        text,
        {
          errorCorrectionLevel,
          format,
          size,
          margin,
          color,
          backgroundColor,
          logo: logo ? { image: logo, size: logoSize } : undefined
        },
        this.config
      );

      // Save to file
      const savedPath = await saveQRToFile(qrResult, resolvedPath);

      return {
        result: {
          content: [
            {
              type: 'text',
              text: `QR code saved to ${savedPath}`
            }
          ] as Array<{ type: string; text: string }>,
          structuredContent: {
            path: savedPath,
            format: qrResult.format,
            size: qrResult.size
          }
        }
      };
    } catch (error) {
      return {
        error: (error as Error).message
      };
    }
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    try {
      // Create HTTP server to handle requests
      this.httpServer = http.createServer(async (req, res) => {
        // --------------------------------------------------
        // 1. JSON-RPC tool calls (POST)
        // 2. Lightweight health probe (GET /health)
        //    Any other request → 405/404
        // --------------------------------------------------

        if (req.method === 'GET' && req.url === '/health') {
          // Re-use shared health handler so behaviour matches pre-existing
          // stand-alone health server.
          const { healthHandler } = await import('../health');
          healthHandler(req, res);
          return;
        }

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
            } catch (error) {
              console.error('Error processing request:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  jsonrpc: '2.0',
                  id: null,
                  error: {
                    code: -32603,
                    message: 'Internal server error'
                  }
                })
              );
            }
          });
        } else {
          // Non-supported route/method
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32601,
                message: 'Not found'
              }
            })
          );
        }
      });

      // Start the HTTP server
      this.httpServer.listen(this.config.port, this.config.host, () => {
        console.error(`MCP Server started on http://${this.config.host}:${this.config.port}`);
      });

      // Start the MCP server
      await this.server.start();
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    try {
      // Stop the MCP server
      await this.server.stop();

      // Close the HTTP server if it exists
      if (this.httpServer) {
        this.httpServer.close();
        this.httpServer = null;
      }
    } catch (error) {
      console.error('Failed to stop MCP server:', error);
      throw error;
    }
  }
}
