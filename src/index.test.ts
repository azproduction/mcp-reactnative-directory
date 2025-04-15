import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { join } from 'node:path';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// The helper function to send a JSONRPC request and await its response.
async function runMCPRequest(message: JSONRPCMessage): Promise<JSONRPCMessage> {
  const transport = new StdioClientTransport({
    command: join(__dirname, 'index.ts'),
    args: [],
    env: {
      PATH: String(process.env.PATH),
    },
  });

  await transport.start();

  const result = new Promise<JSONRPCMessage>((resolve, reject) => {
    transport.onmessage = (message: JSONRPCMessage) => {
      transport.close();
      resolve(message);
    };
    transport.onerror = (error) => {
      transport.close();
      reject(error);
    };
  });

  await transport.send(message);
  return result;
}

describe('mCP Server Integration Tests', () => {
  it('listApplications returns tools', async () => {
    const response = await runMCPRequest({
      id: 1,
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
    });

    expect(response).toMatchSnapshot();
  });

  it('listPackages returns valid data with no filters', async () => {
    // Act: call the listPackages tool with no arguments.
    const response = await runMCPRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'listPackages',
        arguments: {},
      },
    });

    // Assert: snapshot the response.
    expect(response).toMatchSnapshot();
  });

  it('listPackages with search parameter returns filtered data', async () => {
    // Act: call listPackages with a search parameter.
    const response = await runMCPRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'listPackages',
        arguments: { search: 'skia' },
      },
    });

    // Assert: snapshot the filtered response.
    expect(response).toMatchSnapshot();
  });

  it('listPackages handles axios error gracefully', async () => {
    // Act: send a listPackages call.
    const response = await runMCPRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'listPackages',
        arguments: {},
      },
    });

    // Assert: snapshot the error response.
    expect(response).toMatchSnapshot();
  });

  it('invalid tool name returns error', async () => {
    // Act: send a request with an unregistered tool name.
    const response = await runMCPRequest({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'nonExistentTool',
        arguments: {},
      },
    });

    // Assert: snapshot the error response.
    expect(response).toMatchSnapshot();
  });

  it('listPackages with invalid parameter type returns validation error', async () => {
    // Act: call listPackages with invalid argument type (search should be a string).
    const response = await runMCPRequest({
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'listPackages',
        arguments: { search: true }, // incorrect type
      },
    });

    // Assert: snapshot the validation error response.
    expect(response).toMatchSnapshot();
  });
});
