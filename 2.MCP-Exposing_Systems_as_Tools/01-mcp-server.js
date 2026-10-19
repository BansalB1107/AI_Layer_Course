//npm install @modelcontextprotocol/server zod

import "dotenv/config"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import z from "zod"

// 1. Initialize the MCP server instance
const server = new McpServer({
    name: "CompanyOpsServer",
    version: "1.0.0"
})

// 2. Define a business logic function
function calBill(electric, water) {
    return (electric + water) * 0.8
}

// 3. Register the tool using native MCP server helper + Zod schema
server.tool(
    "calBillTool",
    "Calculate company bill using water and electricity bills",
    {
        water: z.number().describe("Water Bill amount"),
        electric: z.number().describe("Electric Bill amount")
    },
    async ({ water, electric }) => {
        try {
            const total = calBill(water, electric)
            return {
                content: [{ type: "text", text: `Calculated total bill: ${total}` }]
            }
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error calculating bill: ${error.message}` }],
                isError: true
            }
        }
    }
)

// 4. Connect and run the server using Stdio transport
async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
}

main().catch((error) => {
    console.error("Server fatal error:", error)
    process.exit(1)
})


//Run: npx @modelcontextprotocol/inspector node 01-mcp-server.js