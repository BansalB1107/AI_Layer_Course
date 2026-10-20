
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs/promises";
import { z } from "zod";

// 1. Create the MCP server
const server = new McpServer({
  name: "OpsInventoryServer",
  version: "1.0.0",
});

// 2. Create our mock inventory data
const mockInventory = {
  "ITEM-001": {
    name: "Cloud Server Node",
    stock: 45,
    price: 120,
  },
  "ITEM-002": {
    name: "Database SSD 2TB",
    stock: 12,
    price: 250,
  },
  "ITEM-003": {
    name: "Network Switch 24-Port",
    stock: 8,
    price: 450,
  },
};

// 3. Register the inventory-checking tool
server.tool(
  "checkInventory",
  "Check live stock and price for a given product ID",
  {
    productId: z.string().describe("The product ID, e.g., ITEM-001"),
  },
  async ({ productId }) => {
    const item = mockInventory[productId];

    if (!item) {
      return {
        content: [
          {
            type: "text",
            text: `Product ID "${productId}" not found in inventory.`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Product: ${item.name} | Stock Available: ${item.stock} units | Price: $${item.price}`,
        },
      ],
    };
  }
);

// 4. Register the company-file reading tool
server.tool(
  "readCompanyFile",
  "Read contents of a local company text file or log",
  {
    fileName: z.string().describe("The path or name of the file to read"),
  },
  async ({ fileName }) => {
    try {
      const data = await fs.readFile(fileName, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: data,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to read file "${fileName}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 5. Start the MCP server
async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server fatal error:", error);
  process.exit(1);
});
