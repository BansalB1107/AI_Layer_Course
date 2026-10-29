import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { google } from "@ai-sdk/google"
import { generateText, stepCountIs, tool } from "ai"
import z from "zod"
import fs from "fs/promises"
import readline from "readline/promises"
import { stdin, stdout } from "process"

const rl = readline.createInterface({ input: stdin, output: stdout })

async function webData(url) { const data = await fetch(url); return await data.text() }
async function fileInfo(fileName) { const text = await fs.readFile(fileName, 'utf-8'); return text }
function calBill(water, electric) { return (water + electric) * 0.8 }

const webDataTool = tool({
    description: "Use to get details from web", inputSchema: z.object({ url: z.string().describe("Get web text from url") }),
    execute: async ({ url }) => { try { return await webData(url) } catch (error) { return { success: false, error: `Given url "${url}"is not correct or not working` } } }
})
const fileInfoTool = tool({
    description: "Use to get text from File", inputSchema: z.object({ fileName: z.string().describe("Get text from file by fileName ") }),
    execute: async ({ fileName }) => { try { return await fileInfo(fileName) } catch (error) { return { success: false, error: `Given file "${fileName}"is not correct or not working` } } }
})
const calBillTool = tool({
    description: "Use to calulate company bill by water and electric bill", inputSchema: z.object({ water: z.number().describe("Water Bill"), electric: z.number().describe("Electric Bill") }),
    execute: async ({ water, electric }) => { try { return calBill(water, electric) } catch (error) { return { success: false, error: `Water/electric/both values missing` } } }
})
const askUserTool = tool({
    description: "Ask user to get missing information/parameters", inputSchema: z.object({ question: z.string().describe("Ask user question to get parameters/information to complete request") }),
    execute: async ({ question }) => { return { type: "user_input_required", question } }
})

async function saveMemory(key, value) {
    const memory = await fs.readFile("memory.json", "utf-8");
    const data = JSON.parse(memory);
    // Avoid saving the same fact again
    if (data[key] === value) {return {success: true,message: "Memory already exists",};}
    // Add a new memory or update an existing one
    const action = Object.hasOwn(data, key) ? "updated" : "added";
    data[key] = value;
    await fs.writeFile("memory.json",JSON.stringify(data, null, 2));
    return {success: true,action,saved: { [key]: value },};
}
async function deleteMemory(key) {
    const memory = await fs.readFile("memory.json", "utf-8");
    const data = JSON.parse(memory);
    if (!Object.hasOwn(data, key)) {return {success: false,error: `Memory "${key}" does not exist`,};}
    delete data[key];
    await fs.writeFile("memory.json",JSON.stringify(data, null, 2));
    return {success: true,deleted: key,};
}
const saveMemoryTool = tool({
    description: "Save a user fact or preference for future conversations",
    inputSchema: z.object({
        key: z.string().describe("A short name for the memory"),
        value: z.string().describe("The fact or preference to remember")
    }),
    execute: async ({ key, value }) => {
        try { return await saveMemory(key, value); } catch (error) { return { success: false, error: "Could not save memory to memory.json" }; }
    }
});
const deleteMemoryTool = tool({
    description: "Delete a saved user memory when the user asks to forget it", inputSchema: z.object({ key: z.string().describe("The exact key of the memory to delete"), }),
    execute: async ({ key }) => { try { return await deleteMemory(key); } catch (error) { return { success: false, error: "Could not delete memory", }; } },
});
async function readMemory() {
    const memory = await fs.readFile("memory.json", "utf-8");
    return JSON.parse(memory);
}

let messages = []
let summary = ""

mainloop: while (true) {
    const user = await rl.question("You: ")
    messages.push({ role: "user", content: user })
    if (user.toLowerCase().trim() === "exit") { break }

    let oldmessages = messages.slice(0, -4)
    if (oldmessages.length >= 4) {
        const summarize = await generateText({
            model: google("gemini-3.1-flash-lite"),
            system: "Summarize given messages and keep facts and user info",
            messages: oldmessages
        })
        summary = summarize.text
    }
    while (true) {
        const savedMemory = await readMemory();
        let recentmessages = messages.slice(-4)
        const result = await generateText({
            model: google("gemini-3.1-flash-lite"),
            system: `You are a reliable tool agent.
            Never guess or invent answers.
            Never call a tool if its required information is missing.
            Call askUserTool if information is missing.
            If a tool returns success: false, use askUserTool to get the required information.
            If a tool fails, do not invent an answer.
            Saved user memories:
            ${JSON.stringify(savedMemory, null, 2)}
            Conversation summary:
            ${summary}
            Use saved memories when relevant, but never invent memories.
            When the user asks you to remember a fact, use saveMemoryTool.
            When the user changes a saved preference, update the relevant existing key.
            When the user asks you to forget a fact, use deleteMemoryTool.
            Only confirm a save, update, or deletion if the tool reports success: true.
            Never delete a memory unless the user has requested it.
            `,
            messages: recentmessages,
            tools: { webDataTool, fileInfoTool, calBillTool, askUserTool, saveMemoryTool, deleteMemoryTool, },
            stopWhen: stepCountIs(5)
        })
        let askUser = result.steps.flatMap(steps => steps.content).find(item => item.type === "tool-call" && item.toolName === "askUserTool")
        if (askUser) {
            const question = askUser.input.question
            console.log("Agenet: ", question)
            messages.push({ role: "assistant", content: question })
            const user = await rl.question("Give value: ")
            messages.push({ role: "user", content: user })
            if (user.toLowerCase().trim() === "exit") { break mainloop }
            continue
        }
        console.log("Output: ", result.text)
        messages.push({ role: "assistant", content: result.text })
        break
    }
}
rl.close()