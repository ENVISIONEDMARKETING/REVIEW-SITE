export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ review: "API is connected." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { industry, service } = body || {};

    const randomSeed = Math.random().toString(36).substring(2);

    const tones = [
      "casual and simple",
      "warm and friendly",
      "slightly detailed",
      "straightforward and natural",
      "relaxed and conversational"
    ];

    const tone = tones[Math.floor(Math.random() * tones.length)];

    const prompt = `
Write one unique, organic Google review.

Industry: ${industry || "business"}
Service: ${service || "service"}
Tone: ${tone}
Variation seed: ${randomSeed}

Rules:
- 25 to 40 words
- Sound like a real customer
- DO NOT use any business name
- DO NOT start with a company name
- Start with the experience, quality, timing, or professionalism
- Use words like "they", "the team", or "this company"
- Do not sound like an ad
- Do not mention AI, discounts, rewards, or incentives
- Make it different every time
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
        temperature: 1.4,
        max_output_tokens: 200
      })
    });

    const data = await response.json();

    let review =
      data.output?.[0]?.content?.[0]?.text ||
      "They did a great job. Everything felt smooth, professional, and easy from start to finish.";

    review = review
      .replace(/wholesome house cleaning company/gi, "the team")
      .replace(/wholesome house cleaning/gi, "the team")
      .replace(/wholesome/gi, "the team")
      .replace(/\s+/g, " ")
      .trim();

    return res.status(200).json({ review });

  } catch (error) {
    return res.status(200).json({
      review: "API error: " + error.message
    });
  }
}
