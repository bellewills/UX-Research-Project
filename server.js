// Loads environment variables (like API key) from the .env file
require("dotenv").config();

// Bring in the main packages used by the server
const express = require("express");
const cors = require("cors");

const app = express();

// Allow requests from the frontend (important when hosted separately)
app.use(cors({
  origin: ["https://bellewills.github.io"], // allow GitHub Pages to talk to this backend
  methods: ["GET", "POST"],
}));

// Lets the server handle incoming JSON data properly
app.use(express.json());

// Load the OpenAI API key securely from the environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Small healthcheck so I can see if Render is up
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Chat endpoint – handles AI chat requests from the frontend
app.post("/chat", async (req, res) => {
  try {
    // Prefer full conversation memory if provided by the client.
    // Fallback: if only a single message is sent, wrap it so the API still works.
    const incoming = req.body?.messages;
    const single = (req.body?.message ?? "").toString();

    const messages = Array.isArray(incoming) && incoming.length
      ? incoming
      : [
          {
            role: "system",
            content:
              "You are a helpful assistant for a design workshop. Give short, clear, " +
              "and structured answers. Reply in 3–4 bullet points max. Keep each bullet under 15 words.",
          },
          { role: "user", content: single },
        ];

    // Send to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,      // forward the whole conversation if present
        max_tokens: 200,
      }),
    });

    // Parse API response
    const data = await response.json();
    // If OpenAI returns an error, surface something readable to the client
    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(502).json({ reply: "Upstream AI error. Please try again." });
    }

    // Return the assistant's content
    const aiReply = data.choices?.[0]?.message?.content || "No reply from AI";
    res.json({ reply: aiReply });
  } catch (err) {
    // Log full error server-side; keep client message simple
    console.error("Server error:", err);
    res.status(500).json({ reply: "Error talking to AI" });
  }
});

// Start the server – Render sets PORT in production
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
