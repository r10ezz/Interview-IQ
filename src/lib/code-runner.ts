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

// Safely evaluate assignment string like: "nums = [2, 7, 11, 15], target = 9"
export function parseInputVariables(inputStr: string): Record<string, any> {
  const context = vm.createContext({});
  try {
    vm.runInContext('var ' + inputStr, context, { timeout: 500 });
  } catch {
    // Return empty if parsing failed
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(context)) {
    if (k !== 'console' && typeof v !== 'function') {
      result[k] = v;
    }
  }
  return result;
}

// Check if an actual string output matches expected output
export function checkTestPassed(actual: string, expected: string): boolean {
  const cleanActual = actual.trim();
  const cleanExpected = expected.trim();

  // Boolean check
  if (cleanExpected.toLowerCase() === 'true' || cleanExpected.toLowerCase() === 'false') {
    return cleanActual.toLowerCase() === cleanExpected.toLowerCase();
  }

  // Number check
  const numActual = Number(cleanActual);
  const numExpected = Number(cleanExpected);
  if (!isNaN(numActual) && !isNaN(numExpected) && cleanActual !== '' && cleanExpected !== '') {
    return numActual === numExpected;
  }

  // Array / JSON check
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
      parsedActual.length === parsedExpected.length &&
      typeof parsedActual[0] === 'number'
    ) {
      const sortedActual = [...parsedActual].sort((a, b) => a - b);
      const sortedExpected = [...parsedExpected].sort((a, b) => a - b);
      return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
    }
  } catch {
    // Not valid JSON, compare strings
  }

  return cleanActual.toLowerCase() === cleanExpected.toLowerCase();
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
    const harness = buildCHarness(code, challenge);
    fs.writeFileSync(srcFile, harness, 'utf8');

    const env = getExecutionEnv();
    try {
      execFileSync('gcc', ['-std=c17', '-O2', srcFile, '-o', exeFile], {
        env,
        timeout: 6000,
        encoding: 'utf8',
      });
    } catch (compileErr: any) {
      const stderr = compileErr.stderr || compileErr.message || 'Compilation failed';
      // Clean up internal temp paths from compiler error
      const cleanedError = stderr.replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), '');
      return {
        status: 'Compilation Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        compilationError: cleanedError,
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

    // Run compiled binary
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

    return parseHarnessOutput(stdout, challenge, startTime);
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
    const harness = buildCppHarness(code, challenge);
    fs.writeFileSync(srcFile, harness, 'utf8');

    const env = getExecutionEnv();
    try {
      execFileSync('g++', ['-std=c++17', '-O2', srcFile, '-o', exeFile], {
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

    // Run compiled binary
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

    return parseHarnessOutput(stdout, challenge, startTime);
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
    const harness = buildJavaHarness(code, challenge);
    fs.writeFileSync(srcFile, harness, 'utf8');

    const env = getExecutionEnv();
    try {
      execFileSync('javac', [srcFile], {
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

    // Run Java class
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

    return parseHarnessOutput(stdout, challenge, startTime);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Execute Python Code
 */
export async function executePython(
  code: string,
  challenge: CodingChallenge
): Promise<CodeExecutionResponse> {
  const startTime = Date.now();
  const env = getExecutionEnv();
  const harness = buildPythonHarness(code, challenge);

  try {
    const stdout = execFileSync('python', ['-c', harness], {
      env,
      timeout: 3000,
      encoding: 'utf8',
    });
    return parseHarnessOutput(stdout, challenge, startTime);
  } catch (runErr: any) {
    const isTimeout = runErr.signal === 'SIGTERM' || runErr.code === 'ETIMEDOUT';
    const stderr = runErr.stderr || runErr.message || 'Python execution failed';
    const isSyntaxErr = /SyntaxError|IndentationError/.test(stderr);

    return {
      status: isSyntaxErr ? 'Compilation Error' : isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
      runtimeMs: Date.now() - startTime,
      allPassed: false,
      compilationError: isSyntaxErr ? stderr : undefined,
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
      jsCode = ts.transpile(code);
    } catch (transpileErr: any) {
      return {
        status: 'Compilation Error',
        runtimeMs: Date.now() - startTime,
        allPassed: false,
        compilationError: transpileErr.message,
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

    if (challenge.id === 'dsa-lru-cache' || jsCode.includes('class LRUCache') || jsCode.includes('var LRUCache')) {
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
      const varMatches = [...inputStr.matchAll(/(?:^|[,;]\s*)([a-zA-Z0-9_$]+)\s*=/g)];
      const varNames = varMatches.map((m) => m[1]);

      runnerScript += `
        var ${inputStr};
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
          result = __targetFn(${varNames.join(', ')});
        } else {
          throw new Error('Could not find function ${expectedFnName || 'solution'}. Please define it.');
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
  const normLang = language.toLowerCase();

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
  startTime: number
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
    const actual = resultMap.get(i + 1) ?? 'No output produced';
    const passed = checkTestPassed(actual, tc.expectedOutput);

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
    testResults,
  };
}

function buildCHarness(code: string, challenge: CodingChallenge): string {
  let harness = `#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>\n#include <ctype.h>\n\n`;
  harness += code + '\n\n';
  harness += `void __print_int_array(int* arr, int size) {\n  printf("[");\n  for(int i = 0; i < size; i++) {\n    printf("%d%s", arr[i], (i + 1 < size ? ", " : ""));\n  }\n  printf("]");\n}\n\n`;
  harness += `int main() {\n`;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;

    harness += `  // Case ${caseNum}\n  {\n`;

    if (challenge.id === 'dsa-two-sum') {
      const nums = vars.nums || [];
      const target = vars.target ?? 0;
      harness += `    int nums[] = {${nums.join(', ')}};\n`;
      harness += `    int returnSize = 0;\n`;
      harness += `    int* res = twoSum(nums, ${nums.length}, ${target}, &returnSize);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:");\n`;
      harness += `    if (res) { __print_int_array(res, returnSize); free(res); } else { printf("[]"); }\n`;
      harness += `    printf("\\n");\n`;
    } else if (challenge.id === 'dsa-valid-palindrome') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    char s[] = "${s}";\n`;
      harness += `    bool res = isPalindrome(s);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%s\\n", res ? "true" : "false");\n`;
    } else if (challenge.id === 'dsa-best-time-stock') {
      const prices = vars.prices || [];
      harness += `    int prices[] = {${prices.join(', ')}};\n`;
      harness += `    int res = maxProfit(prices, ${prices.length});\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%d\\n", res);\n`;
    } else if (challenge.id === 'dsa-longest-substring') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    char s[] = "${s}";\n`;
      harness += `    int res = lengthOfLongestSubstring(s);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%d\\n", res);\n`;
    } else if (challenge.id === 'dsa-valid-parentheses') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    char s[] = "${s}";\n`;
      harness += `    bool res = isValid(s);\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%s\\n", res ? "true" : "false");\n`;
    } else if (challenge.id === 'dsa-number-of-islands') {
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
    } else if (challenge.id === 'dsa-course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = vars.prerequisites || [];
      for (let r = 0; r < prereqs.length; r++) {
        harness += `    int p_${r}[] = {${prereqs[r].join(', ')}};\n`;
      }
      harness += `    int* prereqPtrs[] = {${prereqs.map((_: any, idx: number) => `p_${idx}`).join(', ')}};\n`;
      harness += `    int colSizes[] = {${prereqs.map(() => 2).join(', ')}};\n`;
      harness += `    bool res = canFinish(${numCourses}, ${prereqs.length > 0 ? 'prereqPtrs' : 'NULL'}, ${prereqs.length}, ${prereqs.length > 0 ? 'colSizes' : 'NULL'});\n`;
      harness += `    printf("CASE_RESULT:${caseNum}:%s\\n", res ? "true" : "false");\n`;
    } else if (challenge.id === 'dsa-lru-cache') {
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
        harness += `    lRUCacheGet(c, 1);\n`;
        harness += `    lRUCachePut(c, 3, 3);\n`;
        harness += `    int res = lRUCacheGet(c, 2);\n`;
        harness += `    if (res == -1) printf("CASE_RESULT:${caseNum}:Evicts key 2 (least recently used)\\n");\n`;
        harness += `    else printf("CASE_RESULT:${caseNum}:%d\\n", res);\n`;
        harness += `    lRUCacheFree(c);\n`;
      }
    }

    harness += `  }\n`;
  }

  harness += `  return 0;\n}\n`;
  return harness;
}

function buildCppHarness(code: string, challenge: CodingChallenge): string {
  let harness = `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\n#include <unordered_set>\n#include <algorithm>\n#include <queue>\n#include <stack>\nusing namespace std;\n\n`;
  harness += code + '\n\n';
  harness += `void __print_vector(const vector<int>& v) {\n  cout << "[";\n  for(size_t i = 0; i < v.size(); i++) {\n    cout << v[i] << (i + 1 < v.size() ? ", " : "");\n  }\n  cout << "]";\n}\n\n`;
  harness += `int main() {\n  Solution sol;\n`;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;

    harness += `  // Case ${caseNum}\n  {\n`;

    if (challenge.id === 'dsa-two-sum') {
      const nums = vars.nums || [];
      const target = vars.target ?? 0;
      harness += `    vector<int> nums = {${nums.join(', ')}};\n`;
      harness += `    auto res = sol.twoSum(nums, ${target});\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:";\n`;
      harness += `    __print_vector(res);\n`;
      harness += `    cout << "\\n";\n`;
    } else if (challenge.id === 'dsa-valid-palindrome') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    string s = "${s}";\n`;
      harness += `    bool res = sol.isPalindrome(s);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << (res ? "true" : "false") << "\\n";\n`;
    } else if (challenge.id === 'dsa-best-time-stock') {
      const prices = vars.prices || [];
      harness += `    vector<int> prices = {${prices.join(', ')}};\n`;
      harness += `    int res = sol.maxProfit(prices);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
    } else if (challenge.id === 'dsa-longest-substring') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    string s = "${s}";\n`;
      harness += `    int res = sol.lengthOfLongestSubstring(s);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
    } else if (challenge.id === 'dsa-valid-parentheses') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `    string s = "${s}";\n`;
      harness += `    bool res = sol.isValid(s);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << (res ? "true" : "false") << "\\n";\n`;
    } else if (challenge.id === 'dsa-number-of-islands') {
      const grid = vars.grid || [];
      harness += `    vector<vector<char>> grid = {${grid.map((r: string[]) => `{${r.map((c) => `'${c}'`).join(', ')}}`).join(', ')}};\n`;
      harness += `    int res = sol.numIslands(grid);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << res << "\\n";\n`;
    } else if (challenge.id === 'dsa-course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = vars.prerequisites || [];
      harness += `    vector<vector<int>> prereqs = {${prereqs.map((p: number[]) => `{${p.join(', ')}}`).join(', ')}};\n`;
      harness += `    bool res = sol.canFinish(${numCourses}, prereqs);\n`;
      harness += `    cout << "CASE_RESULT:${caseNum}:" << (res ? "true" : "false") << "\\n";\n`;
    } else if (challenge.id === 'dsa-lru-cache') {
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
  let harness = `import java.util.*;\nimport java.io.*;\n\n`;
  harness += code + '\n\n';
  harness += `public class SolutionRunner {\n  public static void main(String[] args) {\n    Solution sol = new Solution();\n`;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;

    harness += `    // Case ${caseNum}\n    {\n`;

    if (challenge.id === 'dsa-two-sum') {
      const nums = vars.nums || [];
      const target = vars.target ?? 0;
      harness += `      int[] nums = new int[]{${nums.join(', ')}};\n`;
      harness += `      int[] res = sol.twoSum(nums, ${target});\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + Arrays.toString(res));\n`;
    } else if (challenge.id === 'dsa-valid-palindrome') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `      String s = "${s}";\n`;
      harness += `      boolean res = sol.isPalindrome(s);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (challenge.id === 'dsa-best-time-stock') {
      const prices = vars.prices || [];
      harness += `      int[] prices = new int[]{${prices.join(', ')}};\n`;
      harness += `      int res = sol.maxProfit(prices);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (challenge.id === 'dsa-longest-substring') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `      String s = "${s}";\n`;
      harness += `      int res = sol.lengthOfLongestSubstring(s);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (challenge.id === 'dsa-valid-parentheses') {
      const s = (vars.s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      harness += `      String s = "${s}";\n`;
      harness += `      boolean res = sol.isValid(s);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (challenge.id === 'dsa-number-of-islands') {
      const grid = vars.grid || [];
      harness += `      char[][] grid = new char[][]{${grid.map((r: string[]) => `new char[]{${r.map((c) => `'${c}'`).join(', ')}}`).join(', ')}};\n`;
      harness += `      int res = sol.numIslands(grid);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (challenge.id === 'dsa-course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = vars.prerequisites || [];
      harness += `      int[][] prereqs = new int[][]{${prereqs.map((p: number[]) => `new int[]{${p.join(', ')}}`).join(', ')}};\n`;
      harness += `      boolean res = sol.canFinish(${numCourses}, prereqs);\n`;
      harness += `      System.out.println("CASE_RESULT:${caseNum}:" + res);\n`;
    } else if (challenge.id === 'dsa-lru-cache') {
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
  let harness = `import json, sys\n\n`;
  harness += code + '\n\n';
  harness += `def __run_all_cases():\n`;
  harness += `    sol = Solution() if 'Solution' in globals() else None\n`;

  for (let i = 0; i < challenge.sampleTestCases.length; i++) {
    const tc = challenge.sampleTestCases[i];
    const vars = parseInputVariables(tc.input);
    const caseNum = i + 1;

    harness += `    # Case ${caseNum}\n`;

    if (challenge.id === 'dsa-two-sum') {
      const nums = JSON.stringify(vars.nums || []);
      const target = vars.target ?? 0;
      harness += `    fn = getattr(sol, 'twoSum', twoSum if 'twoSum' in globals() else None)\n`;
      harness += `    res = fn(${nums}, ${target})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (challenge.id === 'dsa-valid-palindrome') {
      const s = JSON.stringify(vars.s ?? '');
      harness += `    fn = getattr(sol, 'isPalindrome', isPalindrome if 'isPalindrome' in globals() else None)\n`;
      harness += `    res = fn(${s})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + ("true" if res else "false"))\n`;
    } else if (challenge.id === 'dsa-best-time-stock') {
      const prices = JSON.stringify(vars.prices || []);
      harness += `    fn = getattr(sol, 'maxProfit', maxProfit if 'maxProfit' in globals() else None)\n`;
      harness += `    res = fn(${prices})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (challenge.id === 'dsa-longest-substring') {
      const s = JSON.stringify(vars.s ?? '');
      harness += `    fn = getattr(sol, 'lengthOfLongestSubstring', lengthOfLongestSubstring if 'lengthOfLongestSubstring' in globals() else None)\n`;
      harness += `    res = fn(${s})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (challenge.id === 'dsa-valid-parentheses') {
      const s = JSON.stringify(vars.s ?? '');
      harness += `    fn = getattr(sol, 'isValid', isValid if 'isValid' in globals() else None)\n`;
      harness += `    res = fn(${s})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + ("true" if res else "false"))\n`;
    } else if (challenge.id === 'dsa-number-of-islands') {
      const grid = JSON.stringify(vars.grid || []);
      harness += `    fn = getattr(sol, 'numIslands', numIslands if 'numIslands' in globals() else None)\n`;
      harness += `    res = fn(${grid})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + json.dumps(res))\n`;
    } else if (challenge.id === 'dsa-course-schedule') {
      const numCourses = vars.numCourses ?? 0;
      const prereqs = JSON.stringify(vars.prerequisites || []);
      harness += `    fn = getattr(sol, 'canFinish', canFinish if 'canFinish' in globals() else None)\n`;
      harness += `    res = fn(${numCourses}, ${prereqs})\n`;
      harness += `    print("CASE_RESULT:${caseNum}:" + ("true" if res else "false"))\n`;
    } else if (challenge.id === 'dsa-lru-cache') {
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
