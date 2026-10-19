import "dotenv/config";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const result = await generateText({
  model: google("gemini-3.8-flash"),
  prompt: "Hi",
  maxOutputTokens: 100, //We can add token limit too, remove if not needed (just for learning purpose)
});

console.log(result.text);
console.log(result.usage); //You can check token usage too