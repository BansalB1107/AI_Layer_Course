
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ToolListChangedNotificationSchema, } from "@modelcontextprotocol/sdk/types.js";

// SERVER
async function startServer() {
    const server = new McpServer({
        name: "NotificationServer",
        version: "1.0.0",
    });

    server.tool(
        "get-status",
        "Get the current server status.",
        {},
        async () => ({
            content: [{ type: "text", text: "Server is running." }],
        })
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Add a new tool after the client has connected.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    server.tool(
        "get-stock",
        "Get the stock of a product.",
        {
            productId: z.string().describe("Product ID"),
        },
        async ({ productId }) => ({
            content: [
                {
                    type: "text",
                    text:
                        productId === "ITEM-001"
                            ? "Cloud Server Node: 45 units"
                            : `No sample stock data found for ${productId}.`,
                },
            ],
        })
    );
}

// CLIENT
async function startClient() {
    const client = new Client({
        name: "NotificationClient",
        version: "1.0.0",
    });

    const transport = new StdioClientTransport({
        command: process.execPath,
        args: [fileURLToPath(import.meta.url), "server"],
    });

    try {
        await client.connect(transport);

        console.log("Connected to MCP server.");

        const initial = await client.listTools();

        console.log("\nInitial tools:");
        console.log(initial.tools.map((tool) => tool.name));

        const notificationReceived = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timed out waiting for tool-list notification."));
            }, 10000);

            client.setNotificationHandler(
                ToolListChangedNotificationSchema,
                async () => {
                    console.log("\nNotification received: tool list changed.");

                    try {
                        const updated = await client.listTools();

                        console.log("\nUpdated tools:");
                        console.log(updated.tools.map((tool) => tool.name));

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            );

        });

        await notificationReceived;
    } finally {
        await client.close();
    }
}

if (process.argv[2] === "server") {
    await startServer();
} else {
    await startClient();
}
