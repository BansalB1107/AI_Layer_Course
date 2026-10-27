import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { streamText } from "ai";
import { google } from "@ai-sdk/google";

const result = streamText({
  model: google("gemini-3.8-flash"),
  prompt: "Explain JavaScript in simple terms.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}