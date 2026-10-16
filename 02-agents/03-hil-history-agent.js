import "dotenv/config"
import { google } from "@ai-sdk/google"
import { generateText, stepCountIs, tool } from "ai"
import fs from "fs/promises"
import z from "zod"
import readline from "readline/promises"
import { stdin, stdout } from "process"

const rl = readline.createInterface({ input: stdin, output: stdout })

async function fileRead(fileName) {
    const text = await fs.readFile(fileName, "utf-8")
    return text
}
async function webData(url) {
    const data = await fetch(url)
    return await data.text()
}
function companyBill(electric, water) {
    return (electric + water) * 0.8
}
const fileReadTool = tool({
    description: "Use to get data from given file name",
    inputSchema: z.object({ fileName: z.string().describe("fileName to read") }),
    execute: async ({ fileName }) => { try { return await fileRead(fileName) } catch (error) { return { success: false, error: `Given file name "${fileName} is not available"` } } }
})
const webDataTool = tool({
    description: "Use to get data from given web url",
    inputSchema: z.object({ url: z.string().describe("by url fetch web data") }),
    execute: async ({ url }) => { try { return await webData(url) } catch (error) { return { success: false, error: `Given url "${url}" is not working` } } }
})
const companyBillTool = tool({
    description: "Use to get Company Bill from water and electric bill",
    inputSchema: z.object({ electric: z.number().describe("electric bill"), water: z.number().describe("water bill") }),
    execute: async ({ electric, water }) => { try { return companyBill(electric, water) } catch (error) { return { success: false, error: `You need to provide electric and water bill` } } }
})
const askUserTool = tool({
    description: "Use to get user input so user can give missing value to complete the request",
    inputSchema: z.object({ question: z.string().describe("Question to ask the user") }),
    execute: async ({ question }) => { return { type: "user_input_required", question } }
})
let messages=[]
while (true) {
    const user = await rl.question("You: ")
    if (user.toLowerCase() === 'exit') { break }
    messages = [{ role: "user", content: user }]
    while (true) {
        const result = await generateText({
            model: google("gemini-3.1-flash-lite"),
            system: `You are a reliable tool agent, never guess or invent answers, Never call tool if it's required information is missing, call askUserTool if information is missing
            And if tool returns success : false then do not generate error, Use askUserTool to get information from user, And if tool fails do not invent an answer.`,
            messages,
            tools: { fileReadTool, webDataTool, companyBillTool, askUserTool },
            stopWhen: stepCountIs(5)
        })
        const askCall = result.steps
            .flatMap(step => step.content)
            .find(item => item.type === 'tool-call' && item.toolName === 'askUserTool')

        if (askCall) {
            const question = askCall.input.question
            console.log(`Agent: ${question}`)
            const user = await rl.question("Provide Value: ")
            messages.push({ role: "assistant", content: result.text })
            messages.push({ role: "user", content: user })
            continue
        }
        console.log("Output: ", result.text)
        messages.push({ role: "assistant", content: result.text })
        break
    }
}
rl.close()

/*Best Exmaple:
PS D:\Task\AI Engineering\1\Practice> node 20.js 
You: Give detaial about hi.txt
Agent: The file "hi.txt" was not found. Could you please provide the correct file name or path?
Provide Value: hello.txt
Output:  The file "hello.txt" is not available. Please provide the correct file name.
You: employee.txt and also count company bill if watr bill is 5000
Agent: The file 'employee.txt' was not found. Please provide the correct file name. Also, I need the electric bill amount to calculate the company bill, as the water bill is 5000. Could you please provide the electric bill amount?
Provide Value: employees.txt, and electric bill is 5000 also, and also privide 2-3 lines of details from this web https://en.wikipedia.org/wiki/Amazon_rainforest
Output:  Here are the details from the file `employees.txt`:

*   **Rahul Sharma**: Salary 65000, Joined 2022
*   **Priya Patel**: Salary 72000, Joined 2021
*   **Arjun Mehta**: Salary 58000, Joined 2024
*   **Neha Shah**: Salary 81000, Joined 2020
*   **Karan Desai**: Salary 60000, Joined 2023

Based on your input of a water bill of 5000 and an electric bill of 5000, the total company bill is **8000**.

***

### Amazon Rainforest Details
*   The Amazon rainforest is a moist broadleaf tropical rainforest in the Amazon biome that covers most of the Amazon basin of South America.
*   The region includes territory belonging to nine nations (Brazil, Peru, Colombia, Bolivia, Ecuador, French Guiana, Guyana, Suriname, and Venezuela) and 3,344 indigenous territories.
*   The Amazon represents over half of the total area of remaining rainforests on Earth and is the world's largest and most biodiverse tropical rainforest.
You: exit


Main concepts:
Tool calling: it reads employee data, calculates the bill, and fetches web content.

Human-in-the-loop: it asks you for missing information or a corrected filename.

Multi-step reasoning: it uses your follow-up message to continue the task.

Conversation messages: it adds assistant and user messages to messages so the next model call can use that context.

Error recovery: a failed file read doesn't end the whole application; you can continue at the next You: prompt.
*/