import "dotenv/config"

import { google } from "@ai-sdk/google"
import { generateText, stepCountIs, tool } from "ai"
import readline from "readline/promises"
import fs from "fs/promises"
import z from "zod"
import { stdin, stdout } from "process"

const rl = readline.createInterface({
    input: stdin,
    output: stdout
})

function calBill(electric, water) { return (electric + water) * 0.8 }
async function webSearch(url) { const response = await fetch(url); return await response.text() }
async function fileRead(fileName) { const fileInfo = await fs.readFile(fileName, "utf-8"); return fileInfo }

const calBillTool = tool({
    description: "To calculate company bill using water and elecricity bill",
    inputSchema: z.object({
        water: z.number().describe("Water Bill"),
        electric: z.number().describe("Electric Bill")
    }),
    execute: async ({ electric, water }) => { return calBill(electric, water) }
})
const webSearchTool = tool({
    description: "Getting details of given url",
    inputSchema: z.object({ url: z.string().describe("Fetch web details using url") }),
    execute: async ({ url }) => { return webSearch(url) }
})
const fileReadTool = tool({
    description: "Get details from given file name",
    inputSchema: z.object({ fileName: z.string().describe("Fetch details using File name") }),
    execute: async ({ fileName }) => { return fileRead(fileName) }
})

const user = await rl.question("You: ")

const result = await generateText({
    model: google("gemini-3.1-flash-lite"),
    prompt: user,
    tools: { calBillTool, webSearchTool, fileReadTool },
    stopWhen:stepCountIs(5)
})
console.log(result.text)
console.dir(result.steps, { depth: null })
rl.close()

//Research 2-3 lines of the Amazon rainforest using https://en.wikipedia.org/wiki/Amazon_rainforest, using employees.txt tell me the name of the employee who joined earliest, and calculate the company bill if electricity is 10000 and water is 20000.

//Fail:Research 2-3 lines of the Amazon rainforest using https://en.wikipedia.org/wiki/Amazon_rainforest, tell me the name of the employee who joined earliest, and calculate the company bill if electricity is 10000 and water is 20000.
//ai:Regarding the employees, I was unable to determine the employee who joined earliest as the employees.csv file could not be found.
//it checked csv file, becasue I didn't mension the name of file
//You: Give me details about Rahul Sharma from file
//1.Gemini first tried Rahul Sharma as the filename → ❌ failed.
//2.It then tried data.txt → ❌ failed.
//3.Then contacts.txt → ❌ failed.
//4.Then it finally tried employees.txt → ✅ success.
//5.Finally, Gemini produced the correct Rahul Sharma details.