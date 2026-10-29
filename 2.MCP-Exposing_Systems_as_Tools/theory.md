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

# Module 2 — MCP: Exposing Systems as Tools

## 2.4 Building an MCP Server for Order and Inventory Operations

**Official MCP documentation:** https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts

---

## 1. What Are We Building?

An AI assistant can use an MCP server to access business operations, such as checking an order's status or looking up inventory.

Example questions:

- What is the status of order 101?
- How many Cloud Server Nodes are in stock?
- What is the price of a Database SSD 2TB?

The AI application can request the appropriate tool exposed by the MCP server.

## 2. How Does a Business Operation Become an MCP Tool?

There are three basic parts:

1. **Data:** Business information, such as item names, stock quantities, prices, or order status.
2. **Tool:** An operation exposed by the MCP server, such as `getInventory` or `getOrderStatus`.
3. **Result:** The server runs the operation and returns the result to the MCP client.

Example inventory data from our practice project:

- Cloud Server Node — stock 45, price 120.
- Database SSD 2TB — stock 12, price 250.
- Network Switch 24-Port — stock 8, price 450.

## 3. What Makes a Tool Useful to an AI?

A useful tool definition communicates three things:

- **Name:** What operation can be requested?
- **Description:** When should the AI use the operation?
- **Input schema:** What information must be supplied?

For example, `getOrderStatus` may require an order ID. If the user has not supplied an order ID, the AI should ask for it rather than invent one.

The MCP SDK can validate inputs against the schema defined for a tool.

## 4. How Should We Organize the Server?

For our learning project, keep the flow simple:

1. Store or retrieve the business data.
2. Define the business operation.
3. Expose the operation as an MCP tool.
4. Return a clear result or an understandable error.

The server can expose multiple tools, such as `getOrderStatus` and `getInventory`. The AI application can request the appropriate tool based on the user's question.

## 5. Example Request Flow

```text
User asks about order 101
          |
          v
AI application decides it needs order information
          |
          v
MCP client requests the order-status tool
          |
          v
MCP server looks up order 101
          |
          v
Server returns the actual status or a not-found result
          |
          v
AI application presents the result to the user
```

## 6. Key Terms

- **Business operation:** A task the system can perform, such as looking up an order.
- **Tool definition:** The name, description, and input schema that explain an available operation.
- **Tool handler:** The code that performs the operation when requested.
- **Input validation:** Checking that the supplied input follows the expected schema.
- **Not-found result:** A clear response when the requested order or item does not exist.

## 7. Final Engineering Principles

- Expose useful business operations as tools.
- Give tools clear names and descriptions.
- Define and validate required inputs.
- Return actual results; never invent missing business data.
- Return clear errors when an order or item cannot be found.
- Keep the server's business logic understandable and testable.

---

## Official Reference

https://modelcontextprotocol.io/docs/2026-07-28/learn/server-concepts

---
---

# Module 2 — MCP: Exposing Systems as Tools

## 2.5 Auth & Safety Hardening

**Goal:** Understand the basic protections needed before an MCP server can safely expose business operations.

---

## 1. Why Authentication and Safety Matter

An MCP server may expose information or operations from orders, inventory, customer records, or other business systems.

If access is not controlled, an unauthorized client could read information or request operations it should not be allowed to perform.

**Authentication** checks who is connecting. **Authorization** checks what that connection is allowed to do.

---

## 2. Authentication — Who Is Connecting?

Authentication is the process of verifying the identity of a user, application, or client.

For example, a company may require an approved application to authenticate before it can connect to an MCP server that provides order information.

Do not assume that a client is trusted simply because it can reach the server.

---

## 3. Authorization — What Can It Do?

After identifying a client, the system must decide which actions it may perform.

For example:

- A support assistant may be allowed to read order status.
- An inventory assistant may be allowed to read stock quantities.
- Only an authorized service may be allowed to update inventory.

Give each client only the permissions it needs. This is the principle of **least privilege**.

---

## 4. Validate Tool Inputs

Tool input schemas help check that a request contains the expected fields and types.

For example, `getOrderStatus` may require an order ID. The server should reject missing or incorrectly formatted input rather than guessing what the user meant.

Schema validation is important, but it does not replace business-rule checks. A correctly formatted order ID may still refer to an order the caller is not allowed to access.

---

## 5. Protect Sensitive Data

An MCP server should return only the information needed for the requested task.

For example, a request for an order's delivery status normally does not need to return a customer's full address, payment details, or unrelated personal information.

Avoid placing passwords, API keys, access tokens, or other secrets in tool descriptions, responses, logs, or source code. Use appropriate environment configuration or secret-management facilities.

---

## 6. Treat Tool Calls as Real Operations

Some tools only read information, while others change business data.

Examples:

- `getInventory` reads stock information.
- `updateInventory` changes stock information.
- `cancelOrder` changes an order's state.

Read-only operations are generally lower risk. Operations that change data should have stricter permission checks and clear business rules. Sensitive actions may also require confirmation in the application.

---

## 7. Handle Errors Safely

Return useful errors without exposing internal details.

For example, the server can report that an order was not found or that the caller is not authorized. It should not reveal database credentials, secret values, internal stack traces, or unnecessary customer information.

Record enough diagnostic information for authorized developers to investigate problems, while keeping secrets and sensitive data out of logs.

---

## 8. Key Engineering Principles

- Authenticate clients when the system requires controlled access.
- Authorize each operation; authentication alone is not enough.
- Follow least privilege and expose only necessary capabilities.
- Validate tool inputs and enforce business rules on the server.
- Return only the data needed for the task.
- Protect secrets and avoid exposing sensitive details in errors or logs.
- Apply stronger safeguards to tools that change business data.
- Do not assume that MCP automatically makes a server secure.

---

## Official References

- MCP Authorization: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization
- MCP Security Best Practices: https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices

---
---

# Module 2 — MCP: Exposing Systems as Tools

## 2.6 Multi Round-Trip Requests

**Goal:** Understand how an AI application may make several MCP requests before it can answer a user's question.

---

## 1. What Is a Round Trip?

A **round trip** is a request sent from a client to a server and the response that comes back.

For example, an MCP client may request the available tools from a server and receive a list of tool definitions. Later, it may call one of those tools and receive the result.

Each request and its response form a round trip.

---

## 2. Why Multiple Round Trips Are Needed

Some user requests need more than one operation.

For example, answering **"Can order 101 be shipped today?"** might require the application to:

- Look up order 101.
- Check whether the required items are in stock.
- Check the shipping rules or available delivery options.
- Combine the returned information into an answer.

The application may need multiple requests because each operation provides only part of the information.

---

## 3. A Simple Request Flow

A multi-round-trip interaction can look like this:

```text
User asks a question
        |
        v
AI application requests order details
        |
        v
MCP server returns order details
        |
        v
AI application requests inventory details
        |
        v
MCP server returns inventory details
        |
        v
AI application combines the results
        |
        v
Assistant answers the user
```

The exact number of requests depends on the user's question and the tools available.

---

## 4. The Model and the MCP Client Have Different Roles

The model helps interpret the user's request and determine what information or operation may be needed.

The host application coordinates the workflow, while the MCP client sends protocol requests to the server and receives responses.

The MCP server handles the requested operation and returns its result. It does not independently decide the complete conversation strategy.

---

## 5. Tool Discovery and Tool Calls

A client may first ask the server which tools are available. It can then call a relevant tool using the required inputs.

For example:

- `tools/list` — discover the tools exposed by the server.
- `tools/call` — request execution of a particular tool.

These are different requests: one discovers available operations, while the other asks the server to perform an operation.

An application may also repeat tool calls when it needs additional information to answer the same user request.

---

## 6. Sequential and Independent Requests

Some requests depend on earlier results. For example, the application may need to read an order first to learn which products it contains before checking their inventory.

Other requests may be independent. If order details and general shipping rules can be retrieved separately, the host may be able to request them without waiting for one another.

The application should only run requests in parallel when they do not depend on each other's results and the implementation supports it.

---

## 7. Errors and Incomplete Results

A multi-step workflow can fail at any round trip. A tool may return an error, an order may not exist, or the requested information may be unavailable.

The host should check each result before relying on it. If a necessary step fails, the application should explain the limitation or follow an appropriate recovery path rather than inventing missing information.

More round trips can provide richer answers, but they can also add latency and create more opportunities for failure.

---

## 8. Key Engineering Principles

- A round trip consists of a request and its response.
- Complex questions may require multiple MCP operations.
- The host coordinates the overall workflow; the MCP client communicates with the server.
- `tools/list` discovers tools, while `tools/call` requests an operation.
- Run dependent requests in order and independent requests concurrently only when safe.
- Check results and errors at every step.
- Use returned data to support the final answer; do not invent missing facts.
- More requests can increase latency and the chance of failure.

---

## Official Reference

- MCP Architecture: https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture
- MCP Tools: https://modelcontextprotocol.io/specification/2026-07-28/server/tools

---
---

# Module 2 — MCP: Exposing Systems as Tools

## 2.7 Consuming, Testing & Debugging the Server

**Goal:** Understand how an MCP client connects to a server, checks its available tools, verifies results, and investigates common problems.

---

## 1. What Does It Mean to Consume an MCP Server?

To **consume** an MCP server means to connect to it from an MCP client and use the capabilities it exposes.

In our inventory example, the client connects to the server, discovers tools such as `getInventory`, and calls a tool when the application needs inventory information.

The client and server must use compatible transport and protocol behavior.

---

## 2. Connect Using the Correct Transport

The client must connect in the way the server expects.

- **stdio:** The client typically starts the server as a local process and communicates through standard input and output.
- **Streamable HTTP:** The client sends MCP requests to the server's HTTP endpoint.

A common beginner mistake is trying to open a stdio server in a browser. A stdio server does not automatically provide a browser-accessible URL.

---

## 3. Discover the Available Tools

After connecting, a client can request the server's tool list using `tools/list`.

The list describes the tools available, including their names, descriptions, and input schemas. The client can use this information to understand which operations the server offers.

If the expected tool is missing, check that the server registered it correctly and that the client connected to the intended server.

---

## 4. Call a Tool and Inspect the Result

A client can request an operation using `tools/call`, supplying the required inputs.

For example, a call to `getInventory` might return a product name and its stock quantity. Check whether the result contains the expected information and whether it represents a successful operation or an error.

Do not assume that a request succeeded merely because the client connected successfully.

---

## 5. Test the Main Cases

Testing should cover the basic behavior of each exposed operation:

- **Valid input:** Does the tool return the expected result?
- **Missing or invalid input:** Is the request rejected or handled clearly?
- **Unknown item or order:** Does the server return a useful not-found result?
- **Server or dependency failure:** Does the client receive a manageable error instead of crashing unexpectedly?

For tools that change business data, also verify that they enforce the intended permissions and business rules.

---

## 6. Debug Common Connection Problems

When a connection fails, check the most likely causes first:

- Is the server starting without an error?
- Is the client using the correct server command, file path, or HTTP endpoint?
- Are the client and server using the same expected transport?
- Are required packages and environment settings available?
- For HTTP connections, is the server reachable at the configured endpoint?

Read the actual error message before changing code. The issue may be a startup or configuration problem rather than a problem with the tool itself.

---

## 7. Use Logs and Clear Error Messages

Logs can help identify whether the problem occurred during startup, connection, tool execution, or communication with an underlying database or API.

For a stdio server, keep standard output reserved for MCP protocol messages. Unrelated debug messages printed to stdout can interfere with communication. Use standard error or the logging approach recommended by the SDK.

Avoid logging secrets or unnecessary sensitive business data.

---

## 8. Key Engineering Principles

- Consume an MCP server through a compatible MCP client.
- Choose the correct transport: stdio or Streamable HTTP.
- Use `tools/list` to discover tools and `tools/call` to request operations.
- Test valid input, invalid input, missing records, and failures.
- Inspect tool results rather than assuming every call succeeded.
- Check startup, paths, endpoint configuration, dependencies, and transport when debugging.
- For stdio servers, do not mix debug output into protocol messages on stdout.
- Keep logs useful without exposing secrets or sensitive data.

---

## Official References

- MCP Tools: https://modelcontextprotocol.io/specification/2026-07-28/server/tools
- MCP Transports: https://modelcontextprotocol.io/docs/2026-07-28/basic/transports
- MCP Architecture: https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture

---
---

# Module 2 — MCP: Exposing Systems as Tools

## 2.8 Packaging as a Client Deliverable

**Goal:** Understand what needs to be included when handing an MCP server and its client integration to another developer or team.

---

## 1. What Does Packaging Mean?

Packaging means preparing the MCP server and its related files so another person can install, configure, run, and understand the integration.

A deliverable should include more than the server's source code. The receiving developer also needs to know how to start it, configure it, and connect a compatible MCP client.

---

## 2. Include the Necessary Project Files

A basic deliverable may include:

- The MCP server source code.
- Any client configuration or example needed to connect to the server.
- The package manifest and dependency information.
- A README with setup and usage instructions.
- An example environment configuration file, if needed, without real secrets.

Include the files required to run the project, but do not include generated folders or local files that the recipient does not need.

---

## 3. Document Setup and Startup

The README should explain the required Node.js version, how to install dependencies, which environment variables are needed, and how to start the server.

Clearly identify the transport being used. For a stdio server, document the command or client configuration that launches the server. For a Streamable HTTP server, document the configured endpoint and the required startup process.

Instructions should be clear enough that another developer does not need to guess how the server runs.

---

## 4. Explain the Available Tools

Document the purpose of each important tool, its required inputs, and the kind of result it returns.

For example:

- `getOrderStatus` — looks up the status of an order using its order ID.
- `getInventory` — returns stock information for a product.

Mention any required permissions or limitations. Clear tool documentation helps the receiving team understand what the server can and cannot do.

---

## 5. Handle Configuration and Secrets Safely

Do not package real API keys, passwords, access tokens, or production credentials in source code or example files.

Provide an example configuration file with placeholder values, such as `API_KEY=replace_me`, and explain how the recipient should supply the real value securely.

The server should validate required configuration at startup and report missing settings clearly, without printing secret values.

---

## 6. Include Reliability and Safety Information

Explain any important operational requirements, such as required access permissions, expected external services, and common startup or connection errors.

The recipient should know how the server handles invalid inputs, missing orders or products, and failures from underlying systems. Keep sensitive information out of logs and error messages.

---

## 7. Verify the Deliverable Before Handoff

Before handing over the project, confirm that the documented setup steps are accurate and that the server starts with the required configuration.

Check that the client can connect using the documented transport, discover the expected tools, and receive sensible results from basic calls. The recipient should be able to follow the instructions in a clean environment without relying on undocumented local settings.

---

## 8. Key Engineering Principles

- Package the files needed to install, configure, run, and understand the integration.
- Include clear setup instructions and dependency information.
- Document the transport and how a client connects to the server.
- Describe the tools, inputs, outputs, and important limitations.
- Use placeholders for secrets; never bundle production credentials.
- Explain configuration requirements and common errors.
- Verify the instructions and basic client-server communication before handoff.
- Make the deliverable understandable to someone who did not build it.

---

## Official References

- MCP Introduction: https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro
- MCP Transports: https://modelcontextprotocol.io/docs/2026-07-28/basic/transports
- MCP Security Best Practices: https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices

---
---