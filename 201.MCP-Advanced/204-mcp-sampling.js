
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CreateMessageRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });

// SERVER: request an AI completion through MCP sampling
async function startServer() {
  const server = new McpServer({
    name: "SamplingServer",
    version: "1.0.0",
  });

  server.tool(
    "summarize",
    "Summarize text using the connected client's AI model.",
    {
      text: z.string().describe("Text to summarize"),
    },
    async ({ text }) => {
      const response = await server.server.createMessage({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Summarize this text clearly and briefly:\n\n${text}`,
            },
          },
        ],
        maxTokens: 200,
      });

      const summary =
        response.content.type === "text"
          ? response.content.text
          : "The model did not return text.";

      return {
        content: [
          {
            type: "text",
            text: summary,
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// CLIENT: handle sampling requests and call Gemini
async function startClient() {
  const client = new Client(
    {
      name: "SamplingClient",
      version: "1.0.0",
    },
    {
      capabilities: {
        sampling: {},
      },
    }
  );

  client.setRequestHandler(
    CreateMessageRequestSchema,
    async (request) => {
      console.log("\nSampling request received by client.");

      const prompt = request.params.messages
        .map((message) => {
          const content = message.content;

          return content.type === "text"
            ? content.text
            : "[Non-text content omitted]";
        })
        .join("\n");

      const result = await generateText({
        model: google("gemini-3.1-flash-lite"),
        prompt,
      });

      return {
        role: "assistant",
        content: {
          type: "text",
          text: result.text,
        },
        model: "gemini-3.1-flash-lite",
        stopReason: "endTurn",
      };
    }
  );

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(import.meta.url), "server"],
  });

  try {
    await client.connect(transport);

    console.log("Connected to the sampling MCP server.");

    const result = await client.callTool({
      name: "summarize",
      arguments: {
        text: `
          Our inventory system contains 45 cloud server nodes,
          12 database SSDs, and 8 network switches.
          The team should monitor stock levels and plan
          replenishment before products run out.
        `,
      },
    });

    console.log("\nFinal summary:");

    for (const item of result.content) {
      if (item.type === "text") {
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
