import { NextRequest, NextResponse } from 'next/server';
import { executeCode } from '@/lib/code-runner';
import { CodingChallenge, SupportedLanguage } from '@/types/interview';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { code, challenge, language = 'typescript' } = await req.json();

    if (!code || !challenge) {
      return NextResponse.json({ error: 'Missing code or challenge payload.' }, { status: 400 });
    }

    // Strictly honor the language chosen by the user in the dropdown.
    // Only fallback if empty or invalid.
    const effectiveLanguage: SupportedLanguage | string = language || 'typescript';

    const result = await executeCode(code, challenge as CodingChallenge, effectiveLanguage);
    return NextResponse.json(result);
  } catch (globalErr: any) {
    console.error('Unhandled coding execution error:', globalErr);
    return NextResponse.json(
      {
        status: 'Runtime Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        error: globalErr.message || 'Execution failed',
        testResults: [],
      },
      { status: 500 }
    );
  }
}
