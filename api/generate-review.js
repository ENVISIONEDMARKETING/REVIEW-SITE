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

    const nameUsageRules = [
      "Do not mention the business name at all.",
      "Refer to them only as 'the team'.",
      "Refer to them only as 'they'.",
      "Refer to them only as 'this company'.",
      "Mention the business name naturally one time only."
    ];

    const tone = tones[Math.floor(Math.random() * tones.length)];
    const nameRule = nameUsageRules[Math.floor(Math.random() * nameUsageRules.length)];

    const prompt = `
Write one unique, organic Google review.

Business name: ${name}
Industry: ${industry || "business"}
Service: ${service || "service"}
Tone: ${tone}
Name rule: ${nameRule}
Variation seed: ${randomSeed}

Rules:
- 25 to 40 words
- Sound like a real customer
- Do NOT always use the business name
- Do NOT repeatedly say "${name}"
- If the name rule says not to mention the business name, do not include it
- Use natural words like "they", "the team", or "this company"
- Include details that match the industry
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
        temperature: 1.3,
        max_output_tokens: 200
      })
    });

    const data = await response.json();

    let review =
      data.output?.[0]?.content?.[0]?.text ||
      "They did a great job. Everything felt smooth, professional, and easy from start to finish.";

    // HARD FIX: remove repeated business name if AI keeps using it
    if (name) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nameRegex = new RegExp(escapedName, "gi");

      const matches = review.match(nameRegex);

      // If name appears more than once, remove all extra mentions
      if (matches && matches.length > 1) {
        let first = true;
        review = review.replace(nameRegex, function(match) {
          if (first) {
            first = false;
            return match;
          }
          return "they";
        });
      }

      // Sometimes remove the name completely for variety
      if (Math.random() < 0.6) {
        review = review.replace(nameRegex, "they");
      }
    }

    review = review
      .replace(/\s+/g, " ")
      .replace(/\bthey\s+they\b/gi, "they")
      .replace(/\bThey\s+they\b/g, "They")
      .trim();

    return res.status(200).json({
      review
    });

  } catch (error) {
    return res.status(200).json({
      review: "API error: " + error.message
    });
  }
}
