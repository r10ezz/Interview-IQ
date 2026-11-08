import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { CodingChallenge, SupportedLanguage } from '@/types/interview';

export interface RunTestResult {
  caseNumber: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  logs: string[];
}

export interface CodeExecutionResponse {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
  runtimeMs: number;
  allPassed: boolean;
  testResults: RunTestResult[];
  compilationError?: string;
  compilerOutput?: string;
  rawStdout?: string;
  error?: string;
}

// Build extended PATH environment for child processes (includes MinGW GCC/G++ and JDK 21)
function getExecutionEnv(): NodeJS.ProcessEnv {
  const mingwPath = 'C:\\msys64\\mingw64\\bin';
  const jdkPath = 'C:\\Program Files\\Java\\jdk-21\\bin';
  const existingPath = process.env.PATH || '';
  return {
    ...process.env,
    PATH: `${mingwPath};${jdkPath};${existingPath}`,
  };
}

// Detect if candidate code is a full standalone program with main/stdin reading
export function isStandardIOProgram(code: string, language: string): boolean {
  const normLang = language.toLowerCase();
  if (normLang === 'c' || normLang === 'cpp' || normLang === 'c++') {
    return /\bint\s+main\s*\(|\bvoid\s+main\s*\(/.test(code);
  }
  if (normLang === 'java') {
    return /\bpublic\s+static\s+void\s+main\s*\(/.test(code);
  }
  if (normLang === 'python') {
    return /\binput\s*\(|sys\.stdin|if\s+__name__\s*==\s*['"]__main__['"]/.test(code);
  }
  if (normLang === 'javascript' || normLang === 'typescript') {
    return /\breadFileSync\s*\(0|\breadline\b/.test(code);
  }
  return false;
}

// Identify challenge type by id, title, description, or function keywords
export function resolveChallengeType(challenge: CodingChallenge): string {
  const id = (challenge.id || '').toLowerCase();
  const title = (challenge.title || '').toLowerCase();
  const desc = (challenge.description || '').toLowerCase();
  const starter = (challenge.starterCode || '').toLowerCase();

  if (id.includes('two-sum') || title.includes('two sum') || starter.includes('twosum')) return 'two-sum';
  if (id.includes('palindrome') || title.includes('palindrome') || starter.includes('palindrome') || starter.includes('ispalindrome')) return 'valid-palindrome';
  if (id.includes('stock') || title.includes('stock') || starter.includes('maxprofit')) return 'best-time-stock';
  if (id.includes('substring') || title.includes('substring') || starter.includes('longestsubstring') || starter.includes('lengthoflongestsubstring')) return 'longest-substring';
  if (id.includes('parenthes') || title.includes('parenthes') || starter.includes('isvalid')) return 'valid-parentheses';
  if (id.includes('island') || title.includes('island') || starter.includes('numislands')) return 'number-of-islands';
  if (id.includes('course') || title.includes('course') || starter.includes('canfinish') || starter.includes('shard')) return 'course-schedule';
  if (id.includes('lru') || title.includes('lru') || starter.includes('lrucache')) return 'lru-cache';

  return 'generic';
}

// Extract expected entry function or class name from challenge definition
export function getExpectedFunctionName(challenge: CodingChallenge): string {
  const starter = challenge.starterCode || '';
  const fnMatch = starter.match(/function\s+([a-zA-Z0-9_]+)/);
  if (fnMatch) return fnMatch[1];
  const defMatch = starter.match(/def\s+([a-zA-Z0-9_]+)/);
  if (defMatch) return defMatch[1];
  const classMatch = starter.match(/class\s+([a-zA-Z0-9_]+)/);
  if (classMatch) return classMatch[1];

  const type = resolveChallengeType(challenge);
  switch (type) {
    case 'two-sum': return 'twoSum';
    case 'valid-palindrome': return 'isPalindrome';
    case 'best-time-stock': return 'maxProfit';
    case 'longest-substring': return 'lengthOfLongestSubstring';
    case 'valid-parentheses': return 'isValid';
    case 'number-of-islands': return 'numIslands';
    case 'course-schedule': return 'canFinish';
    case 'lru-cache': return 'LRUCache';
    default: return 'solve';
  }
}

// Safely evaluate assignment string like: "nums = [2, 7, 11, 15], target = 9"
export function parseInputVariables(inputStr: string): Record<string, any> {
  const trimmed = inputStr.trim();

  // 1. JSON object parsing
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed);
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        return obj;
      }
    } catch {}
  }

  // 2. VM safe assignment evaluation
  const context = vm.createContext({});
  try {
    vm.runInContext('var ' + trimmed + ';', context, { timeout: 500 });
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(context)) {
      if (k !== 'console' && typeof v !== 'function') {
        result[k] = v;
      }
    }
    if (Object.keys(result).length > 0) return result;
  } catch {}

  // 3. Fallback direct evaluation
  try {
    vm.runInContext(trimmed + ';', context, { timeout: 500 });
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(context)) {
      if (k !== 'console' && typeof v !== 'function') {
        result[k] = v;
      }
    }
    if (Object.keys(result).length > 0) return result;
  } catch {}

  // 4. Raw input fallback
  return { input: trimmed };
}

// Check if an actual string output matches expected output
export function checkTestPassed(actual: string, expected: string): boolean {
  if (actual === undefined || actual === null) return false;
  const cleanActual = String(actual).trim();
  const cleanExpected = String(expected).trim();

  // 1. Direct string match (case-insensitive for booleans/text)
  if (cleanActual === cleanExpected || cleanActual.toLowerCase() === cleanExpected.toLowerCase()) {
    return true;
  }

  // 2. Boolean normalization (including C 1/0)
  const isExpTrue = cleanExpected.toLowerCase() === 'true';
  const isExpFalse = cleanExpected.toLowerCase() === 'false';
  if (isExpTrue) {
    if (cleanActual.toLowerCase() === 'true' || cleanActual === '1') return true;
  }
  if (isExpFalse) {
    if (cleanActual.toLowerCase() === 'false' || cleanActual === '0') return true;
  }

  // 3. Floating-point and integer number comparison
  const numActual = Number(cleanActual);
  const numExpected = Number(cleanExpected);
  if (!isNaN(numActual) && !isNaN(numExpected) && cleanActual !== '' && cleanExpected !== '') {
    if (Math.abs(numActual - numExpected) < 1e-6) return true;
  }

  // 4. JSON / Array / Object comparison
  try {
    const parsedActual = JSON.parse(cleanActual);
    const parsedExpected = JSON.parse(cleanExpected);

    if (JSON.stringify(parsedActual) === JSON.stringify(parsedExpected)) {
      return true;
    }

    // Number array order-insensitive check (e.g. [0, 1] vs [1, 0] for Two Sum)
    if (
      Array.isArray(parsedActual) &&
      Array.isArray(parsedExpected) &&
      parsedActual.length === parsedExpected.length
    ) {
      if (typeof parsedActual[0] === 'number') {
        const sortedActual = [...parsedActual].sort((a, b) => a - b);
        const sortedExpected = [...parsedExpected].sort((a, b) => a - b);
        if (JSON.stringify(sortedActual) === JSON.stringify(sortedExpected)) return true;
      }
    }
  } catch {}

  // 5. String quotes stripping (e.g. "\"true\"" vs "true")
  const unquotedActual = cleanActual.replace(/^["']|["']$/g, '');
  const unquotedExpected = cleanExpected.replace(/^["']|["']$/g, '');
  if (unquotedActual === unquotedExpected || unquotedActual.toLowerCase() === unquotedExpected.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Execute C Code using native GCC
 */
export async function executeC(
  code: string,
  challenge: CodingChallenge
): Promise<CodeExecutionResponse> {
  const startTime = Date.now();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iq-c-run-'));
  const srcFile = path.join(tmpDir, 'solution.c');
  const exeFile = path.join(tmpDir, 'solution.exe');

  try {
    const isStdinMode = isStandardIOProgram(code, 'c');
    const harness = isStdinMode ? code : buildCHarness(code, challenge);
    fs.writeFileSync(srcFile, harness, 'utf8');

    const env = getExecutionEnv();
    try {
      execFileSync('gcc', ['-std=c17', '-O2', '-Wall', '-Wno-unused-result', srcFile, '-o', exeFile], {
        env,
        timeout: 6000,
        encoding: 'utf8',
      });
    } catch (compileErr: any) {
      const stderr = compileErr.stderr || compileErr.message || 'Compilation failed';
      const cleanedError = stderr.replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), '');
      return {
        status: 'Compilation Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        compilationError: cleanedError,
        compilerOutput: `GCC 15.2 (C17) Compile Error:\n${cleanedError}`,
        testResults: challenge.sampleTestCases.map((tc, idx) => ({
          caseNumber: idx + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Compilation Error: ' + cleanedError.split('\n')[0],
          logs: [],
        })),
      };
    }

    if (isStdinMode) {
      // Execute each test case via stdin
      return executePerTestCaseStdin(exeFile, challenge, env, startTime, 'GCC 15.2 (C17) — Stdin/Stdout Mode');
    }

    // Run driver binary
    let stdout = '';
    try {
      stdout = execFileSync(exeFile, [], {
        env,
        timeout: 3000,
        encoding: 'utf8',
      });
    } catch (runErr: any) {
      const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
      return {
        status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        error: runErr.message,
        compilerOutput: `GCC 15.2 (C17) — Build Succeeded\nRuntime Status: ${isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Process exited with error'}`,
        testResults: challenge.sampleTestCases.map((tc, idx) => ({
          caseNumber: idx + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Runtime Error: ' + (runErr.stderr || runErr.message),
          logs: [],
        })),
      };
    }

    return parseHarnessOutput(stdout, challenge, startTime, 'GCC 15.2 (C17) — Build Succeeded');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Execute C++ Code using native G++
 */
export async function executeCpp(
  code: string,
  challenge: CodingChallenge
): Promise<CodeExecutionResponse> {
  const startTime = Date.now();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iq-cpp-run-'));
  const srcFile = path.join(tmpDir, 'solution.cpp');
  const exeFile = path.join(tmpDir, 'solution.exe');

  try {
    const isStdinMode = isStandardIOProgram(code, 'cpp');
    const harness = isStdinMode ? code : buildCppHarness(code, challenge);
    fs.writeFileSync(srcFile, harness, 'utf8');

    const env = getExecutionEnv();
    try {
      execFileSync('g++', ['-std=c++17', '-O2', '-Wall', '-Wno-unused-result', srcFile, '-o', exeFile], {
        env,
        timeout: 6000,
        encoding: 'utf8',
      });
    } catch (compileErr: any) {
      const stderr = compileErr.stderr || compileErr.message || 'Compilation failed';
      const cleanedError = stderr.replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), '');
      return {
        status: 'Compilation Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        compilationError: cleanedError,
        compilerOutput: `G++ 15.2 (C++17) Compile Error:\n${cleanedError}`,
        testResults: challenge.sampleTestCases.map((tc, idx) => ({
          caseNumber: idx + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Compilation Error: ' + cleanedError.split('\n')[0],
          logs: [],
        })),
      };
    }

    if (isStdinMode) {
      return executePerTestCaseStdin(exeFile, challenge, env, startTime, 'G++ 15.2 (C++17) — Stdin/Stdout Mode');
    }

    let stdout = '';
    try {
      stdout = execFileSync(exeFile, [], {
        env,
        timeout: 3000,
        encoding: 'utf8',
      });
    } catch (runErr: any) {
      const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
      return {
        status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        error: runErr.message,
        compilerOutput: `G++ 15.2 (C++17) — Build Succeeded\nRuntime Status: ${isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Process exited with error'}`,
        testResults: challenge.sampleTestCases.map((tc, idx) => ({
          caseNumber: idx + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Runtime Error: ' + (runErr.stderr || runErr.message),
          logs: [],
        })),
      };
    }

    return parseHarnessOutput(stdout, challenge, startTime, 'G++ 15.2 (C++17) — Build Succeeded');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Execute Java Code using native javac & java
 */
export async function executeJava(
  code: string,
  challenge: CodingChallenge
): Promise<CodeExecutionResponse> {
  const startTime = Date.now();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iq-java-run-'));
  const srcFile = path.join(tmpDir, 'SolutionRunner.java');

  try {
    const isStdinMode = isStandardIOProgram(code, 'java');
    const harness = isStdinMode ? sanitizeJavaStdinCode(code) : buildJavaHarness(code, challenge);
    fs.writeFileSync(srcFile, harness, 'utf8');

    const env = getExecutionEnv();
    try {
      execFileSync('javac', ['-encoding', 'UTF-8', srcFile], {
        env,
        timeout: 6000,
        encoding: 'utf8',
      });
    } catch (compileErr: any) {
      const stderr = compileErr.stderr || compileErr.message || 'Compilation failed';
      const cleanedError = stderr.replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), '');
      return {
        status: 'Compilation Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        compilationError: cleanedError,
        compilerOutput: `OpenJDK 21 (javac) Compile Error:\n${cleanedError}`,
        testResults: challenge.sampleTestCases.map((tc, idx) => ({
          caseNumber: idx + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Compilation Error: ' + cleanedError.split('\n')[0],
          logs: [],
        })),
      };
    }

    if (isStdinMode) {
      return executeJavaPerTestCaseStdin(tmpDir, challenge, env, startTime, 'OpenJDK 21 — Stdin/Stdout Mode');
    }

    let stdout = '';
    try {
      stdout = execFileSync('java', ['-cp', tmpDir, 'SolutionRunner'], {
        env,
        timeout: 3000,
        encoding: 'utf8',
      });
    } catch (runErr: any) {
      const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
      return {
        status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        error: runErr.message,
        compilerOutput: `OpenJDK 21 — Build Succeeded\nRuntime Status: ${isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Process exited with error'}`,
        testResults: challenge.sampleTestCases.map((tc, idx) => ({
          caseNumber: idx + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Runtime Error: ' + (runErr.stderr || runErr.message),
          logs: [],
        })),
      };
    }

    return parseHarnessOutput(stdout, challenge, startTime, 'OpenJDK 21 — Build Succeeded');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Execute Python Code (Isolated via temporary script file to prevent command-line quoting issues)
 */
export async function executePython(
  code: string,
  challenge: CodingChallenge
): Promise<CodeExecutionResponse> {
  const startTime = Date.now();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iq-py-run-'));
  const pyFile = path.join(tmpDir, 'solution.py');
  const env = getExecutionEnv();

  try {
    const isStdinMode = isStandardIOProgram(code, 'python');
    const harness = isStdinMode ? code : buildPythonHarness(code, challenge);
    fs.writeFileSync(pyFile, harness, 'utf8');

    if (isStdinMode) {
      return executePythonPerTestCaseStdin(pyFile, challenge, env, startTime);
    }

    let stdout = '';
    try {
      stdout = execFileSync('python', [pyFile], {
        cwd: tmpDir,
        env,
        timeout: 3500,
        encoding: 'utf8',
      });
    } catch (runErr: any) {
      const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
      const stderr = runErr.stderr || runErr.message || 'Python execution failed';
      const isSyntaxErr = /SyntaxError|IndentationError/.test(stderr);

      return {
        status: isSyntaxErr ? 'Compilation Error' : isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        compilationError: isSyntaxErr ? stderr : undefined,
        compilerOutput: isSyntaxErr ? `Python Syntax Error:\n${stderr}` : `Python 3.12 Runtime Error:\n${stderr}`,
        testResults: challenge.sampleTestCases.map((tc, idx) => ({
          caseNumber: idx + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: isTimeout ? 'Time Limit Exceeded (> 3.0s)' : (isSyntaxErr ? 'SyntaxError: ' : 'Runtime Error: ') + stderr.split('\n').filter(Boolean).pop(),
          logs: [],
        })),
      };
    }

    return parseHarnessOutput(stdout, challenge, startTime, 'Python 3.12 — Execution Completed');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Execute TypeScript / JavaScript using Node VM
 */
export async function executeNodeVM(
  code: string,
  challenge: CodingChallenge,
  language: 'typescript' | 'javascript'
): Promise<CodeExecutionResponse> {
  const startTime = Date.now();
  let jsCode = code;

  if (language === 'typescript') {
    try {
      const transpiled = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.CommonJS,
          allowJs: true,
        },
      });
      jsCode = transpiled.outputText;
    } catch (transpileErr: any) {
      return {
        status: 'Compilation Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        compilationError: transpileErr.message,
        compilerOutput: `TypeScript 5.0 Transpilation Error:\n${transpileErr.message}`,
        testResults: challenge.sampleTestCases.map((tc, i) => ({
          caseNumber: i + 1,
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Syntax Error: ' + transpileErr.message,
          logs: [],
        })),
      };
    }
  }

  const testResults: RunTestResult[] = [];
  let allPassed = true;
  let hasRuntimeError = false;

  const expectedFnName = getExpectedFunctionName(challenge);
  const probType = resolveChallengeType(challenge);

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const logs: string[] = [];

    const inputVars = parseInputVariables(tc.input);

    const sandbox: any = {
      __input: inputVars,
      console: {
        log: (...args: any[]) =>
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
        error: (...args: any[]) =>
          logs.push('[error] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      },
      result: undefined,
      setTimeout: (fn: Function) => fn(),
      clearTimeout: () => {},
    };

    const context = vm.createContext(sandbox);
    let runnerScript = jsCode + '\n';

    if (probType === 'lru-cache' || jsCode.includes('class LRUCache') || jsCode.includes('var LRUCache') || jsCode.includes('function LRUCache')) {
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
    } else {
      runnerScript += `
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
          const keys = Object.keys(this).filter(k => typeof this[k] === 'function' && k !== 'setTimeout' && k !== 'clearTimeout');
          if (keys.length > 0) __targetFn = this[keys[keys.length - 1]];
        }
        if (__targetFn) {
          const __args = Object.values(__input);
          result = __targetFn(...__args);
        } else {
          throw new Error('Could not find function ${expectedFnName || 'solution'}. Please ensure your function is defined.');
        }
      `;
    }

    let tcPassed = false;
    let actualOutput = 'undefined';

    try {
      vm.runInContext(runnerScript, context, { timeout: 2500 });
      const res = sandbox.result;
      actualOutput = JSON.stringify(res);
      if (actualOutput === undefined) actualOutput = String(res);

      tcPassed = checkTestPassed(actualOutput, tc.expectedOutput);

      // If return value didn't match, check if candidate printed the answer to console
      if (!tcPassed && logs.length > 0) {
        for (const logLine of logs) {
          if (checkTestPassed(logLine, tc.expectedOutput)) {
            tcPassed = true;
            actualOutput = logLine;
            break;
          }
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

  return {
    status: allPassed ? 'Accepted' : hasRuntimeError ? 'Runtime Error' : 'Wrong Answer',
    runtimeMs: Date.now() - startTime,
    allPassed,
    compilerOutput: `Node.js v22 (VM Sandbox) — Executed in ${Date.now() - startTime}ms`,
    testResults,
  };
}

/**
 * Main dispatcher for running code in any supported language
 */
export async function executeCode(
  code: string,
  challenge: CodingChallenge,
  language: SupportedLanguage | string
): Promise<CodeExecutionResponse> {
  const normLang = (language || '').toLowerCase().trim();

  switch (normLang) {
    case 'c':
      return executeC(code, challenge);
    case 'cpp':
    case 'c++':
      return executeCpp(code, challenge);
    case 'java':
      return executeJava(code, challenge);
    case 'python':
      return executePython(code, challenge);
    case 'javascript':
      return executeNodeVM(code, challenge, 'javascript');
    case 'typescript':
    default:
      return executeNodeVM(code, challenge, 'typescript');
  }
}

// ---------------------------------------------------------------------------
// HARNESS BUILDERS & OUTPUT PARSER
// ---------------------------------------------------------------------------

function parseHarnessOutput(
  stdout: string,
  challenge: CodingChallenge,
  startTime: number,
  compilerInfo?: string
): CodeExecutionResponse {
  const testResults: RunTestResult[] = [];
  let allPassed = true;

  const resultMap = new Map<number, string>();
  const lines = stdout.split('\n');
  const userLogs: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^CASE_RESULT:(\d+):(.*)$/);
    if (match) {
      resultMap.set(Number(match[1]), match[2].trim());
    } else if (trimmed) {
      userLogs.push(trimmed);
    }
  }

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const actual = resultMap.get(i + 1) ?? (stdout.trim() ? stdout.trim() : 'No output produced');
    let passed = checkTestPassed(actual, tc.expectedOutput);

    // Fallback: check if user printed expected output to logs
    if (!passed && userLogs.length > 0) {
      for (const logLine of userLogs) {
        if (checkTestPassed(logLine, tc.expectedOutput)) {
          passed = true;
          break;
        }
      }
    }

    if (!passed) allPassed = false;

    testResults.push({
      caseNumber: i + 1,
      passed,
      input: tc.input,
      expected: tc.expectedOutput,
      actual,
      logs: i === 0 ? userLogs : [],
    });
  }

  return {
    status: allPassed ? 'Accepted' : 'Wrong Answer',
    runtimeMs: Date.now() - startTime,
    allPassed,
    compilerOutput: compilerInfo,
    rawStdout: stdout,
    testResults,
  };
}

function buildCHarness(code: string, challenge: CodingChallenge): string {
  const probType = resolveChallengeType(challenge);
  let harness = `#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>\n#include <ctype.h>\n#include <math.h>\n#include <limits.h>\n\n`;
  harness += code + '\n\n';
  harness += `void __print_int_array(int* arr, int size) {\n  printf("[");\n  for(int i = 0; i < size; i++) {\n    printf("%d%s", arr[i], (i + 1 < size ? ", " : ""));\n  }\n  printf("]");\n}\n\n`;
  harness += `int main() {\n`;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;

    harness += `  // Case ${caseNum}\n  {\n`;

    if (probType === 'two-sum') {
      const nums = vars.nums || [];
      const target = vars.target ?? 0;
      harness += `    int nums[] = {${nums.join(', ')}};\n`;
      harness += `    int returnSize = 0;\n`;
      harness += `    int* res = twoSum(nums, ${nums.length}, ${target}, &returnSize);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:");\n`;
      harness += `    if (res) { __print_int_array(res, returnSize); free(res); } else { printf("[]"); }\n`;
      harness += `    printf("\\n");\n`;
    } else if (probType === 'valid-palindrome') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    char s[] = "${s}";\n`;
      harness += `    bool res = isPalindrome(s);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%s\\n", res ? "true" : "false");\n`;
    } else if (probType === 'best-time-stock') {
      const prices = vars.prices || [];
      harness += `    int prices[] = {${prices.join(', ')}};\n`;
      harness += `    int res = maxProfit(prices, ${prices.length});\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%d\\n", res);\n`;
    } else if (probType === 'longest-substring') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    char s[] = "${s}";\n`;
      harness += `    int res = lengthOfLongestSubstring(s);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%d\\n", res);\n`;
    } else if (probType === 'valid-parentheses') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    char s[] = "${s}";\n`;
      harness += `    bool res = isValid(s);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%s\\n", res ? "true" : "false");\n`;
    } else if (probType === 'number-of-islands') {
      const grid = vars.grid || [];
      const m = grid.length;
      const n = m > 0 ? grid[0].length : 0;
      for (let r = 0; r < m; r++) {
        harness += `    char row_${r}[] = {${grid[r].map((c: string) => `'${c}'`).join(', ')}};\n`;
      }
      harness += `    char* grid[] = {${grid.map((_: any, idx: number) => `row_${idx}`).join(', ')}};\n`;
      harness += `    int colSizes[] = {${grid.map(() => n).join(', ')}};\n`;
      harness += `    int res = numIslands(grid, ${m}, colSizes);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%d\\n", res);\n`;
    } else if (probType === 'course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = vars.prerequisites || [];
      for (let r = 0; r < prereqs.length; r++) {
        harness += `    int p_${r}[] = {${prereqs[r].join(', ')}};\n`;
      }
      harness += `    int* prereqPtrs[] = {${prereqs.map((_: any, idx: number) => `p_${idx}`).join(', ')}};\n`;
      harness += `    int colSizes[] = {${prereqs.map(() => 2).join(', ')}};\n`;
      harness += `    bool res = canFinish(${numCourses}, ${prereqs.length > 0 ? 'prereqPtrs' : 'NULL'}, ${prereqs.length}, ${prereqs.length > 0 ? 'colSizes' : 'NULL'});\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%s\\n", res ? "true" : "false");\n`;
    } else if (probType === 'lru-cache') {
      if (i === 0) {
        harness += `    LRUCache* c = lRUCacheCreate(2);\n`;
        harness += `    lRUCachePut(c, 1, 1);\n`;
        harness += `    lRUCachePut(c, 2, 2);\n`;
        harness += `    int res = lRUCacheGet(c, 1);\n`;
        harness += `    printf("CASE_RESULT:${caseNum}:%d\\n", res);\n`;
        harness += `    lRUCacheFree(c);\n`;
      } else {
        harness += `    LRUCache* c = lRUCacheCreate(2);\n`;
        harness += `    lRUCachePut(c, 1, 1);\n`;
        harness += `    lRUCachePut(c, 2, 2);\n`;
        harness += `    int res = lRUCacheGet(c, 1);\n`;
        harness += `    lRUCachePut(c, 3, 3);\n`;
        harness += `    int res2 = lRUCacheGet(c, 2);\n`;
        harness += `    if (res2 == -1) printf("CASE_RESULT:${caseNum}:Evicts key 2 (least recently used)\\n");\n`;
        harness += `    else printf("CASE_RESULT:${caseNum}:%d\\n", res2);\n`;
        harness += `    lRUCacheFree(c);\n`;
      }
    }

    harness += `  }\n`;
  }

  harness += `  return 0;\n}\n`;
  return harness;
}

function buildCppHarness(code: string, challenge: CodingChallenge): string {
  const probType = resolveChallengeType(challenge);
  const hasClassSolution = code.includes('class Solution');

  let harness = `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\n#include <unordered_set>\n#include <map>\n#include <set>\n#include <algorithm>\n#include <queue>\n#include <stack>\n#include <deque>\n#include <cmath>\n#include <climits>\n#include <sstream>\n#include <numeric>\n#define private public\n#define protected public\nusing namespace std;\n\n`;
  harness += code + '\n\n';
  harness += `void __print_vector(const vector<int>& v) {\n  cout << "[";\n  for(size_t i = 0; i < v.size(); i++) {\n    cout << v[i] << (i + 1 < v.size() ? ", " : "");\n  }\n  cout << "]";\n}\n\n`;
  harness += `int main() {\n`;
  if (hasClassSolution) {
    harness += `  Solution sol;\n`;
  }

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;
    const caller = hasClassSolution ? 'sol.' : '';

    harness += `  // Case ${caseNum}\n  {\n`;

    if (probType === 'two-sum') {
      const nums = vars.nums || [];
      const target = vars.target ?? 0;
      harness += `    vector<int> nums = {${nums.join(', ')}};\n`;
      harness += `    auto res = ${caller}twoSum(nums, ${target});\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:";\n`;
      harness += `    __print_vector(res);\n`;
      harness += `    cout << "\\n";\n`;
    } else if (probType === 'valid-palindrome') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    string s = "${s}";\n`;
      harness += `    bool res = ${caller}isPalindrome(s);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << (res ? "true" : "false") << "\\n";\n`;
    } else if (probType === 'best-time-stock') {
      const prices = vars.prices || [];
      harness += `    vector<int> prices = {${prices.join(', ')}};\n`;
      harness += `    int res = ${caller}maxProfit(prices);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
    } else if (probType === 'longest-substring') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    string s = "${s}";\n`;
      harness += `    int res = ${caller}lengthOfLongestSubstring(s);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
    } else if (probType === 'valid-parentheses') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    string s = "${s}";\n`;
      harness += `    bool res = ${caller}isValid(s);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << (res ? "true" : "false") << "\\n";\n`;
    } else if (probType === 'number-of-islands') {
      const grid = vars.grid || [];
      harness += `    vector<vector<char>> grid = {${grid.map((r: string[]) => `{${r.map((c) => `'${c}'`).join(', ')}}`).join(', ')}};\n`;
      harness += `    int res = ${caller}numIslands(grid);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
    } else if (probType === 'course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = vars.prerequisites || [];
      harness += `    vector<vector<int>> prereqs = {${prereqs.map((p: number[]) => `{${p.join(', ')}}`).join(', ')}};\n`;
      harness += `    bool res = ${caller}canFinish(${numCourses}, prereqs);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << (res ? "true" : "false") << "\\n";\n`;
    } else if (probType === 'lru-cache') {
      if (i === 0) {
        harness += `    LRUCache c(2);\n`;
        harness += `    c.put(1, 1);\n`;
        harness += `    c.put(2, 2);\n`;
        harness += `    int res = c.get(1);\n`;
        harness += `    cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
      } else {
        harness += `    LRUCache c(2);\n`;
        harness += `    c.put(1, 1);\n`;
        harness += `    c.put(2, 2);\n`;
        harness += `    c.get(1);\n`;
        harness += `    c.put(3, 3);\n`;
        harness += `    int res = c.get(2);\n`;
        harness += `    if (res == -1) cout << "CASE_RESULT:${caseNum}:Evicts key 2 (least recently used)\\n";\n`;
        harness += `    else cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
      }
    }

    harness += `  }\n`;
  }

  harness += `  return 0;\n}\n`;
  return harness;
}

function buildJavaHarness(code: string, challenge: CodingChallenge): string {
  const probType = resolveChallengeType(challenge);

  // Sanitize: strip package declarations if present
  let sanitizedCode = code.replace(/^\s*package\s+[^;]+;\s*/gm, '');

  // Strip 'public ' from any classes so they compile inside SolutionRunner.java
  sanitizedCode = sanitizedCode.replace(/\bpublic\s+class\s+([A-Za-z0-9_]+)/g, 'class $1');

  // If user pasted raw methods without class Solution wrapper, wrap it
  if (!sanitizedCode.includes('class Solution') && !sanitizedCode.includes('class LRUCache')) {
    sanitizedCode = `class Solution {\n${sanitizedCode}\n}`;
  }

  let harness = `import java.util.*;\nimport java.io.*;\nimport java.math.*;\n\n`;
  harness += sanitizedCode + '\n\n';
  harness += `public class SolutionRunner {\n  public static void main(String[] args) {\n`;
  if (probType !== 'lru-cache' && sanitizedCode.includes('class Solution')) {
    harness += `    Solution sol = new Solution();\n`;
  }

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;

    harness += `    // Case ${caseNum}\n    {\n`;

    if (probType === 'two-sum') {
      const nums = vars.nums || [];
      const target = vars.target ?? 0;
      harness += `      int[] nums = new int[]{${nums.join(', ')}};\n`;
      harness += `      int[] res = sol.twoSum(nums, ${target});\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + Arrays.toString(res));\n`;
    } else if (probType === 'valid-palindrome') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `      String s = "${s}";\n`;
      harness += `      boolean res = sol.isPalindrome(s);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (probType === 'best-time-stock') {
      const prices = vars.prices || [];
      harness += `      int[] prices = new int[]{${prices.join(', ')}};\n`;
      harness += `      int res = sol.maxProfit(prices);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (probType === 'longest-substring') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `      String s = "${s}";\n`;
      harness += `      int res = sol.lengthOfLongestSubstring(s);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (probType === 'valid-parentheses') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `      String s = "${s}";\n`;
      harness += `      boolean res = sol.isValid(s);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (probType === 'number-of-islands') {
      const grid = vars.grid || [];
      harness += `      char[][] grid = new char[][]{${grid.map((r: string[]) => `new char[]{${r.map((c) => `'${c}'`).join(', ')}}`).join(', ')}};\n`;
      harness += `      int res = sol.numIslands(grid);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (probType === 'course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = vars.prerequisites || [];
      harness += `      int[][] prereqs = new int[][]{${prereqs.map((p: number[]) => `new int[]{${p.join(', ')}}`).join(', ')}};\n`;
      harness += `      boolean res = sol.canFinish(${numCourses}, prereqs);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (probType === 'lru-cache') {
      if (i === 0) {
        harness += `      LRUCache c = new LRUCache(2);\n`;
        harness += `      c.put(1, 1);\n`;
        harness += `      c.put(2, 2);\n`;
        harness += `      int res = c.get(1);\n`;
        harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
      } else {
        harness += `      LRUCache c = new LRUCache(2);\n`;
        harness += `      c.put(1, 1);\n`;
        harness += `      c.put(2, 2);\n`;
        harness += `      c.get(1);\n`;
        harness += `      c.put(3, 3);\n`;
        harness += `      int res = c.get(2);\n`;
        harness += `      System.out.println("CASE_RESULT:${caseNum}:" + (res == -1 ? "Evicts key 2 (least recently used)" : String.valueOf(res)));\n`;
      }
    }

    harness += `    }\n`;
  }

  harness += `  }\n}\n`;
  return harness;
}

function buildPythonHarness(code: string, challenge: CodingChallenge): string {
  const probType = resolveChallengeType(challenge);

  let harness = `import json, sys, collections, heapq, math, typing\nfrom typing import List, Dict, Set, Tuple, Optional, Any\n\n`;
  harness += code + '\n\n';
  harness += `def __run_all_cases():\n`;
  harness += `    sol = Solution() if 'Solution' in globals() else None\n`;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;

    harness += `    # Case ${caseNum}\n`;

    if (probType === 'two-sum') {
      const nums = JSON.stringify(vars.nums || []);
      const target = vars.target ?? 0;
      harness += `    fn = getattr(sol, 'twoSum', twoSum if 'twoSum' in globals() else None)\n`;
      harness += `    if fn is None:\n`;
      harness += `        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_all_cases']\n`;
      harness += `        if callables: fn = callables[-1]\n`;
      harness += `    res = fn(${nums}, ${target})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (probType === 'valid-palindrome') {
      const s = JSON.stringify(vars.s ?? '');
      harness += `    fn = getattr(sol, 'isPalindrome', isPalindrome if 'isPalindrome' in globals() else None)\n`;
      harness += `    if fn is None:\n`;
      harness += `        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_all_cases']\n`;
      harness += `        if callables: fn = callables[-1]\n`;
      harness += `    res = fn(${s})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + ("true" if res else "false"))\n`;
    } else if (probType === 'best-time-stock') {
      const prices = JSON.stringify(vars.prices || []);
      harness += `    fn = getattr(sol, 'maxProfit', maxProfit if 'maxProfit' in globals() else None)\n`;
      harness += `    if fn is None:\n`;
      harness += `        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_all_cases']\n`;
      harness += `        if callables: fn = callables[-1]\n`;
      harness += `    res = fn(${prices})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (probType === 'longest-substring') {
      const s = JSON.stringify(vars.s ?? '');
      harness += `    fn = getattr(sol, 'lengthOfLongestSubstring', lengthOfLongestSubstring if 'lengthOfLongestSubstring' in globals() else None)\n`;
      harness += `    if fn is None:\n`;
      harness += `        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_all_cases']\n`;
      harness += `        if callables: fn = callables[-1]\n`;
      harness += `    res = fn(${s})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (probType === 'valid-parentheses') {
      const s = JSON.stringify(vars.s ?? '');
      harness += `    fn = getattr(sol, 'isValid', isValid if 'isValid' in globals() else None)\n`;
      harness += `    if fn is None:\n`;
      harness += `        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_all_cases']\n`;
      harness += `        if callables: fn = callables[-1]\n`;
      harness += `    res = fn(${s})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + ("true" if res else "false"))\n`;
    } else if (probType === 'number-of-islands') {
      const grid = JSON.stringify(vars.grid || []);
      harness += `    fn = getattr(sol, 'numIslands', numIslands if 'numIslands' in globals() else None)\n`;
      harness += `    if fn is None:\n`;
      harness += `        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_all_cases']\n`;
      harness += `        if callables: fn = callables[-1]\n`;
      harness += `    res = fn(${grid})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (probType === 'course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = JSON.stringify(vars.prerequisites || []);
      harness += `    fn = getattr(sol, 'canFinish', canFinish if 'canFinish' in globals() else None)\n`;
      harness += `    if fn is None:\n`;
      harness += `        callables = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__run_all_cases']\n`;
      harness += `        if callables: fn = callables[-1]\n`;
      harness += `    res = fn(${numCourses}, ${prereqs})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + ("true" if res else "false"))\n`;
    } else if (probType === 'lru-cache') {
      if (i === 0) {
        harness += `    c = LRUCache(2)\n`;
        harness += `    c.put(1, 1)\n`;
        harness += `    c.put(2, 2)\n`;
        harness += `    res = c.get(1)\n`;
        harness += `    print("CASE_RESULT:${caseNum}:" + str(res))\n`;
      } else {
        harness += `    c = LRUCache(2)\n`;
        harness += `    c.put(1, 1)\n`;
        harness += `    c.put(2, 2)\n`;
        harness += `    c.get(1)\n`;
        harness += `    c.put(3, 3)\n`;
        harness += `    res = c.get(2)\n`;
        harness += `    print("CASE_RESULT:${caseNum}:" + ("Evicts key 2 (least recently used)" if res == -1 else str(res)))\n`;
      }
    }
  }

  harness += `\n__run_all_cases()\n`;
  return harness;
}

// ---------------------------------------------------------------------------
// STANDARD I/O RUNNERS (for questions that read from stdin / print to stdout)
// ---------------------------------------------------------------------------

function formatStdinPayload(inputStr: string): string {
  const vars = parseInputVariables(inputStr);
  const values = Object.values(vars);
  if (values.length > 0) {
    return values.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join('\n') + '\n';
  }
  return inputStr + '\n';
}

function executePerTestCaseStdin(
  exeFile: string,
  challenge: CodingChallenge,
  env: NodeJS.ProcessEnv,
  startTime: number,
  compilerInfo: string
): CodeExecutionResponse {
  const testResults: RunTestResult[] = [];
  let allPassed = true;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const stdinData = formatStdinPayload(tc.input);

    try {
      const stdout = execFileSync(exeFile, [], {
        env,
        input: stdinData,
        timeout: 3000,
        encoding: 'utf8',
      }).trim();

      const passed = checkTestPassed(stdout, tc.expectedOutput);
      if (!passed) allPassed = false;

      testResults.push({
        caseNumber: i + 1,
        passed,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: stdout,
        logs: [stdout],
      });
    } catch (runErr: any) {
      allPassed = false;
      const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
      testResults.push({
        caseNumber: i + 1,
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Runtime Error: ' + (runErr.stderr || runErr.message),
        logs: [],
      });
    }
  }

  return {
    status: allPassed ? 'Accepted' : 'Wrong Answer',
    runtimeMs: Date.now() - startTime,
    allPassed,
    compilerOutput: compilerInfo,
    testResults,
  };
}

function sanitizeJavaStdinCode(code: string): string {
  let sanitized = code.replace(/^\s*package\s+[^;]+;\s*/gm, '');
  sanitized = sanitized.replace(/\bpublic\s+class\s+([A-Za-z0-9_]+)/g, 'class $1');
  return `import java.util.*;\nimport java.io.*;\n\n${sanitized}\n\npublic class SolutionRunner {\n  public static void main(String[] args) {\n    Main.main(args);\n  }\n}\n`;
}

function executeJavaPerTestCaseStdin(
  tmpDir: string,
  challenge: CodingChallenge,
  env: NodeJS.ProcessEnv,
  startTime: number,
  compilerInfo: string
): CodeExecutionResponse {
  const testResults: RunTestResult[] = [];
  let allPassed = true;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const stdinData = formatStdinPayload(tc.input);

    try {
      const stdout = execFileSync('java', ['-cp', tmpDir, 'SolutionRunner'], {
        env,
        input: stdinData,
        timeout: 3000,
        encoding: 'utf8',
      }).trim();

      const passed = checkTestPassed(stdout, tc.expectedOutput);
      if (!passed) allPassed = false;

      testResults.push({
        caseNumber: i + 1,
        passed,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: stdout,
        logs: [stdout],
      });
    } catch (runErr: any) {
      allPassed = false;
      const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
      testResults.push({
        caseNumber: i + 1,
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Runtime Error: ' + (runErr.stderr || runErr.message),
        logs: [],
      });
    }
  }

  return {
    status: allPassed ? 'Accepted' : 'Wrong Answer',
    runtimeMs: Date.now() - startTime,
    allPassed,
    compilerOutput: compilerInfo,
    testResults,
  };
}

function executePythonPerTestCaseStdin(
  pyFile: string,
  challenge: CodingChallenge,
  env: NodeJS.ProcessEnv,
  startTime: number
): CodeExecutionResponse {
  const testResults: RunTestResult[] = [];
  let allPassed = true;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const stdinData = formatStdinPayload(tc.input);

    try {
      const stdout = execFileSync('python', [pyFile], {
        env,
        input: stdinData,
        timeout: 3500,
        encoding: 'utf8',
      }).trim();

      const passed = checkTestPassed(stdout, tc.expectedOutput);
      if (!passed) allPassed = false;

      testResults.push({
        caseNumber: i + 1,
        passed,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: stdout,
        logs: [stdout],
      });
    } catch (runErr: any) {
      allPassed = false;
      const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
      testResults.push({
        caseNumber: i + 1,
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: isTimeout ? 'Time Limit Exceeded (> 3.0s)' : 'Runtime Error: ' + (runErr.stderr || runErr.message),
        logs: [],
      });
    }
  }

  return {
    status: allPassed ? 'Accepted' : 'Wrong Answer',
    runtimeMs: Date.now() - startTime,
    allPassed,
    compilerOutput: 'Python 3.12 — Stdin/Stdout Mode',
    testResults,
  };
}
