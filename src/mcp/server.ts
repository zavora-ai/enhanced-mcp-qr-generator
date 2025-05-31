/**
 * MCP Server implementation for QR code generation
 */

import { ServerConfig } from '../config';
import { generateQR, saveQRToFile } from '../tools/generateQR';
import * as os from 'os';
import * as path from 'path';
import * as http from 'http';
import { McpServer as ModelContextProtocolServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Logger } from '../utils/logger';

/**
 * MCP Server for QR code generation
 */
export class McpServer {
  private mcpServer: any;
  private config: ServerConfig;
  private httpServer: http.Server | null = null;
  private logger: Logger;

  /**
   * Create a new MCP Server
   * @param config Server configuration
   */
  constructor(config: ServerConfig) {
    this.config = config;
    this.mcpServer = new ModelContextProtocolServer({
      name: "Enhanced MCP QR Generator",
      version: "2.1.2"
    });
    
    // Initialize logger
    this.logger = new Logger(config);
    this.logger.info('MCP Server initializing');

    // Register tools
    this.registerTools();
  }

  /**
   * Register MCP tools
   */
  private registerTools() {
    this.logger.info('Registering MCP tools');
    
    // Generate QR code
    this.mcpServer.tool(
      'generate_qr',
      {
        text: z.string().min(1, "Text or URL is required"),
        errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).optional(),
        format: z.enum(['png', 'svg', 'base64', 'terminal']).optional(),
        size: z.number().min(10).max(this.config.maxQRCodeSize).optional(),
        margin: z.number().min(0).max(10).optional(),
        color: z.string().optional(),
        backgroundColor: z.string().optional(),
        logo: z.string().optional(),
        logoSize: z.number().min(1).max(100).optional()
      },
      async (params: any) => {
        try {
          const qrResult = await generateQR(
            params.text,
            {
              errorCorrectionLevel: params.errorCorrectionLevel,
              format: params.format,
              size: params.size,
              margin: params.margin,
              color: params.color,
              backgroundColor: params.backgroundColor,
              logo: params.logo ? { image: params.logo, size: params.logoSize } : undefined
            },
            this.config
          );
          
          this.logger.info(`Generated QR code for text: ${params.text.substring(0, 30)}${params.text.length > 30 ? '...' : ''}`);

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
            content,
            structuredContent: {
              format: qrResult.format,
              size: qrResult.size,
              content: qrResult.content,
              timestamp: qrResult.timestamp
            }
          };
        } catch (error) {
          this.logger.error(`Error generating QR code: ${(error as Error).message}`);
          console.error('Error generating QR code:', error);
          return {
            content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
            isError: true
          };
        }
      }
    );

    // Generate and save QR code
    this.mcpServer.tool(
      'save_qr',
      {
        text: z.string().min(1, "Text or URL is required"),
        outputPath: z.string().min(1, "Output path is required"),
        errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).optional(),
        format: z.enum(['png', 'svg', 'base64', 'terminal']).optional(),
        size: z.number().min(10).max(this.config.maxQRCodeSize).optional(),
        margin: z.number().min(0).max(10).optional(),
        color: z.string().optional(),
        backgroundColor: z.string().optional(),
        logo: z.string().optional(),
        logoSize: z.number().min(1).max(100).optional()
      },
      async (params: any) => {
        try {
          // Resolve output path
          let resolvedPath = params.outputPath;
          if (resolvedPath.startsWith('~')) {
            resolvedPath = path.join(os.homedir(), resolvedPath.slice(1));
          }

          // Generate QR code
          const qrResult = await generateQR(
            params.text,
            {
              errorCorrectionLevel: params.errorCorrectionLevel,
              format: params.format,
              size: params.size,
              margin: params.margin,
              color: params.color,
              backgroundColor: params.backgroundColor,
              logo: params.logo ? { image: params.logo, size: params.logoSize } : undefined
            },
            this.config
          );

          // Save to file
          const savedPath = await saveQRToFile(qrResult, resolvedPath);
          
          this.logger.info(`Saved QR code to ${savedPath}`);

          return {
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
          };
        } catch (error) {
          this.logger.error(`Error saving QR code: ${(error as Error).message}`);
          console.error('Error saving QR code:', error);
          return {
            content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
            isError: true
          };
        }
      }
    );

    // Add a resource for QR code documentation
    this.mcpServer.resource(
      'documentation',
      'qr-docs://guide',
      async (uri) => ({
        contents: [{
          uri: uri.href,
          text: `
# QR Code Generation Guide

This MCP server provides tools for generating QR codes from text or URLs.

## Tools

### generate_qr

Generates a QR code from text or URL.

Parameters:
- text: Text or URL to encode (required)
- errorCorrectionLevel: Error correction level (L, M, Q, H)
- format: Output format (png, svg, base64, terminal)
- size: Size in pixels
- margin: Margin around the QR code
- color: Color of the QR code
- backgroundColor: Background color
- logo: URL or base64 encoded image for logo
- logoSize: Size of logo as percentage of QR code

### save_qr

Generates a QR code and saves it to a file.

Parameters:
- text: Text or URL to encode (required)
- outputPath: Path to save the QR code (required)
- (All other parameters from generate_qr)

## Examples

1. Generate a simple QR code:
   \`\`\`
   generate_qr(text: "https://example.com")
   \`\`\`

2. Generate a customized QR code:
   \`\`\`
   generate_qr(
     text: "https://example.com",
     format: "svg",
     size: 500,
     errorCorrectionLevel: "H",
     color: "#0000ff"
   )
   \`\`\`

3. Save a QR code to file:
   \`\`\`
   save_qr(
     text: "https://example.com",
     outputPath: "~/qrcode.png"
   )
   \`\`\`
`
        }]
      })
    );
    
    this.logger.info('MCP tools registered successfully');
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    try {
      this.logger.info('Starting MCP server');
      
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
          this.logger.debug('Health check request');
          return;
        }

        if (req.method === 'POST') {
          const startTime = Date.now();
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              // Process the request using MCP server
              // This is a simplified implementation - in a production environment,
              // you would use the proper transport from the SDK
              const request = JSON.parse(body);
              
              this.logger.logRpcRequest(request.method, request.id, request.params);
              
              // Check if it's a valid JSON-RPC 2.0 request
              if (request.jsonrpc !== '2.0' || !request.method || request.id === undefined) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  jsonrpc: '2.0',
                  id: request.id || null,
                  error: {
                    code: -32600,
                    message: 'Invalid Request'
                  }
                }));
                
                this.logger.error('Invalid JSON-RPC request');
                this.logger.logRequest(req.method, req.url, 400, Date.now() - startTime);
                return;
              }

              // Handle tools/call method
              if (request.method === 'tools/call') {
                const { name, arguments: args } = request.params;
                
                this.logger.info(`Tool call: ${name}`);
                
                // Find the tool
                const tool = this.mcpServer.tools.find((t: any) => t.name === name);
                if (!tool) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                      code: -32601,
                      message: `Tool not found: ${name}`
                    }
                  }));
                  
                  this.logger.error(`Tool not found: ${name}`);
                  this.logger.logRpcResponse(request.id, undefined, {
                    code: -32601,
                    message: `Tool not found: ${name}`
                  });
                  this.logger.logRequest(req.method, req.url, 404, Date.now() - startTime);
                  return;
                }

                try {
                  // Call the tool
                  const result = await tool.handler(args);
                  
                  // Return the result
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id,
                    result: result
                  }));
                  
                  this.logger.logRpcResponse(request.id, result);
                  this.logger.logRequest(req.method, req.url, 200, Date.now() - startTime);
                } catch (error) {
                  this.logger.error(`Error executing tool ${name}: ${(error as Error).message}`);
                  
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                      code: -32000,
                      message: (error as Error).message
                    }
                  }));
                  
                  this.logger.logRpcResponse(request.id, undefined, {
                    code: -32000,
                    message: (error as Error).message
                  });
                  this.logger.logRequest(req.method, req.url, 500, Date.now() - startTime);
                }
                return;
              }

              // Handle tools/list method
              if (request.method === 'tools/list') {
                this.logger.info('Tools list request');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  jsonrpc: '2.0',
                  id: request.id,
                  result: {
                    tools: this.mcpServer.tools.map((tool: any) => ({
                      name: tool.name,
                      description: tool.description,
                      inputSchema: tool.paramSchema
                    }))
                  }
                }));
                
                this.logger.logRpcResponse(request.id, { toolCount: this.mcpServer.tools.length });
                this.logger.logRequest(req.method, req.url, 200, Date.now() - startTime);
                return;
              }

              // Handle resources/list method
              if (request.method === 'resources/list') {
                this.logger.info('Resources list request');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  jsonrpc: '2.0',
                  id: request.id,
                  result: {
                    resources: this.mcpServer.resources.map((resource: any) => ({
                      name: resource.name,
                      uriTemplate: resource.uriTemplate
                    }))
                  }
                }));
                
                this.logger.logRpcResponse(request.id, { resourceCount: this.mcpServer.resources.length });
                this.logger.logRequest(req.method, req.url, 200, Date.now() - startTime);
                return;
              }

              // Handle resources/read method
              if (request.method === 'resources/read') {
                const { uri } = request.params;
                
                this.logger.info(`Resource read: ${uri}`);
                
                // Find the resource
                const resource = this.mcpServer.resources.find((r: any) => 
                  uri.startsWith(r.uriTemplate.split('{')[0])
                );
                
                if (!resource) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                      code: -32601,
                      message: `Resource not found: ${uri}`
                    }
                  }));
                  
                  this.logger.error(`Resource not found: ${uri}`);
                  this.logger.logRpcResponse(request.id, undefined, {
                    code: -32601,
                    message: `Resource not found: ${uri}`
                  });
                  this.logger.logRequest(req.method, req.url, 404, Date.now() - startTime);
                  return;
                }

                try {
                  // Call the resource handler
                  const result = await resource.handler(new URL(uri), {});
                  
                  // Return the result
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id,
                    result: result
                  }));
                  
                  this.logger.logRpcResponse(request.id, result);
                  this.logger.logRequest(req.method, req.url, 200, Date.now() - startTime);
                } catch (error) {
                  this.logger.error(`Error reading resource ${uri}: ${(error as Error).message}`);
                  
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                      code: -32000,
                      message: (error as Error).message
                    }
                  }));
                  
                  this.logger.logRpcResponse(request.id, undefined, {
                    code: -32000,
                    message: (error as Error).message
                  });
                  this.logger.logRequest(req.method, req.url, 500, Date.now() - startTime);
                }
                return;
              }

              // Method not found
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                jsonrpc: '2.0',
                id: request.id,
                error: {
                  code: -32601,
                  message: `Method not found: ${request.method}`
                }
              }));
              
              this.logger.error(`Method not found: ${request.method}`);
              this.logger.logRpcResponse(request.id, undefined, {
                code: -32601,
                message: `Method not found: ${request.method}`
              });
              this.logger.logRequest(req.method, req.url, 404, Date.now() - startTime);
            } catch (error) {
              this.logger.error(`Error processing request: ${(error as Error).message}`);
              
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                jsonrpc: '2.0',
                id: null,
                error: {
                  code: -32700,
                  message: 'Parse error'
                }
              }));
              
              this.logger.logRequest(req.method, req.url, 500, Date.now() - startTime);
            }
          });
        } else {
          // Non-supported route/method
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32601,
              message: 'Not found'
            }
          }));
          
          this.logger.warn(`Unsupported method: ${req.method} ${req.url || '/'}`);
        }
      });

      // Start the HTTP server
      this.httpServer.listen(this.config.port, this.config.host, () => {
        this.logger.info(`MCP Server started on http://${this.config.host}:${this.config.port}`);
      }).on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          this.logger.error(`Error: Port ${this.config.port} is already in use.`);
          this.logger.error('Please choose a different port by setting the PORT environment variable.');
          process.exit(1);
        } else {
          this.logger.error(`Failed to start server: ${error.message}`);
          throw error;
        }
      });

      this.logger.info(`Health check endpoint available at http://${this.config.host}:${this.config.port}/health`);
    } catch (error) {
      this.logger.error(`Failed to start MCP server: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    try {
      this.logger.info('Stopping MCP server');
      
      // Close the HTTP server if it exists
      if (this.httpServer) {
        this.httpServer.close();
        this.httpServer = null;
        this.logger.info('HTTP server closed');
      }
      
      this.logger.info('MCP server stopped');
    } catch (error) {
      this.logger.error(`Failed to stop MCP server: ${(error as Error).message}`);
      throw error;
    }
  }
}
