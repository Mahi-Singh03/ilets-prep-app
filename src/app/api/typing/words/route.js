import { NextResponse } from "next/server";

const fallbackWords = [
  {
    word: "analysis",
    topic: "Academic Writing",
    partOfSpeech: "noun",
    meaning: "a careful study of something in order to understand it",
    example: "The analysis of the survey results reveals a clear pattern.",
    collocation: "in-depth analysis",
    category: "academic"
  },
  {
    word: "significant",
    topic: "Society",
    partOfSpeech: "adjective",
    meaning: "important or meaningful enough to have an effect",
    example: "There is a significant rise in public concern about pollution.",
    collocation: "significant impact",
    category: "society"
  },
  {
    word: "maintain",
    topic: "Education",
    partOfSpeech: "verb",
    meaning: "to keep something in existence or continue it",
    example: "Schools should maintain high standards of discipline.",
    collocation: "maintain balance",
    category: "education"
  },
  {
    word: "regulate",
    topic: "Government",
    partOfSpeech: "verb",
    meaning: "to control or manage according to rules",
    example: "The government plans to regulate online advertisements.",
    collocation: "regulate activity",
    category: "government"
  },
  {
    word: "consequently",
    topic: "Cause and Effect",
    partOfSpeech: "adverb",
    meaning: "as a result",
    example: "The roads became crowded, consequently travel times increased.",
    collocation: "and consequently",
    category: "linking"
  },
  {
    word: "enhance",
    topic: "Technology",
    partOfSpeech: "verb",
    meaning: "to improve or increase the value, quality, or attractiveness of something",
    example: "Online learning can enhance students' communication skills.",
    collocation: "enhance performance",
    category: "technology"
  },
  {
    word: "evaluate",
    topic: "Research",
    partOfSpeech: "verb",
    meaning: "to judge or calculate the quality, importance, amount, or value of something",
    example: "The report evaluates the effect of the new policy.",
    collocation: "evaluate progress",
    category: "research"
  },
  {
    word: "obstacle",
    topic: "Development",
    partOfSpeech: "noun",
    meaning: "something that blocks progress or makes success difficult",
    example: "Funding remains the main obstacle for many small businesses.",
    collocation: "major obstacle",
    category: "development"
  },
  {
    word: "sustainable",
    topic: "Environment",
    partOfSpeech: "adjective",
    meaning: "able to continue for a long time without causing damage",
    example: "Cleaner energy is essential for a sustainable future.",
    collocation: "sustainable development",
    category: "environment"
  },
  {
    word: "allocate",
    topic: "Economics",
    partOfSpeech: "verb",
    meaning: "to divide and give something for a particular purpose",
    example: "The city should allocate more resources to public health.",
    collocation: "allocate funds",
    category: "economics"
  }
];

function cleanGeminiJson(text) {
  if (!text || typeof text !== "string") {
    return fallbackWords;
  }

  try {
    const withoutFence = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const start = withoutFence.indexOf("[");
    const end = withoutFence.lastIndexOf("]");
    if (start >= 0 && end > start) {
      const parsed = JSON.parse(withoutFence.slice(start, end + 1));
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    const clean = withoutFence.replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    return fallbackWords;
  }
}

async function generateWordsFromGemini() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return { words: fallbackWords, source: "curated" };
  }

  const model = process.env.GOOGLE_MODEL || "gemini-2.5-flash";
  const prompt = `Return a valid JSON array of exactly 12 IELTS writing vocabulary words. Each object must include: word, topic, partOfSpeech, meaning, example, collocation, category. Use only words that are useful for IELTS Writing Task 1 and Task 2. Make topics relevant to common IELTS writing themes such as education, technology, health, environment, economy, society, culture, work, and urban life. Keep the wording simple but academically appropriate. Do not add any commentary or markdown.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      return { words: fallbackWords, source: "curated" };
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { words: fallbackWords, source: "curated" };
    }

    const parsed = cleanGeminiJson(text);
    if (Array.isArray(parsed) && parsed.length >= 8) {
      return { words: parsed.slice(0, 12), source: "gemini" };
    }
  } catch (error) {
    console.warn("Gemini typing word setup failed:", error);
  }

  return { words: fallbackWords, source: "curated" };
}

export async function GET() {
  const payload = await generateWordsFromGemini();
  return NextResponse.json(payload);
}

export async function POST() {
  const payload = await generateWordsFromGemini();
  return NextResponse.json(payload);
}
