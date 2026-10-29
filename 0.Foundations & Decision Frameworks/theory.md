# 0. Foundations & Decision Frameworks

## Module 0 at a glance

9 subtasks · 62 pointers

| Subtask | Title | Points |
| --- | --- | ---: |
| 0.1 | What is an AI engineer | 6 |
| 0.2 | How LLMs actually work | 7 |
| 0.3 | Embeddings & vector space | 6 |
| 0.4 | Databases for AI — vector vs non-vector | 8 |
| 0.5 | Knowledge access — RAG vs fine-tuning vs long-context | 6 |
| 0.6 | Interaction model — single call vs workflow vs agent | 6 |
| 0.7 | Model types & providers + cost/quality/latency | 9 |
| 0.8 | Build vs buy | 7 |
| 0.9 | The AI feature lifecycle | 7 |

---

## 0.1 What is an AI engineer — 6 points

- **1. Definition:** An AI engineer is a software developer who builds applications powered by AI.
- **2. Role comparison:**
  - AI engineer — integrates models into applications.
  - ML engineer — builds, trains, deploys, or maintains machine-learning models.
  - Data scientist — uses data and models to answer questions, find patterns, and make predictions.
  - Research scientist — develops new algorithms, model architectures, and research methods.
- **3. Core skill set:** LLM APIs, RAG, tools/MCP, agents, evaluations, prompt and context engineering, cost control, and safety.
- **4. Why full-stack engineers have a head start:** Existing skills include APIs, HTTP, authentication and authorization, frontend/backend integration, and databases. New areas include tokens, context windows, transformers, sampling, and tool calling.
- **5. Delivery-team role and client value:** Connect AI capabilities to a real product or business workflow; clients are buying a useful, integrated, reliable feature—not just an API call.
- **6. Honest boundary:** An AI engineer does not necessarily train foundation models from scratch or conduct model-training, fine-tuning, computer-vision, or ML research.

---

## 0.2 How LLMs actually work — tokens, context & the transformer — 7 points

- **1. Tokenization:** Models process tokens rather than whole words. A word may become one token or several, depending on the tokenizer and its vocabulary; token count is not the same as word count.
- **2. Next-token prediction and sampling:** An LLM predicts a likely next token and repeats the process to generate text. Temperature changes how concentrated or varied token selection is; top-p limits selection to a probability-ranked set whose cumulative probability reaches the chosen threshold.
- **3. Transformer, attention, order, and context:** Attention helps a model relate tokens to other relevant tokens in the input. Word order changes meaning (“Dog bites a man” vs. “Man bites a dog”), and surrounding context helps distinguish meanings of the same word (“bank” for money vs. a riverbank).
- **4. Context window:** The context window is a finite token budget. The total can include system instructions, conversation history, documents or other input, the current prompt, and generated output. Exceeding the model's limits can cause a request to fail or require trimming the input/output budget.
- **5. Statelessness:** A model call does not automatically create durable memory between independent requests. An application must send relevant conversation history or retrieve stored information when needed.
- **6. Training cutoff:** A model's built-in knowledge reflects its training process and may not include later events. Retrieval, tools, or other fresh data sources can provide up-to-date information.
- **7. Model kinds by training:** Base models learn text patterns; instruction-tuned models are further trained to follow instructions; reasoning models are optimized for tasks that benefit from more deliberate multi-step problem solving.

---

## 0.3 Embeddings & vector space — from text to meaning — 6 points

- **1. Embedding definition:** An embedding is a fixed-length array of numbers representing information such as the semantic meaning of text.
- **2. High-dimensional space:** Embeddings place items in a space with many dimensions. The dimensions collectively encode learned patterns and semantic relationships; they should not be treated as simple, individually named human features.
- **3. Similarity and distance:** Vector distance and cosine similarity are ways to compare embeddings. Items with related meanings often have closer vectors or higher cosine similarity, depending on the embedding model and metric.
- **4. Embedding models:** Embed queries and documents with compatible embeddings from the same model and configuration. Different models may produce incompatible dimensions or vector spaces.
- **5. Strengths and limitations:** Embeddings are useful for fuzzy semantic matching, such as “change my password” and “reset your password.” They are less reliable for exact identifiers, order numbers, and precise numeric values; use exact filters or keyword search for those.
- **6. Semantic-search connection:** Similar meaning → related vector representations → similarity search. This is a foundation for retrieving relevant information in RAG.

---

## 0.4 Databases for AI — vector vs non-vector, and when to use which — 8 points

- **1. What makes a database vector-enabled:** It stores embeddings and supports vector similarity search, often using an approximate-nearest-neighbor (ANN) index such as HNSW or IVF.
- **2. Main non-vector database types:**
  - Relational/SQL — structured records, queries, joins, constraints, and transactions.
  - Document — JSON-like documents, for example MongoDB.
  - Key-value — fast lookup by key.
  - Full-text search — keyword matching and relevance ranking, for example Elasticsearch or OpenSearch.
- **3. What each is optimized for:** SQL is strong at exact queries, joins, and transactions; vector search finds semantically similar items; full-text search ranks results based on matching terms.
- **4. Why vector search is approximate:** Searching very large collections for exact nearest neighbors can be expensive. ANN methods trade some exactness for faster search and may occasionally miss the mathematically nearest item.
- **5. Extension vs. dedicated vector database:** pgvector adds vector search to PostgreSQL and is useful when the data already lives in a relational database. Dedicated options such as Pinecone, Qdrant, or Chroma may fit specialized or larger vector workloads, depending on deployment and requirements.
- **6. Database decision rubric:**
  - Use relational storage for structured business records and transactions.
  - Add vector search when semantic retrieval is needed over that data.
  - Consider a dedicated vector database for a workload whose scale or operational requirements justify it.
  - Use a search engine for keyword search; consider hybrid keyword-plus-vector retrieval when both matter.
- **7. Why vector search does not replace relational storage:** Vector databases are not a substitute for transactional business data such as users, orders, billing records, joins, and constraints. Many applications need both exact database operations and semantic retrieval.
- **8. Why hybrid is common:** Relational filters can narrow records before vector search; dense vectors capture semantic similarity, while sparse vectors or keyword search help match exact terms.

---

## 0.5 Knowledge access — RAG vs fine-tuning vs long-context — 6 points

- **1. RAG:** Retrieve relevant information at query time and add it to the model's context. Typical flow: collect documents → split into chunks (often with overlap) → embed chunks → store/index them → retrieve relevant chunks → generate a grounded response. It avoids retraining just to update knowledge.
- **2. Long-context:** Put the source material directly into the prompt. It is straightforward for self-contained tasks or analyzing a document, but is limited by the context window, latency, and token cost.
- **3. Fine-tuning:** Train a model further on examples to influence its behavior, style, or output format. It is not the usual choice for frequently changing facts; the model's learned knowledge is not automatically refreshed when source data changes.
- **4. Decision rubric:**
  - Fresh, large, changing, or citable knowledge → consider RAG.
  - Small, self-contained input that fits the context budget → consider long-context.
  - Consistent behavior, tone, or format across many examples → consider fine-tuning when justified.
- **5. Combining approaches:** Fine-tuning can shape behavior while RAG supplies current information. RAG can select relevant documents and a long-context prompt can then include a larger portion of a selected document when broader context is useful.
-  **6. Cost, freshness, and maintenance:** RAG adds retrieval work and ongoing indexing; long-context cost and latency rise with the input size; fine-tuning has upfront dataset/training costs and does not automatically keep facts current. Measure these trade-offs on the intended workload rather than relying on fixed latency estimates.

---

## 0.6 Interaction model — single call vs workflow vs agent — 6 points

- **1. Single call:** One prompt produces one answer. Start here for tasks that do not require multiple controlled stages or external lookups, such as summarization, translation, and straightforward question answering.
- **2. Fixed workflow/chain:** The application controls a sequence of steps. It is useful when a task has predictable stages, such as downloading an invoice, extracting its text, saving data to a database, and notifying a team.
- **3. Dynamic agent:** The model chooses actions or tools at runtime. This is useful when the next step depends on the situation, but it is harder to bound, test, and debug.
- **4. Reasoning models and workflows:** Stronger reasoning in a single model call can sometimes replace a chain of older, separately prompted steps. Check whether a multi-step workflow still adds necessary control, validation, or integration.
- **5. Costs of agents:** Multiple model calls and loops can increase token cost and latency. More tools and paths can increase failure possibilities and make debugging and observability more difficult.
- **6. Decision rubric:** Try a single call first; use a fixed workflow when the stages are known and need control; use an agent when the path genuinely cannot be determined in advance.

---

## 0.7 Model types & providers + cost/quality/latency — 9 points

- **1. Standard vs. reasoning models:** Standard instruction-following models suit many routine tasks. Reasoning models may be worth their extra cost and latency for difficult coding, debugging, logic, or mathematics, but may be unnecessary for simple rewriting, translation, formatting, or summarization.
- **2. Other model types:** Multimodal models handle combinations such as text, images, and audio. Embedding models produce vectors for semantic retrieval. Small/fast models can reduce cost and latency; open-weight models can be run or adapted in environments the user controls.
- **3. Model family + size tier:** A family identifies a provider's line of models; a size or capability tier helps frame the trade-off between speed/cost and capability. Actual performance varies by task and model version.
- **4. Major closed-model providers:** Anthropic/Claude, OpenAI/GPT, and Google/Gemini offer different model families and capabilities. Do not treat broad strengths as guarantees; compare current models on the task you need.
- **5. Open-weight families:** Examples include Meta/Llama, Mistral, and Qwen. Open weights can support greater deployment control, privacy options, customization, and potential cost advantages, but hosting, hardware, operations, and licensing still matter.
- **6. Aggregators/gateways:** These provide a unified interface to multiple model providers and can make switching easier. Check differences in feature support, pricing, data handling, reliability, and the risk of adding another dependency.
- **7. Cost/quality/latency triangle:** Improving one dimension can affect the others. Choose the trade-off based on the product requirement instead of assuming the most capable model is always best.
- **8. Match model to task:** Choose a model for each subtask, estimate token usage and pricing, and compare public benchmarks with evaluations on your own representative inputs.
- **9. Decision rubric:** Start with a cost-effective standard model, measure quality, latency, and cost, then escalate to a stronger or reasoning model only where the measured results justify it. Verify provider and model details when building because they change frequently.

---

## 0.8 Build vs buy — SDKs, frameworks & managed services — 7 points

- **1. Layers where the choice appears:**
  - Model access — provider APIs vs. self-hosted open-weight models.
  - Orchestration/agents — custom code vs. a framework such as LangGraph or CrewAI.
  - Vector store — custom storage vs. a vector database such as Pinecone, Qdrant, or Milvus.
  - Evals/observability — custom logging vs. tools such as LangSmith, Phoenix, or Arize.
  - Deployment — managing containers/infrastructure vs. managed hosting.
- **2. Core trade-off:** Building offers control and customization but consumes engineering time and ongoing maintenance. Buying or using managed services can speed delivery but introduces fees, vendor dependencies, and less infrastructure control.
- **3. Raw SDK vs. framework:** A provider SDK is often simpler and easier to inspect for straightforward calls. A framework such as LangGraph becomes more useful for complex stateful workflows, branching, and cycles.
- **4. Self-hosted vs. managed vector store:** Self-hosting can consolidate infrastructure and offer control, especially when a database such as PostgreSQL is already operated. Managed stores reduce infrastructure work and may provide scaling and indexing features, at a service cost.
- **5. Lock-in and abstraction boundaries:** Deeply coupling business logic to one provider's proprietary API can make migration expensive. Keep provider-specific code behind a clear internal interface where portability is valuable; avoid adding abstractions that do not solve a real problem.
- **6. One framework deep vs. many shallow:** Choose one primary orchestration framework when the project needs one, and learn its conventions thoroughly. Mixing several overlapping frameworks can make the architecture harder to understand and maintain.
- **7. When managed services are worth it:** They can be worthwhile for operationally demanding or non-core capabilities such as tracing, logging, or specialized vector indexing. They may be unnecessary overhead for simple tasks that ordinary code handles reliably.

---

## 0.9 The AI feature lifecycle — prototype to production — 7 points

- **1. Lifecycle stages:**
  - Prototype — prove that the core idea can work.
  - Ground — connect real documents, databases, or APIs so the model has relevant context.
  - Harden for safety — add input/output protections, prompt-injection defenses, and appropriate handling of personal information.
  - Evaluate — test quality, accuracy, safety, cost, and regressions with representative test cases.
  - Deploy — provide stable infrastructure, error handling, rate limits, and other production requirements.
  - Monitor/iterate — track logs, user feedback, cost, latency, and quality changes; improve the system over time.
- **2. Demo-to-production gap:** LLM outputs are not perfectly deterministic. Production also has to address safety, security, cost, latency, failures, and real-world inputs.
- **3. Why a demo is only an early step:** A successful local example proves feasibility, not production readiness. Robust delivery also requires edge-case handling, timeouts, retries, caching where useful, and safe fallbacks.
- **4. Course-to-lifecycle mapping:** Modules 1–3 build core AI functionality; Modules 4–5 connect data and tools; Module 6 hardens safety; Module 7 measures quality; Module 8 improves performance and cost; Module 9 focuses on shipping and operations.
- **5. Evals are part of done:** A prompt or model change can improve one example while breaking another. Repeatable test cases help catch regressions; “it looked good in a demo” is not sufficient.
- **6. Security is part of done:** User input can contain prompt injection or attempts to expose private information. Design and test protections from the start instead of treating security as a later add-on.
- **7. Production-readiness judgment:** For any feature, identify its lifecycle stage and state what remains before it is safe, evaluated, deployable, monitorable, and ready to deliver to a client.