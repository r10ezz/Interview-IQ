import { NextRequest, NextResponse } from 'next/server';
import { evaluateCandidateAnswer } from '@/lib/gemini';
import { DifficultyLevel, InterviewExchange, InterviewQuestion } from '@/types/interview';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      currentQuestion,
      candidateAnswer,
      questionIndex = 0,
      totalQuestions = 5,
      previousHistory = [],
      allQuestions = [],
      currentDifficulty = 'intermediate',
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

    const {
      evaluation,
      followUpQuestion,
      newDifficulty,
      source,
    } = await evaluateCandidateAnswer(
      currentQuestion as InterviewQuestion,
      candidateAnswer.trim(),
      questionIndex,
      totalQuestions,
      typedHistory,
      currentDifficulty as DifficultyLevel,
      customApiKey
    );

    // Determine the next question
    let nextQuestion: InterviewQuestion | null = null;
    let isFollowUp = false;
    let isComplete = false;

    // We can insert a follow-up if it was generated and the interview isn't already long
    if (followUpQuestion && typedHistory.length < totalQuestions - 1) {
      nextQuestion = followUpQuestion;
      isFollowUp = true;
    } else {
      // Find the next question from planned allQuestions that hasn't been asked yet
      const typedAll = (allQuestions as InterviewQuestion[]);
      const askedIds = new Set([
        ...typedHistory.map(h => h.question.id),
        currentQuestion.id,
      ]);

      const remainingQuestions = typedAll.filter(q => !askedIds.has(q.id));

      if (remainingQuestions.length > 0 && typedHistory.length + 1 < totalQuestions) {
        // Adapt next question difficulty
        nextQuestion = {
          ...remainingQuestions[0],
          difficulty: newDifficulty,
        };
      } else {
        isComplete = true;
      }
    }

    return NextResponse.json({
      success: true,
      answerEvaluation: evaluation,
      nextQuestion,
      isFollowUp,
      newDifficulty,
      isComplete,
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
