export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ review: "Method not allowed." });
    }

    const { name, industry, service } = req.body || {};

    const businessName = name || "this business";
    const businessIndustry = industry || "local business";
    const businessService = service || industry || "service";

    // Random tone variation (this is key 🔥)
    const tones = [
      "casual and laid-back",
      "slightly detailed and thoughtful",
      "short and straight to the point",
      "friendly and conversational",
      "a bit enthusiastic but still realistic"
    ];

    const randomTone = tones[Math.floor(Math.random() * tones.length)];

    const prompt = `
Write ONE realistic Google review.

Business: ${businessName}
Industry: ${businessIndustry}
Service: ${businessService}

Style:
- Tone: ${randomTone}
- Sound like a real person typing naturally
- Not perfect grammar (slight human feel is okay)

Rules:
- 50–100 words
- Mention the business name once naturally
- Include 1–2 details that fit the industry (but don’t overdo it)
- DO NOT sound like an ad
- DO NOT be overly polished
- DO NOT repeat sentence structure
- DO NOT use the same opening every time
- Avoid “I highly recommend” every time (mix it up)
- End naturally, like a real person would
- No fake specifics like prices, names, or exact dates
- No mention of AI, incentives, or being asked to review

Make sure this review feels different from others.
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
        temperature: 1.1, // 🔥 higher = more variation
        max_output_tokens: 180
      })
    });

    const data = await response.json();

    return res.status(200).json({
      review: data.output_text || fallbackReview(businessName)
    });

  } catch (error) {
    return res.status(500).json({
      review: fallbackReview("this business")
    });
  }
}

function fallbackReview(name) {
  return `Had a good experience with ${name}. Everything went smoothly and felt pretty straightforward. Would probably use them again.`;
}
