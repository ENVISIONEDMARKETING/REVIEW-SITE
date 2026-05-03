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

    // ✅ Only allow company name sometimes
    const allowBusinessName = Math.random() < 0.25;

    const businessLine = allowBusinessName
      ? `Business name: ${name}`
      : `Business name: Do not use the business name in this review.`;

    const prompt = `
Write one unique, organic Google review.

${businessLine}
Industry: ${industry || "business"}
Service: ${service || "service"}
Tone: ${tone}
Variation seed: ${randomSeed}

Rules:
- 25 to 40 words
- Sound like a real customer
- Do NOT sound like an ad
- Do NOT mention AI, discounts, rewards, or incentives
- Include details that match the industry
- Use natural words like "they", "the team", or "this company"
- If told not to use the business name, do not include it at all
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
        temperature: 1.3,
        max_output_tokens: 200
      })
    });

    const data = await response.json();

    let review =
      data.output?.[0]?.content?.[0]?.text ||
      "They did a great job. Everything felt smooth, professional, and easy from start to finish.";

    // ✅ Hard remove company name 75% of the time
    if (name && !allowBusinessName) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nameRegex = new RegExp(escapedName, "gi");

      review = review.replace(nameRegex, "they");
    }

    review = review
      .replace(/\s+/g, " ")
      .replace(/\bthey was\b/gi, "they were")
      .replace(/\bthey did\b/gi, "They did")
      .replace(/\bthey were\b/gi, "They were")
      .trim();

    return res.status(200).json({ review });

  } catch (error) {
    return res.status(200).json({
      review: "API error: " + error.message
    });
  }
}
