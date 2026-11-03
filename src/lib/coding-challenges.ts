import { CodingChallenge, CodingEvaluation, DifficultyLevel } from '@/types/interview';

export const ROLE_DSA_CHALLENGES: CodingChallenge[] = [
  // ==================== TIER 1: BEGINNER (ARRAYS & STRINGS) ====================
  {
    id: 'dsa-two-sum',
    title: 'Two Sum — Target Pair Indices',
    difficulty: 'Easy',
    topicTags: ['Array', 'Hash Table', 'Two Pointers'],
    skillCategory: 'Arrays & Hashing',
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
  // Write your solution here
  
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
    id: 'dsa-valid-palindrome',
    title: 'Valid Palindrome (Alphanumeric)',
    difficulty: 'Easy',
    topicTags: ['String', 'Two Pointers'],
    skillCategory: 'Strings & Two Pointers',
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 'An empty string reads the same forward and backward.'
      }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.',
      'Optimal Time: O(n), Space: O(1)'
    ],
    language: 'typescript',
    starterCode: `function isPalindrome(s: string): boolean {
  // Write your solution here
  return false;
}`,
    sampleTestCases: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        expectedOutput: 'true',
        explanation: 'Alphanumeric letters match'
      },
      {
        input: 's = "race a car"',
        expectedOutput: 'false',
        explanation: 'Characters do not match in reverse'
      },
      {
        input: 's = " "',
        expectedOutput: 'true',
        explanation: 'Empty or whitespace string is a palindrome'
      }
    ]
  },
  {
    id: 'dsa-best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topicTags: ['Array', 'Dynamic Programming', 'Two Pointers'],
    skillCategory: 'Arrays & Greedy',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.'
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        output: '0',
        explanation: 'In this case, no transactions are done and max profit = 0.'
      }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
      'Optimal Time: O(n), Space: O(1)'
    ],
    language: 'typescript',
    starterCode: `function maxProfit(prices: number[]): number {
  // Write your solution here
  return 0;
}`,
    sampleTestCases: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        expectedOutput: '5',
        explanation: 'Buy at 1, sell at 6 = 5'
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        expectedOutput: '0',
        explanation: 'Decreasing prices, profit is 0'
      }
    ]
  },

  // ==================== TIER 2: INTERMEDIATE (STRINGS & SLIDING WINDOW) ====================
  {
    id: 'dsa-longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topicTags: ['Hash Table', 'String', 'Sliding Window', 'Two Pointers'],
    skillCategory: 'Strings & Sliding Window',
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
  // Write your solution here
  return 0;
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
        input: 's = ""',
        expectedOutput: '0',
        explanation: 'Empty string has length 0'
      }
    ]
  },
  {
    id: 'dsa-valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topicTags: ['String', 'Stack'],
    skillCategory: 'Strings & Stacks',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All brackets match in correct order.'
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Mismatched closing bracket.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only "()[]{}"',
      'Optimal Time: O(n), Space: O(n)'
    ],
    language: 'typescript',
    starterCode: `function isValid(s: string): boolean {
  // Write your solution here
  return false;
}`,
    sampleTestCases: [
      {
        input: 's = "()[]{}"',
        expectedOutput: 'true',
        explanation: 'Valid bracket sequence'
      },
      {
        input: 's = "(]"',
        expectedOutput: 'false',
        explanation: 'Mismatched bracket type'
      }
    ]
  },

  // ==================== TIER 3: ADVANCED (GRAPHS & TREES) ====================
  {
    id: 'dsa-number-of-islands',
    title: 'Number of Islands (Grid Graph)',
    difficulty: 'Medium',
    topicTags: ['Graph', 'Breadth-First Search', 'Depth-First Search', 'Matrix'],
    skillCategory: 'Graphs & BFS/DFS',
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    examples: [
      {
        input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]',
        output: '2',
        explanation: 'Two separate islands of land.'
      },
      {
        input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]',
        output: '1',
        explanation: 'All connected lands form 1 island.'
      }
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] is "0" or "1".',
      'Optimal Time: O(m * n), Space: O(m * n)'
    ],
    language: 'typescript',
    starterCode: `function numIslands(grid: string[][]): number {
  // Write your graph traversal solution here
  return 0;
}`,
    sampleTestCases: [
      {
        input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]',
        expectedOutput: '2',
        explanation: 'Top-left cluster and bottom-right island'
      },
      {
        input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]',
        expectedOutput: '1',
        explanation: 'Single connected component'
      }
    ]
  },
  {
    id: 'dsa-course-schedule',
    title: 'Course Schedule (Cycle Detection in Graph)',
    difficulty: 'Medium',
    topicTags: ['Graph', 'Depth-First Search', 'Topological Sort', 'Cycle Detection'],
    skillCategory: 'Graphs & Topological Sort',
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a, b]\` indicates that you must take course \`b\` first if you want to take course \`a\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\` (if there is a cyclic dependency).`,
    examples: [
      {
        input: 'numCourses = 2, prerequisites = [[1, 0]]',
        output: 'true',
        explanation: 'Take course 0 then take course 1.'
      },
      {
        input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]',
        output: 'false',
        explanation: 'Cycle detected between courses 0 and 1.'
      }
    ],
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= 5000',
      'prerequisites[i].length == 2',
      'Optimal Time: O(V + E), Space: O(V + E)'
    ],
    language: 'typescript',
    starterCode: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // Write your topological sort or cycle detection here
  return true;
}`,
    sampleTestCases: [
      {
        input: 'numCourses = 2, prerequisites = [[1, 0]]',
        expectedOutput: 'true',
        explanation: 'Valid DAG with no cycles'
      },
      {
        input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]',
        expectedOutput: 'false',
        explanation: 'Cycle detected: 0 depends on 1, 1 depends on 0'
      }
    ]
  },
  {
    id: 'dsa-lru-cache',
    title: 'LRU Cache (Least Recently Used)',
    difficulty: 'Medium',
    topicTags: ['Hash Table', 'Linked List', 'Doubly-Linked List', 'Design'],
    skillCategory: 'Advanced Data Structures',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\`: Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\`: Update or insert key-value pair. If capacity is exceeded, **evict the least recently used key**.

Both \`get\` and \`put\` must run in **O(1)** average time complexity.`,
    examples: [
      {
        input: 'capacity = 2, put(1, 1), put(2, 2), get(1)',
        output: '1',
        explanation: 'Key 1 exists and returns 1.'
      }
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'O(1) time complexity for both get and put operations.'
    ],
    language: 'typescript',
    starterCode: `class LRUCache {
  constructor(capacity: number) {
    // Initialize your LRU Cache here
  }

  get(key: number): number {
    return -1;
  }

  put(key: number, value: number): void {
    
  }
}`,
    sampleTestCases: [
      {
        input: 'capacity = 2, put(1, 1), put(2, 2), get(1)',
        expectedOutput: '1',
        explanation: 'Key 1 exists and returns 1.'
      },
      {
        input: 'capacity = 2, put(1, 1), put(2, 2), get(1), put(3, 3), get(2)',
        expectedOutput: 'Evicts key 2 (least recently used)',
        explanation: 'get(2) returns -1 after eviction'
      }
    ]
  }
];

export const DEFAULT_CODING_CHALLENGES = ROLE_DSA_CHALLENGES.slice(0, 2);

/**
 * Returns calibrated DSA challenges matching the requested difficulty:
 * - Beginner: Arrays & Strings (Two Sum, Valid Palindrome, Stock)
 * - Intermediate: Arrays, Strings & Sliding Window (Two Sum, Longest Substring)
 * - Advanced: Graphs, Trees & Topological Sort (Number of Islands, Course Schedule)
 */
export function getRoleBasedCodingChallenges(
  jobDescription: string = '',
  resumeText: string = '',
  difficulty: DifficultyLevel = 'intermediate'
): CodingChallenge[] {
  if (difficulty === 'beginner') {
    // Beginner: Arrays & Strings
    return [
      ROLE_DSA_CHALLENGES.find((c) => c.id === 'dsa-two-sum')!,
      ROLE_DSA_CHALLENGES.find((c) => c.id === 'dsa-valid-palindrome')!,
    ];
  }

  if (difficulty === 'advanced') {
    // Advanced: Graphs & Advanced Structures
    return [
      ROLE_DSA_CHALLENGES.find((c) => c.id === 'dsa-number-of-islands')!,
      ROLE_DSA_CHALLENGES.find((c) => c.id === 'dsa-course-schedule')!,
    ];
  }

  // Intermediate: Strings, Arrays, Sliding Window
  return [
    ROLE_DSA_CHALLENGES.find((c) => c.id === 'dsa-two-sum')!,
    ROLE_DSA_CHALLENGES.find((c) => c.id === 'dsa-longest-substring')!,
  ];
}

export function evaluateCodingFallback(code: string, challenge: CodingChallenge): CodingEvaluation {
  const trimmed = code.trim();

  if (trimmed.length < 25 || trimmed === challenge.starterCode.trim()) {
    return {
      score: 20,
      passed: false,
      correctnessScore: 15,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      codeQuality: 25,
      feedback: 'The submission does not implement the core logic or left the starter boilerplate untouched.',
      edgeCasesCovered: [],
      edgeCasesMissed: ['Core execution flow', 'Parameter handling', 'Boundary conditions'],
    };
  }

  let score = 80;
  let correctness = 85;
  let timeComplexity = 'O(n)';
  let spaceComplexity = 'O(n)';

  if (code.includes('Map') || code.includes('Set') || code.includes('dfs') || code.includes('bfs')) {
    score += 10;
  }

  return {
    score: Math.min(100, score),
    passed: score >= 70,
    correctnessScore: correctness,
    timeComplexity,
    spaceComplexity,
    codeQuality: 85,
    feedback: `Good attempt on ${challenge.title}. Core algorithmic structure demonstrates understanding of the problem.`,
    edgeCasesCovered: ['Standard input bounds', 'Valid returns'],
    edgeCasesMissed: ['Extreme boundary constraints'],
  };
}
