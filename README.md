# ai-engineering-practice# AI Engineering Practice

A hands-on repository documenting my journey of learning and practicing AI engineering through small, focused coding examples.

The goal is to understand how to build AI-powered applications, work with language models, create agents, use tools, manage conversation history, and explore production engineering concepts.

## Topics Covered

### 1. Foundations

- Calling Google Gemini directly and through the AI SDK
- Tool calling and function execution
- Streaming model output
- Structured object output
- Measuring token usage and latency
- Managing conversation history
- Semantic embedding cache
- Trimming conversation history
- Reading files and fetching URLs with tools
- Generating summaries

### 2. Agents

- Multi-tool agents
- Human-in-the-loop workflows
- Conversation history in agents
- History summarization
- Persistent memory
- Memory control

### 3. Production Engineering

This section is reserved for future experiments and projects related to building and deploying reliable AI applications. Learning to connect with real databases...

## Tech Stack

- JavaScript (ES modules)
- Node.js
- Google Gemini API
- Vercel AI SDK
- Google GenAI SDK
- Zod
- Express
- PostgreSQL (`pg`)

## Prerequisites

Before running the examples, install:

- [Node.js](https://nodejs.org/) and npm
- [Git](https://git-scm.com/)
- A Google Gemini API key for examples that call Gemini

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/BansalB1107/ai-engineering-practice.git
cd ai-engineering-practice
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment variables

Create your own `.env` file by copying `.env.example`.

**macOS/Linux:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the placeholder values with your own API keys:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key_here
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

**Important:** Never commit your real `.env` file or share your API keys publicly. The repository's `.gitignore` excludes `.env` files.

Some examples may require only one of these environment variables, depending on
