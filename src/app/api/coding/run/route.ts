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

    // Auto-detect language if not explicitly provided or if user pasted Python/Java/C/C++ into default
    let effectiveLanguage: SupportedLanguage | string = language;
    if (language === 'typescript' || language === 'javascript') {
      if (/^\s*#include\s+<iostream>/m.test(code) || /std::/m.test(code) || /class\s+Solution\s*\{[\s\S]*public:/m.test(code)) {
        effectiveLanguage = 'cpp';
      } else if (/^\s*#include\s+<stdio\.h>/m.test(code) || /int\*\s+[a-zA-Z0-9_]+\s*\(/m.test(code)) {
        effectiveLanguage = 'c';
      } else if (/public\s+class\s+Solution/m.test(code) || /public\s+static\s+void\s+main/m.test(code) || /class\s+Solution\s*\{[\s\S]*public\s+[a-zA-Z0-9_\[\]]+\s+[a-zA-Z0-9_]+\s*\(/m.test(code)) {
        effectiveLanguage = 'java';
      } else if (/^\s*def\s+[a-zA-Z0-9_]+\s*\(/m.test(code) || /class\s+Solution:[\s\S]*def\s+/m.test(code)) {
        effectiveLanguage = 'python';
      }
    }

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
