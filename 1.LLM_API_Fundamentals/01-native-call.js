import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import readline from "readline/promises";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const user = await rl.question("User: ")
rl.close()
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: user,
});

console.log(response.text);