import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({
  input,
  output,
});

const history = [];

while (true) {
  const userMessage = await rl.question("\nYou: ");

  if (userMessage.toLowerCase() === "exit") {
    break;
  }

  history.push({
    role: "user",
    content: userMessage,
  });

  console.log("\n=== HISTORY SENT TO GEMINI ===");
  console.log(history);

  const result = await generateText({
    model: google("gemini-3.1-flash-lite"),
    messages: history,
  });

  history.push({
    role: "assistant",
    content: result.text,
  });

  console.log("\nGemini:", result.text);

  console.log("\n=== FULL HISTORY ===");
  console.log(history);
}

rl.close();