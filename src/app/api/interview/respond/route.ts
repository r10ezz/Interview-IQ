import { NextRequest, NextResponse } from 'next/server';
import { evaluateCandidateAnswer, generateAdaptiveNextQuestion } from '@/lib/gemini';
import { CandidateAnalysis, DifficultyLevel, InterviewExchange, InterviewQuestion } from '@/types/interview';
import { generateFallbackQuestions } from '@/lib/fallback-data';

function getTopicGroup(q: InterviewQuestion): string {
  const combined = ((q.category || '') + ' ' + (q.targetSkillOrProject || '') + ' ' + (q.text || '')).toLowerCase();

  if (combined.includes('behavioral') || combined.includes('conflict') || combined.includes('deadline') || combined.includes('teammate') || combined.includes('bug you ran into') || combined.includes('tell me about a time')) {
    return 'behavioral_leadership';
  }
  if (combined.includes('project') || combined.includes('worked on') || combined.includes('overview of what this project') || combined.includes('responsibilities were')) {
    return 'project_architecture';
  }
  if (combined.includes('react') || combined.includes('state and props') || combined.includes('useeffect') || combined.includes('hook') || combined.includes('re-render') || combined.includes('virtual dom') || combined.includes('component')) {
    return 'frontend_framework';
  }
  if (combined.includes('database') || combined.includes('sql') || combined.includes('postgres') || combined.includes('indexing') || combined.includes('nosql') || combined.includes('transaction') || combined.includes('acid') || combined.includes('get and a post') || combined.includes('api') || combined.includes('rest')) {
    return 'backend_storage_api';
  }
  if (combined.includes('event loop') || combined.includes('promise') || combined.includes('async') || combined.includes('closure') || combined.includes('javascript') || combined.includes('typescript') || combined.includes('call stack')) {
    return 'core_language_runtime';
  }
  if (combined.includes('cache') || combined.includes('redis') || combined.includes('security') || combined.includes('jwt') || combined.includes('auth') || combined.includes('latency') || combined.includes('error propagation') || combined.includes('concurrency')) {
    return 'system_architecture_reliability';
  }

  return (q.category || 'general_technical').toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function getTopicDisplayName(topicGroup: string): string {
  switch (topicGroup) {
    case 'core_language_runtime': return 'Language Mechanics & Async Runtime';
    case 'frontend_framework': return 'Component & State Architecture';
    case 'backend_storage_api': return 'Backend APIs & Database Storage';
    case 'system_architecture_reliability': return 'Production Reliability & Caching';
    case 'project_architecture': return 'Resume Project Architecture';
    case 'behavioral_leadership': return 'Behavioral & Technical Problem Solving';
    default: return 'Core Engineering Competencies';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      currentQuestion,
      candidateAnswer,
      questionIndex = 0,
      previousHistory = [],
      allQuestions = [],
      currentDifficulty = 'intermediate',
      candidateAnalysis,
      jobDescription = '',
      resumeText = '',
      customApiKey,
    } = body;

    if (!currentQuestion) {
      return NextResponse.json({ error: 'Missing current question.' }, { status: 400 });
    }

    if (!candidateAnswer || typeof candidateAnswer !== 'string' || candidateAnswer.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter a response before submitting.' },
        { status: 400 }
      );
    }

    const typedHistory = previousHistory as InterviewExchange[];
    const answeredCount = typedHistory.length + 1; // Including the current answer

    // 1. Identify current topic and evaluate candidate answer
    const currentTopicGroup = getTopicGroup(currentQuestion as InterviewQuestion);
    const currentTopicName = getTopicDisplayName(currentTopicGroup);

    const {
      evaluation,
      newDifficulty,
      source,
    } = await evaluateCandidateAnswer(
      currentQuestion as InterviewQuestion,
      candidateAnswer.trim(),
      questionIndex,
      12, // Maximum possible questions
      typedHistory,
      currentDifficulty as DifficultyLevel,
      customApiKey
    );

    // 2. Identify all topics evaluated so far in this session
    const previouslyAskedTopicGroups = new Set(typedHistory.map(h => getTopicGroup(h.question)));
    const allConcludedTopicGroups = new Set([...previouslyAskedTopicGroups, currentTopicGroup]);
    const concludedTopicNames = Array.from(allConcludedTopicGroups).map(getTopicDisplayName);

    // 3. Formulate topic conclusion based on candidate's performance
    // Rule: We conclude the topic right here. We do NOT badger or extend the same topic either way!
    let topicConclusionMessage = '';
    if (evaluation.score >= 70) {
      topicConclusionMessage = `Clear grasp of ${currentTopicName} confirmed.`;
    } else if (evaluation.score < 50) {
      topicConclusionMessage = `Recorded baseline signal on ${currentTopicName}. Concluding this topic to prevent fatigue.`;
    } else {
      topicConclusionMessage = `Adequate competency signal recorded for ${currentTopicName}.`;
    }

    // 4. Compute overall candidate proficiency metrics across all answers
    const allScores = [...typedHistory.map(h => h.evaluation.score), evaluation.score];
    const avgScore = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
    const recentScores = allScores.slice(-2);
    const hasRecentStruggle = recentScores.some(s => s < 60);
    const hasGibberishOrZero = allScores.some(s => s === 0);

    // High proficiency stopping criteria:
    // At least 5 questions, avgScore >= 75 across diverse topics, no recent struggles, no zeros.
    const isMasteryEstablished = answeredCount >= 5 && avgScore >= 75 && !hasRecentStruggle && !hasGibberishOrZero;

    let isComplete = false;
    let nextQuestion: InterviewQuestion | null = null;
    let interviewerNote = '';

    if (answeredCount >= 12) {
      isComplete = true;
      interviewerNote = `${topicConclusionMessage} Comprehensive evaluation completed across multiple technical pillars (12 questions maximum).`;
    } else if (answeredCount >= 5 && isMasteryEstablished) {
      isComplete = true;
      interviewerNote = `${topicConclusionMessage} Thorough, confident mastery demonstrated across core competencies in 5 questions. Concluding verbal round.`;
    } else {
      isComplete = false;
    }

    // 5. Select next question from a NEW, UNTESTED TOPIC (guaranteed topic switching across 3-4 topics)
    if (!isComplete) {
      const typedAll = (allQuestions as InterviewQuestion[]);
      const askedIds = new Set([
        ...typedHistory.map(h => h.question.id),
        currentQuestion.id,
      ]);

      const remainingQuestions = typedAll.filter(q => !askedIds.has(q.id));
      // Prioritize questions from a fresh, untouched topic group
      const freshTopicQuestion = remainingQuestions.find(q => !allConcludedTopicGroups.has(getTopicGroup(q)));

      if (freshTopicQuestion) {
        nextQuestion = {
          ...freshTopicQuestion,
          difficulty: newDifficulty,
        };
      } else if (remainingQuestions.length > 0) {
        // If all primary topic groups have had at least one question, pick a question from a different topic than the current one
        const differentTopicQuestion = remainingQuestions.find(q => getTopicGroup(q) !== currentTopicGroup);
        nextQuestion = {
          ...(differentTopicQuestion || remainingQuestions[0]),
          difficulty: newDifficulty,
        };
      } else {
        // Initial pool exhausted: dynamically generate an adaptive question on a fresh topic
        if (candidateAnalysis && (resumeText || jobDescription)) {
          nextQuestion = await generateAdaptiveNextQuestion(
            candidateAnalysis as CandidateAnalysis,
            resumeText,
            jobDescription,
            [...typedHistory, { question: currentQuestion, candidateAnswer, evaluation, answeredAt: new Date().toISOString() }],
            newDifficulty,
            customApiKey,
            concludedTopicNames
          );
        } else {
          const fallbackPool = generateFallbackQuestions(
            candidateAnalysis || ({} as any),
            'mixed',
            newDifficulty,
            12,
            ['foundation', 'behavioral']
          );
          const freshFallback = fallbackPool.find(
            q => !askedIds.has(q.id) && !allConcludedTopicGroups.has(getTopicGroup(q))
          );
          nextQuestion = freshFallback || fallbackPool.find(q => !askedIds.has(q.id)) || {
            id: `q-adapt-${answeredCount + 1}`,
            roundType: 'foundation',
            skillStage: `Stage ${answeredCount + 1}: Production Reliability`,
            text: `When building backend systems under high load, how do you handle error propagation, circuit breaking, and database timeouts?`,
            type: 'job-requirement',
            category: 'System Reliability',
            targetSkillOrProject: 'Backend Systems',
            difficulty: newDifficulty,
            suggestedDurationSeconds: 90,
          };
        }
      }

      const nextTopicName = getTopicDisplayName(getTopicGroup(nextQuestion));
      interviewerNote = `${topicConclusionMessage} Shifting focus to ${nextTopicName} (Question ${answeredCount + 1}).`;
    }

    return NextResponse.json({
      success: true,
      answerEvaluation: evaluation,
      nextQuestion,
      isFollowUp: false,
      newDifficulty,
      isComplete,
      interviewerNote,
      answeredCount,
      source,
    });
  } catch (error) {
    console.error('Error in /api/interview/respond:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to evaluate response.' },
      { status: 500 }
    );
  }
}
