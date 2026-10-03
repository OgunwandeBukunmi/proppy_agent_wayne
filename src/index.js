import 'dotenv/config';

import express from "express";
import cors from "cors";
import morgan from "morgan";

import { runAgent } from "./agent/runtime.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.post("/chat", async (req, res) => {

    try {

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: "Prompt is required"
            });
        }

        const result = await runAgent(prompt);

        console.log(result);

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});