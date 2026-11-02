import { NextRequest, NextResponse } from 'next/server';
import { generateFinalEvaluation } from '@/lib/gemini';
import { CandidateAnalysis, InterviewExchange } from '@/types/interview';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      interviewHistory,
      candidateAnalysis,
      jobDescription,
      customApiKey,
    } = body;

    if (!interviewHistory || !Array.isArray(interviewHistory) || interviewHistory.length === 0) {
      return NextResponse.json(
        { error: 'Cannot evaluate empty interview history.' },
        { status: 400 }
      );
    }

    if (!candidateAnalysis || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing candidate analysis or job description context.' },
        { status: 400 }
      );
    }

    const { report, source } = await generateFinalEvaluation(
      interviewHistory as InterviewExchange[],
      candidateAnalysis as CandidateAnalysis,
      jobDescription,
      customApiKey
    );

    return NextResponse.json({
      success: true,
      report,
      source,
    });
  } catch (error) {
    console.error('Error in /api/interview/evaluate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate final evaluation report.' },
      { status: 500 }
    );
  }
}
