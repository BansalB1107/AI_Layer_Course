
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { google } from "@ai-sdk/google";
import { generateText, jsonSchema, stepCountIs } from "ai";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Find project folders
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const mcpFolder = path.resolve(
  projectRoot,
  "2.MCP-Exposing_Systems_as_Tools"
);

// Load API key from the root .env file
dotenv.config({ path: path.join(projectRoot, ".env") });

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const client = new Client({
  name: "dynamic-tool-discovery-client",
  version: "1.0.0",
});

const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(mcpFolder, "03-inventory-server.js")],
  cwd: mcpFolder,
});

try {
  // 1. Connect to the MCP server
  await client.connect(transport);

  console.log("Connected to MCP server.");

  // 2. Discover the available MCP tools
  const { tools: mcpTools } = await client.listTools();

    /*equivalent:
    const response = await client.listTools();
    const mcpTools = response.tools;
    */   

  console.log("\nDiscovered MCP tools:");

  for (const mcpTool of mcpTools) {
    console.log(`- ${mcpTool.name}: ${mcpTool.description ?? "No description"}`);
  }

  // 3. Convert discovered MCP tools into AI SDK tools
  const aiTools = {};

  for (const mcpTool of mcpTools) {
    aiTools[mcpTool.name] = {
      description: mcpTool.description ?? `Call ${mcpTool.name}`,
      inputSchema: jsonSchema(mcpTool.inputSchema),


    /*Explain:
        const aiTools = {
            checkInventory: {
                description: "...",
                inputSchema: "...",
                execute: async (args) => {
                    // Forward the call to the MCP server
            },
        },

        readCompanyFile: {
                description: "...",
                inputSchema: "...",
                execute: async (args) => {
                    // Forward the call to the MCP server
            },
        },
    };
    */

      execute: async (args) => {
        console.log(`\nCalling MCP tool: ${mcpTool.name}`);

        const result = await client.callTool({
          name: mcpTool.name,
          arguments: args,
        });

        if (result.isError) {
          throw new Error(
            result.content
              .filter((item) => item.type === "text")
              .map((item) => item.text)
              .join("\n") || "MCP tool failed"
          );
        }

        return result.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n");
      },
    };
  }

  // 4. Ask the user what they want to know
  const question = await rl.question("\nYou: ");

  // 5. Let the AI choose and call discovered tools
  const response = await generateText({
    model: google("gemini-3.1-flash-lite"),
    tools: aiTools,
    stopWhen: stepCountIs(5),
    prompt: question,
  });

  console.log("\nAssistant:", response.text);
} catch (error) {
  console.error("\nError:", error.message);
} finally {
  rl.close();
  await client.close().catch(() => {});
}
