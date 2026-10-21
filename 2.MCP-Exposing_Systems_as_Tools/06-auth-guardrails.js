
import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// 1. Create the MCP server
const server = new McpServer({
  name: "OpsInventorySecureServer",
  version: "1.0.0",
});

// 2. Keep the existing inventory data
const mockInventory = {
  "ITEM-001": { name: "Cloud Server Node", stock: 45, price: 120 },
  "ITEM-002": { name: "Database SSD 2TB", stock: 12, price: 250 },
  "ITEM-003": { name: "Network Switch 24-Port", stock: 8, price: 450 },
};

// 3. Define the approved file directory
const COMPANY_FILES_DIR = path.resolve(process.cwd());

const allowedFiles = new Set([
  "company.txt",  //Permision to read
]);

// 4. Register the inventory tool with input validation
server.tool(
  "checkInventory",
  "Check stock and price for a product",
  {
    productId: z
      .string()
      .min(1)
      .max(20)
      .regex(/^ITEM-\d{3}$/, "Use a product ID like ITEM-001"),
  },
  async ({ productId }) => {
    const item = mockInventory[productId];

    if (!item) {
      return {
        content: [{ type: "text", text: "Product not found." }],
        isError: true,
      };
    }

    return {
      content: [{
        type: "text",
        text: `Product: ${item.name} | Stock: ${item.stock} | Price: $${item.price}`,
      }],
    };
  }
);

// 5. Register the secured file-reading tool
server.tool(
  "readCompanyFile",
  "Read an approved company text file",
  {
    fileName: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-zA-Z0-9_-]+\.txt$/, "Only plain text filenames are allowed"),
  },
  async ({ fileName }) => {
    // Check whether the requested file is explicitly approved
    if (!allowedFiles.has(fileName)) {
      return {
        content: [{
          type: "text",
          text: "Access denied: this file is not approved for reading.",
        }],
        isError: true,
      };
    }

    // Resolve the full path and verify it stays inside the approved directory
    const filePath = path.resolve(COMPANY_FILES_DIR, fileName);
    const relativePath = path.relative(COMPANY_FILES_DIR, filePath);

    if (
      relativePath.startsWith("..") ||
      path.isAbsolute(relativePath)
    ) {
      return {
        content: [{
          type: "text",
          text: "Access denied: file path is outside the approved directory.",
        }],
        isError: true,
      };
    }

    try {
      const data = await fs.readFile(filePath, "utf-8");

      return {
        content: [{ type: "text", text: data }],
      };
    } catch (error) {
      // Log the detailed error on the server side
      console.error("File read failed:", error.message);

      // Return a safer message to the caller
      return {
        content: [{
          type: "text",
          text: "Unable to read the approved company file.",
        }],
        isError: true,
      };
    }
  }
);

// 6. Start the secured MCP server
async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server fatal error:", error);
  process.exit(1);
});
