export default async function handler(req, res) {
  console.log("✅ /api/chat endpoint hit"); // debug line

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  ...
}
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { userMessage } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or your assistant ID
      messages: [{ role: "user", content: userMessage }],
    });

    res.status(200).json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    res.status(500).json({ error: "Failed to contact OpenAI" });
  }
}
