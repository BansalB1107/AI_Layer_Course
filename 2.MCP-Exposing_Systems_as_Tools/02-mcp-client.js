import "dotenv/config"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

async function main() {
    // 1. Configure the Stdio transport to spawn your server file as a child process
    const transport = new StdioClientTransport({
        command: "node",
        args: ["01-mcp-server.js"]
    })

    // 2. Initialize the MCP Client instance
    const client = new Client(
        { name: "OpsClientTest", version: "1.0.0" },
        {
            capabilities: {}
        }
    )

    try {
        console.log("Connecting to MCP server...")
        // 3. Connect the client to the transport (this boots up 01-mcp-server.js)
        await client.connect(transport)
        console.log("Connected successfully!\n")

        // 4. Discover available tools from the server
        console.log("Discovering available tools...")
        const toolsResult = await client.listTools()
        console.log("Available Tools:", JSON.stringify(toolsResult.tools, null, 2))
        console.log("-".repeat(40))

        // 5. Call the calBillTool programmatically
        console.log("Calling 'calBillTool' with water: 150, electric: 300...")
        const toolExecutionResult = await client.callTool({
            name: "calBillTool",
            arguments: { water: 150, electric: 300 }
        })

        console.log("\nTool Execution Result:")
        console.dir(toolExecutionResult, { depth: null })

    } catch (error) { console.error("Error communicating with MCP server:", error) }
    finally {
        // 6. Cleanly close the connection and terminate the child server process
        await client.close()
        console.log("\nClient disconnected and server process stopped.")
    }
}

main()

//In second terminal Run: node 02-mcp-client.js