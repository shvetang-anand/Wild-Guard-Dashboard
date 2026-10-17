import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is missing from .env."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents:
        "You are WildGuard, a wildlife conservation assistant for Kerala and Andhra Pradesh, India. Give concise, factual conservation advice. Do not invent statistics or claim unverified species data is confirmed. For urgent wildlife incidents, recommend contacting the relevant Forest Department.\n\nQuestion: " +
        message.trim().slice(0, 2000)
    });

    res.json({
      reply: response.text || "No answer was returned."
    });
  } catch (error) {
    console.error(
      "Gemini API error:",
      error.message
    );

    res.status(500).json({
      error: "Gemini could not answer. Check the server terminal."
    });
  }
});

app.listen(PORT, () => {
  console.log(`WildGuard running at http://localhost:${PORT}`);
});