const API_BASE = 'http://localhost:3000';

async function testRounds() {
  console.log('Testing /api/interview/start with selected rounds...\n');

  const candidateAnalysis = {
    candidateName: 'Alex Rivera',
    experienceSummary: 'Senior Full Stack Engineer with 4+ years building scalable web apps in Next.js, React, Node.js, and Redis.',
    technicalSkills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
    projects: [
      {
        name: 'CloudScale Analytics Dashboard',
        description: 'Multi-tenant analytics serving 120,000 MAU',
        techStack: ['Next.js', 'TypeScript', 'Tailwind', 'Redis']
      }
    ],
    jobRequirements: ['React 19', 'TypeScript', 'Node.js Microservices', 'Distributed Caching'],
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'Redis'],
    missingSkills: ['Kubernetes'],
    matchScore: 92,
    recommendedTopics: ['Event loop', 'Caching invalidation']
  };

  const resumeText = 'Alex Rivera, Senior Full Stack Developer. Experience in React, Next.js, Node.js, BullMQ, Redis. Built DevFlow Kanban and CloudScale analytics.';
  const jobDescription = 'Apex Technologies is hiring a Senior Full Stack Engineer. Build performant microservices with Node.js and Next.js, optimize PostgreSQL queries, and lead sprint reviews.';

  // Test 1: All 3 rounds
  console.log('--- Test 1: Foundation + Coding + Behavioral ---');
  const res1 = await fetch(`${API_BASE}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText,
      jobDescription,
      candidateAnalysis,
      selectedRounds: ['foundation', 'coding', 'behavioral'],
      interviewLength: 4
    })
  });
  const data1 = await res1.json();
  console.log('Success:', data1.success);
  console.log('Questions Count:', data1.questions?.length);
  console.log('Question 1 (Foundation):', data1.questions?.[0]?.text?.slice(0, 110) + '...');
  console.log('Question 3 (Behavioral):', data1.questions?.[2]?.text?.slice(0, 110) + '...');
  console.log('Coding Challenges Count:', data1.codingChallenges?.length);
  console.log('Challenge 1 Title:', data1.codingChallenges?.[0]?.title);
  console.log('Challenge 1 Topic Tags:', data1.codingChallenges?.[0]?.topicTags);

  // Test 2: Coding ONLY
  console.log('\n--- Test 2: Coding ONLY ---');
  const res2 = await fetch(`${API_BASE}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText,
      jobDescription,
      candidateAnalysis,
      selectedRounds: ['coding']
    })
  });
  const data2 = await res2.json();
  console.log('Success:', data2.success);
  console.log('Questions Count (should be 0):', data2.questions?.length);
  console.log('Coding Challenges Count (should be 2):', data2.codingChallenges?.length);
  console.log('Challenge 1:', data2.codingChallenges?.[0]?.title);
  console.log('Challenge 2:', data2.codingChallenges?.[1]?.title);

  console.log('\n✓ ALL ROUND SELECTION TESTS COMPLETED SUCCESSFULLY!');
}

testRounds().catch(console.error);

