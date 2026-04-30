export default async function handler(req, res) {
  try {
    const { name, industry, service } = req.body || {};

    const businessName = name || "this business";
    const businessIndustry = industry || "local business";
    const businessService = service || industry || "service";

    const prompt = `
Write ONE realistic Google review.

Business name: ${businessName}
Business industry/type: ${businessIndustry}
Service/type of work: ${businessService}

Make the review sound like a real customer wrote it after a real experience.

Rules:
- 45 to 85 words
- Sound organic, casual, and human
- Mention the business name naturally only once
- Include details that fit the industry
- Do not sound fake, robotic, overly perfect, or salesy
- Do not mention AI, automation, discounts, free items, gifts, or incentives
- Do not make claims that are too specific unless they fit the industry
- Make each review feel unique
- Avoid repeating the same sentence structure
- Use natural wording and slight personality
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
        temperature: 0.9
      })
    });

    const data = await response.json();

    res.status(200).json({
      review: data.output_text || "I had a great experience. Everything was handled professionally, the process felt smooth, and I’d definitely recommend them."
    });

  } catch (error) {
    res.status(500).json({
      review: "I had a great experience. Everything was handled professionally, the process felt smooth, and I’d definitely recommend them."
    });
  }
}
