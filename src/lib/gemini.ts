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
const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];

function getGeminiClient(customApiKey?: string): GoogleGenerativeAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(key.trim());
}

function withTimeout<T>(promise: Promise<T>, ms: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
  }
  const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (match) {
    cleaned = match[0];
  }
  // Strip trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
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

      const result = await withTimeout(model.generateContent(prompt), 7000);
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

      const prompt = `You are a friendly, experienced Technical Interviewer conducting a realistic, supportive technical interview.
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

CRITICAL QUESTION GUIDELINES (DO NOT OVERWHELM THE CANDIDATE):
1. QUESTIONS MUST BE SHORT, CLEAR, AND DIRECT (1 to 2 sentences maximum).
2. DO NOT ask long multi-part paragraphs, deep distributed systems triages, or high-level architecture degradation quizzes.
3. STICK CLOSELY TO WHAT IS ACTUALLY ON THE CANDIDATE'S RESUME AND THE JOB DESCRIPTION:
   * Foundation Round: Ask fundamental, most-asked technical questions on the specific core technologies mentioned in their resume and JD:
     - If React: difference between state and props, useEffect purpose, or key prop in lists.
     - If JavaScript: synchronous vs asynchronous code, Promises, closures, or let vs const.
     - If Node.js / Backend: GET vs POST, RESTful principles, or Express middleware.
     - If Databases / SQL: indexing purpose, difference between SQL and NoSQL, or primary key vs foreign key.
   * Project Focus: Reference their actual project by name from their resume (e.g. "${analysis.projects[0]?.name || 'your project'}"), asking a concise question about what the project does or their core technical responsibility.
   * Behavioral Round: Ask 1 concise STAR scenario (e.g., a challenging bug they encountered and how they diagnosed it, or learning a new tool under a deadline).
4. Address the candidate naturally by name ("${analysis.candidateName}").

Generate EXACTLY ${count} questions. Format strictly as a JSON array matching this schema:
[
  {
    "id": "q1",
    "roundType": "foundation" | "behavioral",
    "skillStage": "e.g. Stage 1: Core Fundamentals" or "Behavioral: Technical Challenge",
    "text": "Short, direct 1-2 sentence question",
    "type": "fundamental" | "job-requirement" | "resume-project" | "behavioral",
    "category": "e.g. React Basics or JavaScript Fundamentals",
    "targetSkillOrProject": "e.g. React or ${analysis.projects[0]?.name || 'Project'}",
    "difficulty": "${difficulty}",
    "suggestedDurationSeconds": 90
  }
]
`;

      const result = await withTimeout(model.generateContent(prompt), 7000);
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
      challenges: getRoleBasedCodingChallenges(jobDescription, resumeText, difficulty),
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
Generate EXACTLY 2 role-specific, most-asked Data Structures & Algorithms (DSA) coding problems for this candidate and target role.

CANDIDATE:
- Candidate Name: ${analysis.candidateName}
- Target Role Skills: ${analysis.matchingSkills.join(', ')}
${resumeText.slice(0, 1500)}

JOB DESCRIPTION:
${jobDescription.slice(0, 1500)}

STRICT DIFFICULTY CALIBRATION FOR "${difficulty.toUpperCase()}":
${difficulty === 'beginner' ? `
* BEGINNER LEVEL: Generate problems focusing strictly on basic ARRAYS and STRINGS (e.g., Two Sum, Valid Palindrome, Best Time to Buy and Sell Stock, Valid Anagram, Reverse String, Contains Duplicate).
* Do NOT ask graph, tree traversal, or dynamic programming questions for beginners.
` : difficulty === 'advanced' ? `
* ADVANCED LEVEL: Generate problems focusing on GRAPHS, TREES, or ADVANCED DATA STRUCTURES (e.g., Number of Islands / Graph DFS, Course Schedule / Topological Sort, Binary Tree Level Order, LRU Cache).
` : `
* INTERMEDIATE LEVEL: Generate problems focusing on STRINGS, ARRAYS, SLIDING WINDOW, and TWO POINTERS (e.g., Longest Substring Without Repeating Characters, Two Sum, Valid Parentheses, Best Time to Buy and Sell Stock).
`}

CRITICAL REQUIREMENTS:
1. starterCode MUST BE AN UNIMPLEMENTED FUNCTION STUB with a helpful comment (like LeetCode), NOT the completed solution.
2. Format each problem in professional LeetCode style with Example 1, Example 2, and realistic Constraints.
3. Include 2-3 sample test cases with clean input and expectedOutput.

Return strictly a JSON array matching this schema:
[
  {
    "id": "dsa-1",
    "title": "Problem Title",
    "difficulty": "${difficulty === 'beginner' ? 'Easy' : difficulty === 'advanced' ? 'Hard' : 'Medium'}",
    "topicTags": ["Array", "Two Pointers"],
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
    "starterCode": "function solve(nums: number[], target: number): number[] {\\n  // Write your solution here\\n\\n}",
    "language": "typescript",
    "sampleTestCases": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "expectedOutput": "[0, 1]",
        "explanation": "2 + 7 = 9"
      }
    ]
  }
]
`;

      const result = await withTimeout(model.generateContent(prompt), 7000);
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
    challenges: getRoleBasedCodingChallenges(jobDescription, resumeText, difficulty),
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

      const result = await withTimeout(model.generateContent(prompt), 7000);
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
 * Dynamically generates an adaptive probing question on a NEW, UNTESTED topic
 * when the initial question pool is exhausted or when switching topics (aiming for 3-4 distinct topics).
 */
export async function generateAdaptiveNextQuestion(
  analysis: CandidateAnalysis,
  resumeText: string,
  jobDescription: string,
  previousHistory: InterviewExchange[],
  currentDifficulty: DifficultyLevel,
  customApiKey?: string,
  concludedTopics: string[] = []
): Promise<InterviewQuestion> {
  const client = getGeminiClient(customApiKey);
  const questionNumber = previousHistory.length + 1;
  const askedQuestions = previousHistory.map((h) => h.question.text);
  const askedCategories = previousHistory.map((h) => h.question.category || h.question.targetSkillOrProject);

  if (client) {
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const prompt = `You are Sarah, an experienced Principal Engineering Lead conducting a realistic technical screening.
Candidate: "${analysis.candidateName}"
Current Progress: Question ${questionNumber} of max 12.
Target Role Skills: ${analysis.technicalSkills.join(', ')}

TOPICS ALREADY EVALUATED & CONCLUDED (DO NOT ASK ABOUT THESE AGAIN):
${concludedTopics.length > 0 ? concludedTopics.join(', ') : askedCategories.join(', ')}

OBJECTIVE & INTERVIEW INTEGRITY RULES:
1. SWITCH TO A FRESH, UNTESTED TOPIC: We already reached a conclusion on the topics above. Do NOT ask another question on them. Our aim is to fairly assess 3 to 4 distinct competencies (e.g. Core Language, Framework State, Backend/Storage, System Reliability, or Applied Project Architecture) without badgering the candidate or repeating topics.
2. Formulate 1 short, direct, 1-2 sentence question on a completely NEW competency area from their resume or JD.
3. Keep the tone conversational, professional, and clear.

Return strictly a JSON object:
{
  "id": "q-adapt-${questionNumber}",
  "roundType": "foundation",
  "skillStage": "Stage ${questionNumber}: New Competency Evaluation",
  "text": "Short 1-2 sentence direct question on an unassessed topic",
  "type": "job-requirement",
  "category": "e.g. Database Indexing or Caching Architecture",
  "targetSkillOrProject": "e.g. PostgreSQL or Redis",
  "difficulty": "${currentDifficulty}",
  "suggestedDurationSeconds": 90
}
`;
        const result = await withTimeout(model.generateContent(prompt), 6000);
        const parsed = JSON.parse(cleanJsonText(result.response.text())) as InterviewQuestion;
        if (parsed && parsed.text) {
          return {
            ...parsed,
            id: parsed.id || `q-adapt-${questionNumber}`,
            difficulty: parsed.difficulty || currentDifficulty,
            roundType: parsed.roundType || 'foundation',
          };
        }
      } catch (err) {
        console.warn(`[InterviewIQ] Gemini generateAdaptiveNextQuestion failed on ${modelName}:`, err);
      }
    }
  }

  // Dynamic fallback from expanded pool, finding a topic not yet concluded
  const fallbackBank = generateFallbackQuestions(analysis, 'mixed', currentDifficulty, 12, ['foundation', 'behavioral']);
  const askedTexts = new Set(askedQuestions);
  const unusedFromNewTopic = fallbackBank.find(
    (q) => !askedTexts.has(q.text) && !concludedTopics.some((t) => q.category.toLowerCase().includes(t.toLowerCase()))
  );
  const unused = unusedFromNewTopic || fallbackBank.find((q) => !askedTexts.has(q.text));

  return unused || {
    id: `q-adapt-${questionNumber}`,
    roundType: 'foundation',
    skillStage: `Stage ${questionNumber}: Core Architecture Probe`,
    text: `${analysis.candidateName}, how do you approach error logging, monitoring, and diagnosing production performance bottlenecks in your backend services?`,
    type: 'job-requirement',
    category: 'Production Reliability',
    targetSkillOrProject: 'Observability',
    difficulty: currentDifficulty,
    suggestedDurationSeconds: 90,
  };
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

      const prompt = `You are the Lead Hiring Committee Evaluator delivering the final comprehensive interview evaluation report for candidate "${analysis.candidateName}".

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

      const result = await withTimeout(model.generateContent(prompt), 7000);
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
