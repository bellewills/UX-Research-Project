// Loads environment variables (like API key) from the .env file
require("dotenv").config(); 

// Bring in the main packages used by the server
const express = require("express");
const cors = require("cors");

const app = express();

// Allow requests from the frontend (important when hosted separately)
app.use(cors({
  origin: ["https://bellewills.github.io"], // allows GitHub Pages site to talk to this backend
  methods: ["GET", "POST"]
}));

// Lets the server handle incoming JSON data properly
app.use(express.json());

// Load the OpenAI API key securely from the environment file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Chat endpoint – handles AI chat requests from the frontend
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message; // the text the user sends from the website

    // Sends the user message to OpenAI’s API for a short structured reply
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant for a design workshop. Give short, clear, and structured answers. Reply in 3-4 bullet points max. Keep each bullet under 15 words." 
          },
          { 
            role: "user", 
            content: userMessage 
          }
        ],
        max_tokens: 200
      }),
    });

    // Convert the API’s response into JSON so it can be used
    const data = await response.json();
    console.log("OpenAI response:", data); // just for checking responses in the console

    // Grab the AI’s actual text reply or fallback message if missing
    const aiReply = data.choices?.[0]?.message?.content || "No reply from AI";
    res.json({ reply: aiReply }); // send  reply back to  frontend
  } catch (err) {
    console.error("Server error:", err); // log the full error in console
    res.status(500).json({ reply: "Error talking to AI" }); // send a clear error message to the browser
  }
});

// Start the server - Render will assign a port auto in production
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
