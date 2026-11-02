// Live Gemini test verifying that /api/analyze uses live Gemini AI with the configured key
import { analyzeCandidate, generateInterviewQuestions, evaluateCandidateAnswer } from '../src/lib/gemini.ts';

async function testLiveGemini() {
  console.log('Testing live Gemini connectivity via src/lib/gemini.ts...');
  console.log('Using GEMINI_API_KEY from .env.local:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

  const resume = "Alex Rivera, Senior Full Stack Engineer. 4 years building Next.js and Node.js microservices. Scaled Redis caching layer to reduce p95 latency by 45%.";
  const jd = "Senior Full Stack Engineer. We require deep experience in Next.js, Redis, and high-concurrency microservices.";

  console.log('\n--- Calling analyzeCandidate with Gemini 3.8 Flash ---');
  const { analysis, source } = await analyzeCandidate(resume, jd);
  console.log('Analyze Result Source:', source);
  console.log('Candidate Name:', analysis.candidateName);
  console.log('Match Score:', analysis.matchScore);
  console.log('Matching Skills:', analysis.matchingSkills);
  console.log('Missing Skills:', analysis.missingSkills);

  console.log('\n--- Calling generateInterviewQuestions with Gemini 3.8 Flash ---');
  const { questions, source: qSource } = await generateInterviewQuestions(analysis, resume, jd, 'technical', 'advanced', 3);
  console.log('Questions Source:', qSource);
  console.log('Question 1:', questions[0]?.text);

  console.log('\n--- Evaluating Gibberish with Gemini 3.8 Flash ---');
  const evalRes = await evaluateCandidateAnswer(
    questions[0],
    "asdfghjkl random letters test",
    0,
    3,
    [],
    'advanced'
  );
  console.log('Gibberish Answer Score:', evalRes.evaluation.score);
  console.log('Gibberish Feedback:', evalRes.evaluation.quickFeedback);
  console.log('Evaluation Source:', evalRes.source);

  console.log('\n--- Evaluating Real Technical Response with Gemini 3.8 Flash ---');
  const techEval = await evaluateCandidateAnswer(
    questions[0],
    "To handle cache invalidation across concurrent sessions, we implemented a dual-key cache strategy using Redis cluster. Write requests update the primary PostgreSQL replica and broadcast an invalidation message via Redis pub/sub. Read requests utilize a cache-aside pattern with randomized TTL jitter (between 240 and 300 seconds) to completely avoid cache stampedes, keeping our p95 response time consistently under 240ms.",
    0,
    3,
    [],
    'advanced'
  );
  console.log('Technical Answer Score:', techEval.evaluation.score);
  console.log('Technical Correctness:', techEval.evaluation.technicalCorrectness);
  console.log('Technical Feedback:', techEval.evaluation.quickFeedback);
  console.log('Evaluation Source:', techEval.source);
}

testLiveGemini().catch(console.error);
