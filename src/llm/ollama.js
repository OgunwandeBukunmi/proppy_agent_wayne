import axios from "axios";

export async function askOllama(messages) {
    const response = await axios.post(
        "http://localhost:11434/api/chat",
        {
            model: "llama3.1",
            messages,
            stream: false
        }
    );

    return response.data.message.content;
}