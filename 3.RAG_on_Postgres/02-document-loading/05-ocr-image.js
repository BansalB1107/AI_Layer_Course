//npm install tesseract.js //Install the Node.js OCR library-OCR stands for Optical Character Recognition. It recognizes text inside images and converts it into machine-readable text.

import { createWorker } from "tesseract.js";

// 1. Create an OCR worker for English
const worker = await createWorker("eng");

try {
  // 2. Read text from the image
  const result = await worker.recognize("./company-policy.png");

  // 3. Display the extracted text
  console.log("OCR completed successfully!\n");
  console.log(result.data.text);

  // 4. Display the extracted text length
  console.log("\nCharacter count:", result.data.text.length);
} finally {
  // 5. Release the OCR worker
  await worker.terminate();
}
