# Module 2.1: What MCP Is and Why It Exists

**Official MCP Introduction:** [https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)

---

## 1. What MCP stands for

**MCP** stands for **Model Context Protocol**.

MCP is an open protocol that provides a standard way for AI applications to connect to external systems and access their capabilities and context.

- **Model:** The AI model that understands requests and generates responses.
- **Context:** Information the AI can use, such as inventory records, files, database results, and other relevant data.
- **Protocol:** An agreed set of rules that different software systems follow to communicate.

Think of MCP as a **common communication standard between AI applications and external systems**.

For example, an AI assistant may need to check an order's delivery status, look up inventory, read company documents, or calculate a bill. The AI model does not automatically have access to a company's database or files. The application needs a way to connect it to those systems. MCP provides a standardized way to expose and communicate with those capabilities.

## 2. Why MCP exists

### The problem: many applications need many integrations

Imagine you build three AI applications:

- AI Assistant A uses Gemini.
- AI Assistant B uses GPT.
- AI Assistant C uses another AI model.

Now imagine all three assistants need access to three systems:

- A company database.
- An inventory system.
- Company files.

Without a shared integration standard, developers may need to build separate custom connections for each application and system. As the number of applications and systems grows, the number of integrations and the work needed to maintain them can grow quickly.

This is commonly described as the **M × N integration problem**: many applications need to connect to many systems.

### The MCP approach: a shared standard

Instead of building a completely separate integration for every combination, a developer can expose a system through an MCP server. Compatible AI applications can then connect to that server using the MCP protocol.

For example:

- An inventory system exposes its approved inventory operations through an MCP server.
- A compatible AI application connects to that server through an MCP client.
- Other compatible AI applications can reuse the same server integration rather than implementing the inventory connection from scratch.

**Important:** MCP does not eliminate all integration work. The server still needs to be built or configured, and it still needs to connect to the underlying system. MCP standardizes communication so the integration can be reused by compatible clients.

## 3. How MCP fits into an AI application

MCP is a communication layer between an AI application and external systems. A typical high-level flow looks like this:

1. **The user asks a question.** For example: "What is the current stock of the Cloud Server Node?"
2. **The AI application determines what it needs.** It identifies that inventory information is required and considers the tools available to it.
3. **The MCP client sends a request.** It communicates with the relevant MCP server using the MCP protocol.
4. **The MCP server performs the operation.** It looks up the item in its inventory data or underlying system.
5. **The result returns to the AI application.** The application provides the result to the model as needed.
6. **The assistant answers the user.** It can use the returned result to formulate a human-readable response.

For example, if the server returns a stock quantity of `45`, the assistant could answer: "The Cloud Server Node currently has 45 units in stock."

The quantity should come from the tool result, not from the model guessing.

**Important distinction:** MCP does not itself decide which tool is appropriate. The AI application or its model-driven orchestration selects a tool. The MCP client and server handle standardized communication and the operation request.

## 4. MCP in our inventory project

Our MCP practice project contains an inventory server and an AI client.

- **`03-inventory-server.js`:** Exposes inventory-related capabilities through an MCP server. It can provide information from the sample inventory data and other configured sources.
- **`04-ai-mcp-client.js`:** Connects to the MCP server and integrates the server's available capabilities with an AI model.

When a user asks the assistant about an inventory item, the intended flow is:

`User question → AI application → MCP client → MCP server → inventory operation → result returned → AI response`

The MCP server does not have to be a website. If it uses **stdio transport**, a client can communicate with it through the process's standard input and output. In that case, opening `localhost:3001` in a browser will not show a web page because the server is not listening for browser HTTP requests on that port.

## 5. MCP versus ordinary AI tool calling

These concepts are related, but they are not the same.

| Concept | Meaning |
|---|---|
| **AI tool calling** | A model requests that a function or tool be executed as part of an AI workflow. |
| **MCP** | A standard protocol for compatible applications to discover and communicate with external capabilities and context. |
| **MCP server** | Exposes capabilities or context through MCP. |
| **MCP client** | Communicates with an MCP server on behalf of the host application. |

You can build an AI agent with ordinary tool calling without MCP. For example, you could define a `getInventory()` function directly inside your Gemini application and let the model request that function.

That approach can work well for a small, self-contained application.

MCP becomes especially useful when you want reusable integrations, multiple external systems, different compatible AI clients, or a clearer separation between the AI application and the systems it accesses.

## 6. What MCP does not do

Do not assume MCP handles every part of an AI application.

- **MCP is not an AI model.** It does not generate intelligent answers by itself.
- **MCP does not train a model.** It is a communication protocol, not a model-training method.
- **MCP does not automatically connect to every system.** A developer must implement or configure the server integration.
- **MCP does not guarantee security.** Authentication, authorization, input validation, and access controls still matter.
- **MCP does not replace business logic.** The inventory server still needs code that implements the rules for reading or updating inventory.
- **MCP does not guarantee that a model will use a tool correctly.** The surrounding application must handle tool selection, errors, and returned data appropriately.

Think of MCP as a **standardized communication layer**, not the entire AI application.

## 7. Where MCP is useful

### AI coding assistants

Compatible assistants can connect to tools and context related to source code, repositories, development environments, and other services.

### Business automation

An assistant can be given access to approved operations such as looking up orders, checking inventory, or querying customer records.

### Data and knowledge assistants

An application can expose documentation, company files, database queries, and other relevant information through MCP servers.

The exact capabilities depend on which servers are configured and what access they are permitted to provide.

## 8. Key terms to remember

- **Protocol:** Shared rules that systems use to communicate.
- **Integration:** The connection between an application and an external system.
- **MCP server:** The component that exposes capabilities or context through MCP.
- **MCP client:** The component that communicates with an MCP server.
- **Tool:** An operation a compatible application can discover and request, such as looking up inventory.
- **Reusable integration:** An integration that compatible applications can use without each one rebuilding the entire connection from scratch.

The detailed roles of hosts, clients, servers, tools, and resources are covered in **Module 2.2: Architecture**.

## 9. Final engineering principles

1. Use MCP when a standardized, reusable connection between AI applications and external systems is valuable.
2. Remember that MCP standardizes communication; it does not remove the need to build and maintain integrations.
3. Keep business logic in the system responsible for the operation.
4. Treat tool results as data to verify and use, not as a reason to let the model invent missing facts.
5. Add authentication, authorization, input validation, and safe error handling when exposing real systems.
6. Understand the transport being used. A stdio MCP server is not automatically an HTTP server or a website.

> **Rule:** AI tool calling lets a model request an operation. MCP provides a standard way for compatible applications to discover and communicate with external capabilities.

---

## Official reference

- [MCP Introduction — Model Context Protocol](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)


---
---

# Module 2 — MCP: Exposing Systems as Tools

## 2.2 MCP Architecture — Hosts, Clients, Servers, Tools, and Resources

Official reference: https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture

---

## 1. The Big Picture

Model Context Protocol (MCP) provides a standard way for an AI application to communicate with external systems.

For example, an AI assistant may need to check inventory information. MCP defines how the application can connect to a server that provides inventory capabilities.

The five important terms are:

- **Host**
- **Client**
- **Server**
- **Tools**
- **Resources**

---

## 2. Host — The AI Application

The host is the application that the user interacts with. It manages the AI experience and coordinates the model and MCP connections.

In our practice project, `04-ai-mcp-client.js` acts as a simple AI application: it accepts the user's question, uses Gemini, and connects to the MCP server.

Think of the host as the main office coordinating the work.

---

## 3. Client — The Connection Manager

The MCP client connects the host to an MCP server and communicates with it using the MCP protocol.

Example from our project:

```js
const transport = new StdioClientTransport({
  command: "node",
  args: ["03-inventory-server.js"],
});
```

What this means:

- `command: "node"` starts a Node.js process.
- `args: ["03-inventory-server.js"]` tells Node.js which file to run.
- `StdioClientTransport` allows the client and server to communicate through standard input and output.

The client manages the connection; it does not itself contain the inventory data.

---

## 4. Server — The System That Provides Capabilities

An MCP server exposes capabilities that an AI application can use.

In our project, `03-inventory-server.js` is an example. It can expose operations such as checking inventory and reading company notes.

The server receives requests and returns results. It does not have to be a website, and it does not necessarily need to run on a port such as `3001`.

---

## 5. Tools — Actions the AI Can Request

Tools let the AI application ask a system to perform an operation.

Examples:

- `getInventory` — check an item's stock.
- `calculateBill` — calculate a bill.
- `readCompanyNotes` — retrieve information from a notes file.

Example question:

> How many Cloud Server Nodes are in stock?

The AI application may request the relevant inventory tool. The server runs the operation and returns the result.

Important: MCP makes a tool available, but the AI model and host orchestration decide whether and when to request it.

---

## 6. Resources — Information the AI Can Read

Resources expose information for an AI application to access as context.

Examples could include:

- Company documentation
- Product catalogs
- Configuration information
- Reference documents

### Tools vs. Resources

| Concept | Main purpose |
|---|---|
| Tool | Perform an action or operation |
| Resource | Provide information or context |

A server can expose tools, resources, or both. Not every MCP server needs to expose every capability.

---

## 7. How the Parts Work Together

A simplified architecture looks like this:

```text
User
  |
  v
Host (AI application + model)
  |
  v
MCP Client
  |
  | MCP communication
  v
MCP Server
  |             |
  v             v
Tools        Resources
  |             |
  v             v
Inventory, files, databases, APIs, documentation
```

For an inventory question, the flow is:

1. The user asks the host a question.
2. The model determines that it needs inventory information.
3. The host uses its MCP client to request the relevant tool.
4. The MCP server executes the operation and returns the result.
5. The host gives the result to the model, which forms the answer.

The host/client/server communication can involve multiple request-and-response messages.

---

## 8. Quick Example from Our Project

- `04-ai-mcp-client.js`: the AI application and host-side orchestration.
- `03-inventory-server.js`: the MCP server that exposes inventory capabilities.
- `StdioClientTransport`: the transport used for communication through standard input and output.
- Inventory tools: operations the AI application can request.
- Company notes: information that can be read by a tool in our current example.

Remember: using `stdio` does not automatically create a website at `localhost:3001`. A server using standard input/output communicates with its client through the process streams rather than serving a browser page.

---

## 9. Key Terms to Remember

- **Host:** The AI application that coordinates the experience.
- **Client:** Manages communication with an MCP server.
- **Server:** Exposes capabilities to the client.
- **Tool:** An operation that can be requested.
- **Resource:** Information that can be accessed as context.
- **Transport:** The communication mechanism used between the client and server, such as `stdio` or HTTP-based transport.

---

## 10. Final Engineering Principles

- MCP standardizes communication between AI applications and external capabilities.
- The host, client, and server have different responsibilities.
- Tools are for operations; resources are for information/context.
- MCP does not itself decide which tool the model should call.
- An MCP server does not have to be a browser-accessible website.
- Understand the architecture before trying to memorize the SDK syntax.

---

## Official Reference

https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture

---
---

# Module 2 — MCP: Exposing Systems as Tools

## 2.3 MCP Specification and Transports

Official reference: https://modelcontextprotocol.io/docs/2026-07-28/basic/transports

---

## 1. What Is the MCP Specification?

The MCP specification is the set of rules that defines how MCP clients and servers communicate.

It defines how the two sides exchange messages and use MCP capabilities, such as discovering tools, calling tools, and receiving results.

The goal is for clients and servers to follow a shared protocol instead of inventing a different communication format for every integration.

---

## 2. What Is a Transport?

A **transport** is the communication channel used by an MCP client and server.

Think of it like delivering a message: the message has content, but you also need a way to deliver it.

Our project uses this transport:

```js
new StdioClientTransport({
  command: "node",
  args: ["03-inventory-server.js"],
});
```

`StdioClientTransport` carries MCP messages between the client and server through standard input and standard output.

That is why opening `localhost:3001` in a browser does not show this server. The `stdio` transport does not automatically create a website or an HTTP server.

---

## 3. The Two Standard MCP Transports

The MCP specification defines two standard transports:

### A. `stdio` — Local Process Communication

- The client launches the MCP server as a separate process.
- The client and server exchange messages through standard input (`stdin`) and standard output (`stdout`).
- It is commonly used for local tools and scripts.

In our project, the client launches `03-inventory-server.js`.

### B. Streamable HTTP — HTTP Communication

- The MCP server runs as an independent process and exposes an HTTP endpoint.
- The client sends MCP messages using HTTP requests.
- Responses can be a JSON object or a Server-Sent Events (SSE) stream for that request.
- It can be used when an application needs to communicate with a server over a network.

### Quick Comparison

| Feature | `stdio` | Streamable HTTP |
|---|---|---|
| Communication | Process input/output | HTTP requests |
| Typical use | Local server process | Local or remote HTTP server |
| Requires an HTTP endpoint? | No | Yes |
| Browser page appears automatically? | No | No; an MCP endpoint is not necessarily a human-readable webpage |

---

## 4. What Is JSON-RPC?

MCP uses **JSON-RPC** to structure its messages. Think of JSON-RPC as a standard format for requests and responses.

Simplified illustration:

```json
{
  "method": "tools/list"
}
```

This is only a conceptual example, not a complete valid MCP request. It illustrates a request to discover the server's available tools.

Remember the difference:

- **MCP specification:** defines the protocol rules and what MCP methods mean.
- **JSON-RPC:** provides the structure for protocol messages.
- **Transport:** carries the messages between client and server.

The SDK handles most of the message formatting for us.

---

## 5. What Does the Specification Version Mean?

You may see a version such as `2026-07-28` in the official MCP documentation.

A specification version identifies a particular revision of the protocol rules. Client and server implementations need compatible protocol behavior.

You do not need to memorize version details now. When building real applications, check that your SDK and the documentation you follow support the intended protocol version.

---

## 6. How This Applies to Our Project

Our current client uses `StdioClientTransport` to launch and communicate with `03-inventory-server.js`.

The flow is:

```text
04-ai-mcp-client.js
        |
        | starts Node.js process
        v
03-inventory-server.js
        |
        | MCP messages over stdin/stdout
        v
Tool result returned to the client
```

No browser URL is needed for this `stdio` connection.

If we later choose Streamable HTTP, we will configure an HTTP-based MCP server and connect to its endpoint instead.

---

## 7. Key Terms to Remember

- **Specification:** the shared rules clients and servers follow.
- **Transport:** the communication channel.
- **`stdio`:** communication through process input and output.
- **Streamable HTTP:** communication through an HTTP endpoint.
- **JSON-RPC:** the message format used by MCP.
- **SSE:** Server-Sent Events, a way an HTTP response can stream events.

---

## 8. Final Engineering Principles

- The MCP specification defines shared communication rules.
- A transport carries messages; it does not define what the messages mean.
- `stdio` and Streamable HTTP are the two standard transports described in the specification.
- `stdio` does not automatically create a website or open a port.
- MCP uses JSON-RPC to structure messages.
- Let the MCP SDK handle low-level protocol details while learning the architecture first.

---

## Official References

- MCP transports: https://modelcontextprotocol.io/docs/2026-07-28/basic/transports
- MCP introduction: https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro

---
---
