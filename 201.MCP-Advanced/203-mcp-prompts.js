
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// SERVER: expose a reusable prompt
async function startServer() {
  const server = new McpServer({
    name: "CompanyPromptsServer",
    version: "1.0.0",
  });

  server.prompt(
    "inventory-report",
    "Generate a clear inventory report from supplied data.",
    {
      department: z.string().describe("Department name"),
      inventoryData: z.string().describe("Inventory data to analyze"),
    },
    ({ department, inventoryData }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Prepare an inventory report for the ${department} department.

                   Use only the following inventory data:
                   ${inventoryData}

                   Include the available products, stock levels, and important observations.
                   Do not invent missing information.`,
          },
        },
      ],
    })
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// CLIENT: discover and retrieve the prompt
async function startClient() {
  const client = new Client({
    name: "CompanyPromptsClient",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(import.meta.url), "server"],
  });

  try {
    await client.connect(transport);

    console.log("Connected to the MCP prompt server.");

    const prompts = await client.listPrompts();

    console.log("\nAvailable prompts:");
    console.log(prompts.prompts);

    const result = await client.getPrompt({
      name: "inventory-report",
      arguments: {
        department: "AI Engineering",
        inventoryData: `
            Cloud Server Node: 45 units
            Database SSD 2TB: 12 units
            Network Switch 24-Port: 8 units
        `,
      },
    });

    console.log("\nRetrieved prompt messages:");

    for (const message of result.messages) {
      if (message.content.type === "text") {
        console.log(message.content.text);
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
