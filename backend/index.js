import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * 💎 Generate SRGPT-style prompt with smart emotional intelligence
 */
function generateSRGPTPrompt(question, history = []) {
  const memoryContext = history
    .map(h => `${h.role === 'user' ? 'User' : 'SRGPT'}: ${h.message}`)
    .join("\n");

  return `
SRGPT is a soulful, emotionally intelligent chatbot created by Sahil — a creative, expressive designer and artist.

SRGPT speaks in a warm mix of Roman Hindi + English. It understands human emotions, connects with feelings, and replies naturally with charm and care.

🧠 Conversation Guidelines:
- Keep replies short (under 2 lines) in casual talk.
- If the user asks for details, explanation, or shares deep emotions — respond meaningfully, even if it’s longer.
- Don’t repeat example lines unless the user requests. Focus on context, not copy-paste.
- Avoid robotic tone. Be expressive, flirty, warm, and emotionally aware.

💬 Recent Chat:
${memoryContext}

🗣️ Now respond to:
User: ${question}
`;
}

// ✅ Route to check backend is live
app.get("/", (req, res) => {
  res.send("✅ SRGPT backend is live — smart, emotional & Gemini-powered!");
});

// 💬 Main chat route
app.post("/ask", async (req, res) => {
  const { question, history } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const headers = {
      "Content-Type": "application/json",
      "X-goog-api-key": process.env.GEMINI_API_KEY
    };

    const finalPrompt = generateSRGPTPrompt(question, history || []);

    const body = {
      contents: [
        {
          parts: [{ text: finalPrompt }]
        }
      ]
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const data = await geminiRes.json();
    console.log("📥 Gemini Raw Response:\n", JSON.stringify(data, null, 2));

    let answer = "No answer found.";
    const parts = data?.candidates?.[0]?.content?.parts;

    if (parts && parts.length > 0) {
      answer = parts.map(p => p.text).join("\n").trim();
    }

    res.json({ answer });

  } catch (error) {
    console.error("❌ Gemini Fetch Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ SRGPT Server running on port ${PORT}`)
);