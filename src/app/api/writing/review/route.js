import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const fallbackModel = "gemini-2.5-flash";

const reviewShape = {
  wordCount: 0,
  criterionScores: {
    task: 0,
    coherence: 0,
    vocabulary: 0,
    grammar: 0,
  },
  average: 0,
  finalBand: 0,
  confidence: "Low",
  criteria: {
    task: { evidence: [], strengths: [], weaknesses: [] },
    coherence: { evidence: [], strengths: [], weaknesses: [] },
    vocabulary: { evidence: [], strengths: [], weaknesses: [] },
    grammar: { evidence: [], strengths: [], weaknesses: [] },
  },
  paragraphAnalysis: [],
  sentenceAnalysis: [],
  vocabularyAnalysis: {
    advanced: [],
    repetitive: [],
    collocations: [],
    informal: [],
    alternatives: [],
    missingTopicVocabulary: [],
  },
  grammarAnalysis: [],
  taskAnalysis: [],
  improvedAnswer: "",
  improvements: [],
  estimatedBandAfterImprovements: 0,
  notHigherBand: [],
};

const reviewSchema = `
Return ONLY valid JSON matching this shape. Do not wrap it in markdown:
${JSON.stringify(reviewShape, null, 2)}

Rules for the JSON:
- Use numbers from 0 to 9 in criterionScores, average, finalBand, and estimatedBandAfterImprovements. Use only 0.5 increments for bands.
- confidence must be exactly High, Medium, or Low.
- evidence, strengths, weaknesses, grammarAnalysis, taskAnalysis, improvements, and notHigherBand are arrays of concise strings.
- paragraphAnalysis must contain one object per paragraph with paragraph, bandEstimate, strengths, and weaknesses.
- sentenceAnalysis must contain one object per sentence with sentence, grammar, vocabulary, coherence, bandEstimate, and corrections.
- vocabularyAnalysis fields must be arrays of concise strings.
- improvedAnswer must be a complete corrected version of the candidate answer, preserving the original ideas while fixing language and organisation.
- Identify concrete mistakes from the essay. Do not invent errors that are not present.
`;

function cleanJsonResponse(text) {
  const withoutFence = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Gemini returned an invalid review format.");
  }

  return JSON.parse(withoutFence.slice(start, end + 1));
}

export async function POST(request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "Gemini review is not configured. Add GOOGLE_API_KEY to .env.local." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { essay, taskType, question, wordCount } = body;

    if (typeof essay !== "string" || !essay.trim()) {
      return NextResponse.json({ message: "A written answer is required." }, { status: 400 });
    }

    if (![1, 2].includes(Number(taskType)) || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ message: "A valid IELTS task and question are required." }, { status: 400 });
    }

    const promptPath = path.join(process.cwd(), "src", "prompt", "band.md");
    const examinerPrompt = await readFile(promptPath, "utf8");
    const taskName = Number(taskType) === 1 ? "Task 1 (Task Achievement)" : "Task 2 (Task Response)";
    const model = process.env.GOOGLE_MODEL || fallbackModel;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${examinerPrompt}\n\n${reviewSchema}\n\nEvaluate this ${taskName}.\n\nQuestion:\n${question}\n\nWord count reported by the editor: ${wordCount}\n\nCandidate answer:\n${essay}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      const message = result?.error?.message || "Gemini could not review the answer.";
      return NextResponse.json({ message }, { status: response.status >= 500 ? 502 : response.status });
    }

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned an empty review.");
    }

    const review = cleanJsonResponse(text);
    return NextResponse.json({ ...review, wordCount: Number(wordCount) || 0 });
  } catch (error) {
    console.error("Writing review error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to review the answer." },
      { status: 500 }
    );
  }
}
