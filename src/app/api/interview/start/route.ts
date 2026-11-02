import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/gemini';
import { CandidateAnalysis, DifficultyLevel, InterviewType } from '@/types/interview';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resumeText,
      jobDescription,
      candidateAnalysis,
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

    const count = typeof interviewLength === 'number' ? Math.min(10, Math.max(3, interviewLength)) : 5;

    const { questions, source } = await generateInterviewQuestions(
      candidateAnalysis as CandidateAnalysis,
      resumeText,
      jobDescription,
      interviewType as InterviewType,
      difficulty as DifficultyLevel,
      count,
      customApiKey
    );

    return NextResponse.json({
      success: true,
      questions,
      initialQuestion: questions[0],
      totalQuestions: questions.length,
      sessionContext: {
        interviewType,
        initialDifficulty: difficulty,
        candidateName: candidateAnalysis.candidateName,
        createdAt: new Date().toISOString(),
      },
      source,
    });
  } catch (error) {
    console.error('Error in /api/interview/start:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate interview questions.' },
      { status: 500 }
    );
  }
}
