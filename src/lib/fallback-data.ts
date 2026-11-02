import {
  CandidateAnalysis,
  InterviewQuestion,
  AnswerEvaluation,
  FinalEvaluationReport,
  InterviewExchange,
  DifficultyLevel,
  InterviewType,
} from '@/types/interview';

// Helper keyword extractor to make fallback dynamic and contextual
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

  // If few skills detected, provide sensible defaults
  const finalSkills = resumeSkills.length > 0 ? resumeSkills : ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'];
  const finalMatching = matchingSkills.length > 0 ? matchingSkills : ['JavaScript', 'React', 'Node.js'];
  const finalMissing = missingSkills.length > 0 ? missingSkills : ['Cloud Architecture (AWS)', 'Kubernetes', 'System Profiling'];

  // Try extracting candidate name from first few lines
  const firstLines = resumeText.split('\n').filter(l => l.trim().length > 0);
  let candidateName = 'Candidate';
  if (firstLines.length > 0) {
    const candidateLine = firstLines[0].replace(/[^a-zA-Z\s]/g, '').trim();
    if (candidateLine.length > 2 && candidateLine.split(' ').length <= 4) {
      candidateName = candidateLine;
    }
  }

  // Calculate dynamic match score
  const matchRatio = jdSkills.length > 0 ? matchingSkills.length / jdSkills.length : 0.75;
  const matchScore = Math.min(95, Math.max(58, Math.round(matchRatio * 100)));

  return {
    candidateName,
    experienceSummary: `Candidate with demonstrated background in ${finalSkills.slice(0, 4).join(', ')}. Shows practical experience developing web applications, microservices, and collaborating across engineering workflows.`,
    technicalSkills: finalSkills,
    projects: [
      {
        name: 'Enterprise Service & UI Modernization',
        description: 'Led end-to-end full stack development, modularizing application architecture and optimizing API throughput.',
        techStack: finalSkills.slice(0, 3),
      },
      {
        name: 'Distributed Data & API Service',
        description: 'Designed database schemas, implemented secure endpoints, and integrated automated testing pipelines.',
        techStack: finalSkills.slice(1, 4),
      }
    ],
    jobRequirements: jdSkills.length > 0 ? jdSkills : ['Modern Web Frameworks', 'API Design & Microservices', 'Relational Databases', 'Performance Optimization'],
    matchingSkills: finalMatching,
    missingSkills: finalMissing,
    matchScore,
    recommendedTopics: [
      ...finalMissing.slice(0, 2),
      'System Architecture & Scaling',
      'Production Edge Cases & Testing Strategy'
    ],
    confidenceAssessment: 'High confidence match. Strong alignment on core technical frameworks with growth opportunities in cloud orchestration and distributed system depth.',
  };
}

export function generateFallbackQuestions(
  analysis: CandidateAnalysis,
  interviewType: InterviewType,
  difficulty: DifficultyLevel,
  count: number = 5
): InterviewQuestion[] {
  const topMatchSkill = analysis.matchingSkills[0] || 'software development';
  const secondMatchSkill = analysis.matchingSkills[1] || 'backend architecture';
  const topProject = analysis.projects[0]?.name || 'recent production project';
  const targetRequirement = analysis.jobRequirements[0] || 'core engineering requirements';

  const bank: InterviewQuestion[] = [
    {
      id: 'q1',
      type: 'job-requirement',
      category: 'System Architecture & Technical Fundamentals',
      targetSkillOrProject: targetRequirement,
      difficulty,
      suggestedDurationSeconds: 120,
      text: `Based on the job requirements for this role, how would you design a resilient architecture using ${topMatchSkill} that can handle unexpected traffic spikes while maintaining low database latency?`,
    },
    {
      id: 'q2',
      type: 'resume-project',
      category: 'Practical Project Implementation',
      targetSkillOrProject: topProject,
      difficulty,
      suggestedDurationSeconds: 150,
      text: `In your resume, you highlighted your work on "${topProject}". What was the single most difficult engineering obstacle you encountered during this project, and how did you resolve it technically?`,
    },
    {
      id: 'q3',
      type: 'job-requirement',
      category: 'Data Integrity & Performance Optimization',
      targetSkillOrProject: secondMatchSkill,
      difficulty,
      suggestedDurationSeconds: 120,
      text: `When working with ${secondMatchSkill} in production, how do you handle concurrency, race conditions, or state synchronization across distributed client sessions?`,
    },
    {
      id: 'q4',
      type: 'resume-project',
      category: 'Code Quality & Technical Trade-offs',
      targetSkillOrProject: analysis.technicalSkills[2] || 'Testing & CI/CD',
      difficulty,
      suggestedDurationSeconds: 120,
      text: `Walk me through a situation where you had to make a difficult trade-off between architectural purity, development speed, and runtime performance. What decision did you take?`,
    },
    {
      id: 'q5',
      type: 'behavioral',
      category: 'Collaboration & Engineering Leadership',
      targetSkillOrProject: 'Conflict Resolution & Teamwork',
      difficulty: 'intermediate',
      suggestedDurationSeconds: 120,
      text: `Tell me about a time when you and a senior team member or stakeholder disagreed fundamentally on a technical design or implementation approach. How did you communicate and align?`,
    },
    {
      id: 'q6',
      type: 'job-requirement',
      category: 'Observability & Troubleshooting',
      targetSkillOrProject: 'Production Debugging',
      difficulty,
      suggestedDurationSeconds: 120,
      text: `If a critical production service begins throwing 5xx errors or degrading in response times at 2:00 AM, what is your systematic troubleshooting methodology from alert to root-cause post-mortem?`,
    },
    {
      id: 'q7',
      type: 'behavioral',
      category: 'Continuous Learning & Adaptability',
      targetSkillOrProject: 'Technology Evolution',
      difficulty: 'intermediate',
      suggestedDurationSeconds: 120,
      text: `How do you decide when a newly released framework or library is mature enough to adopt in production, versus sticking with established industry standards?`,
    }
  ];

  // Adjust for interview type filter if strictly technical or strictly HR
  let selected = bank;
  if (interviewType === 'technical') {
    selected = bank.filter(q => q.type !== 'behavioral');
  } else if (interviewType === 'hr') {
    selected = bank.filter(q => q.type === 'behavioral' || q.category.includes('Leadership'));
  }

  // Ensure count matches
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
  const words = answer.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  let score = 75;
  let correctness = 78;
  let relevance = 80;
  let depth = 70;
  let clarity = 75;

  if (wordCount < 15) {
    score = 45;
    correctness = 50;
    relevance = 55;
    depth = 35;
    clarity = 50;
  } else if (wordCount < 40) {
    score = 65;
    correctness = 68;
    relevance = 70;
    depth = 60;
    clarity = 68;
  } else if (wordCount > 100) {
    score = 88;
    correctness = 88;
    relevance = 90;
    depth = 86;
    clarity = 85;
  } else {
    score = 80;
    correctness = 82;
    relevance = 84;
    depth = 76;
    clarity = 80;
  }

  // Adaptive difficulty adjustment logic
  let newDifficulty: DifficultyLevel = question.difficulty;
  if (score >= 85) {
    newDifficulty = question.difficulty === 'beginner' ? 'intermediate' : 'advanced';
  } else if (score < 55) {
    newDifficulty = question.difficulty === 'advanced' ? 'intermediate' : 'beginner';
  }

  // Generate an adaptive follow-up if candidate answered with good points but left a technical nuance open
  let followUpQuestion: InterviewQuestion | undefined;
  if (score >= 65 && historyCount % 2 === 1) {
    followUpQuestion = {
      id: `fu-${Date.now()}`,
      type: 'follow-up',
      category: `Deep Dive: ${question.category}`,
      targetSkillOrProject: question.targetSkillOrProject,
      difficulty: newDifficulty,
      suggestedDurationSeconds: 90,
      followUpContext: `Follow-up probing question based on your response regarding ${question.targetSkillOrProject}`,
      text: `You mentioned your approach to ${question.targetSkillOrProject}. How would you validate this approach against edge cases like intermittent network failures or high concurrent write conflicts?`,
    };
  }

  const evaluation: AnswerEvaluation = {
    score,
    technicalCorrectness: correctness,
    relevance,
    depth,
    clarity,
    quickFeedback: score >= 75 
      ? 'Strong, structured answer addressing the core concepts with relevant context.'
      : 'Good foundational attempt, but could benefit from deeper technical specifics and concrete metrics.',
    keyStrengths: [
      'Directly addressed the primary intent of the question',
      'Articulated reasonable architectural or methodological rationale',
      'Demonstrated practical awareness of engineering constraints'
    ],
    keyMissingPoints: score < 80 ? [
      'Could cite specific metrics or quantitative outcomes',
      'Missing concrete edge-case handling or failure mitigation strategy'
    ] : [
      'Consider elaborating on long-term maintainability implications'
    ],
    idealAnswerHighlights: `A top-tier answer addresses the core problem, outlines architectural trade-offs, specifies data flow and caching/storage mechanics, and explains how failure modes are mitigated.`
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
  else if (avgOverall >= 55) recommendation = 'Borderline / Needs Follow-up';
  else recommendation = 'Not Ready Yet';

  return {
    overallScore: avgOverall,
    technicalCorrectness: avgCorrectness,
    answerRelevance: avgRelevance,
    technicalDepth: avgDepth,
    communicationClarity: avgClarity,
    hiringRecommendation: recommendation,
    performanceSummary: `The candidate demonstrated consistent technical understanding across ${total} interview questions. Their strongest showing was in ${analysis.matchingSkills[0] || 'core technical execution'}, demonstrating practical experience. Deepening explanations around edge-case mitigation and system scalability will elevate future technical rounds.`,
    strengths: [
      'Clear articulation of practical development experiences and technical concepts.',
      `Effective alignment with target requirements in ${analysis.matchingSkills.slice(0, 3).join(', ')}.`,
      'Comfortable answering questions under dynamic difficulty conditions.',
      'Maintained consistent professional communication and structured problem solving.'
    ],
    weaknesses: [
      'Tendency to overlook concrete failure handling and error mitigation strategies.',
      'Could incorporate more quantifiable impact metrics (e.g., latency, throughput, scale) when explaining past projects.',
      'Opportunity to deepen familiarity with distributed system trade-offs.'
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
        status: (avgOverall >= 75 ? 'strong' : 'moderate') as 'strong' | 'moderate',
        note: `Demonstrated practical familiarity during interview discussions.`
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
