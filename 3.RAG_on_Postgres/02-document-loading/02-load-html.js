
import fs from "fs/promises";

// 1. Load the HTML file
const html = await fs.readFile("./company-policy.html","utf-8");

// 2. Display the raw HTML
console.log("HTML loaded successfully!\n");
console.log(html);

// 3. Check the size
console.log("\nCharacter count:", html.length);
