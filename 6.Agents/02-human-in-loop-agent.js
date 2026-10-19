import "dotenv/config"

import { google } from "@ai-sdk/google"
import { generateText, stepCountIs, tool } from "ai"
import readline from "readline/promises"
import fs from "fs/promises"
import z, { success } from "zod"
import { stdin, stdout } from "process"

const rl = readline.createInterface({ input: stdin, output: stdout })

function calBill(electric, water) { return (electric + water) * 0.8 }
async function webSearch(url) { const response = await fetch(url); return await response.text() }
async function fileRead(fileName) { const fileInfo = await fs.readFile(fileName, "utf-8"); return fileInfo }
const calBillTool = tool({
    description: "Calculate company bill using water and electricity bill",
    inputSchema: z.object({ water: z.number().describe("Water Bill"), electric: z.number().describe("Electric Bill") }),
    execute: async ({ electric, water }) => { try{return calBill(electric, water)} catch(error){return {success:false, error:`values "${electric}"or"${water}"or both could not be found`}} }
})
const webSearchTool = tool({
    description: "Get details from a given URL",
    inputSchema: z.object({ url: z.string().describe("URL to fetch") }),
    execute: async ({ url }) => { try{return webSearch(url)} catch(error) { return { success: false, error: `web "${url}" could not be found.` } }}
})
const fileReadTool = tool({
    description: "Get details from a given file name",
    inputSchema: z.object({ fileName: z.string().describe("File name to read") }),
    execute: async ({ fileName }) => {
        try { return await fileRead(fileName) }
        catch (error) { return { success: false, error: `File "${fileName}" could not be found.` } }
    }
})
const askUserTool = tool({
    description: "Ask the user for missing information required to complete the request",
    inputSchema: z.object({ question: z.string().describe("Question to ask the user") }),
    execute: async ({ question }) => { return { type: "user_input_required", question } }
})
const user = await rl.question("You: ")
let messages = [{ role: "user", content: user }]
while (true) {
    const result = await generateText({
        model: google("gemini-3.1-flash-lite"),
        system: ` You are a reliable tool-using agent.
        Never guess or invent information.
        Never call a tool if its required input is missing.
        If required information is missing, use askUserTool.
        If a tool returns success: false, do not simply report the error.
        Use askUserTool to ask the user for the correct information
        needed to recover from the failure.
        Only answer using information provided by the user
        or results returned by tools.
        If a tool fails, do not invent a result.`,
        messages,
        tools: { calBillTool, webSearchTool, fileReadTool, askUserTool },
        stopWhen: stepCountIs(5)
    })
    const askCall = result.steps
        .flatMap(step => step.content)
        .find(item => item.type === "tool-call" && item.toolName === "askUserTool")
    if (askCall) {
        const question = askCall.input.question
        console.log(`Agent: ${question}`)
        const answer = await rl.question("You: ")
        messages.push({ role: "assistant", content: result.text || "" })
        messages.push({ role: "user", content: answer })
        continue    //Stop this iteration and go back to the beginning of the loop.
    }
    console.log(result.text)
    break
}
rl.close()
//Issue:
// PS D:\Task\AI Engineering\1\Practice> node 19.js
// You: You: read details from ugabuga.txt
// Agent: The file "ugabuga.txt" could not be found. Could you please provide the correct filename or check if the file exists?
// You: wa.txt
// The file "wa.txt" could not be found. Please double-check the filename and try again. 
//Basically only one chance to give correct value