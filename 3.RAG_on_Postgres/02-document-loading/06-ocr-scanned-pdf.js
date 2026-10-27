//npm install pdfjs-dist @napi-rs/canvas //We'll use Mozilla's PDF.js to render PDF pages and @napi-rs/canvas to create PNG images in Node.js. PDF.js handles PDF rendering; Tesseract will handle recognizing the text.

import fs from "fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import { createWorker } from "tesseract.js";

// 1. Load the scanned PDF
const pdfData = await fs.readFile("./scanned-policy.pdf");

const loadingTask = getDocument({
  data: new Uint8Array(pdfData),
  useSystemFonts: false,
  disableFontFace: true,
  verbosity: 0,
});

const pdf = await loadingTask.promise;

// 2. Create the OCR worker
const worker = await createWorker("eng");

try {
  let extractedText = "";

  console.log("Total pages:", pdf.numPages);

  // 3. Process each PDF page
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    console.log(`\nProcessing page ${pageNumber}...`);

    // Get the current page
    const page = await pdf.getPage(pageNumber);

    // Decide the image size
    const viewport = page.getViewport({ scale: 2 });

    // Create a canvas to render the page
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );

    const context = canvas.getContext("2d");

    // Render the PDF page into an image
    await page.render({
      canvasContext: context,
      viewport,
      canvasFactory: {
        create(width, height) {
          const canvas = createCanvas(width, height);

          return {
            canvas,
            context: canvas.getContext("2d"),
          };
        },

        reset(canvasAndContext, width, height) {
          canvasAndContext.canvas.width = width;
          canvasAndContext.canvas.height = height;
        },

        destroy(canvasAndContext) {
          canvasAndContext.canvas.width = 0;
          canvasAndContext.canvas.height = 0;
          canvasAndContext.canvas = null;
          canvasAndContext.context = null;
        },
      },
    }).promise;

    // Convert the rendered page into PNG image data
    const imageBuffer = canvas.toBuffer("image/png");

    // Recognize text in the page image
    const result = await worker.recognize(imageBuffer);

    // Save the extracted text in page order
    extractedText += `\n--- Page ${pageNumber} ---\n`;
    extractedText += result.data.text;

    // Release page resources
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  // 4. Display the final text
  console.log("\nOCR completed successfully!");
  console.log(extractedText);

  console.log("\nCharacter count:", extractedText.length);

  // 5. Save the extracted text
  await fs.writeFile("./scanned-policy-extracted.txt", extractedText);

  console.log("\nExtracted text saved successfully!");
} finally {
  // 6. Release resources
  await worker.terminate();
  await loadingTask.destroy();
}
