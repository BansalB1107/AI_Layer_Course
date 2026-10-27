import fs from "fs/promises";

// 1. Load the source document
const document = await fs.readFile("../02-document-loading/company-policy.txt","utf-8");

// 2. Prepare the extracted text
const text = document.trim();

// 3. Display the result
console.log("Document loaded successfully!\n");
console.log(text);

// 4. Display basic information
console.log("\nCharacter count:", text.length);
