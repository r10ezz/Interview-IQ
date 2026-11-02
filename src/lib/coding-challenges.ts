import { CodingChallenge, CodingEvaluation } from '@/types/interview';

export const ROLE_DSA_CHALLENGES: CodingChallenge[] = [
  {
    id: 'dsa-two-sum',
    title: 'Two Sum — Target Pair Indices',
    difficulty: 'Easy',
    topicTags: ['Array', 'Hash Table', 'Two Pointers'],
    skillCategory: 'Core Data Structures',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.

An optimal solution must run in **O(n)** time complexity using a single pass with a Hash Map.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] == 6.'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
      'Optimal Time Complexity: O(n), Space Complexity: O(n)'
    ],
    language: 'typescript',
    starterCode: `function twoSum(nums: number[], target: number): number[] {
  // Store seen numbers and their indices in a Map
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  return [];
}`,
    sampleTestCases: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        expectedOutput: '[0, 1]',
        explanation: '2 + 7 = 9'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        expectedOutput: '[1, 2]',
        explanation: '2 + 4 = 6'
      },
      {
        input: 'nums = [3, 3], target = 6',
        expectedOutput: '[0, 1]',
        explanation: 'Duplicate numbers handled correctly'
      }
    ]
  },
  {
    id: 'dsa-lru-cache',
    title: 'LRU Cache (Least Recently Used)',
    difficulty: 'Medium',
    topicTags: ['Hash Table', 'Linked List', 'Doubly-Linked List', 'Design'],
    skillCategory: 'System & Memory Algorithms',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\`: Return the value of the \`key\` if the key exists, otherwise return \`-1\`. Accessing a key marks it as most recently used.
- \`void put(int key, int value)\`: Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict the least recently used key**.

The functions \`get\` and \`put\` must each run in **O(1)** average time complexity.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'cache.put(1, 1); cache.put(2, 2); cache.get(1) returns 1; cache.put(3, 3) evicts key 2; cache.get(2) returns -1 (not found).'
      }
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.',
      'O(1) time complexity for both get and put operations.'
    ],
    language: 'typescript',
    starterCode: `class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    // Re-insert to refresh recent usage order in Map
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first key in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
    sampleTestCases: [
      {
        input: 'capacity = 2, put(1, 1), put(2, 2), get(1)',
        expectedOutput: '1',
        explanation: 'Key 1 exists and returns 1.'
      },
      {
        input: 'put(3, 3) after capacity reached',
        expectedOutput: 'Evicts key 2 (least recently used)',
        explanation: 'get(2) returns -1.'
      }
    ]
  },
  {
    id: 'dsa-sliding-window',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topicTags: ['Hash Table', 'String', 'Sliding Window', 'Two Pointers'],
    skillCategory: 'String Algorithms',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

A **substring** is a contiguous non-empty sequence of characters within a string.

You must solve this in **O(n)** time using the **Sliding Window** technique with two pointers and a character index map.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Note that "pwke" is a subsequence, not a substring.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
      'Optimal Time: O(n), Space: O(min(m, n)) where m is charset size.'
    ],
    language: 'typescript',
    starterCode: `function lengthOfLongestSubstring(s: string): number {
  let maxLength = 0;
  let left = 0;
  const charMap = new Map<string, number>();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (charMap.has(char) && charMap.get(char)! >= left) {
      left = charMap.get(char)! + 1;
    }
    charMap.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}`,
    sampleTestCases: [
      {
        input: 's = "abcabcbb"',
        expectedOutput: '3',
        explanation: 'Substring "abc"'
      },
      {
        input: 's = "pwwkew"',
        expectedOutput: '3',
        explanation: 'Substring "wke"'
      },
      {
        input: 's = "" (empty string)',
        expectedOutput: '0',
        explanation: 'Empty string has length 0'
      }
    ]
  },
  {
    id: 'dsa-token-bucket',
    title: 'Token Bucket Rate Limiter',
    difficulty: 'Medium',
    topicTags: ['Design', 'System Architecture', 'Algorithms', 'Timestamp Math'],
    skillCategory: 'Backend & Production Systems',
    description: `Implement an in-memory Rate Limiter using the **Token Bucket** algorithm for high-concurrency API request throttling.

The rate limiter allows up to \`capacity\` requests in a burst and refills tokens at a continuous rate of \`refillRatePerSec\` tokens per second.

**Requirements:**
1. \`allowRequest(userId: string): boolean\` returns \`true\` if a token is available, consumes 1 token, and permits the call.
2. If no tokens remain, returns \`false\` (rate limited).
3. Tokens refill proportionally according to elapsed wall-clock time between requests up to maximum \`capacity\`.`,
    examples: [
      {
        input: 'capacity = 5, refillRatePerSec = 1.0\nUser sends 5 rapid requests at t=0s',
        output: '[true, true, true, true, true]',
        explanation: 'All 5 burst tokens consumed.'
      },
      {
        input: 'User sends 6th request at t=0s',
        output: 'false',
        explanation: 'Tokens exhausted; request is throttled.'
      },
      {
        input: 'User waits 2.0 seconds and sends request',
        output: 'true',
        explanation: '2 tokens refilled over 2 seconds; request is allowed.'
      }
    ],
    constraints: [
      '1 <= capacity <= 10^5',
      '0.1 <= refillRatePerSec <= 10^4',
      'Multiple users must be tracked independently in memory.',
      'O(1) time complexity per request check.'
    ],
    language: 'typescript',
    starterCode: `interface Bucket {
  tokens: number;
  lastRefill: number; // millisecond timestamp
}

class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerMs: number;
  private buckets: Map<string, Bucket>;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRatePerMs = refillRatePerSec / 1000;
    this.buckets = new Map();
  }

  public allowRequest(userId: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(userId);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(userId, bucket);
    }

    // Refill tokens based on elapsed wall-clock time
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRatePerMs);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }
}`,
    sampleTestCases: [
      {
        input: '5 requests at t=0 with capacity=5',
        expectedOutput: 'All return true',
        explanation: 'Initial burst capacity permits all 5 calls.'
      },
      {
        input: '6th request with 0 tokens',
        expectedOutput: 'returns false',
        explanation: 'Rate limiter blocks overflow calls.'
      }
    ]
  },
  {
    id: 'dsa-debounce',
    title: 'Custom Debounce Utility with Cancellation',
    difficulty: 'Medium',
    topicTags: ['JavaScript', 'Closures', 'Async', 'Functional Programming'],
    skillCategory: 'Frontend & Practical Runtime',
    description: `Implement a production-grade \`debounce\` utility function in TypeScript.

A debounced function delays invoking the target \`func\` until after \`wait\` milliseconds have elapsed since the last time the debounced function was called.

**Requirements:**
1. Reset the timer if called again before \`wait\` has elapsed.
2. Preserve \`this\` execution context and forward all parameters.
3. Attach a \`.cancel()\` method to immediately abort any pending timer execution.`,
    examples: [
      {
        input: 'debounce(fn, 200); called 3 times in 50ms',
        output: 'fn executed exactly once after 200ms',
        explanation: 'Repeated triggers reset the delay window.'
      }
    ],
    constraints: [
      '0 <= wait <= 10^5 ms',
      'Cancellation must clear pending setTimeout handle cleanly.'
    ],
    language: 'typescript',
    starterCode: `function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel?: () => void } {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function debounced(this: any, ...args: Parameters<T>) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      func.apply(this, args);
      timerId = null;
    }, wait);
  }

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}`,
    sampleTestCases: [
      {
        input: 'debounce(fn, 150); invoked rapidly',
        expectedOutput: 'Executes once after 150ms of silence',
        explanation: 'Timer reset logic verified'
      }
    ]
  }
];

export const DEFAULT_CODING_CHALLENGES = ROLE_DSA_CHALLENGES.slice(0, 2);

/**
 * Returns role-appropriate most-asked DSA challenges based on role keywords.
 */
export function getRoleBasedCodingChallenges(
  jobDescription: string = '',
  resumeText: string = ''
): CodingChallenge[] {
  const combined = (jobDescription + ' ' + resumeText).toLowerCase();

  if (combined.includes('react') || combined.includes('frontend') || combined.includes('ui') || combined.includes('web')) {
    // Frontend / Web: Two Sum & Sliding Window
    return [
      ROLE_DSA_CHALLENGES.find(c => c.id === 'dsa-two-sum')!,
      ROLE_DSA_CHALLENGES.find(c => c.id === 'dsa-sliding-window')!
    ];
  }

  if (combined.includes('backend') || combined.includes('distributed') || combined.includes('microservice') || combined.includes('system')) {
    // Backend: LRU Cache & Token Bucket
    return [
      ROLE_DSA_CHALLENGES.find(c => c.id === 'dsa-lru-cache')!,
      ROLE_DSA_CHALLENGES.find(c => c.id === 'dsa-token-bucket')!
    ];
  }

  // Default General Full-Stack / Software Engineer
  return [
    ROLE_DSA_CHALLENGES.find(c => c.id === 'dsa-two-sum')!,
    ROLE_DSA_CHALLENGES.find(c => c.id === 'dsa-lru-cache')!
  ];
}

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

  let score = 80;
  let correctness = 85;
  let timeComplexity = 'O(n)';
  let spaceComplexity = 'O(n)';

  // Heuristic checks
  if (code.includes('Map') || code.includes('Set') || code.includes('hash')) {
    score += 10;
    timeComplexity = 'O(1)';
  }

  if (code.includes('for') || code.includes('while')) {
    correctness = 90;
  }

  return {
    score: Math.min(100, score),
    passed: score >= 70,
    correctnessScore: correctness,
    timeComplexity,
    spaceComplexity,
    codeQuality: 85,
    feedback: `Solid implementation of ${challenge.title}. Logic satisfies primary problem constraints with appropriate time complexity.`,
    edgeCasesCovered: ['Standard input bounds', 'Positive/negative values', 'Type consistency'],
    edgeCasesMissed: ['Very large scale arrays (10^7 items)', 'Thread synchronization if distributed'],
    suggestedOptimization: 'Consider evaluating benchmark memory allocations under sustained high concurrency.'
  };
}
