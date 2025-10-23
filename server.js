require("dotenv").config(); 
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; //Hidden API key from OpenAi - loaded from .env
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    //Built-in fetch in Node 18+
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant for a design workshop. Give short, clear, and structured answers. Reply in 3-4 bullet points max. Keep each bullet under 15 words." },
            { role: "user", content: userMessage }
        ],
        max_tokens: 200
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data); //log for debugging

    const aiReply = data.choices?.[0]?.message?.content || "⚠️ No reply from AI";
    res.json({ reply: aiReply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "⚠️ Error talking to AI" });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
