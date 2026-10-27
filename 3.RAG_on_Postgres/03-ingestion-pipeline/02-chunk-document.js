
import fs from "fs/promises";

// 1. Load the document
const document = await fs.readFile("../02-document-loading/company-policy.txt","utf-8");

// 2. Clean the text
const text = document.trim();

// 3. Configure chunking
const chunkSize = 100;
const overlap = 20;
const chunks = [];

// 4. Create chunks
for (let i = 0; i < text.length; i += chunkSize - overlap) {
  const chunk = text.slice(i, i + chunkSize);

  if (chunk.length > 0) {
    chunks.push(chunk);
  }
}

// 5. Display the ingestion result
console.log("Ingestion completed successfully!");
console.log("Document characters:", text.length);
console.log("Total chunks:", chunks.length);

chunks.forEach((chunk, index) => {
  console.log(`\nChunk ${index + 1}:`);
  console.log(chunk);
});
