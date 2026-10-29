import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { embed, generateText } from "ai";
import { google } from "@ai-sdk/google";

function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

// -------------------------
// 1. Our cache
// -------------------------

const cache = {
  question: "What is JavaScript?",
  answer:
    "JavaScript is a programming language used to make web pages interactive.",
  embedding: null,
};


// -------------------------
// 2. Create embedding for cached question
// -------------------------

const cachedResult = await embed({
  model: google.textEmbeddingModel("gemini-embedding-001"),
  value: cache.question,
});

cache.embedding = cachedResult.embedding;


// -------------------------
// 3. New question
// -------------------------

const newQuestion = "What is Python?";


// -------------------------
// 4. Create embedding for new question
// -------------------------

const newResult = await embed({
  model: google.textEmbeddingModel("gemini-embedding-001"),
  value: newQuestion,
});


// -------------------------
// 5. Compare embeddings
// -------------------------

const similarity = cosineSimilarity(
  cache.embedding,
  newResult.embedding
);


console.log("Cached question:", cache.question);
console.log("New question:", newQuestion);
console.log("Similarity:", similarity.toFixed(4));
console.log(cache.embedding)
console.log(newResult.embedding)

// -------------------------
// 6. Cache decision
// -------------------------

if (similarity >= 0.75) {

  console.log("CACHE HIT");
  console.log("Answer:", cache.answer);

} else {

  console.log("CACHE MISS");
  console.log("Calling Gemini...");

  const result = await generateText({
    model: google("gemini-3.1-flash-lite"),
    prompt: newQuestion,
  });

  console.log("New answer:", result.text);


  // -------------------------
  // 7. Save new result
  // -------------------------

  cache.question = newQuestion;
  cache.answer = result.text;
  cache.embedding = newResult.embedding;

  console.log("\nCache updated!");
  console.log("Cached question:", cache.question);
}