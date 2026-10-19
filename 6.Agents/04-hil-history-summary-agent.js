import "dotenv/config"
import { google } from "@ai-sdk/google"
import { generateText, stepCountIs, tool } from "ai"
import readline from "readline/promises"
import z from "zod"
import fs from "fs/promises"
import { stdin, stdout } from "process"

const rl = readline.createInterface({ input: stdin, output: stdout })
async function webSearch(url) { const webData = await fetch(url); return await webData.text() }
async function fileInfo(fileName) { const text = await fs.readFile(fileName, 'utf-8'); return text }
function calBill(water, electric) { return (water + electric) * 0.8 }

const webSearchTool = tool({
    description: "Get web details from url",
    inputSchema: z.object({ url: z.string().describe("Fetch web data by given url") }),
    execute: async ({ url }) => { try { return await webSearch(url) } catch (error) { return { success: false, error: `Given url "${url} is not valid or not working"` } } }
})
const fileInfoTool = tool({
    description: "Get file details from given file name",
    inputSchema: z.object({ fileName: z.string().describe("Get file data by given fileName") }),
    execute: async ({ fileName }) => { try { return await fileInfo(fileName) } catch (error) { return { success: false, error: `Given File name "${fileName} is not available"` } } }
})
const calBillTool = tool({
    description: "From given water and electric bill calculate company bill",
    inputSchema: z.object({ water: z.number().describe("water bill"), electric: z.number().describe("electric bill") }),
    execute: async ({ water, electric }) => { try { return calBill(water, electric) } catch (error) { return { success: false, error: `Water bill or electric bill or both is/are not valid or missing"` } } }
})
const askUserTool = tool({
    description: "Use to get user input so user can give missing value to complete the request",
    inputSchema: z.object({ question: z.string().describe("Ask user to get missing information/parameters") }),
    execute: async ({ question }) => { return { type: "user_input_required", question } }
})

let messages = []
let summary = ''

mainloop: while (true) {
    const user = await rl.question("You: ")
    messages.push({ role: "user", content: user })
    if (user.toLowerCase() === "exit") { break }

    let oldmessages = messages.slice(0, -4)

    if (oldmessages.length >= 4) {
        const summarize = await generateText({
            model: google("gemini-3.1-flash-lite"),
            system: "Summarize the given messages, keep facts and user information",
            messages: oldmessages
        })
        summary = summarize.text
    }

    while (true) {
        let recentmessages = messages.slice(-4)
        const result = await generateText({
            model: google("gemini-3.1-flash-lite"),
            system: `You are a reliable tool agent, never guess or invent answers, Never call tool if it's required information is missing, call askUserTool if information is missing
            And if tool returns success : false then do not generate error, Use askUserTool to get information from user, And if tool fails do not invent an answer..
            Also use ${summary} to give user answer.`,
            messages: recentmessages,
            tools: { webSearchTool, fileInfoTool, calBillTool, askUserTool },
            stopWhen: stepCountIs(5)
        })
        const askUser = result.steps.flatMap(step => step.content).find(item => item.type === "tool-call" && item.toolName === "askUserTool")
        if (askUser) {
            const question = askUser.input.question
            console.log("Agent: ", question)
            messages.push({ role: "assistant", content: question })
            const user = await rl.question("Give value: ")
            if (user.toLowerCase() === "exit") { break mainloop }
            messages.push({ role: "user", content: user })
            continue
        }
        console.log("Output: ", result.text)
        messages.push({ role: "assistant", content: result.text })
        break
    }
}
rl.close()