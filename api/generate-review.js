export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ review: "API is connected. Use the Generate Review button." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, industry, service } = body || {};

    const businessName = name || "this business";
    const businessIndustry = industry || "local business";
    const businessService = service || industry || "service";

    const prompt = `
Write one organic, realistic Google review.

Business name: ${businessName}
Industry: ${businessIndustry}
Service: ${businessService}

Make it sound like a real person.
Make it different every time.
Use natural wording.
45-90 words.
Mention the business name once.
Include details that fit the industry.
Do not mention AI, discounts, rewards, or incentives.
Do not sound like an ad.
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
        temperature: 1.1,
        max_output_tokens: 180
      })
    });

    const data = await response.json();

    return res.status(200).json({
      review: data.output_text || "I had a good experience with this business. Everything felt smooth, professional, and easy to work with."
    });

  } catch (error) {
    return res.status(200).json({
      review: "I had a good experience with this business. Everything felt smooth, professional, and easy to work with."
    });
  }
}
