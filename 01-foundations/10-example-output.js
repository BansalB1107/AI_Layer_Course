import "dotenv/config"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const message = "I am very happy with this product."

const result = await generateText({
    model: google("gemini-3.8-flash"),

    prompt: `Classify the following message as either "positive" or "negative".

            Example 1:
            Message: "This product is amazing!"
            Classification: positive

            Example 2:
            Message: "This product is terrible."
            Classification: negative

            Example 3:
            Message: "I really enjoyed using this."
            Classification: positive

            Now classify this message:

            Message:
            ${message}

            Return only the classification.
            `
})

console.log("Output:", result.text)