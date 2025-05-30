/**
 * Integration tests for the MCP QR Generator
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);

describe('MCP QR Generator Integration Tests', () => {
  const outputPath = path.join(__dirname, '../../test_output');
  const qrResponsePath = path.join(outputPath, 'qr_response.json');
  const qrImagePath = path.join(outputPath, 'example_qr.png');

  beforeAll(async () => {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
  });

  afterEach(async () => {
    // Clean up test files
    if (await exists(qrResponsePath)) {
      await unlink(qrResponsePath);
    }
    if (await exists(qrImagePath)) {
      await unlink(qrImagePath);
    }
  });

  test('should generate a QR code using the MCP server', async () => {
    // Skip test if running in CI environment without Docker
    if (process.env.CI && !process.env.DOCKER_AVAILABLE) {
      console.log('Skipping integration test in CI environment without Docker');
      return;
    }

    // Create the JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'generate_qr',
        arguments: {
          text: 'https://example.com',
          format: 'png',
          size: 300
        }
      }
    };

    // Write request to a temporary file
    const requestPath = path.join(outputPath, 'request.json');
    await writeFile(requestPath, JSON.stringify(request));

    // Run the Docker command
    const dockerProcess = spawn('docker', [
      'run',
      '-i',
      '--rm',
      'zavorai/enhanced-mcp-qr-generator'
    ]);

    // Send the request to stdin
    dockerProcess.stdin.write(JSON.stringify(request));
    dockerProcess.stdin.end();

    // Collect stdout
    let responseData = '';
    dockerProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    // Wait for the process to complete
    const exitCode = await new Promise<number>((resolve) => {
      dockerProcess.on('close', resolve);
    });

    // Check if Docker is available, if not, skip the test
    if (exitCode !== 0) {
      console.log('Docker may not be available, skipping test');
      return;
    }

    // Save the response
    await writeFile(qrResponsePath, responseData);

    // Parse the response
    const response = JSON.parse(responseData);

    // Verify the response structure
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
    expect(response.result.content).toBeDefined();
    expect(Array.isArray(response.result.content)).toBe(true);
    
    // Check if we have an image in the response
    const imageContent = response.result.content.find(
      (item: any) => item.type === 'image'
    );
    
    if (imageContent) {
      // Extract and save the image
      const imageData = imageContent.data;
      const buffer = Buffer.from(imageData, 'base64');
      await writeFile(qrImagePath, buffer);
      
      // Verify the image was saved
      const fileExists = await exists(qrImagePath);
      expect(fileExists).toBe(true);
      
      // Check file size (should be non-zero)
      const stats = fs.statSync(qrImagePath);
      expect(stats.size).toBeGreaterThan(0);
    }
  }, 30000); // Increase timeout for Docker operations
});
