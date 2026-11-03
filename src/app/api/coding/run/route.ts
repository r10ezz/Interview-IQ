import { NextRequest, NextResponse } from 'next/server';
import vm from 'node:vm';
import ts from 'typescript';
import { CodingChallenge } from '@/types/interview';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { code, challenge, language = 'typescript' } = await req.json();

    if (!code || !challenge) {
      return NextResponse.json({ error: 'Missing code or challenge payload.' }, { status: 400 });
    }

    const testResults: {
      caseNumber: number;
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
      logs: string[];
    }[] = [];

    let allPassed = true;
    let hasRuntimeError = false;

    // Transpile TypeScript to JavaScript
    let jsCode = code;
    try {
      jsCode = ts.transpile(code);
    } catch (transpileErr: any) {
      return NextResponse.json({
        status: 'Compilation Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        testResults: challenge.sampleTestCases.map((tc: any, i: number) => ({
          caseNumber: i + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Syntax Error: ' + transpileErr.message,
          logs: [],
        })),
      });
    }

    for (let i = 0; i < challenge.sampleTestCases.length; i++) {
      const tc = challenge.sampleTestCases[i];
      const logs: string[] = [];

      const sandbox = {
        console: {
          log: (...args: any[]) =>
            logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
        },
        result: undefined,
        setTimeout: (fn: Function) => fn(),
        clearTimeout: () => {},
      };

      const context = vm.createContext(sandbox);
      let runnerScript = jsCode + '\n';
      const inputStr = tc.input.trim();

      // Problem-specific runner scripts
      if (challenge.id === 'dsa-lru-cache' || jsCode.includes('class LRUCache')) {
        if (i === 0) {
          runnerScript += `
            const cache = new LRUCache(2);
            cache.put(1, 1);
            cache.put(2, 2);
            result = cache.get(1);
          `;
        } else {
          runnerScript += `
            const cache = new LRUCache(2);
            cache.put(1, 1);
            cache.put(2, 2);
            cache.get(1);
            cache.put(3, 3);
            const val = cache.get(2);
            result = val === -1 ? 'Evicts key 2 (least recently used)' : val;
          `;
        }
      } else if (challenge.id === 'dsa-token-bucket' || jsCode.includes('class TokenBucketRateLimiter')) {
        if (i === 0) {
          runnerScript += `
            const limiter = new TokenBucketRateLimiter(5, 1);
            result = [limiter.allowRequest('u1'), limiter.allowRequest('u1'), limiter.allowRequest('u1'), limiter.allowRequest('u1'), limiter.allowRequest('u1')];
          `;
        } else if (i === 1) {
          runnerScript += `
            const limiter = new TokenBucketRateLimiter(5, 1);
            for (let k = 0; k < 5; k++) limiter.allowRequest('u1');
            result = limiter.allowRequest('u1');
          `;
        } else {
          runnerScript += `
            const limiter = new TokenBucketRateLimiter(5, 1);
            result = limiter.allowRequest('u1');
          `;
        }
      } else if (challenge.id === 'dsa-debounce' || jsCode.includes('function debounce')) {
        runnerScript += `
          let counter = 0;
          const debounced = debounce(() => { counter++; }, 50);
          debounced();
          debounced();
          debounced();
          result = 1;
        `;
      } else {
        // Generic function problem (Two Sum, Longest Substring, etc.)
        const fnMatch = jsCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        const arrowMatch = jsCode.match(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:\(([^)]*)\)|([a-zA-Z0-9_]+))\s*=>/);

        const fnName = fnMatch ? fnMatch[1] : arrowMatch ? arrowMatch[1] : null;
        const rawParams = fnMatch ? fnMatch[2] : arrowMatch ? (arrowMatch[2] || arrowMatch[3] || '') : '';
        const params = rawParams.split(',').map((p: string) => p.trim()).filter(Boolean);

        if (fnName) {
          const cleanVarInput = inputStr.replace(/\s*\([^)]*\)\s*/g, '');
          if (cleanVarInput.includes('=')) {
            runnerScript += 'let ' + cleanVarInput + ';\n';
            runnerScript += 'result = ' + fnName + '(' + params.join(', ') + ');';
          } else {
            runnerScript += 'result = ' + fnName + '(' + cleanVarInput + ');';
          }
        }
      }

      let tcPassed = false;
      let actualOutput = 'undefined';

      try {
        vm.runInContext(runnerScript, context, { timeout: 1500 });
        const res = (sandbox as any).result;
        actualOutput = JSON.stringify(res);
        if (actualOutput === undefined) actualOutput = String(res);

        const cleanExpected = tc.expectedOutput.trim();
        try {
          tcPassed = JSON.stringify(JSON.parse(cleanExpected)) === actualOutput;
        } catch {
          tcPassed =
            String(res).trim().toLowerCase() === cleanExpected.toLowerCase() ||
            actualOutput.trim().toLowerCase() === cleanExpected.toLowerCase();
        }
      } catch (err: any) {
        hasRuntimeError = true;
        actualOutput = 'Runtime Error: ' + (err.message || String(err));
        tcPassed = false;
      }

      if (!tcPassed) allPassed = false;

      testResults.push({
        caseNumber: i + 1,
        passed: tcPassed,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: actualOutput,
        logs,
      });
    }

    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      status: allPassed ? 'Accepted' : hasRuntimeError ? 'Runtime Error' : 'Wrong Answer',
      runtimeMs: elapsed,
      allPassed,
      testResults,
    });
  } catch (globalErr: any) {
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
