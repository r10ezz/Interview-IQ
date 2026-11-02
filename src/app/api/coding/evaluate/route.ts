import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CodingChallenge, CodingEvaluation } from '@/types/interview';
import { evaluateCodingFallback } from '@/lib/coding-challenges';

export async function POST(req: NextRequest) {
  try {
    const { code, challenge, customApiKey } = await req.json();

    if (!code || !challenge) {
      return NextResponse.json({ error: 'Missing code or challenge payload.' }, { status: 400 });
    }

    const key = customApiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      const evaluation = evaluateCodingFallback(code, challenge as CodingChallenge);
      return NextResponse.json({ success: true, evaluation, source: 'fallback' });
    }

    try {
      const client = new GoogleGenerativeAI(key.trim());
      const model = client.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `You are a Principal Software Engineer assessing a candidate's live coding submission.

CODING CHALLENGE:
Title: ${challenge.title}
Difficulty: ${challenge.difficulty}
Description:
${challenge.description}

CANDIDATE'S SUBMITTED CODE:
\`\`\`${challenge.language || 'typescript'}
${code}
\`\`\`

Evaluate this code strictly for:
1. Correctness (does it solve the problem requirements and sample test cases?)
2. Time and Space Complexity (Big-O analysis)
3. Code quality, edge-case mitigation, and defensive programming.

Return strictly a JSON object matching this schema:
{
  "score": 85, // 0-100 overall code score
  "passed": true, // boolean (true if score >= 70)
  "correctnessScore": 90, // 0-100
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "codeQuality": 85,
  "feedback": "2-3 sentences evaluating logic, cleanliness, and correctness",
  "edgeCasesCovered": ["Handled timer resets", "Forwarded arguments"],
  "edgeCasesMissed": ["Did not handle negative delay"],
  "suggestedOptimization": "Brief optimization advice if applicable"
}
`;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
      }

      const evaluation = JSON.parse(text) as CodingEvaluation;
      return NextResponse.json({ success: true, evaluation, source: 'gemini' });
    } catch (err) {
      console.warn('Gemini coding evaluation fallback:', err);
      const evaluation = evaluateCodingFallback(code, challenge as CodingChallenge);
      return NextResponse.json({ success: true, evaluation, source: 'fallback' });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Evaluation error' },
      { status: 500 }
    );
  }
}

