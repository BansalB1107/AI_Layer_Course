//cd 1.LLM_API_Fundamentals
//npm init -y
//npm install @google/genai dotenv
//Use your gemini api in .env:GEMINI_API_KEY=your_actual_api_key_here

import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
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
    model: "gemini-3.1-flash-lite", //Use whatever model you like, I am using this because this codes are leraning process only so no high level model needed(so api key can used for many calls)
    contents: user,
});

console.log(response.text);
//Run (terminal):node 01-native-call.js