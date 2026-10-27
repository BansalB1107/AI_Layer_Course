// npm install cheerio //We'll use Cheerio, a Node.js library that lets us select HTML elements and extract their text without manually removing tags.

import fs from "fs/promises";
import * as cheerio from "cheerio";

// 1. Load the HTML file
const html = await fs.readFile("./company-policy.html","utf-8");

// 2. Parse the HTML
const $ = cheerio.load(html);

// 3. Extract the page title
const title = $("h1").text();

// 4. Extract the main text
const text = $("body").text().trim();

//5. Display the extracted content
console.log("Title:", title);
console.log("\nExtracted text:");
console.log(text);
//console.log($.text()) //All in one