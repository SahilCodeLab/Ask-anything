import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Gemini AI backend is live!");
});

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const headers = {
      "Content-Type": "application/json",
      "X-goog-api-key": process.env.GEMINI_API_KEY
    };

    const body = {
      contents: [
        {
          parts: [
            { text: question }
          ]
        }
      ]
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: headers,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));