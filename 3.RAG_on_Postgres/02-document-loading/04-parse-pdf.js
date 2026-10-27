//npm install pdf-parse //We'll use pdf-parse, which supports extracting text from PDFs in Node.js. The current v2 API uses PDFParse and its getText() method.

import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

// 1. Load the PDF as binary data
const data = await fs.readFile("./company-policy.pdf");

// 2. Create the PDF parser
const parser = new PDFParse({ data });

// 3. Extract text
try {
  const result = await parser.getText();

  console.log("PDF parsed successfully!\n");
  console.log(result.text);

  console.log("\nCharacter count:", result.text.length);
} finally {
  // 4. Release parser resources
  await parser.destroy();
}
