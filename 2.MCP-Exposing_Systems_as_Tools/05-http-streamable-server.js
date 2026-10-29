
import { randomUUID } from "node:crypto";
import express from "express";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const app = express();
app.use(express.json());

// Store active transports by MCP session ID
const transports = new Map();

function createMcpServer() {
  const server = new McpServer({
    name: "OpsInventoryHTTPServer",
    version: "1.0.0",
  });

  const inventory = {
    "ITEM-001": { name: "Cloud Server Node", stock: 45, price: 120 },
    "ITEM-002": { name: "Database SSD 2TB", stock: 12, price: 250 },
    "ITEM-003": { name: "Network Switch 24-Port", stock: 8, price: 450 },
  };

  server.tool(
    "checkInventory",
    "Check stock and price for a product",
    {
      productId: z.string().regex(/^ITEM-\d{3}$/),
    },
    async ({ productId }) => {
      const item = inventory[productId];

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

  return server;
}

// Accept MCP requests
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport;

  try {
    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId);
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),

        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };

      const server = createMcpServer();
      await server.connect(transport);
    } else {
      res.status(400).json({
        error: "Bad Request",
        message: "Missing or invalid MCP session.",
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Session termination
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = transports.get(sessionId);

  if (!transport) {
    res.status(404).send("Session not found");
    return;
  }

  await transport.close();
  transports.delete(sessionId);
  res.status(200).send("Session closed");
});

// Start the HTTP service
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`MCP HTTP server listening at http://localhost:${PORT}/mcp`);
});
