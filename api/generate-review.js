export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ review: "API is connected." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, industry, service } = body || {};

    const randomSeed = Math.random().toString(36).substring(2) + Date.now();

    const prompt = `
Write ONE original, organic Google review.

Business name: ${name || "Do not use a business name"}
Industry: ${industry || "business"}
Service: ${service || "service"}
Random variation seed: ${randomSeed}

Rules:
- 25 to 45 words
- Sound like a real customer, not an ad
- Use natural everyday language
- Create a completely different beginning and ending every time
- Do NOT use template-style openings or closings
- Do NOT start with the business name
- Only mention the business name if it feels natural, and never at the beginning
- Do NOT use dashes, hyphens, or symbols like — or -
- Do NOT use overly polished or formal writing
- Avoid repeating phrases from previous reviews
- Do not mention AI, discounts, rewards, or incentives
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
      "Everything went smooth and the service was solid from start to finish.";

    // 🔥 HARD CLEAN (removes AI-style formatting)
    review = review
      .replace(/[—-]/g, "") // remove dashes
      .replace(/\s+/g, " ")
      .replace(/^["']|["']$/g, "")
      .trim();

    return res.status(200).json({ review });

  } catch (error) {
    return res.status(200).json({
      review: "API error: " + error.message
    });
  }
}
