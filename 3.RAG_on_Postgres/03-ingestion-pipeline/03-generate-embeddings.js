import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
import fs from "fs/promises";
import { embedMany } from "ai";
import { google } from "@ai-sdk/google";

// 1. Load the document
const document = await fs.readFile("../02-document-loading/company-policy.txt","utf-8");

const text = document.trim();

// 2. Split the document into chunks
const chunkSize = 100;
const overlap = 20;
const chunks = [];

for (let i = 0; i < text.length; i += chunkSize - overlap) {
  chunks.push(text.slice(i, i + chunkSize));
}

// 3. Generate an embedding for each chunk
const result = await embedMany({
  model: google.textEmbeddingModel("gemini-embedding-001"),
  values: chunks,
});

// 4. Display the results
console.log("Total chunks:", chunks.length);
console.log("Total embeddings:", result.embeddings.length);

chunks.forEach((chunk, index) => {
  console.log(`\nChunk ${index + 1}:`);
  console.log(chunk);

  console.log("Embedding dimensions:", result.embeddings[index].length);
  console.log("First 5 numbers:", result.embeddings[index].slice(0, 5));
});
