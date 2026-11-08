import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CodingChallenge, CodingEvaluation } from '@/types/interview';
import { evaluateCodingFallback } from '@/lib/coding-challenges';

const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];

export async function POST(req: NextRequest) {
  try {
    const { code, challenge, language = 'typescript', customApiKey } = await req.json();

    if (!code || !challenge) {
      return NextResponse.json({ error: 'Missing code or challenge payload.' }, { status: 400 });
    }

    const key = customApiKey || process.env.GEMINI_API_KEY;

    if (!key || key.trim() === '' || key === 'your_gemini_api_key_here') {
      const evaluation = evaluateCodingFallback(code, challenge as CodingChallenge, language);
      return NextResponse.json({ success: true, evaluation, source: 'fallback' });
    }

    const client = new GoogleGenerativeAI(key.trim());
    const prompt = `You are a Principal Software Engineer assessing a candidate's live coding submission.

CODING CHALLENGE:
Title: ${challenge.title}
Difficulty: ${challenge.difficulty}
Programming Language: ${language}
Description:
${challenge.description}

CANDIDATE'S SUBMITTED CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

Evaluate this code strictly for:
1. Correctness (does it solve the problem requirements and constraints according to ${language} conventions?)
2. Time and Space Complexity (accurate Big-O analysis, e.g. O(n) time, O(1) space)
3. Code quality, language idioms, memory safety, and edge-case handling.

Return strictly a JSON object matching this schema:
{
  "score": 85, // 0-100 overall code score
  "passed": true, // boolean (true if score >= 70)
  "correctnessScore": 90, // 0-100
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "codeQuality": 85,
  "feedback": "2-3 sentences evaluating logic, cleanliness, and correctness",
  "edgeCasesCovered": ["Handled empty input", "Handled duplicate elements"],
  "edgeCasesMissed": ["Did not handle negative constraints"],
  "suggestedOptimization": "Brief optimization advice if applicable"
}
`;

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
        }

        const evaluation = JSON.parse(text) as CodingEvaluation;
        return NextResponse.json({ success: true, evaluation, source: 'gemini' });
      } catch (err) {
        console.warn(`Coding evaluation model ${modelName} failed, falling back:`, err instanceof Error ? err.message : err);
      }
    }

    const evaluation = evaluateCodingFallback(code, challenge as CodingChallenge, language);
    return NextResponse.json({ success: true, evaluation, source: 'fallback' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Evaluation error' },
      { status: 500 }
    );
  }
}
