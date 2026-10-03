import { askOllama } from "../llm/ollama.js";
import { webSearch } from "../tools/search.js";
import { AgentState } from "../../state/initState.js";
import { askGroq } from "../llm/groq.js";

const tools = {
    search: {
        description: `Search the web for information.
            - Only use it when you need information from the internet.
            # IMPORTANT RULES

            1. If you need information from the internet, call the search tool.

            2. When calling a tool, respond with ONLY valid JSON.

            Example:

            {
                "type": "tool",
                "tool": "search",
                "args": {
                    "query": "Who is Elon Musk?"
                }
            }

            Do NOT include markdown.
            Do NOT wrap the JSON in \`\`\`.
            Do NOT explain your reasoning.
            Return ONLY the JSON object.
        `,
        args: {
            query: "string"
        },
        execute: webSearch,
    },


    // visit_page:{
    //     description:"Visit a webpage and extract its visible text.",
    //     args:{
    //         url:"string"
    //     },
    //     execute:openWebpage
    // }
};

const toolDescriptions = Object.entries(tools)
    .map(([name, tool]) => `
Tool: ${name}

Description:
${tool.description}

Arguments:
${JSON.stringify(tool.args, null, 4)}
`)
    .join("\n");


const SYSTEM_PROMPT = `
You are an autonomous AI agent.

You have access to these tools:

${toolDescriptions}

OPTION 1

If you need more information,
call a tool.

Return:

{
    "type":"tool",
    "tool":"search",
    "args":{
        "query":"..."
    }
}

------------------------------------------------

OPTION 2

If you already have enough information,
finish the task.

Return:

{
    "type":"finish",
    "content":"..."
}

------------------------------------------------

The runtime will execute tool calls.

After every tool call,
you will receive the tool result.

Do NOT call the same tool again unless the new information is insufficient.

If the tool result answers the user's question,
you MUST return a finish response.

Never return plain text.

Never return markdown.

Return exactly ONE valid JSON object.
`;

export async function runAgent(userPrompt) {

    const state = new AgentState(userPrompt);

    state.messages.push({
        role: "system",
        content: SYSTEM_PROMPT
    });

    state.messages.push({
        role: "user",
        content: userPrompt
    });

    while (!state.finished) {
        console.log(state)
        const response = await askGroq(state.messages);

        console.log("\n========== LLM ==========");
        console.log(response);

        let action;

        try {

            action = JSON.parse(response);

        } catch {

            // Model ignored JSON instructions.
            return {
                type: "response",
                content: response
            };

        }

        //         // -----------------------
        //         // FINISH
        //         // -----------------------

        //         if (action.type === "finish") {

        //             state.finished = true;

        //             return {
        //                 type: "response",
        //                 content: action.content
        //             };

        //         }

        //         // -----------------------
        //         // TOOL CALL
        //         // -----------------------

        //         if (action.type === "tool") {

        //             const tool = tools[action.tool].execute;

        //             if (!tool) {

        //                 return {
        //                     type: "error",
        //                     message: `Unknown tool: ${action.tool}`
        //                 };

        //             }

        //             const result = await tool(action.args);

        //             state.toolHistory.push({
        //                 tool: action.tool,
        //                 args: action.args,
        //                 result
        //             });

        //             state.messages.push({
        //                 role: "assistant",
        //                 content: response
        //             });

        //             state.messages.push({
        //                 role: "user",
        //                 content: `
        // Tool "${action.tool}" returned:

        // ${JSON.stringify(result, null, 2)}

        // Continue solving the user's task.
        // `
        //             });

        //             // IMPORTANT:
        //             // We DON'T call askOllama() here.
        //             // The while loop automatically continues.

        //             continue;
        //         }
        console.log(action.type,)
        if (action.type === "finish") {

            state.finished = true;

            return {
                type: "response",
                content: action.content
            };

        } else {
            const tool = tools[action.tool];

            const result = await tool.execute(action.args.query);
            console.log(result)
            state.messages.push({
                role: "assistant",
                content: response
            });

            state.toolHistory.push({
                tool: action.tool,
                args: action.args,
                result
            });

            if (action.tool == "search") {
                const webResults = result.map((searchresult) => `Title :${searchresult.title}\nURL: ${searchresult.url}\nContent: ${searchresult.content}`)

                state.messages.push({
                    role: "user",
                    content: `
                    Tool "${action.tool}" returned:

                    ${webResults.join("\n")}

                    Continue solving the user's task.
                    `
                });

            }
            continue;
        }
    }

}