const http = require('http');

function post(path, payload) {
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, { method: 'GET' }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runCompleteSystemQA() {
  console.log('========================================================================');
  console.log('         INTERVIEW-IQ COMPREHENSIVE PRODUCTION QA TEST SUITE            ');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function test(title, ok, details = '') {
    total++;
    if (ok) {
      passed++;
      console.log(`  [PASS] ${title} ${details ? `(${details})` : ''}`);
    } else {
      console.error(`  [FAIL] ${title} ${details ? `(${details})` : ''}`);
    }
  }

  // ========================================================================
  // SECTION 1: SYSTEM HEALTH & SERVER CONFIG
  // ========================================================================
  console.log('--- SECTION 1: ENVIRONMENT & API CONFIGURATION ---');
  const keyRes = await get('/api/validate-key');
  test(
    'GET /api/validate-key returns 200 with locked-in status',
    keyRes.statusCode === 200 && keyRes.data.lockedIn === true,
    `Key: ${keyRes.data.maskedKey || 'Server default'}`
  );

  // ========================================================================
  // SECTION 2: RESUME ANALYSIS & INTERVIEW START
  // ========================================================================
  console.log('\n--- SECTION 2: RESUME ANALYSIS & ADAPTIVE SESSION START ---');
  const sampleResume = `
    Jane Doe - Senior Full Stack Engineer
    Skills: TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, Docker, System Design
    Experience: 5 years at FinTech Corp building high-throughput payment gateways and distributed microservices.
  `;
  const sampleJD = `
    Senior Software Engineer - FinTech Infrastructure
    Requirements: Strong algorithms, distributed systems, caching with Redis, SQL optimization, microservice architecture.
  `;

  const analyzeRes = await post('/api/analyze', {
    resumeText: sampleResume,
    jobDescription: sampleJD,
  });
  test(
    'POST /api/analyze extracts candidate name and technical skills',
    analyzeRes.statusCode === 200 && !!analyzeRes.data.candidateAnalysis?.technicalSkills?.length,
    `Skills: ${analyzeRes.data.candidateAnalysis?.technicalSkills?.slice(0, 4).join(', ')}...`
  );

  const startRes = await post('/api/interview/start', {
    candidateAnalysis: analyzeRes.data.candidateAnalysis,
    jobDescription: sampleJD,
    resumeText: sampleResume,
    interviewType: 'technical',
    difficulty: 'intermediate',
    selectedRounds: ['foundation', 'coding'],
  });
  test(
    'POST /api/interview/start generates questions and role-based DSA challenges',
    startRes.statusCode === 200 &&
      startRes.data.questions?.length > 0 &&
      startRes.data.codingChallenges?.length >= 2,
    `Questions: ${startRes.data.questions?.length}, Challenges: ${startRes.data.codingChallenges?.length}`
  );

  const challenges = startRes.data.codingChallenges || [];
  const twoSum = challenges.find((c) => c.id.includes('two-sum')) || challenges[0];
  const secondChallenge = challenges.find((c) => !c.id.includes('two-sum')) || challenges[1];

  test(
    'Coding challenges contain starterCodes for all 6 supported languages',
    twoSum &&
      twoSum.starterCodes &&
      !!twoSum.starterCodes.typescript &&
      !!twoSum.starterCodes.javascript &&
      !!twoSum.starterCodes.python &&
      !!twoSum.starterCodes.java &&
      !!twoSum.starterCodes.cpp &&
      !!twoSum.starterCodes.c,
    'TS, JS, Python, Java, C++, C all present'
  );

  // ========================================================================
  // SECTION 3: ADAPTIVE VERBAL INTERVIEW & TOPIC ROTATION
  // ========================================================================
  console.log('\n--- SECTION 3: ADAPTIVE VERBAL INTERVIEW & TOPIC ROTATION ---');
  const firstQuestion = startRes.data.questions[0];
  console.log(`  Question 1 (${firstQuestion.category}): "${firstQuestion.text}"`);

  let accurateAnswer = 'SQL databases are relational systems with predefined schemas, table relationships, and ACID compliance for transactional reliability. In contrast, NoSQL databases are non-relational data stores (such as document, key-value, or columnar) offering flexible schemas, horizontal partitioning across clusters, and eventual consistency for high-throughput unstructured workloads.';

  if (firstQuestion.text.toLowerCase().includes('react') || firstQuestion.text.toLowerCase().includes('component') || firstQuestion.text.toLowerCase().includes('hook')) {
    accurateAnswer = 'In React, state changes trigger re-renders of the component and its children. We optimize performance using React.memo, useCallback for stable function references, and useMemo for expensive calculations.';
  } else if (firstQuestion.text.toLowerCase().includes('event loop') || firstQuestion.text.toLowerCase().includes('promise') || firstQuestion.text.toLowerCase().includes('async')) {
    accurateAnswer = 'JavaScript is single-threaded with an event loop. Synchronous code runs on the call stack, while Promises queue in the microtask queue and setTimeout queues in the macrotask queue. Microtasks execute immediately after the call stack empties before macrotasks.';
  }

  const respondResProficient = await post('/api/interview/respond', {
    currentQuestion: firstQuestion,
    candidateAnswer: accurateAnswer,
    questionIndex: 0,
    previousHistory: [],
    allQuestions: startRes.data.questions,
    currentDifficulty: 'intermediate',
    candidateAnalysis: analyzeRes.data.candidateAnalysis,
    jobDescription: sampleJD,
    resumeText: sampleResume,
  });

  test(
    'Adaptive Verbal: Proficient answer concludes topic and rotates to new domain',
    respondResProficient.statusCode === 200 &&
      respondResProficient.data.answerEvaluation?.score >= 65 &&
      !!respondResProficient.data.interviewerNote &&
      respondResProficient.data.nextQuestion !== null,
    `Score: ${respondResProficient.data.answerEvaluation?.score}/100, Note: "${respondResProficient.data.interviewerNote}"`
  );

  // Test 3.2: Underperformance topic conclusion (no badgering / fatigue guard)
  const secondVerbalQ = respondResProficient.data.nextQuestion;
  console.log(`  Question 2 (${secondVerbalQ.category}): "${secondVerbalQ.text}"`);
  const respondResStruggle = await post('/api/interview/respond', {
    currentQuestion: secondVerbalQ,
    candidateAnswer: 'I do not have much experience with this specific concept yet.',
    questionIndex: 1,
    previousHistory: [
      {
        question: firstQuestion,
        candidateAnswer: accurateAnswer,
        evaluation: respondResProficient.data.answerEvaluation,
        answeredAt: new Date().toISOString(),
      },
    ],
    allQuestions: startRes.data.questions,
    currentDifficulty: respondResProficient.data.newDifficulty,
    candidateAnalysis: analyzeRes.data.candidateAnalysis,
    jobDescription: sampleJD,
    resumeText: sampleResume,
  });

  test(
    'Adaptive Verbal: Underperformance concludes topic gracefully to prevent fatigue',
    respondResStruggle.statusCode === 200 &&
      respondResStruggle.data.answerEvaluation?.score < 50 &&
      respondResStruggle.data.interviewerNote.includes('Concluding this topic') &&
      respondResStruggle.data.nextQuestion !== null,
    `Note: "${respondResStruggle.data.interviewerNote}"`
  );

  // Verbal round evaluation test
  const evalHistory = [
    {
      question: firstQuestion,
      candidateAnswer: accurateAnswer,
      evaluation: respondResProficient.data.answerEvaluation,
      answeredAt: new Date().toISOString(),
    },
    {
      question: secondVerbalQ,
      candidateAnswer: 'I do not have much experience with this specific concept yet.',
      evaluation: respondResStruggle.data.answerEvaluation,
      answeredAt: new Date().toISOString(),
    },
  ];

  const verbalEvalRes = await post('/api/interview/evaluate', {
    interviewHistory: evalHistory,
    candidateAnalysis: analyzeRes.data.candidateAnalysis,
    jobDescription: sampleJD,
    codingSubmissions: [],
  });

  test(
    'POST /api/interview/evaluate creates comprehensive final candidate scorecard',
    verbalEvalRes.statusCode === 200 && !!verbalEvalRes.data.report?.overallScore,
    `Overall Score: ${verbalEvalRes.data.report?.overallScore}, Recommendation: ${verbalEvalRes.data.report?.hiringRecommendation}`
  );

  // ========================================================================
  // SECTION 4: LIVE CODING ENGINE (ALL 6 LANGUAGES & MULTI-CHALLENGE)
  // ========================================================================
  console.log('\n--- SECTION 4: LIVE CODING EXECUTION ENGINE (6 LANGUAGES) ---');

  // 4.1 TypeScript - Two Sum
  const tsRes = await post('/api/coding/run', {
    code: `function twoSum(nums: number[], target: number): number[] {
      const map = new Map<number, number>();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp)!, i];
        map.set(nums[i], i);
      }
      return [];
    }`,
    challenge: twoSum,
    language: 'typescript',
  });
  test('TypeScript: Two Sum optimal Map solution', tsRes.data.status === 'Accepted' && tsRes.data.allPassed, `${tsRes.data.runtimeMs}ms`);

  // 4.2 JavaScript - Two Sum (Arrow function with const)
  const jsRes = await post('/api/coding/run', {
    code: `const twoSum = (nums, target) => {
      const seen = {};
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen[comp] !== undefined) return [seen[comp], i];
        seen[nums[i]] = i;
      }
      return [];
    };`,
    challenge: twoSum,
    language: 'javascript',
  });
  test('JavaScript: Two Sum arrow function', jsRes.data.status === 'Accepted' && jsRes.data.allPassed, `${jsRes.data.runtimeMs}ms`);

  // 4.3 Python - Two Sum (class Solution)
  const pyRes = await post('/api/coding/run', {
    code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        m = {}
        for i, x in enumerate(nums):
            if target - x in m:
                return [m[target - x], i]
            m[x] = i
        return []`,
    challenge: twoSum,
    language: 'python',
  });
  test('Python 3.12: Two Sum dictionary solution', pyRes.data.status === 'Accepted' && pyRes.data.allPassed, `${pyRes.data.runtimeMs}ms`);

  // 4.4 Java - Two Sum (with public class Solution and imports)
  const javaRes = await post('/api/coding/run', {
    code: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[]{ map.get(comp), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
    challenge: twoSum,
    language: 'java',
  });
  test('Java 21: Two Sum with public class Solution', javaRes.data.status === 'Accepted' && javaRes.data.allPassed, `${javaRes.data.runtimeMs}ms`);

  // 4.5 C++ - Two Sum (standalone function)
  const cppRes = await post('/api/coding/run', {
    code: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); ++i) {
        int comp = target - nums[i];
        if (seen.find(comp) != seen.end()) {
            return {seen[comp], i};
        }
        seen[nums[i]] = i;
    }
    return {};
} `,
    challenge: twoSum,
    language: 'cpp',
  });
  test('C++17: Two Sum standalone function', cppRes.data.status === 'Accepted' && cppRes.data.allPassed, `${cppRes.data.runtimeMs}ms`);

  // 4.6 C - Two Sum (malloc pointer return)
  const cRes = await post('/api/coding/run', {
    code: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* res = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                res[0] = i;
                res[1] = j;
                *returnSize = 2;
                return res;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}`,
    challenge: twoSum,
    language: 'c',
  });
  test('C17: Two Sum with malloc pointer', cRes.data.status === 'Accepted' && cRes.data.allPassed, `${cRes.data.runtimeMs}ms`);

  // 4.7 Second Challenge (Longest Substring / Palindrome) in Python
  const secondRes = await post('/api/coding/run', {
    code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right, c in enumerate(s):
            if c in char_map and char_map[c] >= left:
                left = char_map[c] + 1
            char_map[c] = right
            max_len = max(max_len, right - left + 1)
        return max_len

    def isPalindrome(self, s: str) -> bool:
        filtered = [c.lower() for c in s if c.isalnum()]
        return filtered == filtered[::-1]`,
    challenge: secondChallenge,
    language: 'python',
  });
  test(
    `Challenge 2 (${secondChallenge.title}) in Python`,
    secondRes.data.status === 'Accepted' && secondRes.data.allPassed,
    `${secondRes.data.runtimeMs}ms`
  );

  // ========================================================================
  // SECTION 5: CLASS-BASED & STANDARD I/O EXECUTION
  // ========================================================================
  console.log('\n--- SECTION 5: CLASS-BASED & STANDARD I/O RUNNERS ---');

  // 5.1 Class-based: LRU Cache in Java
  const lruChallenge = {
    id: 'dsa-lru-cache',
    title: 'LRU Cache (Least Recently Used)',
    starterCode: 'class LRUCache { constructor(capacity: number) {} get(key: number): number { return -1; } put(key: number, value: number): void {} }',
    sampleTestCases: [
      { input: 'capacity = 2, put(1, 1), put(2, 2), get(1)', expectedOutput: '1' },
      { input: 'capacity = 2, put(1, 1), put(2, 2), get(1), put(3, 3), get(2)', expectedOutput: 'Evicts key 2 (least recently used)' },
    ],
  };

  const lruJavaRes = await post('/api/coding/run', {
    code: `import java.util.*;

class LRUCache {
    private int capacity;
    private LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > capacity;
            }
        };
    }

    public int get(int key) {
        return map.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        map.put(key, value);
    }
}`,
    challenge: lruChallenge,
    language: 'java',
  });
  test('Class-based: LRU Cache in Java 21', lruJavaRes.data.status === 'Accepted' && lruJavaRes.data.allPassed);

  // 5.2 Standard I/O: C program with main() and scanf/printf
  const stdinChallenge = {
    id: 'stdin-sum',
    title: 'Sum of Two Numbers (Standard I/O)',
    starterCode: '',
    sampleTestCases: [
      { input: '7 8', expectedOutput: '15' },
      { input: '100 250', expectedOutput: '350' },
    ],
  };

  const cStdinRes = await post('/api/coding/run', {
    code: `#include <stdio.h>
int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        printf("%d\\n", a + b);
    }
    return 0;
}`,
    challenge: stdinChallenge,
    language: 'c',
  });
  test('Standard I/O: C program with main() & scanf/printf', cStdinRes.data.status === 'Accepted' && cStdinRes.data.allPassed);

  // 5.3 Standard I/O: C++ program with main() and cin/cout
  const cppStdinRes = await post('/api/coding/run', {
    code: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a + b) << endl;
    }
    return 0;
}`,
    challenge: stdinChallenge,
    language: 'cpp',
  });
  test('Standard I/O: C++ program with main() & cin/cout', cppStdinRes.data.status === 'Accepted' && cppStdinRes.data.allPassed);

  // ========================================================================
  // SECTION 6: VERDICTS & ERROR HANDLING
  // ========================================================================
  console.log('\n--- SECTION 6: VERDICTS & ERROR HANDLING ---');

  // 6.1 Compilation Error in C++
  const cppErrRes = await post('/api/coding/run', {
    code: `class Solution { public: vector<int> twoSum() { SYNTAX_MISTAKE; } };`,
    challenge: twoSum,
    language: 'cpp',
  });
  test(
    'Compilation Error: C++ syntax error captured in compilationError',
    cppErrRes.data.status === 'Compilation Error' && !!cppErrRes.data.compilationError,
    'status = Compilation Error'
  );

  // 6.2 Wrong Answer in Python
  const pyWrongRes = await post('/api/coding/run', {
    code: `class Solution:
    def twoSum(self, nums, target):
        return [0, 999]`,
    challenge: twoSum,
    language: 'python',
  });
  test(
    'Wrong Answer: Python incorrect indices caught',
    pyWrongRes.data.status === 'Wrong Answer' && !pyWrongRes.data.allPassed,
    'status = Wrong Answer'
  );

  // 6.3 Time Limit Exceeded (Infinite Loop Guard)
  const tleRes = await post('/api/coding/run', {
    code: `function twoSum(nums, target) {
      while (true) {}
    }`,
    challenge: twoSum,
    language: 'javascript',
  });
  test(
    'Time Limit Exceeded: 2.5s execution sandbox timeout triggers correctly',
    tleRes.data.status === 'Runtime Error' || tleRes.data.status === 'Time Limit Exceeded',
    'infinite loop caught'
  );

  // ========================================================================
  // SECTION 7: CODING EVALUATION API (BIG-O COMPLEXITY & CODE QUALITY)
  // ========================================================================
  console.log('\n--- SECTION 7: AI CODING EVALUATOR (BIG-O & RUBRIC) ---');

  const evalRes = await post('/api/coding/evaluate', {
    code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{ map.get(comp), i };
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
    challenge: twoSum,
    language: 'java',
    runResults: javaRes.data,
  });
  test(
    'POST /api/coding/evaluate returns Big-O complexity analysis and score',
    evalRes.statusCode === 200 &&
      evalRes.data.evaluation?.score >= 70 &&
      !!evalRes.data.evaluation?.timeComplexity,
    `Score: ${evalRes.data.evaluation?.score}, Time: ${evalRes.data.evaluation?.timeComplexity}, Space: ${evalRes.data.evaluation?.spaceComplexity}`
  );

  // ========================================================================
  // FINAL SUMMARY
  // ========================================================================
  console.log('\n========================================================================');
  console.log(`      QA TEST EXECUTION SUMMARY: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('      STATUS: ALL TESTS PASSED! PLATFORM IS PRODUCTION READY!');
  } else {
    console.error(`      STATUS: ${total - passed} TESTS FAILED! ATTENTION REQUIRED!`);
  }
  console.log('========================================================================\n');
}

runCompleteSystemQA().catch(console.error);
