import "dotenv/config";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const result = await generateObject({
  model: google("gemini-3.8-flash"),

  prompt: "What is JavaScript? Give a simple beginner-friendly answer.",

  schema: z.object({
    question: z.string(),

    answer: z.string(),

    difficulty: z.enum(["easy", "medium", "hard"]),

    topic: z.object({
      name: z.string(),
      category: z.string(),
    }),
  }),
});

console.log(result.object);