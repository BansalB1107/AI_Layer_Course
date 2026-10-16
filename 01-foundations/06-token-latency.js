import "dotenv/config";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const startTime = performance.now();

const result = await generateText({
  model: google("gemini-3.8-flash"),
  prompt: "What is JavaScript? Explain in 2 sentences.",
});

const endTime = performance.now();

console.log("Answer:");
console.log(result.text);

console.log("\nToken usage:");
console.log(result.usage);

console.log("\nTotal tokens:", result.usage.totalTokens);

console.log("\nLatency:", endTime - startTime, "ms");