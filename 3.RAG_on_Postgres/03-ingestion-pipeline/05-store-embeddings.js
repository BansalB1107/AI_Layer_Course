
import dotenv from "dotenv";
import fs from "fs/promises";
import pg from "pg";
import { embedMany } from "ai";
import { google } from "@ai-sdk/google";

// 1. Load environment variables
dotenv.config({ path: "../../.env" });

const { Client } = pg;

// 2. Load the document
const documentName = "company-policy.txt";

const document = await fs.readFile("../02-document-loading/company-policy.txt","utf-8");

const text = document.trim();

// 3. Split the document into chunks
const chunkSize = 100;
const overlap = 20;
const chunks = [];

for (let i = 0; i < text.length; i += chunkSize - overlap) {
  chunks.push(text.slice(i, i + chunkSize));
}

// 4. Generate embeddings for all chunks
const result = await embedMany({
  model: google.textEmbeddingModel("gemini-embedding-001"),
  values: chunks,
});

// 5. Connect to Neon
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from ../../.env");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

try {
  await client.connect();
  console.log("Connected to Neon!");

  // 6. Store each chunk and its embedding
  await client.query("BEGIN");

  for (let i = 0; i < chunks.length; i++) {
    const embedding = `[${result.embeddings[i].join(",")}]`;

    await client.query(
      `INSERT INTO document_chunks
        (document_name, chunk_index, content, embedding)
       VALUES ($1, $2, $3, $4::vector)
       ON CONFLICT (document_name, chunk_index)
       DO UPDATE SET
         content = EXCLUDED.content,
         embedding = EXCLUDED.embedding`,
      [documentName, i + 1, chunks[i], embedding]
    );
  }

  await client.query("COMMIT");

  console.log("Total chunks:", chunks.length);
  console.log("Total embeddings:", result.embeddings.length);
  console.log("Chunks stored successfully!");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Storage failed:", error.message);
} finally {
  await client.end();
}
/*
Verify the stored data Run(Neon SQL Command):
SELECT
  id,
  document_name,
  chunk_index,
  content,
  vector_dims(embedding) AS embedding_dimensions,
  created_at
FROM document_chunks
ORDER BY chunk_index;
*/