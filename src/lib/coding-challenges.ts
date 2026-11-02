import { CodingChallenge, CodingEvaluation } from '@/types/interview';

export const DEFAULT_CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'code-1',
    title: 'Custom Debounce Utility / Hook',
    difficulty: 'Medium',
    skillCategory: 'JavaScript / React Foundations',
    description: `Implement a robust debounce utility function in JavaScript / TypeScript.

A debounced function delays invoking \`func\` until after \`wait\` milliseconds have elapsed since the last time the debounced function was invoked. It should support canceling and passing arguments properly.

**Requirements:**
1. Delay execution of \`func\` by \`wait\` milliseconds.
2. If invoked again before \`wait\` has elapsed, reset the timer.
3. Preserve the \`this\` context and pass all provided arguments.
4. (Bonus) Provide a \`.cancel()\` method on the returned function.`,
    language: 'typescript',
    starterCode: `function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel?: () => void } {
  let timerId: NodeJS.Timeout | null = null;

  function debounced(...args: Parameters<T>) {
    // Write your debounce implementation here
  }

  debounced.cancel = () => {
    // Implement cancellation
  };

  return debounced;
}`,
    sampleTestCases: [
      {
        input: 'debounce(fn, 200); called 3 times in 50ms',
        expectedOutput: 'fn is executed exactly once after 200ms',
        explanation: 'Previous unexecuted timer invocations must be cleared upon each rapid trigger.'
      },
      {
        input: 'debounced("hello", 42)',
        expectedOutput: 'Arguments "hello" and 42 are received by target fn',
        explanation: 'Arguments must be forwarded correctly to the underlying function.'
      }
    ]
  },
  {
    id: 'code-2',
    title: 'Token Bucket Rate Limiter Middleware',
    difficulty: 'Medium',
    skillCategory: 'Node.js / Backend Systems',
    description: `Implement an in-memory Rate Limiter using the **Token Bucket** algorithm for API requests.

The rate limiter allows up to \`capacity\` requests in a burst and refills tokens at a fixed rate of \`refillRatePerSec\` tokens per second.

**Requirements:**
1. Initialize with a maximum \`capacity\` and \`refillRatePerSec\`.
2. \`allowRequest(userId: string): boolean\` returns \`true\` if a token was available and consumed, or \`false\` if rate limited.
3. Refill tokens proportionally based on elapsed wall-clock time between requests.`,
    language: 'typescript',
    starterCode: `interface Bucket {
  tokens: number;
  lastRefillTime: number;
}

class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSec: number;
  private buckets: Map<string, Bucket>;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.buckets = new Map();
  }

  public allowRequest(userId: string): boolean {
    const now = Date.now();
    // Implement token refill and consumption logic
    return true;
  }
}`,
    sampleTestCases: [
      {
        input: 'capacity = 5, rate = 1/sec. 5 requests sent at t=0',
        expectedOutput: 'All 5 requests return true; 6th request at t=0 returns false',
        explanation: 'Tokens cannot be overdrawn below zero.'
      },
      {
        input: 'Waiting 2 seconds after exhaustion',
        expectedOutput: '2 new requests are allowed',
        explanation: 'Tokens refill at 1 per second up to maximum capacity.'
      }
    ]
  }
];

export function evaluateCodingFallback(code: string, challenge: CodingChallenge): CodingEvaluation {
  const trimmed = code.trim();

  // Basic checks
  if (trimmed.length < 30 || trimmed === challenge.starterCode.trim()) {
    return {
      score: 15,
      passed: false,
      correctnessScore: 10,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      codeQuality: 20,
      feedback: 'The submission does not implement the core logic or left the starter boilerplate untouched.',
      edgeCasesCovered: [],
      edgeCasesMissed: ['Core execution flow', 'Parameter handling', 'Boundary conditions']
    };
  }

  let score = 70;
  let correctness = 75;
  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  const edgeCasesCovered: string[] = [];
  const edgeCasesMissed: string[] = [];

  if (challenge.id === 'code-1') {
    // Debounce checks
    const hasClearTimeout = /clearTimeout\s*\(/.test(trimmed);
    const hasSetTimeout = /setTimeout\s*\(/.test(trimmed);
    const hasApplyOrCall = /(apply|call|\.\.\.args)/.test(trimmed);
    const hasCancel = /cancel\s*=/.test(trimmed) && hasClearTimeout;

    if (hasClearTimeout) edgeCasesCovered.push('Clears existing pending timer on re-invocation');
    else edgeCasesMissed.push('Fails to clear previous timer with clearTimeout');

    if (hasSetTimeout) edgeCasesCovered.push('Defers execution by wait milliseconds');
    else edgeCasesMissed.push('Missing setTimeout deferral');

    if (hasApplyOrCall) edgeCasesCovered.push('Preserves arguments forwarding');
    else edgeCasesMissed.push('Arguments may be lost or not forwarded properly');

    if (hasCancel) edgeCasesCovered.push('Properly implements .cancel() cleanup');

    if (hasClearTimeout && hasSetTimeout && hasApplyOrCall) {
      score = hasCancel ? 95 : 85;
      correctness = 90;
    } else {
      score = 45;
      correctness = 40;
    }
  } else if (challenge.id === 'code-2') {
    // Token Bucket checks
    const hasNow = /Date\.now\(\)|performance\.now\(\)/.test(trimmed);
    const hasMathMin = /Math\.min/.test(trimmed) || /tokens\s*>\s*this\.capacity/.test(trimmed);
    const hasMapSet = /this\.buckets\.(get|set)/.test(trimmed);

    if (hasNow) edgeCasesCovered.push('Tracks elapsed wall-clock timestamp');
    else edgeCasesMissed.push('Missing timestamp delta calculation');

    if (hasMathMin) edgeCasesCovered.push('Caps tokens at bucket capacity');
    else edgeCasesMissed.push('Tokens may unbounded overflow past capacity');

    if (hasMapSet) edgeCasesCovered.push('Maintains per-user bucket state');

    timeComplexity = 'O(1) average lookup';
    spaceComplexity = 'O(U) where U is unique users';

    if (hasNow && hasMathMin && hasMapSet) {
      score = 90;
      correctness = 90;
    } else {
      score = 50;
      correctness = 45;
    }
  }

  return {
    score,
    passed: score >= 70,
    correctnessScore: correctness,
    timeComplexity,
    spaceComplexity,
    codeQuality: Math.min(95, score + 5),
    feedback: score >= 75
      ? 'Clean, idiomatic implementation handling timer state and edge-case boundaries effectively.'
      : 'Implementation missing key state reset or boundary checks. Review the edge-case notes.',
    edgeCasesCovered,
    edgeCasesMissed
  };
}

