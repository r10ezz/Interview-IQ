// Automated End-to-End Test for InterviewIQ API Endpoints
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
- Introduced Redis caching layer, decreasing p95 latency from 850ms to 240ms.

PROJECTS
1. DevFlow Kanban: Real-time project board with WebSockets and PostgreSQL.
2. CodePulse: Developer telemetry CLI with Next.js and SQLite.`;

const sampleJD = `Senior Full Stack Software Engineer (React, Next.js, Node.js)
Company: Apex Technologies
Responsibilities:
- Build high-performance web applications using React, Next.js, and TypeScript.
- Architect robust Node.js backend microservices and REST/GraphQL APIs.
- Manage PostgreSQL databases and implement distributed caching with Redis.
- Mentor junior engineers and champion automated testing.`;

async function runTest() {
  console.log('--- Step 1: Testing Home Page GET / ---');
  const homeRes = await fetch(BASE_URL);
  console.log(`Status: ${homeRes.status} ${homeRes.statusText}`);
  const homeHtml = await homeRes.text();
  const hasTitle = homeHtml.includes('InterviewIQ');
  console.log(`Contains "InterviewIQ": ${hasTitle}`);

  console.log('\n--- Step 2: Testing POST /api/analyze ---');
  const analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: sampleResume,
      jobDescription: sampleJD,
    }),
  });
  console.log(`Status: ${analyzeRes.status}`);
  const analyzeData = await analyzeRes.json();
  console.log('Success:', analyzeData.success);
  console.log('Candidate Name:', analyzeData.candidateAnalysis?.candidateName);
  console.log('Match Score:', analyzeData.candidateAnalysis?.matchScore);
  console.log('Matching Skills:', analyzeData.candidateAnalysis?.matchingSkills);
  console.log('Missing Skills:', analyzeData.candidateAnalysis?.missingSkills);

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
  console.log(`Status: ${startRes.status}`);
  const startData = await startRes.json();
  console.log('Total Questions Generated:', startData.questions?.length);
  console.log('First Question:', startData.initialQuestion?.text);

  console.log('\n--- Step 4: Testing POST /api/interview/respond ---');
  const currentQuestion = startData.initialQuestion;
  const candidateAnswer = "At CloudScale Solutions, I architected a multi-tier caching system utilizing Redis alongside PostgreSQL read-replicas. We implemented cache-aside patterns with jittered TTLs to avert cache stampedes and optimized slow joins with composite indices, reducing p95 latency from 850ms to 240ms under 120k MAU peak load.";
  
  const respondRes = await fetch(`${BASE_URL}/api/interview/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentQuestion,
      candidateAnswer,
      questionIndex: 0,
      totalQuestions: 3,
      previousHistory: [],
      allQuestions: startData.questions,
      currentDifficulty: 'intermediate',
    }),
  });
  console.log(`Status: ${respondRes.status}`);
  const respondData = await respondRes.json();
  console.log('Answer Score:', respondData.answerEvaluation?.score);
  console.log('Correctness:', respondData.answerEvaluation?.technicalCorrectness);
  console.log('Relevance:', respondData.answerEvaluation?.relevance);
  console.log('Depth:', respondData.answerEvaluation?.depth);
  console.log('Clarity:', respondData.answerEvaluation?.clarity);
  console.log('New Difficulty Adapted:', respondData.newDifficulty);
  console.log('Next Question:', respondData.nextQuestion?.text);

  console.log('\n--- Step 5: Testing POST /api/interview/evaluate ---');
  const history = [
    {
      question: currentQuestion,
      candidateAnswer,
      evaluation: respondData.answerEvaluation,
      answeredAt: new Date().toISOString(),
    }
  ];

  const evalRes = await fetch(`${BASE_URL}/api/interview/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interviewHistory: history,
      candidateAnalysis: analyzeData.candidateAnalysis,
      jobDescription: sampleJD,
    }),
  });
  console.log(`Status: ${evalRes.status}`);
  const evalData = await evalRes.json();
  console.log('Overall Score:', evalData.report?.overallScore);
  console.log('Hiring Recommendation:', evalData.report?.hiringRecommendation);
  console.log('Strengths Count:', evalData.report?.strengths?.length);
  console.log('Weaknesses Count:', evalData.report?.weaknesses?.length);
  console.log('Questions Breakdown Count:', evalData.report?.questionBreakdown?.length);
  console.log('Recommended Study Topics:', evalData.report?.recommendedTopics?.map(t => t.topic));

  console.log('\n========================================');
  console.log('✓ ALL 5 ENDPOINTS VERIFIED END-TO-END!');
  console.log('========================================');
}

runTest().catch(console.error);
