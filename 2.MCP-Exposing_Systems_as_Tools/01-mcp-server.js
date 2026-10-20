//npm install @modelcontextprotocol/server zod

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. Create the MCP server
const server = new McpServer({
    name: "CompanyOpsServer",
    version: "1.0.0",
});

// 2. Create the bill calculation function
function calBill(electric, water) {
    return (electric + water) * 0.8;
}

// 3. Register the bill calculation tool
server.tool(
    "calBillTool",//Tool Name
    "Calculate company bill using water and electricity bills",//Tool description
    {//Tool Input schema
        water: z.number().describe("Water bill amount"), 
        electric: z.number().describe("Electric bill amount"),
    },
    async ({ water, electric }) => {//The callback function (Basically execute from tool calling)
        try {
            const total = calBill(electric, water);

            return {
                content: [
                    {
                        type: "text",
                        text: `Calculated total bill: ${total}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error calculating bill: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
);

// 4. Start the MCP server
async function main() {
    const transport = new StdioServerTransport();

    await server.connect(transport);
}

main().catch((error) => {
    console.error("Server fatal error:", error);
    process.exit(1);
});



//Run: npx @modelcontextprotocol/inspector node 01-mcp-server.js