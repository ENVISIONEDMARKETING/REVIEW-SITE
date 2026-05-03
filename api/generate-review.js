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

    const openings = [
      "Start with the customer’s experience, not the business name.",
      "Start with how the service made the customer feel.",
      "Start with a detail about the appointment or service.",
      "Start with a simple honest reaction.",
      "Start with the business name naturally.",
      "Start with appreciation for the quality of work.",
      "Start with a comment about professionalism or timing."
    ];

    const tone = tones[Math.floor(Math.random() * tones.length)];
    const openingRule = openings[Math.floor(Math.random() * openings.length)];

    const prompt = `
Write one unique, organic Google review.

Business name: ${name}
Industry: ${industry}
Service: ${service}
Tone: ${tone}
Opening style: ${openingRule}
Variation seed: ${randomSeed}

Rules:
- 25 to 40 words
- Must sound like a real customer
- Mention the business name once
- Do NOT always start with the business name
- Only start with the business name sometimes
- Do not start every review with "${name}"
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

    const review =
      data.output?.[0]?.content?.[0]?.text ||
      `I had a great experience with ${name}. Everything felt smooth, professional, and easy from start to finish.`;

    return res.status(200).json({
      review: review.trim()
    });

  } catch (error) {
    return res.status(200).json({
      review: "API error: " + error.message
    });
  }
}
