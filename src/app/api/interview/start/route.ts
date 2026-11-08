import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions, generateDynamicCodingChallenges } from '@/lib/gemini';
import { CandidateAnalysis, DifficultyLevel, InterviewType, InterviewRoundType } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resumeText,
      jobDescription,
      candidateAnalysis,
      selectedRounds = ['foundation', 'coding', 'behavioral'],
      interviewType = 'mixed',
      difficulty = 'intermediate',
      interviewLength = 5,
      customApiKey,
    } = body;

    if (!resumeText || !jobDescription || !candidateAnalysis) {
      return NextResponse.json(
        { error: 'Missing required context: resume, job description, or candidate analysis.' },
        { status: 400 }
      );
    }

    const rounds = (Array.isArray(selectedRounds) && selectedRounds.length > 0)
      ? selectedRounds as InterviewRoundType[]
      : ['foundation', 'coding', 'behavioral'] as InterviewRoundType[];

    // Seed an initial pool of 7 foundational and behavioral questions
    const count = 7;

    // 1. Generate verbal questions if foundation or behavioral rounds are selected
    let questions: any[] = [];
    let questionSource = 'gemini';

    const hasVerbal = rounds.includes('foundation') || rounds.includes('behavioral');
    if (hasVerbal) {
      const qRes = await generateInterviewQuestions(
        candidateAnalysis as CandidateAnalysis,
        resumeText,
        jobDescription,
        interviewType as InterviewType,
        difficulty as DifficultyLevel,
        count,
        customApiKey,
        rounds
      );
      questions = qRes.questions;
      questionSource = qRes.source;
    }

    // 2. Generate role-specific LeetCode DSA challenges if coding round is selected
    let codingChallenges: any[] = [];
    let codingSource = 'gemini';

    if (rounds.includes('coding')) {
      const cRes = await generateDynamicCodingChallenges(
        candidateAnalysis as CandidateAnalysis,
        jobDescription,
        resumeText,
        difficulty as DifficultyLevel,
        customApiKey
      );
      codingChallenges = cRes.challenges;
      codingSource = cRes.source;
    }

    return NextResponse.json({
      success: true,
      questions,
      codingChallenges,
      selectedRounds: rounds,
      initialQuestion: questions[0] || null,
      totalQuestions: questions.length,
      sessionContext: {
        selectedRounds: rounds,
        interviewType,
        initialDifficulty: difficulty,
        candidateName: candidateAnalysis.candidateName,
        createdAt: new Date().toISOString(),
      },
      source: questionSource === 'fallback' && codingSource === 'fallback' ? 'fallback' : 'gemini',
    });
  } catch (error) {
    console.error('Error in /api/interview/start:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate interview questions.' },
      { status: 500 }
    );
  }
}
