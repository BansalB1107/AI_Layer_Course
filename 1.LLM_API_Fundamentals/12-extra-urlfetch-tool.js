import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { generateText, stepCountIs, tool } from "ai";
import { google } from "@ai-sdk/google";
import readline from "readline/promises";
import { stdin, stdout } from "process";
import z from "zod";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

async function fetchWebpage(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

const webtool = tool({
  description: "Fetch information from a webpage",
  inputSchema: z.object({
    url: z.string().describe("The webpage URL to read"),
  }),
  execute: async ({ url }) => {
    return await fetchWebpage(url);
  },
});

const user = await rl.question("You: ");

const result = await generateText({
  model: google("gemini-3.1-flash-lite"),
  prompt: user,
  tools: {
    webtool,
  },
  stopWhen:stepCountIs(5)
});

console.log("Output:", result.text);

rl.close();