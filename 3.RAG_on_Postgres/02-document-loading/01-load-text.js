//cd 3.RAG_on_Postgres
//cd 02-document-loading
import fs from "fs/promises";

// 1. Load the document from the current folder
const document = await fs.readFile(
  "./company-policy.txt",
  "utf-8"
);

// 2. Display the extracted text
console.log("Document loaded successfully!\n");
console.log(document);

// 3. Check the document size
console.log("\nCharacter count:", document.length);
