
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ review: "API is connected." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { industry, service } = body || {};

    const randomSeed = Math.random().toString(36).substring(2) + Date.now();

    // RANDOM REVIEW VARIATION SYSTEM
    const styles = [
      "very casual and conversational",
      "short and direct",
      "warm and appreciative",
      "matter of fact",
      "slightly enthusiastic",
      "relaxed like someone typing on their phone",
      "detail focused",
      "brief storytelling style",
      "simple and understated",
      "friendly with slightly imperfect conversational grammar",
      "confident but casual",
      "low key and natural",
      "personal and observational",
      "quick and spontaneous"
    ];

    const perspectives = [
      "focus mostly on the result",
      "focus mostly on communication",
      "focus mostly on how easy the experience felt",
      "focus on one small memorable detail",
      "focus mostly on professionalism",
      "focus mostly on speed and convenience",
      "focus mostly on how the service solved the problem",
      "focus on the overall experience without listing everything",
      "focus on an unexpected positive detail",
      "focus on how smooth the appointment felt",
      "focus on the quality of the completed service",
      "focus on the interaction during the service"
    ];

    const structures = [
      "a short sentence, a longer sentence, and a medium sentence in each paragraph",
      "three conversational sentences with varied lengths per paragraph",
      "a detailed sentence followed by two shorter sentences per paragraph",
      "three sentences that build naturally on each other per paragraph",
      "a short observation, a detailed thought, and a casual ending per paragraph",
      "a medium sentence, a short sentence, and a longer sentence per paragraph",
      "six sentences with noticeably varied lengths across two paragraphs",
      "three relaxed conversational sentences in each paragraph",
      "two medium sentences followed by one short sentence per paragraph",
      "a longer opening sentence followed by two natural observations per paragraph"
    ];

    const openings = [
      "begin immediately with a detail about the experience",
      "begin with the result",
      "begin with something that surprised the writer",
      "begin with the original problem",
      "begin casually without introducing the service",
      "begin with a specific observation",
      "begin with what stood out most",
      "begin with how the appointment went",
      "begin with what the writer noticed first",
      "begin with a reaction to the finished result",
      "begin in the middle of the experience instead of giving an introduction",
      "begin with a simple conversational statement"
    ];

    const endings = [
      "end with a simple observation",
      "end with a short positive reaction",
      "end by mentioning the result",
      "end casually without recommending anything",
      "end with a detail about how the experience felt",
      "end with a brief statement about the completed service",
      "end naturally as if the writer simply finished their thought",
      "end with a small detail rather than a broad compliment"
    ];

    const detailTypes = [
      "mention a small detail about timing",
      "mention a small detail about communication",
      "mention a small detail about the work itself",
      "mention a small detail about cleanliness or organization",
      "mention a small detail about explaining something",
      "mention a small detail about the appointment",
      "mention a small detail about the finished result",
      "mention a small detail about how simple the process felt"
    ];

    const pickRandom = (array) =>
      array[Math.floor(Math.random() * array.length)];

    const selectedStyle = pickRandom(styles);
    const selectedPerspective = pickRandom(perspectives);
    const selectedStructure = pickRandom(structures);
    const selectedOpening = pickRandom(openings);
    const selectedEnding = pickRandom(endings);
    const selectedDetail = pickRandom(detailTypes);

    const prompt = `
Write ONE fictional sample Google review style text.

Industry: ${industry || "business"}
Service: ${service || "service"}

Variation seed: ${randomSeed}

For THIS review specifically use:

Writing style: ${selectedStyle}
Main perspective: ${selectedPerspective}
Sentence structure: ${selectedStructure}
Opening approach: ${selectedOpening}
Ending approach: ${selectedEnding}
Small detail approach: ${selectedDetail}

STRICT RULES:

- 55 to 85 words total
- Write exactly 6 sentences
- Organize the review into exactly 2 paragraphs
- Each paragraph MUST contain exactly 3 sentences
- Separate the two paragraphs with one blank line
- Make the transition between paragraphs sound natural
- Sound like a real person naturally typing their thoughts
- Make the wording and sentence pattern noticeably different every generation
- Do NOT use any business name
- Do NOT use "wholesome" or anything similar
- Do NOT use dashes
- Do NOT use repetitive phrases
- Every review must begin differently
- Every review must end differently
- Do not repeatedly use the same sentence structure
- Include one small concrete detail about the experience
- Do not overload the review with details
- Use natural everyday language
- Slight conversational imperfections are okay
- Sometimes use contractions when natural
- Do not make every review overly enthusiastic
- Do not make every review sound perfectly polished
- Do not make every review sound like marketing copy
- Do not automatically recommend the business
- Do not automatically mention that you would use them again
- Avoid generic filler

NEVER USE THESE PHRASES:

- highly recommend
- great service
- amazing service
- excellent service
- amazing experience
- excellent experience
- went above and beyond
- couldn't be happier
- could not be happier
- from start to finish
- top notch
- five stars
- definitely recommend
- would highly recommend
- super professional
- very professional and friendly
- fast and efficient
- quick and efficient

IMPORTANT VARIATION RULE:

Do not fall into the common review format of:
problem + arrival + professionalism + completed work + recommendation.

Choose a different natural flow based on the randomly selected instructions above.

Return ONLY the review text.
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
        temperature: 1.8,
        top_p: 0.95,
        max_output_tokens: 250
      })
    });

    const data = await response.json();

    let review =
      data.output?.[0]?.content?.[0]?.text ||
      "The appointment was easy to arrange. Communication was clear. The work was completed as discussed. Everything looked organized afterward. The result matched what I expected. The process felt straightforward.";

    // HARD KILL LIST
    const replacements = [
      "they",
      "the crew",
      "the staff",
      "this company",
      "the workers",
      "these guys"
    ];

    const randomReplacement = pickRandom(replacements);

    review = review
      .replace(/saint wholesome house cleaning company/gi, randomReplacement)
      .replace(/wholesome house cleaning company/gi, randomReplacement)
      .replace(/wholesome house cleaning/gi, randomReplacement)
      .replace(/wholesome/gi, randomReplacement)
      .replace(/saint/gi, "")
      .replace(/[—-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // FORCE 6 SENTENCES INTO 2 PARAGRAPHS
    // Exactly 3 sentences in each paragraph

    const sentences = review
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map(sentence => sentence.trim())
      .filter(Boolean) || [];

    if (sentences.length === 6) {
      review = [
        sentences.slice(0, 3).join(" "),
        sentences.slice(3, 6).join(" ")
      ].join("\n\n");
    } else {
      // Preserve the generated text if sentence count differs.
      // Separate near the midpoint rather than cutting off text.
      const midpoint = Math.ceil(sentences.length / 2);

      if (sentences.length >= 2) {
        review = [
          sentences.slice(0, midpoint).join(" "),
          sentences.slice(midpoint).join(" ")
        ].join("\n\n");
      }
    }

    return res.status(200).json({ review });

  } catch (error) {
    return res.status(200).json({
      review: "The appointment was easy to arrange. Communication was clear. Everything was explained beforehand.\n\nThe work was completed as discussed. The finished result looked organized. The process felt straightforward."
    });
  }
}
