# React Native Directory MCP

JSONRPC-driven server that implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.org/) to interact with the [React Native Directory API](https://reactnative.directory/). This project allows clients to search, filter, and retrieve information on React Native libraries with ease.

## Features

- **MCP Server and Tools:**  
  Implements a JSONRPC server using standard I/O transports. The server exposes tools such as `listPackages` as well as a resource lookup for package details.

- **Flexible Filtering & Searching:**  
  Leverages various query parameters (e.g., `search`, platform flags, recency, and more) so you can filter libraries based on your needs.

- **Robust Validation and Error Handling:**  
  Uses the [Zod](https://github.com/colinhacks/zod) schema validator to enforce correct parameter types and API response structures. Invalid tool names or incorrect parameters trigger clear, JSONRPC-formatted error responses.

- **Integration Testing with Snapshots:**  
  Comprehensive Jest snapshot tests validate the responses of the MCP tools in various scenarios—from standard requests to error cases.

- **Extensible TypeScript Architecture:**  
  Built on TypeScript for clarity and scalability. The design makes it easy to add new tools or extend existing functionality.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- [npm](https://www.npmjs.com/) (or your favorite package manager)

## Installation

So far there is no npm package. Clone the repository and install the necessary dependencies:

```bash
git clone <repository-url>
cd mcp-reactnative-directory
npm install
```

## Usage

### MCP Config

```json
{
  "mcpServers": {
    "mcp-reactnative-directory": {
      "command": "/path/to/mcp-reactnative-directory/src/index.ts"
    }
  }
}

```

### Interacting with the Server

The project is designed to be used with the Model Context Protocol Inspector. To launch the inspector and interact with the server, run:

```bash
npx @modelcontextprotocol/inspector src/index.ts
```

This command opens an interactive console where you can send commands (e.g., calling the `listPackages` tool or requesting a specific package) and view the JSONRPC responses.

### Running Tests

To run all tests, execute:

```bash
npm test
```

## License

This project is licensed under the ISC License.

## Acknowledgments

- **React Native Directory:** For providing a comprehensive API to discover React Native libraries.
- **Model Context Protocol:** For inspiring the MCP-based approach to integrating and querying APIs.
- **Community Contributions:** Thanks to all developers and contributors for feedback and improvements.

## Contact

For any questions, bug reports, or feedback, please [open an issue](https://github.com/your-repo/issues) in the repository. You can also contact the maintainers directly via their GitHub profiles.
