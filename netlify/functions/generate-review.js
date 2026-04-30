exports.handler = async function(event) {
  try {
    const { name, industry, service } = JSON.parse(event.body || "{}");

    const prompt = `
Write a short, natural, honest-sounding Google review.

Business name: ${name}
Industry: ${industry}
Service: ${service}

Rules:
- Keep it under 65 words.
- Sound like a real customer.
- Do not sound fake or robotic.
- Do not mention discounts, rewards, free items, or incentives.
- Make it positive but believable.
- Do not say anything extreme like "best ever" unless it sounds natural.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        review: data.output_text
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "AI review generation failed."
      })
    };
  }
};
