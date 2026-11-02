export type InterviewType = 'technical' | 'hr' | 'mixed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'job-requirement' | 'resume-project' | 'behavioral' | 'follow-up';

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
  skillStage?: string; // e.g. "Section 1: React & Next.js"
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
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  questionCount: number; // 3, 5, or 7
  candidateName?: string;
  jobTitle?: string;
}
