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

    // Only allow business name 10% of the time
    const allowBusinessName = Math.random() < 0.10;

    const prompt = `
Write one unique, organic Google review.

Industry: ${industry || "business"}
Service: ${service || "service"}
Tone: ${tone}
Variation seed: ${randomSeed}

Business name: ${allowBusinessName ? name : "DO NOT USE THE BUSINESS NAME"}

Rules:
- 25 to 40 words
- Sound like a real customer
- DO NOT start with the business name
- Start with the experience, service, timing, quality, or professionalism
- Use words like "they", "the team", or "this company"
- If the business name is allowed, mention it later in the review, never first
- If business name says DO NOT USE, do not include it at all
- Do not sound like an ad
- Do not mention AI, discounts, rewards, or incentives
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

    // Hard remove the business name if not allowed
    if (name && !allowBusinessName) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nameRegex = new RegExp(escapedName, "gi");
      review = review.replace(nameRegex, "the team");
    }

    // If it starts with business name, force rewrite beginning
    if (name) {
      const lowerReview = review.toLowerCase().trim();
      const lowerName = name.toLowerCase().trim();

      if (lowerReview.startsWith(lowerName)) {
        review = review.replace(new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "They");
      }
    }

    review = review
      .replace(/\s+/g, " ")
      .replace(/\bthe team was\b/gi, "the team was")
      .replace(/\bthe team were\b/gi, "the team was")
      .trim();

    return res.status(200).json({ review });

  } catch (error) {
    return res.status(200).json({
      review: "API error: " + error.message
    });
  }
}
