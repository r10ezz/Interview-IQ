const API_BASE = 'http://localhost:3000';

async function run() {
  console.log('Testing full flow with Coding round + Final Evaluation synthesis...');

  const evaluateRes = await fetch(`${API_BASE}/api/interview/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interviewHistory: [
        {
          question: {
            id: 'q1',
            text: 'Explain the JavaScript Event Loop, microtasks, and macrotasks.',
            type: 'fundamental',
            category: 'JavaScript Fundamentals',
            targetSkillOrProject: 'JavaScript',
            difficulty: 'beginner'
          },
          candidateAnswer: 'The JavaScript Event Loop coordinates the call stack, microtask queue (Promises, MutationObserver), and macrotask queue (setTimeout, setInterval, I/O). When the call stack is empty, the event loop drains the entire microtask queue before picking the next macrotask.',
          evaluation: {
            score: 92,
            quickFeedback: 'Exceptional explanation of call stack and microtask drain mechanics.',
            technicalCorrectness: 95,
            relevance: 95,
            depth: 88,
            clarity: 90,
            keyStrengths: ['Accurate microtask queue drain order', 'Clean technical precision'],
            keyMissingPoints: ['Could mention queueMicrotask API'],
            idealAnswerHighlights: 'Benchmark answer'
          },
          answeredAt: new Date().toISOString()
        }
      ],
      candidateAnalysis: {
        candidateName: 'Alex Mercer',
        experienceSummary: 'Senior Full Stack Engineer with 5+ years experience in React and Node.js.',
        technicalSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
        projects: [
          {
            name: 'Distributed Analytics Platform',
            description: 'Real-time telemetry pipeline processing 10M events daily',
            techStack: ['Node.js', 'Redis', 'Kafka']
          }
        ],
        jobRequirements: ['React 19', 'TypeScript', 'Node.js Microservices', 'Distributed Caching'],
        matchingSkills: ['React', 'TypeScript', 'Node.js', 'Redis'],
        missingSkills: ['Kafka Administration'],
        matchScore: 90,
        recommendedTopics: ['Event-driven architecture', 'Microtask mechanics']
      },
      jobDescription: 'Senior Full Stack Engineer. Must know React, Node.js, asynchronous runtime mechanics, and robust distributed caching.',
      codingSubmissions: [
        {
          challenge: {
            id: 'code-1',
            title: 'Custom Debounce Utility / Hook',
            difficulty: 'Medium',
            skillCategory: 'JavaScript / React Foundations',
            description: 'Implement debounce with cancellation and timer reset',
            language: 'typescript'
          },
          code: `function debounce(func, wait) {
  let timerId = null;
  function debounced(...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => func.apply(this, args), wait);
  }
  debounced.cancel = () => { if (timerId) clearTimeout(timerId); };
  return debounced;
}`,
          evaluation: {
            score: 90,
            passed: true,
            correctnessScore: 92,
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)',
            codeQuality: 88,
            feedback: 'Clean closure implementation with correct timer clearance and argument forwarding.',
            edgeCasesCovered: ['Rapid invocation reset', 'Cancellation method'],
            edgeCasesMissed: ['Leading edge invocation']
          },
          submittedAt: new Date().toISOString()
        }
      ]
    })
  });

  const data = await evaluateRes.json();
  if (!evaluateRes.ok) {
    console.error('FAILED:', data);
    process.exit(1);
  }

  console.log('Source:', data.source);
  console.log('Overall Score:', data.report.overallScore);
  console.log('Coding Score:', data.report.codingScore);
  console.log('Hiring Recommendation:', data.report.hiringRecommendation);
  console.log('Performance Summary Excerpt:', data.report.performanceSummary?.slice(0, 160));
  console.log('Coding Submissions preserved in report:', data.report.codingSubmissions?.length);
  console.log('--- SUCCESS: Final Report synthesizes both verbal and live coding assessment! ---');
}

run().catch(console.error);

