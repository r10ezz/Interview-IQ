import { NextRequest, NextResponse } from 'next/server';
import vm from 'node:vm';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
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

    // Detect if code is Python
    const isPython = language === 'python' || /^\s*def\s+[a-zA-Z0-9_]+\s*\(/m.test(code);

    if (isPython) {
      // Execute Python code
      const starterFnMatch = challenge.starterCode.match(/function\s+([a-zA-Z0-9_]+)/) ||
                             challenge.starterCode.match(/def\s+([a-zA-Z0-9_]+)/);
      const expectedFnName = starterFnMatch ? starterFnMatch[1] : 'solve';

      for (let i = 0; i < challenge.sampleTestCases.length; i++) {
        const tc = challenge.sampleTestCases[i];
        const inputStr = tc.input.trim();
        const cleanExpected = tc.expectedOutput.trim();

        const pyRunner = `
import json, sys

${code}

def __run_test():
    scope = {}
    exec('''${inputStr.replace(/\\/g, '\\\\').replace(/'''/g, "\\'\\'\\'")}''', scope)
    
    fn = None
    if '${expectedFnName}' in globals() and callable(globals()['${expectedFnName}']):
        fn = globals()['${expectedFnName}']
    elif '${expectedFnName}' in scope and callable(scope['${expectedFnName}']):
        fn = scope['${expectedFnName}']
    elif 'Solution' in globals():
        sol = Solution()
        if hasattr(sol, '${expectedFnName}'):
            fn = getattr(sol, '${expectedFnName}')
        else:
            methods = [m for m in dir(sol) if not m.startswith('_')]
            if methods:
                fn = getattr(sol, methods[0])
    
    if fn is None:
        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_test']
        if callables:
            fn = callables[-1]

    if fn is None:
        raise Exception("No callable function found matching '${expectedFnName}'")
        
    var_names = [v.strip().split('=')[0].strip() for v in '''${inputStr.replace(/'/g, "\\'")}'''.split(',') if '=' in v]
    args = [scope[k] for k in var_names if k in scope]
    
    res = fn(*args)
    print(json.dumps(res))

__run_test()
`;
        try {
          const stdout = execFileSync('python', ['-c', pyRunner], {
            encoding: 'utf8',
            timeout: 2500,
          }).trim();

          let passed = false;
          let actualOutput = stdout;

          if (cleanExpected === 'true' || cleanExpected === 'false') {
            passed = stdout.toLowerCase() === cleanExpected.toLowerCase();
          } else {
            try {
              const parsedActual = JSON.parse(stdout);
              const parsedExpected = JSON.parse(cleanExpected);
              if (JSON.stringify(parsedActual) === JSON.stringify(parsedExpected)) {
                passed = true;
              } else if (
                Array.isArray(parsedActual) &&
                Array.isArray(parsedExpected) &&
                parsedActual.length === parsedExpected.length &&
                typeof parsedActual[0] === 'number'
              ) {
                passed = JSON.stringify([...parsedActual].sort()) === JSON.stringify([...parsedExpected].sort());
              }
            } catch {
              passed = stdout.toLowerCase() === cleanExpected.toLowerCase();
            }
          }

          if (!passed) allPassed = false;
          testResults.push({
            caseNumber: i + 1,
            passed,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: actualOutput,
            logs: [],
          });
        } catch (pyErr: any) {
          hasRuntimeError = true;
          allPassed = false;
          testResults.push({
            caseNumber: i + 1,
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: 'Execution Error: ' + (pyErr.stderr || pyErr.message),
            logs: [],
          });
        }
      }

      return NextResponse.json({
        status: allPassed ? 'Accepted' : hasRuntimeError ? 'Runtime Error' : 'Wrong Answer',
        runtimeMs: Date.now() - startTime,
        allPassed,
        testResults,
      });
    }

    // TypeScript / JavaScript Execution
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

    // Extract expected entry name from challenge starterCode
    let expectedFnName = '';
    const starterFnMatch = challenge.starterCode.match(/function\s+([a-zA-Z0-9_]+)/);
    const starterClassMatch = challenge.starterCode.match(/class\s+([a-zA-Z0-9_]+)/);
    if (starterFnMatch) expectedFnName = starterFnMatch[1];
    else if (starterClassMatch) expectedFnName = starterClassMatch[1];

    for (let i = 0; i < challenge.sampleTestCases.length; i++) {
      const tc = challenge.sampleTestCases[i];
      const logs: string[] = [];

      const sandbox: any = {
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

      // Problem-specific runner scripts for classes
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
        } else {
          runnerScript += `
            const limiter = new TokenBucketRateLimiter(5, 1);
            for (let k = 0; k < 5; k++) limiter.allowRequest('u1');
            result = limiter.allowRequest('u1');
          `;
        }
      } else {
        // Parse variable names from input like "nums = [2, 7, 11, 15], target = 9"
        const varMatches = [...inputStr.matchAll(/(?:^|[,;]\s*)([a-zA-Z0-9_$]+)\s*=/g)];
        const varNames = varMatches.map((m) => m[1]);

        runnerScript += `
          // Declare input variables in local scope
          var ${inputStr};

          // Locate execution entry point
          let __targetFn = null;
          if (typeof ${expectedFnName || '__unlikely__'} === 'function') {
            __targetFn = ${expectedFnName};
          } else if (typeof Solution === 'function') {
            const __sol = new Solution();
            if (typeof __sol['${expectedFnName}'] === 'function') {
              __targetFn = (...args) => __sol['${expectedFnName}'](...args);
            } else {
              const methods = Object.getOwnPropertyNames(Solution.prototype).filter(m => m !== 'constructor');
              if (methods.length > 0) __targetFn = (...args) => __sol[methods[0]](...args);
            }
          }

          if (!__targetFn) {
            // Check top-level declared functions
            const keys = Object.keys(this).filter(k => typeof this[k] === 'function' && k !== 'setTimeout' && k !== 'clearTimeout');
            if (keys.length > 0) {
              __targetFn = this[keys[keys.length - 1]];
            }
          }

          if (__targetFn) {
            result = __targetFn(${varNames.join(', ')});
          } else {
            throw new Error('Could not find function ${expectedFnName || 'solution'}. Please define it.');
          }
        `;
      }

      let tcPassed = false;
      let actualOutput = 'undefined';

      try {
        vm.runInContext(runnerScript, context, { timeout: 2000 });
        const res = sandbox.result;
        actualOutput = JSON.stringify(res);
        if (actualOutput === undefined) actualOutput = String(res);

        const cleanExpected = tc.expectedOutput.trim();

        // 1. Boolean check
        if (typeof res === 'boolean' || cleanExpected === 'true' || cleanExpected === 'false') {
          tcPassed = String(res).toLowerCase() === cleanExpected.toLowerCase();
        }
        // 2. Number check
        else if (typeof res === 'number' && !isNaN(Number(cleanExpected))) {
          tcPassed = res === Number(cleanExpected);
        }
        // 3. Array check (supports arbitrary order for two sum indices)
        else if (Array.isArray(res)) {
          try {
            const expArr = JSON.parse(cleanExpected);
            if (Array.isArray(expArr)) {
              if (JSON.stringify(res) === JSON.stringify(expArr)) {
                tcPassed = true;
              } else if (res.length === expArr.length && typeof res[0] === 'number') {
                tcPassed = JSON.stringify([...res].sort()) === JSON.stringify([...expArr].sort());
              }
            }
          } catch {
            tcPassed = actualOutput.trim().toLowerCase() === cleanExpected.toLowerCase();
          }
        }
        // 4. JSON / Object deep equality
        if (!tcPassed) {
          try {
            tcPassed = JSON.stringify(JSON.parse(cleanExpected)) === actualOutput;
          } catch {
            tcPassed =
              String(res).trim().toLowerCase() === cleanExpected.toLowerCase() ||
              actualOutput.trim().toLowerCase() === cleanExpected.toLowerCase();
          }
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
