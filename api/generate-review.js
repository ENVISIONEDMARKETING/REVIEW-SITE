export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ review: "API is connected." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { industry, service } = body || {};

    const randomSeed = Math.random().toString(36).substring(2) + Date.now();

    const prompt = `
Write ONE natural, human-like Google review.

Industry: ${industry || "business"}
Service: ${service || "service"}
Variation seed: ${randomSeed}

Rules:
- 25 to 45 words
- Sound like a real person wrote it
- Do NOT use any business name at all
- Do NOT say "Wholesome House Cleaning Company"
- Do NOT use dashes (— or -)
- Do NOT use repetitive phrases like "highly recommend"
- Do NOT start the same way each time
- Do NOT end the same way each time
- Use natural, casual language (like a real customer)
- Include a small detail about the experience
- Slight imperfections are okay (not too polished)
- Return only the review text
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        temperature: 1.7,
        top_p: 0.95,
        max_output_tokens: 200
      })
    });

    const data = await response.json();

    let review =
      data.output?.[0]?.content?.[0]?.text ||
      "Everything went smooth and the service felt easy from start to finish.";

    // 🔥 HARD CLEAN (guaranteed removal)
    review = review
      .replace(/wholesome house cleaning company/gi, "")
      .replace(/wholesome house cleaning/gi, "")
      .replace(/wholesome/gi, "")
      .replace(/[—-]/g, "") // remove dashes
      .replace(/\s+/g, " ")
      .trim();

    return res.status(200).json({ review });

  } catch (error) {
    return res.status(200).json({
      review: "Everything went smooth and the service felt easy from start to finish."
    });
  }
}
