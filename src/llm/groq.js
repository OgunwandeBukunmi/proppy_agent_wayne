import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askGroq(messages) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set in environment variables.");
    }

    const response = await axios.post(
        GROQ_API_URL,
        {
            model: "llama-3.1-8b-instant",
            messages,
            temperature: 0.6,
            max_tokens: 1024,
        },
        {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.choices[0].message.content
}
