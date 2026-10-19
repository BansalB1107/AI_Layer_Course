import "dotenv/config";
import { generateText, tool, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const orders = {
  101: {
    product: "Laptop",
    status: "shipped",
    price: 75000,
  },
  102: {
    product: "Keyboard",
    status: "delivered",
    price: 2500,
  },
  103: {
    product: "Mouse",
    status: "processing",
    price: 1200,
  },
};

function lookupOrder(orderId) {
  return orders[orderId];
}

const lookupOrderTool = tool({
  description: "Look up an order by its order ID.",

  inputSchema: z.object({
    orderId: z.number().describe("The ID of the order to look up."),
  }),

  execute: async ({ orderId }) => {
    return lookupOrder(orderId);
  },
});

const result = await generateText({
  model: google("gemini-3.8-flash"),
  prompt: "What is the product of order 101?",
  tools: {
    lookupOrder: lookupOrderTool,
  },
  stopWhen: stepCountIs(5),
});

console.log(result.text);