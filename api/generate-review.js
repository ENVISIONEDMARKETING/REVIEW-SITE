export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ review: "API is connected." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, industry, service } = body || {};

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

Business name: ${name}
Industry: ${industry}
Service: ${service}
Tone: ${tone}
Variation seed: ${randomSeed}

Rules:
- 45 to 90 words
- Must sound like a real customer
- Mention the business name once
- Include details that match the industry
- Do not sound like an ad
- Do not repeat common review phrases
- Do not mention AI, discounts, rewards, or incentives
- Make it different from the last review
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
        temperature: 1.2,
        max_output_tokens: 200
      })
    });

    const data = await response.json();

    if (!data.output_text) {
      return res.status(200).json({
        review: "AI error: " + JSON.stringify(data).slice(0, 250)
      });
    }

    return res.status(200).json({
      review: data.output_text.trim()
    });

  } catch (error) {
    return res.status(200).json({
      review: "API error: " + error.message
    });
  }
}
