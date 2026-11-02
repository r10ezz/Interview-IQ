import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  CandidateAnalysis,
  InterviewQuestion,
  AnswerEvaluation,
  FinalEvaluationReport,
  InterviewExchange,
  DifficultyLevel,
  InterviewType,
  CodingSubmission,
  CodingChallenge,
  InterviewRoundType,
} from '@/types/interview';
import {
  generateFallbackAnalysis,
  generateFallbackQuestions,
  generateFallbackAnswerEvaluation,
  generateFallbackFinalReport,
} from './fallback-data';
import { getRoleBasedCodingChallenges } from './coding-challenges';

// Available stable Gemini models in order of priority (Fastest first)
const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

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
 * Validates a Gemini API Key by making a minimal request.
 */
export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const client = new GoogleGenerativeAI(apiKey.trim());
    const model = client.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const result = await model.generateContent('Say hello in 1 word.');
    const text = result.response.text();
    if (text) {
      return { valid: true, message: 'Google Gemini AI connected successfully!' };
    }
    return { valid: false, message: 'No response received from Gemini.' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid API key or network error';
    return { valid: false, message: msg };
  }
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

  // Attempt models in order
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `You are a Principal Technical Recruiter and Academic Research Evaluator analyzing candidate-job alignment.
Analyze the provided RESUME and JOB DESCRIPTION in high depth.

Extract structured data strictly as a valid JSON object with this exact schema:
{
  "candidateName": "Extracted name or Candidate",
  "experienceSummary": "2-3 sentence technical summary highlighting candidate architectural background, stack depth, and scale",
  "technicalSkills": ["skill1", "skill2", ...],
  "projects": [
    {
      "name": "Project Name",
      "description": "Concrete technical summary of problem solved, metrics achieved, and architecture",
      "techStack": ["tech1", "tech2"]
    }
  ],
  "jobRequirements": ["core requirement 1", "core requirement 2", ...],
  "matchingSkills": ["skills substantiated in BOTH resume and job requirements"],
  "missingSkills": ["skills explicitly required by job but absent/unsubstantiated in resume"],
  "matchScore": 78, // Integer 0 to 100 based on rigorous semantic skill alignment
  "recommendedTopics": ["topic 1 to test in interview", "topic 2", "topic 3"],
  "confidenceAssessment": "Evaluation of candidate alignment with this specific role, noting strengths and risk areas"
}

RESUME TEXT:
${resumeText.slice(0, 8000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 5000)}
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
      console.warn(`[InterviewIQ] Gemini analyzeCandidate failed on ${modelName}:`, err instanceof Error ? err.message : err);
    }
  }

  return {
    analysis: generateFallbackAnalysis(resumeText, jobDescription),
    source: 'fallback',
  };
}

/**
 * Generates personalized interview questions based on Resume, JD, and selected rounds.
 */
export async function generateInterviewQuestions(
  analysis: CandidateAnalysis,
  resumeText: string,
  jobDescription: string,
  interviewType: InterviewType,
  difficulty: DifficultyLevel,
  count: number = 5,
  customApiKey?: string,
  selectedRounds: InterviewRoundType[] = ['foundation', 'behavioral']
): Promise<{ questions: InterviewQuestion[]; source: 'gemini' | 'fallback' }> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    return {
      questions: generateFallbackQuestions(analysis, interviewType, difficulty, count, selectedRounds),
      source: 'fallback',
    };
  }

  const isFoundation = selectedRounds.includes('foundation');
  const isBehavioral = selectedRounds.includes('behavioral');

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const prompt = `You are a Principal Technical Interviewer and Hiring Committee Lead conducting a realistic, high-signal mock interview (like Pramp or Aced).
You are evaluating candidate "${analysis.candidateName}" for the target role detailed in the Job Description.

CANDIDATE RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

CANDIDATE ANALYSIS:
- Skills: ${analysis.technicalSkills.join(', ')}
- Matching Skills: ${analysis.matchingSkills.join(', ')}
- Projects: ${analysis.projects.map(p => `${p.name} (${p.techStack.join(', ')})`).join('; ')}

SELECTED ROUNDS:
${selectedRounds.join(', ')}

INSTRUCTIONS (GENERATE EXACTLY ${count} QUESTIONS):
${isFoundation && isBehavioral ? `
- SPLIT QUESTIONS BETWEEN FOUNDATION & BEHAVIORAL:
  1. FOUNDATION ROUND (First half): Focus on core language runtime, memory models, framework mechanics, and the MOST-ASKED foundational technical questions for this exact role (e.g. Event Loop, closures, reconciliation, connection pooling, indexing).
  2. BEHAVIORAL ROUND (Second half): Focus on the STAR method (Situation, Task, Action, Result). Formulate questions that directly reference the candidate's actual projects from their resume (e.g. "${analysis.projects[0]?.name || 'past projects'}"), probing technical disagreements, production crises, trade-offs under pressure, and cross-functional ownership.
` : isFoundation ? `
- ALL QUESTIONS MUST BE TECHNICAL & FOUNDATIONAL:
  * Start with most-asked language/runtime fundamentals for this role (e.g. memory model, async execution, closures, reconciliation).
  * Advance to practical component/service architecture and production trade-offs.
` : `
- ALL QUESTIONS MUST BE BEHAVIORAL & PROJECT-FOCUSED (STAR Method):
  * Directly tie questions to the projects, architecture, and responsibilities detailed in the candidate's resume and the leadership/ownership expectations in the Job Description.
`}

CRITICAL REALISM:
- Address the candidate naturally by name ("${analysis.candidateName}").
- Frame each question conversationally, as an interviewer addressing the candidate directly.

Format strictly as a JSON array of questions with this schema:
[
  {
    "id": "q1",
    "roundType": "foundation" | "behavioral",
    "skillStage": "e.g. Stage 1: Core Fundamentals & Syntax" or "Behavioral: STAR Method & Project Leadership",
    "text": "The exact interview question addressing the candidate directly",
    "type": "fundamental" | "job-requirement" | "resume-project" | "behavioral",
    "category": "e.g. JavaScript Runtime / Event Loop or Project Architecture",
    "targetSkillOrProject": "e.g. React & Node.js or ${analysis.projects[0]?.name || 'Primary Project'}",
    "difficulty": "${difficulty}",
    "suggestedDurationSeconds": 120
  }
]
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(cleanJsonText(result.response.text())) as InterviewQuestion[];

      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          questions: parsed.slice(0, count).map((q, idx) => ({
            ...q,
            id: q.id || `q-${idx + 1}`,
            difficulty: q.difficulty || difficulty,
            roundType: q.roundType || (idx < Math.ceil(count / 2) && isFoundation ? 'foundation' : 'behavioral'),
          })),
          source: 'gemini',
        };
      }
    } catch (err) {
      console.warn(`[InterviewIQ] Gemini generateInterviewQuestions failed on ${modelName}:`, err instanceof Error ? err.message : err);
    }
  }

  return {
    questions: generateFallbackQuestions(analysis, interviewType, difficulty, count, selectedRounds),
    source: 'fallback',
  };
}

/**
 * Generates role-specific, most-asked LeetCode / HackerRank style DSA coding challenges.
 */
export async function generateDynamicCodingChallenges(
  analysis: CandidateAnalysis,
  jobDescription: string,
  resumeText: string,
  difficulty: DifficultyLevel = 'intermediate',
  customApiKey?: string
): Promise<{ challenges: CodingChallenge[]; source: 'gemini' | 'fallback' }> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    return {
      challenges: getRoleBasedCodingChallenges(jobDescription, resumeText),
      source: 'fallback',
    };
  }

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `You are a Principal Software Engineer and LeetCode / HackerRank problem setter.
Generate EXACTLY 2 role-specific, most-asked Data Structures & Algorithms (DSA) or System Algorithm coding problems for this candidate and target role.

CANDIDATE:
- Candidate Name: ${analysis.candidateName}
- Target Role Skills: ${analysis.matchingSkills.join(', ')}
${resumeText.slice(0, 1500)}

JOB DESCRIPTION:
${jobDescription.slice(0, 1500)}

CRITERIA:
- The 2 problems MUST be the MOST-ASKED coding interview problems for this specific role:
  * If Frontend/FullStack: problems like LRU Cache, Two Sum, Longest Substring Without Repeating Characters, Custom Debounce/Throttle, Flatten Deep Object, Valid Parentheses.
  * If Backend/Systems: problems like Token Bucket Rate Limiter, LRU Cache, Merge Intervals, Course Schedule (Graph/Topo-sort), Top-K Frequent Elements.
- Format each problem in professional LeetCode / HackerRank style with Example 1, Example 2, and realistic Constraints.
- Include starter code in TypeScript with complete type annotations.
- Include 2-3 sample test cases with input, expectedOutput, and explanation.

Return strictly a JSON array matching this schema:
[
  {
    "id": "dsa-1",
    "title": "Problem Title (e.g. LRU Cache)",
    "difficulty": "Easy" | "Medium" | "Hard",
    "topicTags": ["Hash Table", "Two Pointers"],
    "skillCategory": "Data Structures & Algorithms",
    "description": "Clear problem statement with requirements",
    "examples": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "[0, 1]",
        "explanation": "nums[0] + nums[1] == 9"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "Time Complexity: O(n), Space: O(n)"
    ],
    "starterCode": "function solve(...) { ... }",
    "language": "typescript",
    "sampleTestCases": [
      {
        "input": "...",
        "expectedOutput": "...",
        "explanation": "..."
      }
    ]
  }
]
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(cleanJsonText(result.response.text())) as CodingChallenge[];

      if (Array.isArray(parsed) && parsed.length >= 2) {
        return {
          challenges: parsed.slice(0, 2),
          source: 'gemini',
        };
      }
    } catch (err) {
      console.warn(`[InterviewIQ] Gemini generateDynamicCodingChallenges failed on ${modelName}:`, err instanceof Error ? err.message : err);
    }
  }

  return {
    challenges: getRoleBasedCodingChallenges(jobDescription, resumeText),
    source: 'fallback',
  };
}

/**
 * Evaluates candidate answer with strict academic rubric and gibberish rejection.
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

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `You are a Principal Engineering Hiring Committee Member and strict Academic Evaluator.
Your goal is to evaluate the candidate's response with extreme rigor, honesty, and precision.

QUESTION ASKED:
"${currentQuestion.text}"
Category: ${currentQuestion.category}
Target Skill/Project: ${currentQuestion.targetSkillOrProject}
Current Difficulty: ${currentQuestion.difficulty}

CANDIDATE'S SUBMITTED ANSWER:
"""${candidateAnswer}"""

PREVIOUS EXCHANGE COUNT: ${previousHistory.length}
QUESTION INDEX: ${questionIndex + 1} of ${totalQuestions}

CRITICAL SCORING INTEGRITY INSTRUCTIONS:
1. GIBBERISH / RANDOM KEYSTROKES / TRIVIAL INPUTS:
   - If the candidate submitted random characters (e.g. "asdfghjkl", "qwerty", "zzz", "abcd"), spam, incoherent non-words, or a non-serious attempt:
     - "score": 0
     - "technicalCorrectness": 0
     - "relevance": 0
     - "depth": 0
     - "clarity": 0
     - "quickFeedback": "Answer Rejected: The submitted text contains random keystrokes or incoherent words. Zero technical substance was demonstrated."
     - "keyStrengths": ["None (No coherent content provided)"]
     - "keyMissingPoints": ["A coherent explanation", "Relevant technical concepts", "Answering the prompt"]
     - "newDifficulty": "beginner"
     - "shouldGenerateFollowUp": false
   - Do NOT award participation scores or be lenient with gibberish!

2. OFF-TOPIC RESPONSES:
   - If the candidate wrote coherent English but completely off-topic (e.g., discussing food or an unrelated topic):
     - Score between 5 and 15 out of 100 with relevance <= 10.

3. SUPERFICIAL / SHALLOW RESPONSES:
   - If the candidate gave a brief, generic answer without architectural specifics or trade-offs:
     - Score between 25 and 45 out of 100.

4. GOOD / DETAILED RESPONSES:
   - Well-structured explanation addressing core mechanics: score 70-84.
   - Deep production-grade explanation with metrics, trade-offs, and failure handling: score 85-98.

ADAPTIVE DIFFICULTY RULES:
- If score >= 85 and difficulty is not 'advanced', scale UP to next difficulty.
- If score <= 40 and difficulty is not 'beginner', scale DOWN to beginner.
- If score is between 60-84 and candidate missed an interesting technical trade-off, formulate a probing "followUpQuestion".

Return strictly a JSON object:
{
  "evaluation": {
    "score": 0 to 100,
    "quickFeedback": "Direct, honest assessment",
    "technicalCorrectness": 0 to 100,
    "relevance": 0 to 100,
    "depth": 0 to 100,
    "clarity": 0 to 100,
    "keyStrengths": ["bullet 1", "bullet 2"],
    "keyMissingPoints": ["bullet 1", "bullet 2"],
    "idealAnswerHighlights": "What an exemplary staff-level answer would contain"
  },
  "shouldGenerateFollowUp": false,
  "followUpQuestion": {
    "id": "fu-1",
    "text": "Deep-dive follow-up question directly challenging candidate's prior answer",
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
        score: parsed.evaluation?.score ?? 0,
        quickFeedback: parsed.evaluation?.quickFeedback ?? 'No evaluation provided.',
        technicalCorrectness: parsed.evaluation?.technicalCorrectness ?? 0,
        relevance: parsed.evaluation?.relevance ?? 0,
        depth: parsed.evaluation?.depth ?? 0,
        clarity: parsed.evaluation?.clarity ?? 0,
        keyStrengths: parsed.evaluation?.keyStrengths ?? [],
        keyMissingPoints: parsed.evaluation?.keyMissingPoints ?? [],
        idealAnswerHighlights: parsed.evaluation?.idealAnswerHighlights ?? '',
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
      console.warn(`[InterviewIQ] Gemini evaluateCandidateAnswer failed on ${modelName}:`, err instanceof Error ? err.message : err);
    }
  }

  const res = generateFallbackAnswerEvaluation(currentQuestion, candidateAnswer, previousHistory.length);
  return { ...res, source: 'fallback' };
}

/**
 * Generates comprehensive final performance evaluation and report.
 */
export async function generateFinalEvaluation(
  history: InterviewExchange[],
  analysis: CandidateAnalysis,
  jobDescription: string,
  customApiKey?: string,
  codingSubmissions?: CodingSubmission[]
): Promise<{ report: FinalEvaluationReport; source: 'gemini' | 'fallback' }> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    return {
      report: generateFallbackFinalReport(history, analysis, codingSubmissions),
      source: 'fallback',
    };
  }

  const avgCodingScore = codingSubmissions && codingSubmissions.length > 0
    ? Math.round(codingSubmissions.reduce((sum, s) => sum + (s.evaluation.score || 0), 0) / codingSubmissions.length)
    : undefined;

  const codingSummary = codingSubmissions && codingSubmissions.length > 0
    ? `LIVE CODING ASSESSMENT ROUND (${codingSubmissions.length} Challenges):
${JSON.stringify(codingSubmissions.map((s, i) => ({
  challengeIndex: i + 1,
  title: s.challenge.title,
  difficulty: s.challenge.difficulty,
  skill: s.challenge.skillCategory,
  score: s.evaluation.score,
  verdict: s.evaluation.passed ? 'PASSED' : 'NEEDS OPTIMIZATION',
  timeComplexity: s.evaluation.timeComplexity,
  spaceComplexity: s.evaluation.spaceComplexity,
  correctness: `${s.evaluation.correctnessScore}%`,
  feedback: s.evaluation.feedback,
  edgeCasesCovered: s.evaluation.edgeCasesCovered,
  edgeCasesMissed: s.evaluation.edgeCasesMissed,
  submittedCode: s.code.slice(0, 350),
})), null, 2)}`
    : 'No live coding round conducted.';

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
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
        rubric: {
          correctness: h.evaluation.technicalCorrectness,
          relevance: h.evaluation.relevance,
          depth: h.evaluation.depth,
          clarity: h.evaluation.clarity,
        }
      }));

      const prompt = `You are the Lead Hiring Committee Evaluator delivering the final MCA research evaluation report for candidate "${analysis.candidateName}".

INTERVIEW HISTORY & EVALUATIONS:
${JSON.stringify(summaryHistory, null, 2)}

CODING ASSESSMENT:
${codingSummary}

CANDIDATE ANALYSIS:
${JSON.stringify(analysis, null, 2).slice(0, 2500)}

JOB REQUIREMENTS:
${jobDescription.slice(0, 2500)}

CRITICAL GRADING:
- Calculate realistic averages from the interview scores.
${avgCodingScore !== undefined ? `- The candidate completed a live coding round with an average score of ${avgCodingScore}/100. Blend verbal and coding performance (approx. 60% verbal, 40% coding) into overallScore, and explicitly address both practical implementation skills and conceptual understanding in performanceSummary, strengths, and weaknesses.` : ''}
- If the candidate gave poor answers or gibberish, the overall score and rubric MUST reflect that faithfully.
- If overall score < 50, hiring recommendation MUST be "Not Ready Yet".
- If overall score 50-69, "Borderline / Needs Follow-up".
- If overall score 70-84, "Hire".
- If overall score >= 85, "Strong Hire".

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
          codingScore: avgCodingScore,
          codingSubmissions: codingSubmissions || [],
          completedAt: report.completedAt || new Date().toISOString(),
          totalTimeMinutes: report.totalTimeMinutes || Math.max(2, Math.round(history.length * 2.5 + (codingSubmissions?.length || 0) * 3)),
        },
        source: 'gemini',
      };
    } catch (err) {
      console.warn(`[InterviewIQ] Gemini generateFinalEvaluation failed on ${modelName}:`, err instanceof Error ? err.message : err);
    }
  }

  return {
    report: generateFallbackFinalReport(history, analysis, codingSubmissions),
    source: 'fallback',
  };
}
