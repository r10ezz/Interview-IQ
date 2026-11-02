import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  CandidateAnalysis,
  InterviewQuestion,
  AnswerEvaluation,
  FinalEvaluationReport,
  InterviewExchange,
  DifficultyLevel,
  InterviewType,
} from '@/types/interview';
import {
  generateFallbackAnalysis,
  generateFallbackQuestions,
  generateFallbackAnswerEvaluation,
  generateFallbackFinalReport,
} from './fallback-data';

function getGeminiClient(customApiKey?: string): GoogleGenerativeAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(key.trim());
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown codeblock tags if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

/**
 * Analyses candidate resume and job description using Gemini.
 */
export async function analyzeCandidate(
  resumeText: string,
  jobDescription: string,
  customApiKey?: string
): Promise<{ analysis: CandidateAnalysis; source: 'gemini' | 'fallback' }> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    console.warn('[InterviewIQ] No Gemini API key provided. Using intelligent fallback evaluator.');
    return {
      analysis: generateFallbackAnalysis(resumeText, jobDescription),
      source: 'fallback',
    };
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `You are an expert AI Technical Recruiter and MCA Research Evaluator analyzing candidate-job alignment.
Analyze the provided RESUME and JOB DESCRIPTION.

Extract structured data strictly as a valid JSON object with this exact schema:
{
  "candidateName": "Extracted name or Candidate",
  "experienceSummary": "2-3 sentence professional summary highlighting candidate background and domain",
  "technicalSkills": ["skill1", "skill2", ...],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief summary of problem solved and impact",
      "techStack": ["tech1", "tech2"]
    }
  ],
  "jobRequirements": ["key requirement 1", "key requirement 2", ...],
  "matchingSkills": ["skills present in BOTH resume and job requirements"],
  "missingSkills": ["skills required by job but absent/weak in resume"],
  "matchScore": 78, // Integer 0 to 100 based on rigorous semantic skill alignment
  "recommendedTopics": ["topic 1 to test in interview", "topic 2", "topic 3"],
  "confidenceAssessment": "Brief explanation of how well candidate aligns with this specific job role"
}

RESUME TEXT:
${resumeText.slice(0, 7000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(cleanJsonText(responseText)) as CandidateAnalysis;

    return {
      analysis: {
        ...parsed,
        matchScore: typeof parsed.matchScore === 'number' ? Math.min(100, Math.max(0, parsed.matchScore)) : 75,
      },
      source: 'gemini',
    };
  } catch (err) {
    console.error('[InterviewIQ] Gemini analyzeCandidate error:', err);
    return {
      analysis: generateFallbackAnalysis(resumeText, jobDescription),
      source: 'fallback',
    };
  }
}

/**
 * Generates personalized initial interview questions.
 */
export async function generateInterviewQuestions(
  analysis: CandidateAnalysis,
  resumeText: string,
  jobDescription: string,
  interviewType: InterviewType,
  difficulty: DifficultyLevel,
  count: number = 5,
  customApiKey?: string
): Promise<{ questions: InterviewQuestion[]; source: 'gemini' | 'fallback' }> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    return {
      questions: generateFallbackQuestions(analysis, interviewType, difficulty, count),
      source: 'fallback',
    };
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const prompt = `You are a Principal Software Engineering Interviewer conducting an adaptive mock interview.
Based on the candidate's analysis, resume, and job description, generate EXACTLY ${count} personalized interview questions.

Question distribution requirements:
${interviewType === 'technical' ? `- All ${count} questions must be Technical (architecture, coding design, debugging, systems)` : ''}
${interviewType === 'hr' ? `- All ${count} questions must be Behavioral & Leadership (STAR method, teamwork, conflict, culture)` : ''}
${interviewType === 'mixed' ? `- 2 questions strictly targeting key job requirements
- 2 questions strictly targeting the candidate's actual projects/resume claims
- 1 behavioral / situational question` : ''}

Current target difficulty: ${difficulty.toUpperCase()}

Return strictly a JSON array of questions with this schema:
[
  {
    "id": "q1",
    "text": "The exact interview question text",
    "type": "job-requirement" | "resume-project" | "behavioral",
    "category": "e.g. System Design / State Management / Distributed Systems",
    "targetSkillOrProject": "e.g. Redis Caching / DevFlow Kanban / Conflict Resolution",
    "difficulty": "${difficulty}",
    "suggestedDurationSeconds": 120
  }
]

CANDIDATE ANALYSIS:
${JSON.stringify(analysis, null, 2).slice(0, 2500)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2500)}
`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(cleanJsonText(result.response.text())) as InterviewQuestion[];

    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        questions: parsed.slice(0, count).map((q, idx) => ({
          ...q,
          id: q.id || `q-${idx + 1}`,
          difficulty: q.difficulty || difficulty,
        })),
        source: 'gemini',
      };
    }

    throw new Error('Unexpected question format returned');
  } catch (err) {
    console.error('[InterviewIQ] Gemini generateInterviewQuestions error:', err);
    return {
      questions: generateFallbackQuestions(analysis, interviewType, difficulty, count),
      source: 'fallback',
    };
  }
}

/**
 * Evaluates candidate answer and determines adaptive next step / follow-up.
 */
export async function evaluateCandidateAnswer(
  currentQuestion: InterviewQuestion,
  candidateAnswer: string,
  questionIndex: number,
  totalQuestions: number,
  previousHistory: InterviewExchange[],
  currentDifficulty: DifficultyLevel,
  customApiKey?: string
): Promise<{
  evaluation: AnswerEvaluation;
  followUpQuestion?: InterviewQuestion;
  newDifficulty: DifficultyLevel;
  source: 'gemini' | 'fallback';
}> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    const res = generateFallbackAnswerEvaluation(currentQuestion, candidateAnswer, previousHistory.length);
    return { ...res, source: 'fallback' };
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `You are an adaptive interview AI evaluator.
Evaluate the candidate's response to the given question.

QUESTION:
"${currentQuestion.text}"
Category: ${currentQuestion.category}
Difficulty: ${currentQuestion.difficulty}

CANDIDATE ANSWER:
"${candidateAnswer}"

PREVIOUS EXCHANGE COUNT: ${previousHistory.length}
QUESTION INDEX: ${questionIndex + 1} of ${totalQuestions}

Evaluate strictly according to these 5 criteria:
1. Overall Score (0-100)
2. Technical Correctness (0-100)
3. Relevance (0-100)
4. Depth & Specificity (0-100)
5. Communication Clarity (0-100)

Also determine ADAPTIVE ACTION:
- If score >= 85 and current difficulty is not 'advanced', recommend difficulty increase.
- If score <= 50 and current difficulty is not 'beginner', recommend difficulty decrease.
- If candidate gave an interesting answer that left a key technical nuance or edge-case unaddressed, or if this is an MCA research depth check, you can optionally generate a contextual "followUpQuestion".

Return strictly a JSON object:
{
  "evaluation": {
    "score": 82,
    "quickFeedback": "1-2 sentence immediate assessment",
    "technicalCorrectness": 85,
    "relevance": 90,
    "depth": 75,
    "clarity": 80,
    "keyStrengths": ["bullet 1", "bullet 2"],
    "keyMissingPoints": ["bullet 1", "bullet 2"],
    "idealAnswerHighlights": "What a top tier response should have covered"
  },
  "shouldGenerateFollowUp": false,
  "followUpQuestion": {
    "id": "fu-1",
    "text": "Probing follow-up question directly addressing candidate answer",
    "type": "follow-up",
    "category": "Deep Dive Nuance",
    "targetSkillOrProject": "${currentQuestion.targetSkillOrProject}",
    "difficulty": "intermediate"
  },
  "newDifficulty": "beginner" | "intermediate" | "advanced"
}
`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(cleanJsonText(result.response.text()));

    const evaluation: AnswerEvaluation = {
      score: parsed.evaluation?.score ?? 75,
      quickFeedback: parsed.evaluation?.quickFeedback ?? 'Good response covering core principles.',
      technicalCorrectness: parsed.evaluation?.technicalCorrectness ?? 75,
      relevance: parsed.evaluation?.relevance ?? 80,
      depth: parsed.evaluation?.depth ?? 70,
      clarity: parsed.evaluation?.clarity ?? 75,
      keyStrengths: parsed.evaluation?.keyStrengths ?? ['Good context understanding'],
      keyMissingPoints: parsed.evaluation?.keyMissingPoints ?? ['Could provide deeper metrics'],
      idealAnswerHighlights: parsed.evaluation?.idealAnswerHighlights ?? 'Provide architecture trade-offs and edge case mitigations.',
    };

    const newDiff = (['beginner', 'intermediate', 'advanced'].includes(parsed.newDifficulty)
      ? parsed.newDifficulty
      : currentDifficulty) as DifficultyLevel;

    const followUp = parsed.shouldGenerateFollowUp && parsed.followUpQuestion
      ? {
          ...parsed.followUpQuestion,
          id: `fu-${Date.now()}`,
          difficulty: newDiff,
        }
      : undefined;

    return {
      evaluation,
      followUpQuestion: followUp,
      newDifficulty: newDiff,
      source: 'gemini',
    };
  } catch (err) {
    console.error('[InterviewIQ] Gemini evaluateCandidateAnswer error:', err);
    const res = generateFallbackAnswerEvaluation(currentQuestion, candidateAnswer, previousHistory.length);
    return { ...res, source: 'fallback' };
  }
}

/**
 * Generates comprehensive final performance evaluation and report.
 */
export async function generateFinalEvaluation(
  history: InterviewExchange[],
  analysis: CandidateAnalysis,
  jobDescription: string,
  customApiKey?: string
): Promise<{ report: FinalEvaluationReport; source: 'gemini' | 'fallback' }> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    return {
      report: generateFallbackFinalReport(history, analysis),
      source: 'fallback',
    };
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const summaryHistory = history.map((h, i) => ({
      index: i + 1,
      question: h.question.text,
      category: h.question.category,
      difficulty: h.question.difficulty,
      answer: h.candidateAnswer,
      score: h.evaluation.score,
    }));

    const prompt = `You are the Lead Hiring Committee Evaluator delivering the final MCA research evaluation report for candidate "${analysis.candidateName}".

INTERVIEW HISTORY & SCORES:
${JSON.stringify(summaryHistory, null, 2)}

CANDIDATE ANALYSIS:
${JSON.stringify(analysis, null, 2).slice(0, 2000)}

JOB REQUIREMENTS:
${jobDescription.slice(0, 2000)}

Provide a thorough, research-grade evaluation report formatted strictly as a JSON object with this schema:
{
  "overallScore": 82, // 0-100 weighted aggregate
  "technicalCorrectness": 84, // 0-100
  "answerRelevance": 88, // 0-100
  "technicalDepth": 76, // 0-100
  "communicationClarity": 82, // 0-100
  "hiringRecommendation": "Strong Hire" | "Hire" | "Borderline / Needs Follow-up" | "Not Ready Yet",
  "performanceSummary": "3-4 sentence comprehensive evaluation narrative",
  "strengths": ["Clear strength 1 with evidence", "Strength 2", "Strength 3"],
  "weaknesses": ["Area for improvement 1", "Area for improvement 2", "Area for improvement 3"],
  "questionBreakdown": [
    {
      "questionId": "q1",
      "questionText": "exact question",
      "questionType": "job-requirement",
      "category": "Category",
      "difficulty": "intermediate",
      "candidateAnswer": "Candidate response excerpt",
      "score": 85,
      "critique": "Specific constructive critique of candidate response",
      "idealAnswer": "Benchmark response demonstrating top tier engineering maturity",
      "rubricScores": {
        "correctness": 85,
        "relevance": 90,
        "depth": 80,
        "clarity": 85
      }
    }
  ],
  "skillAssessment": [
    {
      "skill": "React / Next.js",
      "status": "strong" | "moderate" | "needs-improvement",
      "note": "Evaluator notes"
    }
  ],
  "recommendedTopics": [
    {
      "topic": "System Design / Distributed Caching",
      "priority": "high" | "medium" | "low",
      "reason": "Why this matters for the role",
      "recommendedFocus": "Specific resources or concepts to study"
    }
  ],
  "completedAt": "${new Date().toISOString()}",
  "totalTimeMinutes": ${Math.max(2, Math.round(history.length * 2.5))}
}
`;

    const result = await model.generateContent(prompt);
    const report = JSON.parse(cleanJsonText(result.response.text())) as FinalEvaluationReport;

    return {
      report: {
        ...report,
        completedAt: report.completedAt || new Date().toISOString(),
        totalTimeMinutes: report.totalTimeMinutes || Math.max(2, Math.round(history.length * 2.5)),
      },
      source: 'gemini',
    };
  } catch (err) {
    console.error('[InterviewIQ] Gemini generateFinalEvaluation error:', err);
    return {
      report: generateFallbackFinalReport(history, analysis),
      source: 'fallback',
    };
  }
}
