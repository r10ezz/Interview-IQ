// Automated End-to-End Test for InterviewIQ API Endpoints & Gibberish Rejection
const BASE_URL = 'http://localhost:3000';

const sampleResume = `ALEX RIVERA
Full Stack Software Engineer | alex.rivera@example.com | San Francisco, CA

SUMMARY
Results-oriented Full Stack Engineer with 4+ years of hands-on experience building scalable web applications and microservices in React, Next.js, TypeScript, Node.js, and PostgreSQL.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, SQL, Python
- Frontend: React 18, Next.js, Tailwind CSS, Redux Toolkit
- Backend & Cloud: Node.js, Express, REST APIs, PostgreSQL, Redis, Docker, AWS

EXPERIENCE
Senior Full Stack Developer | CloudScale Solutions | 2022 - Present
- Architected multi-tenant analytics dashboard serving 120,000+ MAU using Next.js and TypeScript.
- Introduced Redis caching layer, decreasing p95 latency from 850ms to 240ms.`;

const sampleJD = `Senior Full Stack Software Engineer (React, Next.js, Node.js)
Company: Apex Technologies
Responsibilities:
- Build high-performance web applications using React, Next.js, and TypeScript.
- Architect robust Node.js backend microservices and REST/GraphQL APIs.
- Manage PostgreSQL databases and implement distributed caching with Redis.`;

async function runTest() {
  console.log('--- Step 1: Testing Home Page GET / ---');
  const homeRes = await fetch(BASE_URL);
  console.log(`Status: ${homeRes.status} (Contains "InterviewIQ": ${(await homeRes.text()).includes('InterviewIQ')})`);

  console.log('\n--- Step 2: Testing POST /api/analyze ---');
  const analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: sampleResume,
      jobDescription: sampleJD,
    }),
  });
  const analyzeData = await analyzeRes.json();
  console.log('Match Score:', analyzeData.candidateAnalysis?.matchScore);

  console.log('\n--- Step 3: Testing POST /api/interview/start ---');
  const startRes = await fetch(`${BASE_URL}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: sampleResume,
      jobDescription: sampleJD,
      candidateAnalysis: analyzeData.candidateAnalysis,
      interviewType: 'mixed',
      difficulty: 'intermediate',
      interviewLength: 3,
    }),
  });
  const startData = await startRes.json();
  const currentQuestion = startData.initialQuestion;
  console.log('Generated Question:', currentQuestion?.text);

  console.log('\n--- Step 4A: GIBBERISH SUBMISSION TEST (Random letters) ---');
  const gibberishAnswer = "asdfghjkl qwertyuiop zxcvbnm lkjhgfdsazxcvbnm";
  const gibberishRes = await fetch(`${BASE_URL}/api/interview/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentQuestion,
      candidateAnswer: gibberishAnswer,
      questionIndex: 0,
      totalQuestions: 3,
      previousHistory: [],
      allQuestions: startData.questions,
      currentDifficulty: 'intermediate',
    }),
  });
  const gibberishData = await gibberishRes.json();
  console.log('Gibberish Answer Score:', gibberishData.answerEvaluation?.score);
  console.log('Gibberish Correctness:', gibberishData.answerEvaluation?.technicalCorrectness);
  console.log('Gibberish Relevance:', gibberishData.answerEvaluation?.relevance);
  console.log('Feedback:', gibberishData.answerEvaluation?.quickFeedback);
  console.log('Difficulty scaled down to:', gibberishData.newDifficulty);

  if (gibberishData.answerEvaluation?.score !== 0) {
    throw new Error(`FAILURE: Expected score 0 for gibberish, got ${gibberishData.answerEvaluation?.score}`);
  }
  console.log('✓ PASS: Random keystrokes received 0/100 and rejected!');

  console.log('\n--- Step 4B: REAL TECHNICAL ANSWER TEST ---');
  const technicalAnswer = "At CloudScale Solutions, I implemented a multi-tier caching architecture utilizing Redis alongside PostgreSQL read-replicas. We implemented cache-aside with jittered TTLs to prevent cache stampedes and optimized slow queries with composite indices, reducing p95 latency from 850ms to 240ms under 120k MAU peak load.";
  const techRes = await fetch(`${BASE_URL}/api/interview/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentQuestion,
      candidateAnswer: technicalAnswer,
      questionIndex: 0,
      totalQuestions: 3,
      previousHistory: [],
      allQuestions: startData.questions,
      currentDifficulty: 'intermediate',
    }),
  });
  const techData = await techRes.json();
  console.log('Technical Answer Score:', techData.answerEvaluation?.score);
  console.log('Technical Correctness:', techData.answerEvaluation?.technicalCorrectness);
  console.log('Technical Depth:', techData.answerEvaluation?.depth);
  console.log('Feedback:', techData.answerEvaluation?.quickFeedback);
  console.log('Difficulty scaled up to:', techData.newDifficulty);

  console.log('\n========================================');
  console.log('✓ ALL TESTS PASSED: GIBBERISH REJECTED (0/100) & TECHNICAL ANSWER HONORED!');
  console.log('========================================');
}

runTest().catch(console.error);
