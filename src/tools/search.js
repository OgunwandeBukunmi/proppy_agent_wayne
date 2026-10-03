import axios from "axios";

export async function webSearch(query) {

    const response = await axios.post(
        "https://api.tavily.com/search",
        {
            api_key: process.env.TAVILY_API_KEY,
            query,
            search_depth: "basic",
            max_results: 5
        }
    );

    return response.data.results;
}