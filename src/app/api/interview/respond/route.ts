import { NextRequest, NextResponse } from 'next/server';
import { evaluateCandidateAnswer, generateAdaptiveNextQuestion } from '@/lib/gemini';
import { CandidateAnalysis, DifficultyLevel, InterviewExchange, InterviewQuestion } from '@/types/interview';
import { generateFallbackQuestions } from '@/lib/fallback-data';

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

    const {
      evaluation,
      followUpQuestion,
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

    // Compute candidate proficiency metrics across all answers
    const allScores = [...typedHistory.map(h => h.evaluation.score), evaluation.score];
    const avgScore = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
    const recentScores = allScores.slice(-2);
    const hasRecentStruggle = recentScores.some(s => s < 60);
    const hasGibberishOrZero = allScores.some(s => s === 0);

    // High proficiency stopping criteria:
    // "atleast 5 questions and atmost 12 questions based on candidate answering ability:
    // if candidate seems to give answers perfectly then stop at 5 if not extend it"
    const isMasteryEstablished = answeredCount >= 5 && avgScore >= 75 && !hasRecentStruggle && !hasGibberishOrZero;

    let isComplete = false;
    let nextQuestion: InterviewQuestion | null = null;
    let isFollowUp = false;
    let interviewerNote = '';

    if (answeredCount >= 12) {
      // Hard ceiling of 12 questions reached
      isComplete = true;
      interviewerNote = 'Comprehensive assessment depth completed (12 questions maximum).';
    } else if (answeredCount >= 5 && isMasteryEstablished) {
      // Candidate gave answers perfectly / demonstrated clear mastery across foundational competencies
      isComplete = true;
      interviewerNote = 'Candidate demonstrated thorough, confident mastery across core competencies. Signal established in 5 questions.';
    } else {
      // Must continue: either answeredCount < 5, OR candidate missed details/struggled and needs further probing!
      isComplete = false;
      if (answeredCount >= 5) {
        interviewerNote = `Probing deeper into technical edge cases (Question ${answeredCount + 1} of max 12).`;
      }
    }

    if (!isComplete) {
      // 1. If Gemini suggested a specific follow-up probing question for this answer, prioritize it
      if (followUpQuestion && answeredCount < 12) {
        nextQuestion = followUpQuestion;
        isFollowUp = true;
      } else {
        // 2. Look for remaining questions from the initial pool
        const typedAll = (allQuestions as InterviewQuestion[]);
        const askedIds = new Set([
          ...typedHistory.map(h => h.question.id),
          currentQuestion.id,
        ]);
        const remainingQuestions = typedAll.filter(q => !askedIds.has(q.id));

        if (remainingQuestions.length > 0) {
          nextQuestion = {
            ...remainingQuestions[0],
            difficulty: newDifficulty,
          };
        } else {
          // 3. Question bank exhausted! Dynamically generate next adaptive question on the fly (probing up to 12)
          if (candidateAnalysis && (resumeText || jobDescription)) {
            nextQuestion = await generateAdaptiveNextQuestion(
              candidateAnalysis as CandidateAnalysis,
              resumeText,
              jobDescription,
              [...typedHistory, { question: currentQuestion, candidateAnswer, evaluation, answeredAt: new Date().toISOString() }],
              newDifficulty,
              customApiKey
            );
          } else {
            const fallbackPool = generateFallbackQuestions(
              candidateAnalysis || ({} as any),
              'mixed',
              newDifficulty,
              12,
              ['foundation', 'behavioral']
            );
            const unusedFallback = fallbackPool.find(q => !askedIds.has(q.id));
            nextQuestion = unusedFallback || {
              id: `q-adapt-${answeredCount + 1}`,
              roundType: 'foundation',
              skillStage: `Stage ${answeredCount + 1}: Deeper Competency Probe`,
              text: `When building backend systems under high concurrent load, how do you handle asynchronous error propagation and database connection pool exhaustion?`,
              type: 'job-requirement',
              category: 'Resilience & Architecture',
              targetSkillOrProject: 'Backend Systems',
              difficulty: newDifficulty,
              suggestedDurationSeconds: 90,
            };
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      answerEvaluation: evaluation,
      nextQuestion,
      isFollowUp,
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
