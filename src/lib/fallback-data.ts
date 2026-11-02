import {
  CandidateAnalysis,
  InterviewQuestion,
  AnswerEvaluation,
  FinalEvaluationReport,
  InterviewExchange,
  DifficultyLevel,
  InterviewType,
} from '@/types/interview';

// Common technical and English words to detect coherent speech vs random keystrokes
const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
  'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
  'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
  'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us', 'used', 'using', 'built', 'implemented', 'handled', 'designed', 'tested',
  'reduced', 'increased', 'improved', 'created', 'developed', 'solved', 'resolved', 'managed', 'deployed',
  'architecture', 'system', 'component', 'components', 'database', 'query', 'queries', 'cache', 'caching',
  'latency', 'throughput', 'server', 'client', 'frontend', 'backend', 'api', 'apis', 'rest', 'graphql',
  'microservices', 'service', 'services', 'react', 'nextjs', 'next', 'node', 'nodejs', 'typescript',
  'javascript', 'python', 'sql', 'postgres', 'postgresql', 'redis', 'docker', 'aws', 'cloud', 'security',
  'auth', 'authentication', 'state', 'redux', 'hook', 'hooks', 'performance', 'scalability', 'scale',
  'traffic', 'load', 'balancer', 'replica', 'cluster', 'index', 'indices', 'network', 'http', 'https',
  'status', 'error', 'exception', 'failure', 'retry', 'circuit', 'breaker', 'event', 'queue', 'kafka',
  'message', 'async', 'promise', 'await', 'thread', 'concurrency', 'lock', 'mutex', 'race', 'condition',
  'trade-off', 'tradeoff', 'bottleneck', 'memory', 'cpu', 'leak', 'profiling', 'monitoring', 'telemetry',
  'p95', 'p99', 'star', 'situation', 'task', 'action', 'result', 'team', 'mentor', 'code', 'review',
  'pipeline', 'ci/cd', 'github', 'git', 'pull', 'request', 'deploy', 'production', 'staging', 'test',
  'unit', 'integration', 'e2e', 'cypress', 'jest', 'playwright', 'prisma', 'orm', 'relational', 'nosql'
]);

function extractKeywords(text: string): string[] {
  const commonTech = [
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Docker',
    'PostgreSQL', 'SQL', 'MongoDB', 'Redis', 'AWS', 'FastAPI', 'GraphQL', 'Tailwind',
    'Redux', 'PyTorch', 'TensorFlow', 'LLMs', 'RAG', 'REST APIs', 'Microservices',
    'Git', 'CI/CD', 'Jest', 'Playwright', 'Kubernetes', 'Prisma', 'Linux'
  ];
  return commonTech.filter(tech => 
    new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i').test(text)
  );
}

/**
 * Advanced coherence & gibberish detector.
 * Identifies keystroke smashing (e.g. "asdfghjkl", "qwertyuiop", "zzzzzz"),
 * repetitive characters, lack of vowels, or excessive non-dictionary tokens.
 */
export function detectGibberish(text: string): { isGibberish: boolean; reason: string } {
  const trimmed = text.trim();
  if (trimmed.length < 6) {
    return { isGibberish: true, reason: 'Answer is too brief to contain technical substance.' };
  }

  // Check for repetitive characters like "aaaaa" or "asdfasdfasdf"
  if (/(.)\1{4,}/i.test(trimmed)) {
    return { isGibberish: true, reason: 'Contains excessive repetitive character sequences.' };
  }

  const cleanWords = trimmed.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);

  if (cleanWords.length === 0) {
    return { isGibberish: true, reason: 'No readable words detected.' };
  }

  // Check consonant-to-vowel ratio across the whole text
  const lettersOnly = trimmed.toLowerCase().replace(/[^a-z]/g, '');
  if (lettersOnly.length > 8) {
    const vowels = (lettersOnly.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowels / lettersOnly.length;
    // Normal English has 30% - 45% vowels. Gibberish like "sdfghjkl" has < 12% vowels
    if (vowelRatio < 0.12 || vowelRatio > 0.85) {
      return { isGibberish: true, reason: 'Abnormal letter distribution indicative of random keystrokes.' };
    }
  }

  // Check dictionary hit rate
  let recognizedCount = 0;
  for (const word of cleanWords) {
    // If exact dictionary match
    if (COMMON_WORDS.has(word)) {
      recognizedCount++;
    } else if (word.length >= 2 && !/[^a-z]/.test(word)) {
      // Check if word contains recognizable sub-patterns (e.g., plurals or common endings)
      const stem = word.replace(/(ing|ed|ly|es|s|tion|able|ment)$/, '');
      if (COMMON_WORDS.has(stem)) {
        recognizedCount++;
      }
    }
  }

  const recognizedRatio = recognizedCount / cleanWords.length;

  // If fewer than 25% of words are recognizable and words > 3
  if (cleanWords.length >= 3 && recognizedRatio < 0.25) {
    return { isGibberish: true, reason: 'High concentration of unidentifiable strings or keyboard smash.' };
  }

  return { isGibberish: false, reason: 'Coherent text structure detected.' };
}

export function generateFallbackAnalysis(
  resumeText: string,
  jobDescription: string
): CandidateAnalysis {
  const resumeSkills = extractKeywords(resumeText);
  const jdSkills = extractKeywords(jobDescription);

  const matchingSkills = jdSkills.filter(skill => 
    resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );
  
  const missingSkills = jdSkills.filter(skill => 
    !resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );

  const finalSkills = resumeSkills.length > 0 ? resumeSkills : ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'];
  const finalMatching = matchingSkills.length > 0 ? matchingSkills : ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
  const finalMissing = missingSkills.length > 0 ? missingSkills : ['Distributed Tracing', 'Kubernetes Orchestration'];

  // Try extracting candidate name from first lines
  const firstLines = resumeText.split('\n').filter(l => l.trim().length > 0);
  let candidateName = 'Candidate';
  if (firstLines.length > 0) {
    const candidateLine = firstLines[0].replace(/[^a-zA-Z\s]/g, '').trim();
    if (candidateLine.length > 2 && candidateLine.split(' ').length <= 4) {
      candidateName = candidateLine;
    }
  }

  const matchRatio = jdSkills.length > 0 ? matchingSkills.length / jdSkills.length : 0.8;
  const matchScore = Math.min(95, Math.max(62, Math.round(matchRatio * 100)));

  return {
    candidateName,
    experienceSummary: `Candidate with verified hands-on background in ${finalSkills.slice(0, 4).join(', ')}. Demonstrated experience architecting web applications, designing resilient microservices, and managing database queries at scale.`,
    technicalSkills: finalSkills,
    projects: [
      {
        name: 'Multi-Tenant Analytics Engine',
        description: 'Engineered high-throughput event processing and responsive dashboard serving 100k+ active users.',
        techStack: finalSkills.slice(0, 3),
      },
      {
        name: 'Distributed Microservices & Caching Layer',
        description: 'Architected Redis caching and PostgreSQL replicas to alleviate p95 database latency bottlenecks.',
        techStack: finalSkills.slice(2, 5),
      }
    ],
    jobRequirements: jdSkills.length > 0 ? jdSkills : ['TypeScript/React Web Architecture', 'Microservice Design & Node.js', 'PostgreSQL Schema Optimization', 'Distributed Caching (Redis)'],
    matchingSkills: finalMatching,
    missingSkills: finalMissing,
    matchScore,
    recommendedTopics: [
      ...finalMissing.slice(0, 2),
      'Cache Invalidation & Thundering Herd Prevention',
      'High-Concurrency Database Locking & Transactions'
    ],
    confidenceAssessment: 'Strong technical match on core frameworks. Recommend probing production edge-cases, cache consistency under high write throughput, and observability.',
  };
}

export function generateFallbackQuestions(
  analysis: CandidateAnalysis,
  interviewType: InterviewType,
  difficulty: DifficultyLevel,
  count: number = 5
): InterviewQuestion[] {
  const topMatchSkill = analysis.matchingSkills[0] || 'React & TypeScript';
  const secondMatchSkill = analysis.matchingSkills[1] || 'Node.js & PostgreSQL';
  const topProject = analysis.projects[0]?.name || 'Multi-Tenant Analytics Engine';

  const bank: InterviewQuestion[] = [
    {
      id: 'q1',
      type: 'job-requirement',
      category: 'System Architecture & Concurrency',
      targetSkillOrProject: topMatchSkill,
      difficulty,
      suggestedDurationSeconds: 120,
      text: `In a production system built with ${topMatchSkill}, how would you architect a distributed caching strategy to handle a 10x traffic spike while preventing cache stampedes and stale reads across concurrent user sessions?`,
    },
    {
      id: 'q2',
      type: 'resume-project',
      category: 'Production Bottlenecks & Profiling',
      targetSkillOrProject: topProject,
      difficulty,
      suggestedDurationSeconds: 150,
      text: `In your resume project "${topProject}", what was the single most challenging performance or latency bottleneck you diagnosed? Walk me through your profiling methodology, the root cause, and the measurable outcome.`,
    },
    {
      id: 'q3',
      type: 'job-requirement',
      category: 'Data Consistency & Transactions',
      targetSkillOrProject: secondMatchSkill,
      difficulty,
      suggestedDurationSeconds: 120,
      text: `When designing services with ${secondMatchSkill}, how do you ensure data consistency during distributed transactions or partial network failures? What specific patterns (e.g. idempotent consumers, saga pattern, two-phase commits) do you employ?`,
    },
    {
      id: 'q4',
      type: 'resume-project',
      category: 'Architectural Trade-offs',
      targetSkillOrProject: analysis.technicalSkills[1] || 'State Management',
      difficulty,
      suggestedDurationSeconds: 120,
      text: `Describe a specific scenario where you had to compromise between engineering purity and operational speed or delivery constraints. What technical debt did you knowingly accept, and how did you mitigate its risk?`,
    },
    {
      id: 'q5',
      type: 'behavioral',
      category: 'Technical Disagreement & Influence',
      targetSkillOrProject: 'Engineering Alignment',
      difficulty: 'intermediate',
      suggestedDurationSeconds: 120,
      text: `Tell me about a time when you strongly disagreed with a senior engineer or architect regarding a database schema or API design choice. How did you structure your technical argument, and what was the ultimate resolution?`,
    },
    {
      id: 'q6',
      type: 'job-requirement',
      category: 'Resilience & Disaster Recovery',
      targetSkillOrProject: 'Production Outages',
      difficulty,
      suggestedDurationSeconds: 120,
      text: `If a core production API suddenly degrades with p99 latency jumping from 100ms to 4500ms and connection pools exhausting, what is your step-by-step diagnostic sequence from triage to post-mortem?`,
    }
  ];

  let selected = bank;
  if (interviewType === 'technical') {
    selected = bank.filter(q => q.type !== 'behavioral');
  } else if (interviewType === 'hr') {
    selected = bank.filter(q => q.type === 'behavioral');
  }

  return selected.slice(0, count);
}

export function generateFallbackAnswerEvaluation(
  question: InterviewQuestion,
  answer: string,
  historyCount: number
): {
  evaluation: AnswerEvaluation;
  followUpQuestion?: InterviewQuestion;
  newDifficulty: DifficultyLevel;
} {
  const trimmed = answer.trim();

  // 1. Rigorous Gibberish Check
  const gibberishCheck = detectGibberish(trimmed);
  if (gibberishCheck.isGibberish) {
    const evaluation: AnswerEvaluation = {
      score: 0,
      technicalCorrectness: 0,
      relevance: 0,
      depth: 0,
      clarity: 0,
      quickFeedback: `Answer Rejected: ${gibberishCheck.reason} No technical concepts or coherent explanations were provided.`,
      keyStrengths: ['None (Unintelligible or random input)'],
      keyMissingPoints: [
        'A coherent explanation in plain English',
        'Direct answer addressing the question prompt',
        'Relevant technical frameworks, architecture, and trade-offs'
      ],
      idealAnswerHighlights: `An acceptable answer must clearly address: 1) Architectural strategy, 2) Technical mechanics (e.g. caching, indexing, concurrency), 3) Failure mitigation, and 4) Concrete metrics.`
    };

    return {
      evaluation,
      followUpQuestion: undefined,
      newDifficulty: 'beginner',
    };
  }

  // 2. Coherent word and semantic analysis
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Check technical relevance: does the response contain any engineering terms?
  const techTerms = [
    'redis', 'cache', 'caching', 'latency', 'postgres', 'postgresql', 'database',
    'query', 'index', 'sql', 'ttl', 'lock', 'mutex', 'concurrency', 'replica',
    'cluster', 'api', 'microservice', 'react', 'state', 'hook', 'nextjs', 'node',
    'docker', 'aws', 'throughput', 'p95', 'p99', 'bottleneck', 'profiling', 'trade-off',
    'architecture', 'scalable', 'sharding', 'read-replica', 'transaction', 'acid'
  ];

  const matchedTechTerms = techTerms.filter(term => 
    new RegExp(`\\b${term}\\b`, 'i').test(trimmed)
  );

  // Check causal/reasoning depth terms (indicates explaining "why")
  const reasoningTerms = ['because', 'therefore', 'in order to', 'trade-off', 'compromise', 'prevent', 'mitigate', 'resulted in', 'reduced', 'improved'];
  const hasReasoning = reasoningTerms.some(term => trimmed.toLowerCase().includes(term));

  // Check metrics/numbers
  const hasMetrics = /\b\d+(\.\d+)?(ms|s|%|k|m|users|rps)?\b/i.test(trimmed);

  // Calculate granular scores
  let score = 50;
  let correctness = 55;
  let relevance = 60;
  let depth = 40;
  let clarity = 55;

  if (matchedTechTerms.length === 0) {
    if (wordCount < 15) {
      // Trivial, empty, or non-technical response
      score = 0;
      correctness = 0;
      relevance = 0;
      depth = 0;
      clarity = 0;
    } else {
      // Off-topic or non-technical response
      score = 10;
      correctness = 5;
      relevance = 10;
      depth = 5;
      clarity = 30;
    }
  } else if (wordCount < 15) {
    // Has a tech word but too brief / superficial
    score = 25;
    correctness = 30;
    relevance = 40;
    depth = 15;
    clarity = 30;
  } else {
    // Base score on technical density
    score = 65;
    correctness = 70;
    relevance = 75;
    depth = 60;
    clarity = 70;

    if (matchedTechTerms.length >= 2) {
      score += 10;
      correctness += 10;
      depth += 10;
    }
    if (hasReasoning) {
      score += 8;
      depth += 10;
      clarity += 8;
    }
    if (hasMetrics) {
      score += 7;
      depth += 10;
      correctness += 5;
    }

    score = Math.min(95, score);
    correctness = Math.min(95, correctness);
    relevance = Math.min(98, relevance);
    depth = Math.min(95, depth);
    clarity = Math.min(95, clarity);
  }

  // Adaptive difficulty adjustment logic
  let newDifficulty: DifficultyLevel = question.difficulty;
  if (score >= 82) {
    newDifficulty = question.difficulty === 'beginner' ? 'intermediate' : 'advanced';
  } else if (score < 45) {
    newDifficulty = question.difficulty === 'advanced' ? 'intermediate' : 'beginner';
  }

  // Follow-up question if answer was decent but had gaps
  let followUpQuestion: InterviewQuestion | undefined;
  if (score >= 60 && historyCount % 2 === 1) {
    followUpQuestion = {
      id: `fu-${Date.now()}`,
      type: 'follow-up',
      category: `Deep Dive: ${question.category}`,
      targetSkillOrProject: question.targetSkillOrProject,
      difficulty: newDifficulty,
      suggestedDurationSeconds: 90,
      followUpContext: `Follow-up probing question regarding ${question.targetSkillOrProject}`,
      text: `You outlined your strategy for ${question.targetSkillOrProject}. How would you validate this architecture against high concurrent race conditions or transient network partitions?`,
    };
  }

  const feedbackSummary = score === 0
    ? 'Answer Rejected: The response contains no recognizable technical substance or relevant engineering concepts.'
    : score < 20
    ? 'Off-Topic / Non-Technical: The response does not address the core engineering principles or requirements asked in the question.'
    : score < 45
    ? 'Superficial Response: The answer is too brief or generic. It lacks architectural specifics, trade-off analysis, or concrete metrics.'
    : score < 75
    ? 'Solid Foundation: Good explanation of core concepts, but needs deeper exploration of edge cases and quantitative impact.'
    : 'Strong Staff-Level Response: Excellent technical depth, clear architectural rationale, and realistic consideration of failure modes.';

  const evaluation: AnswerEvaluation = {
    score,
    technicalCorrectness: correctness,
    relevance,
    depth,
    clarity,
    quickFeedback: feedbackSummary,
    keyStrengths: score >= 60 ? [
      `Accurately referenced relevant technologies (${matchedTechTerms.slice(0, 3).join(', ') || 'software patterns'})`,
      hasReasoning ? 'Articulated architectural cause-and-effect reasoning' : 'Clear communication structure',
      hasMetrics ? 'Cited quantitative metrics and impact' : 'Addressed the primary requirements of the prompt'
    ] : [
      'Submitted a readable response'
    ],
    keyMissingPoints: score < 80 ? [
      !hasMetrics ? 'Missing quantitative performance metrics (e.g. latency, throughput, scale)' : 'Could elaborate on failure mitigation',
      !hasReasoning ? 'Lacks explanation of alternative trade-offs considered' : 'Expand on distributed edge-case handling',
      matchedTechTerms.length < 2 ? 'Incorporate more domain-specific technical mechanics' : 'Consider operational observability'
    ] : [
      'Consider elaborating on long-term maintainability implications'
    ],
    idealAnswerHighlights: `A benchmark answer explicitly identifies the architectural constraint, details the data flow and storage mechanics, provides concrete metrics (e.g. p95 latency reduction), and outlines how failure modes are mitigated.`
  };

  return { evaluation, followUpQuestion, newDifficulty };
}

export function generateFallbackFinalReport(
  history: InterviewExchange[],
  analysis: CandidateAnalysis
): FinalEvaluationReport {
  const total = history.length || 1;
  const avgOverall = Math.round(history.reduce((sum, h) => sum + h.evaluation.score, 0) / total);
  const avgCorrectness = Math.round(history.reduce((sum, h) => sum + h.evaluation.technicalCorrectness, 0) / total);
  const avgRelevance = Math.round(history.reduce((sum, h) => sum + h.evaluation.relevance, 0) / total);
  const avgDepth = Math.round(history.reduce((sum, h) => sum + h.evaluation.depth, 0) / total);
  const avgClarity = Math.round(history.reduce((sum, h) => sum + h.evaluation.clarity, 0) / total);

  let recommendation: FinalEvaluationReport['hiringRecommendation'] = 'Hire';
  if (avgOverall >= 85) recommendation = 'Strong Hire';
  else if (avgOverall >= 70) recommendation = 'Hire';
  else if (avgOverall >= 50) recommendation = 'Borderline / Needs Follow-up';
  else recommendation = 'Not Ready Yet';

  return {
    overallScore: avgOverall,
    technicalCorrectness: avgCorrectness,
    answerRelevance: avgRelevance,
    technicalDepth: avgDepth,
    communicationClarity: avgClarity,
    hiringRecommendation: recommendation,
    performanceSummary: avgOverall < 50
      ? `The candidate did not demonstrate sufficient technical depth or clarity across the ${total} questions. Responses frequently lacked concrete architectural context, required terminology, or actionable engineering trade-offs.`
      : `The candidate demonstrated consistent technical understanding across ${total} interview questions. Their strongest showing was in ${analysis.matchingSkills[0] || 'core technical execution'}, demonstrating practical experience. Deepening explanations around edge-case mitigation and system scalability will elevate future technical rounds.`,
    strengths: avgOverall >= 50 ? [
      'Clear articulation of practical development experiences and technical concepts.',
      `Effective alignment with target requirements in ${analysis.matchingSkills.slice(0, 3).join(', ')}.`,
      'Comfortable answering questions under dynamic difficulty conditions.',
      'Maintained consistent professional communication and structured problem solving.'
    ] : [
      'Attempted the mock interview session under time constraints.'
    ],
    weaknesses: avgOverall >= 50 ? [
      'Tendency to overlook concrete failure handling and error mitigation strategies.',
      'Could incorporate more quantifiable impact metrics (e.g., latency, throughput, scale) when explaining past projects.',
      'Opportunity to deepen familiarity with distributed system trade-offs.'
    ] : [
      'Submitted superficial, incomplete, or off-topic responses.',
      'Did not demonstrate familiarity with core job requirements or architectural concepts.',
      'Must practice structuring technical answers using the STAR methodology.'
    ],
    questionBreakdown: history.map((item, idx) => ({
      questionId: item.question.id || `q-${idx}`,
      questionText: item.question.text,
      questionType: item.question.type,
      category: item.question.category,
      difficulty: item.question.difficulty,
      candidateAnswer: item.candidateAnswer,
      score: item.evaluation.score,
      critique: item.evaluation.quickFeedback,
      idealAnswer: item.evaluation.idealAnswerHighlights,
      rubricScores: {
        correctness: item.evaluation.technicalCorrectness,
        relevance: item.evaluation.relevance,
        depth: item.evaluation.depth,
        clarity: item.evaluation.clarity,
      }
    })),
    skillAssessment: [
      ...analysis.matchingSkills.map(skill => ({
        skill,
        status: (avgOverall >= 75 ? 'strong' : avgOverall >= 50 ? 'moderate' : 'needs-improvement') as 'strong' | 'moderate' | 'needs-improvement',
        note: avgOverall >= 50 
          ? `Demonstrated practical familiarity during interview discussions.`
          : `Gaps observed during technical response evaluation.`
      })),
      ...analysis.missingSkills.map(skill => ({
        skill,
        status: 'needs-improvement' as 'needs-improvement',
        note: `Identified as a gap against job requirements; recommend targeted review.`
      }))
    ],
    recommendedTopics: [
      {
        topic: 'Distributed Systems & Concurrency Patterns',
        priority: 'high',
        reason: 'Essential for answering senior-level system design and high-load questions.',
        recommendedFocus: 'Review CAP theorem, idempotent APIs, database locking mechanisms, and message queue patterns.'
      },
      {
        topic: 'Performance Profiling & Observability',
        priority: 'medium',
        reason: 'Distinguishes senior engineers by showing proactive monitoring mindset.',
        recommendedFocus: 'Practice explaining telemetry, p95/p99 latency analysis, and memory leak diagnosis.'
      },
      {
        topic: 'STAR Method Behavioral Framing',
        priority: 'medium',
        reason: 'Structures behavioral and leadership answers with clear conflict and resolution arcs.',
        recommendedFocus: 'Prepare 3-4 structured project stories highlighting personal leadership and measured impact.'
      }
    ],
    completedAt: new Date().toISOString(),
    totalTimeMinutes: Math.max(1, Math.round((total * 2.5))),
  };
}
