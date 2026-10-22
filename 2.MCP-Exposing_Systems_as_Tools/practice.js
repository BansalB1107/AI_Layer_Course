import "dotenv/config"
import { Client } from "@modelcontextprotocol/sdk/client"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio"
async function  main(){
    const transport=new StdioClientTransport({
        command:"node",
        args:["01-mcp-server.js"]
    })
    const client=new Client(
        {name:"OpsClientTest",version:"1.0.0"},
        {capabilities:{},}
    )
    try{
        console.log("Connecting...")
        await client.connect(transport)
        console.log("Discovering available tools...")
        const toolsResult=await client.listTools()
        console.log("Available tools: ",JSON.stringify(toolsResult.tools,null,2))
        console.log("Calling calBillTool...")
        const result=await client.callTool({
            name:"calBillTool",
            arguments:{water:150,electric:300}
        })
    }catch(error){
        console.log("Error comunication with MCP server:",error)
    }finally{
        await client.close()
        console.log("Client disconnected")
    }
}
main()