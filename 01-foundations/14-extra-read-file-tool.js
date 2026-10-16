import "dotenv/config";

import { google } from "@ai-sdk/google";
import { generateText, tool, stepCountIs } from "ai";
import readline from "readline/promises";
import { stdin, stdout } from "process";
import fs from "fs/promises";
import z from "zod";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

async function readFile(fileName) {
  const text = await fs.readFile(fileName, "utf-8");
  return text;
}

const readFileTool = tool({
  description: "Read the contents of a text file",
  
  inputSchema: z.object({
    fileName: z.string().describe("The name of the text file to read"),
  }),

  execute: async ({ fileName }) => {
    return await readFile(fileName);
  },
});

const user = await rl.question("You: ");

const result = await generateText({
  model: google("gemini-3.1-flash-lite"),
  prompt: user,

  tools: {
    readFileTool,
  },

  stopWhen: stepCountIs(3),
});

console.log(result.text);

rl.close();