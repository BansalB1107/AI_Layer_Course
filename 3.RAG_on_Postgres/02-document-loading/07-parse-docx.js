//npm install mammoth//A .docx file is a Microsoft Word document. It can contain paragraphs, headings, tables, and other elements. Just like PDFs and HTML.We'll use the mammoth package, which can extract text from Word documents.

import fs from "fs/promises";
import mammoth from "mammoth";

// 1. Read the DOCX file
const data = await fs.readFile("./company-policy.docx");

// 2. Extract text from the Word document
const result = await mammoth.extractRawText({ buffer: data });

// 3. Store the extracted text
const document = result.value.trim();

// 4. Display the extracted text
console.log("DOCX parsed successfully!\n");
console.log(document);

// 5. Display the character count
console.log("\nCharacter count:", document.length);
