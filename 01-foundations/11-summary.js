import "dotenv/config"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import Readline from "readline/promises"
import { stdin, stdout } from "process"

const rl = Readline.createInterface({
    input: stdin,
    output: stdout
})

let summary = ""
const history = []

while (true) {
    const user = await rl.question("You: ")
    if (user.toLocaleLowerCase() === "exit") {
        break;
    }
    history.push({
        role: "user",
        content: user
    })
    console.log("User History Pushed")

    const oldHistory = history.slice(0, -4)
    const recentHistory = history.slice(-4)

    const startTime = performance.now()


    if (oldHistory.length > 0) {
        const summaryResult = await generateText({
            model: google("gemini-3.5-flash-lite"),
            system: "Summarize the conversation below. Keep important facts and user information.",
            messages: oldHistory
        })

        summary = summaryResult.text
    }

    console.log("Oveall Summarry generation done")

    const result = await generateText({
        model: google("gemini-3.8-flash"),
        system: `Use the following conversation summary as context when answering the user: ${summary}`,
        messages: recentHistory
    })
    const endTime = performance.now()
    history.push({
        role: "assistant",
        content: result.text
    })

    console.log("Assistant History Pushed")

    console.log("Output: ", result.text)
    console.log(result.usage)
    console.log("Letency: ", endTime - startTime, "ms")

}

rl.close()