
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

import { google } from "@ai-sdk/google";
import { generateText, tool, stepCountIs } from "ai";
import readline from "readline/promises";
import { stdin, stdout } from "process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const client = new Client({
  name: "MultiRoundtripClient",
  version: "1.0.0",
});

const transport = new StdioClientTransport({
  command: "node",
  args: ["03-inventory-server.js"],
});

async function main() {
  try {
    await client.connect(transport);
    console.log("Connected to inventory MCP server.");

    const checkInventoryTool = tool({
      description: "Look up a product's stock and price.",
      inputSchema: z.object({
        productId: z.string().regex(/^ITEM-\d{3}$/),
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

    const calculateStockValueTool = tool({
      description:
        "Calculate the total value of a product's available stock using its unit price and stock count.",
      inputSchema: z.object({
        stock: z.number().nonnegative(),
        price: z.number().nonnegative(),
      }),
      execute: async ({ stock, price }) => {
        return {
          stock,
          price,
          totalValue: stock * price,
        };
      },
    });

    const user = await rl.question(
      "\nYou: Ask about a product and its stock value: "
    );

    const result = await generateText({
      model: google("gemini-3.1-flash-lite"),
      system: `You are an inventory assistant.
               Use checkInventoryTool to look up product details.
               If the user asks for stock value, use the stock and unit price
               from the inventory result to call calculateStockValueTool.
               Never invent inventory values. If you cannot extract the stock
               and price reliably, explain that you cannot calculate the value.`,
      prompt: user,
      tools: {
        checkInventoryTool,
        calculateStockValueTool,
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
