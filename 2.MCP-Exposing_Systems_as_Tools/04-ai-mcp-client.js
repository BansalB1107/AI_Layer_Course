
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

import { google } from "@ai-sdk/google";
import { generateText, tool, stepCountIs } from "ai";
import readline from "readline/promises";
import { stdin, stdout } from "process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

// 1. Create the terminal input
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

// 2. Create the MCP client
const client = new Client({
  name: "OpsMateAIClient",
  version: "1.0.0",
});

// 3. Connect the client to our inventory server
const transport = new StdioClientTransport({
  command: "node",
  args: ["03-inventory-server.js"],
});

async function main() {
  try {
    await client.connect(transport);

    console.log("Connected to the inventory MCP server.");

    // 4. Create an AI tool for checking inventory
    const checkInventoryTool = tool({
      description: "Check the stock and price of a product using its product ID.",

      inputSchema: z.object({
        productId: z.string().describe("Product ID, e.g. ITEM-001"),
      }),

      execute: async ({ productId }) => {
        const result = await client.callTool({
          name: "checkInventory",
          arguments: { productId },
        });

        return result.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n");
      },
    });

    // 5. Create an AI tool for reading company files
    const readCompanyFileTool = tool({
      description: "Read a company text file using the inventory MCP server.",

      inputSchema: z.object({
        fileName: z.string().describe("The name of the file, e.g. company-notes.txt"),
      }),

      execute: async ({ fileName }) => {
        const result = await client.callTool({
          name: "readCompanyFile",
          arguments: { fileName },
        });

        return result.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n");
      },
    });

    // 6. Get the user's request
    const user = await rl.question("\nYou: ");

    // 7. Let Gemini decide which tools to call
    const result = await generateText({
      model: google("gemini-3.1-flash-lite"),

      system: `You are a helpful inventory assistant.
               Use the available tools when the user asks about product stock,
               prices, or company files.
               Base your answers on tool results. Do not invent inventory data
               or company-file contents.`,

      prompt: user,

      tools: {
        checkInventoryTool,
        readCompanyFileTool,
      },

      stopWhen: stepCountIs(5),
    });

    console.log("\nAssistant:", result.text);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close().catch(() => {});
    rl.close();
  }
}

main();
