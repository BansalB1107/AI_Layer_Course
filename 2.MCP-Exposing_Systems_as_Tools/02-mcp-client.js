
import "dotenv/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// 1. Connect to the MCP server and test its tool
async function main() {
  // Start the server as a child process
  const transport = new StdioClientTransport({
    command: "node",
    args: ["01-mcp-server.js"],
  });

  // 2. Create the MCP client
  const client = new Client(
    {name: "OpsClientTest",version: "1.0.0",},
    {capabilities: {},}
  );

  try {
    console.log("Connecting to MCP server...");

    // 3. Connect to the server
    await client.connect(transport);

    console.log("Connected successfully!\n");

    // 4. Discover the available tools
    console.log("Discovering available tools...");

    const toolsResult = await client.listTools();

    console.log(
      "Available tools:",
      JSON.stringify(toolsResult.tools, null, 2)
    );

    console.log("-".repeat(40));

    // 5. Call the bill calculation tool
    console.log("Calling calBillTool...");

    const result = await client.callTool({
      name: "calBillTool",
      arguments: {water: 150,electric: 300,},
    });

    console.log("\nTool execution result:");
    console.dir(result, { depth: null });
  } catch (error) {
    console.error("Error communicating with MCP server:", error);
  } finally {
    // 6. Close the connection
    await client.close();

    console.log("\nClient disconnected.");
  }
}

main().catch((error) => {
  console.error("Client fatal error:", error);
  process.exit(1);
});


//In second terminal Run: node 02-mcp-client.js