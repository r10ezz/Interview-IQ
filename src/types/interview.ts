export type InterviewType = 'technical' | 'hr' | 'mixed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'job-requirement' | 'resume-project' | 'behavioral' | 'follow-up' | 'fundamental';
export type InterviewRoundType = 'foundation' | 'coding' | 'behavioral';

export interface ProjectInfo {
  name: string;
  description: string;
  techStack: string[];
}

export interface CandidateAnalysis {
  candidateName: string;
  experienceSummary: string;
  technicalSkills: string[];
  projects: ProjectInfo[];
  jobRequirements: string[];
  matchingSkills: string[];
  missingSkills: string[];
  matchScore: number; // 0-100
  recommendedTopics: string[];
  confidenceAssessment?: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: QuestionType;
  category: string;
  targetSkillOrProject: string;
  skillStage?: string; // e.g. "Stage 1: Core Fundamentals & Syntax", "Stage 2: Architecture", etc.
  roundType?: InterviewRoundType;
  difficulty: DifficultyLevel;
  followUpContext?: string;
  suggestedDurationSeconds?: number;
}

export interface AnswerEvaluation {
  score: number; // 0-100
  quickFeedback: string;
  technicalCorrectness: number; // 0-100
  relevance: number; // 0-100
  depth: number; // 0-100
  clarity: number; // 0-100
  keyStrengths: string[];
  keyMissingPoints: string[];
  idealAnswerHighlights: string;
}

export interface InterviewExchange {
  question: InterviewQuestion;
  candidateAnswer: string;
  evaluation: AnswerEvaluation;
  answeredAt: string;
  timeSpentSeconds?: number;
}

export interface CodingTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface CodingChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicTags?: string[];
  skillCategory: string; // e.g. "DSA / Algorithms", "System Patterns"
  description: string;
  examples?: CodingChallengeExample[];
  constraints?: string[];
  starterCode: string;
  language: string; // 'typescript' | 'javascript' | 'python'
  sampleTestCases: CodingTestCase[];
}

export interface CodingEvaluation {
  score: number; // 0-100
  passed: boolean;
  correctnessScore: number;
  timeComplexity: string; // e.g. "O(N)"
  spaceComplexity: string; // e.g. "O(1)"
  codeQuality: number;
  feedback: string;
  edgeCasesCovered: string[];
  edgeCasesMissed: string[];
  suggestedOptimization?: string;
}

export interface CodingSubmission {
  challenge: CodingChallenge;
  code: string;
  language?: string;
  evaluation: CodingEvaluation;
  submittedAt: string;
}

export interface QuestionBreakdownItem {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  category: string;
  difficulty: DifficultyLevel;
  candidateAnswer: string;
  score: number;
  critique: string;
  idealAnswer: string;
  rubricScores: {
    correctness: number;
    relevance: number;
    depth: number;
    clarity: number;
  };
}

export interface SkillAssessmentItem {
  skill: string;
  status: 'strong' | 'moderate' | 'needs-improvement';
  note: string;
}

export interface RecommendedTopicItem {
  topic: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  recommendedFocus: string;
}

export interface FinalEvaluationReport {
  overallScore: number;
  technicalCorrectness: number;
  answerRelevance: number;
  technicalDepth: number;
  communicationClarity: number;
  codingScore?: number;
  codingSubmissions?: CodingSubmission[];
  selectedRounds?: InterviewRoundType[];
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Follow-up' | 'Not Ready Yet';
  performanceSummary: string;
  strengths: string[];
  weaknesses: string[];
  questionBreakdown: QuestionBreakdownItem[];
  skillAssessment: SkillAssessmentItem[];
  recommendedTopics: RecommendedTopicItem[];
  completedAt: string;
  totalTimeMinutes: number;
}

export interface InterviewSetupConfig {
  resumeText: string;
  resumeFileName?: string;
  jobDescription: string;
  selectedRounds?: InterviewRoundType[]; // ['foundation', 'coding', 'behavioral']
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  questionCount: number;
  candidateName?: string;
  jobTitle?: string;
  includeCodingRound?: boolean;
}
