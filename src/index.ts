#!/usr/bin/env -S npx tsx

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';

// For simplicity, define a partial Library schema based on the OpenAPI schema.
// You can expand this as needed.
const LibrarySchema = z.object({
  githubUrl: z.string(),
  examples: z.array(z.string()).optional(),
  ios: z.boolean().optional(),
  android: z.boolean().optional(),
  // Optional platforms – if not returned by the API, they will be undefined.
  web: z.boolean().optional(),
  expoGo: z.boolean().optional(),
  macos: z.boolean().optional(),
  tvos: z.boolean().optional(),
  fireos: z.boolean().optional(),
  newArchitecture: z.boolean().optional(),
  github: z.object({
    urls: z.object({
      repo: z.string(),
      clone: z.string(),
      homepage: z.string().nullable(),
    }),
    stats: z.object({
      hasIssues: z.boolean(),
      hasWiki: z.boolean(),
      hasSponsorships: z.boolean(),
      hasTopics: z.boolean(),
      updatedAt: z.string(),
      createdAt: z.string(),
      pushedAt: z.string(),
      forks: z.number(),
      issues: z.number(),
      subscribers: z.number(),
      stars: z.number(),
    }),
    name: z.string(),
    fullName: z.string(),
    isPrivate: z.boolean(),
    topics: z.array(z.string()).optional(),
    description: z.string().optional(),
    registry: z.string().optional(),
    // You may further refine license and lastRelease if needed.
    license: z.any().optional(),
    lastRelease: z.any().optional(),
    hasTypes: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),
  // Optional fields from the OpenAPI schema
  npmPkg: z.string().optional(),
  npm: z.any().optional(),
  score: z.number().optional(),
  matchingScoreModifiers: z.array(z.string()).optional(),
  popularity: z.number().optional(),
  topicSearchString: z.string().optional(),
});

// Define the overall response schema as per the OpenAPI "Data" schema.
const DataSchema = z.object({
  libraries: z.array(LibrarySchema),
  total: z.number(),
});

// Create the MCP server.
const server = new McpServer({
  name: 'React Native Directory',
  version: '1.0.0',
});

// Implement the "listPackages" tool.
server.tool(
  'listPackages',
  {
    search: z.string().optional(),
    offset: z.number().optional(),
    limit: z.number().optional(),
    android: z.boolean().optional(),
    ios: z.boolean().optional(),
    macos: z.boolean().optional(),
    tvos: z.boolean().optional(),
    visionos: z.boolean().optional(),
    web: z.boolean().optional(),
    windows: z.boolean().optional(),
    wasRecentlyUpdated: z.boolean().optional(),
    hasTypes: z.boolean().optional(),
    hasImage: z.boolean().optional(),
    hasExample: z.boolean().optional(),
    newArchitecture: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    isMaintained: z.boolean().optional(),
    expoGo: z.boolean().optional(),
    fireos: z.boolean().optional(),
    skipLibs: z.boolean().optional(),
    skipTools: z.boolean().optional(),
    skipTemplates: z.boolean().optional(),
    order: z.enum(['updated', 'relevance', 'added', 'quality', 'popularity', 'downloads', 'stars', 'issues']).optional(),
  },
  async (params) => {
    try {
      // Fetch data from the React Native Directory API using axios and validated query parameters.
      const response = await axios.get('https://reactnative.directory/api/libraries', {
        params,
      });
        // Validate the response data using zod
      const data = DataSchema.parse(response.data);
      // Return the data as a formatted text (or you can return the JSON object directly if preferred)
      return {
        content: [
          {
            text: JSON.stringify(data, null, 2),
            type: 'text',
          },
        ],
      };
    }
    catch (error: any) {
      return {
        content: [
          {
            text: `Error fetching data: ${error.message}`,
            type: 'text',
          },
        ],
      };
    }
  },
);

async function findPackage(uri: URL, packageName: string) {
  try {
    // Call the API with the package name as the search parameter.
    const response = await axios.get('https://reactnative.directory/api/libraries', {
      params: { search: packageName },
    });
    // Validate the response data
    const data = DataSchema.parse(response.data);
    // Look for an exact match in the library list. We assume that the GitHub name (github.name) should match.
    const library = data.libraries.find(lib => lib.npmPkg === packageName);
    if (!library) {
      return {
        contents: [{
          uri: uri.href,
          text: `Package '${packageName}' not found`,
        }],
      };
    }

    // Return the found library details.
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(library, null, 2),
      }],
    };
  }
  catch (error) {
    return {
      contents: [{
        uri: uri.href,
        text: `Error fetching package data: ${String(error)}`,
      }],
    };
  }
}

server.resource(
  'package',
  new ResourceTemplate(`package://{packageName}`, { list: undefined }),
  async (uri, { packageName }) => {
    const pkgName = (() => {
      const scope = String('');

      if (!scope) {
        return String(packageName);
      }

      return `${String(scope).startsWith('@') ? scope : `@${scope}`}/${packageName}`;
    })();

    return findPackage(uri, pkgName);
  },
);

// Start receiving messages on stdin and sending messages on stdout.
const transport = new StdioServerTransport();
server.connect(transport).catch((e) => {
  console.error(e);
});
