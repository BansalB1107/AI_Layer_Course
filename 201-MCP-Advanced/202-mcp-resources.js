
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";

// SERVER: expose company information as a resource
async function startServer() {
  const server = new McpServer({
    name: "CompanyResourcesServer",
    version: "1.0.0",
  });

  server.resource(
    "company-info",
    "company://info",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: `Company: TechNova
          Department: AI Engineering
          Team: AI Agents and MCP
          Project: Inventory Management`,
        },
      ],
    })
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// CLIENT: discover and read the resource
async function startClient() {
  const client = new Client({
    name: "CompanyResourcesClient",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(import.meta.url), "server"],
  });

  try {
    await client.connect(transport);

    console.log("Connected to the MCP resource server.");

    const resources = await client.listResources();

    console.log("\nAvailable resources:");
    console.log(resources.resources);

    const result = await client.readResource({
      uri: "company://info",
    });

    console.log("\nResource contents:");

    for (const item of result.contents) {
      if ("text" in item) {
        console.log(item.text);
      }
    }
  } finally {
    await client.close();
  }
}

if (process.argv[2] === "server") {
  await startServer();
} else {
  await startClient();
}
