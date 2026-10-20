//npm install ai @ai-sdk/google dotenv
//Put your api gemini api key in .env :GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here

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
//Run(terminal):node index.js