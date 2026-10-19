import "dotenv/config"
import {generateText} from "ai"
import {google} from "@ai-sdk/google"
import readline from "readline/promises"
import { stdin, stdout } from "process"

const rl = readline.createInterface({
    input:stdin,
    output:stdout
})

const history = []

while(true){

    const user = await rl.question("You: ")
    if(user.toLowerCase() === "exit"){
        break;
    }
    history.push({
        role:"user",
        content:user
    })
    console.log("User Contenct Pushed in history")
    const startTime=performance.now()
    const result = await generateText({
        model: google("gemini-3.8-flash"),
        messages:history.slice(-4)      //Trimming
    })

    const endTime=performance.now()
    history.push({
        role:"assistant",
        content:result.text
    })
    console.log("Assistant Contenct Pushed in history")
    console.log(history)
    console.log(result.usage)
    console.log("Latency: ", endTime-startTime,"ms")

}

rl.close()