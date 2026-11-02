'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sliders,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  InterviewQuestion,
  AnswerEvaluation,
  InterviewExchange,
  DifficultyLevel,
} from '@/types/interview';

interface InterviewConsoleProps {
  currentQuestion: InterviewQuestion;
  questionIndex: number;
  totalQuestions: number;
  currentDifficulty: DifficultyLevel;
  onSubmitAnswer: (answer: string) => Promise<{
    evaluation: AnswerEvaluation;
    nextQuestion: InterviewQuestion | null;
    isFollowUp: boolean;
    newDifficulty: DifficultyLevel;
    isComplete: boolean;
  }>;
  onFinishInterview: () => void;
  isEvaluating: boolean;
  candidateName?: string;
}

export default function InterviewConsole({
  currentQuestion,
  questionIndex,
  totalQuestions,
  currentDifficulty,
  onSubmitAnswer,
  onFinishInterview,
  isEvaluating,
  candidateName = 'Candidate',
}: InterviewConsoleProps) {
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Instant evaluation review state
  const [lastExchange, setLastExchange] = useState<{
    evaluation: AnswerEvaluation;
    nextQuestion: InterviewQuestion | null;
    isFollowUp: boolean;
    newDifficulty: DifficultyLevel;
    isComplete: boolean;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track elapsed time per question
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Reset timer on question change
  useEffect(() => {
    setElapsedSeconds(0);
    setAnswerText('');
    setLastExchange(null);
    setTimerActive(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentQuestion.id]);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setAnswerText((prev) => {
              const cleaned = prev ? `${prev} ${currentTranscript.trim()}` : currentTranscript.trim();
              return cleaned;
            });
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isEvaluating) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setTimerActive(false);
    try {
      const result = await onSubmitAnswer(answerText.trim());
      setLastExchange(result);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setTimerActive(true);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const progressPercent = Math.min(100, Math.round(((questionIndex + 1) / totalQuestions) * 100));

  // Difficulty badge styling
  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'beginner':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'intermediate':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60';
      case 'advanced':
        return 'bg-violet-950/60 text-violet-300 border-violet-800/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Top Header Console */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">
                  Question {questionIndex + 1} of {totalQuestions}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getDifficultyBadge(
                    currentDifficulty
                  )}`}
                >
                  <Sliders className="w-2.5 h-2.5 inline mr-1" />
                  {currentDifficulty} Difficulty
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Candidate: <span className="text-slate-200">{candidateName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={onFinishInterview}
              className="text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Finish interview and generate final report now"
            >
              End Early
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-3 flex items-center space-x-3">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-xl mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-indigo-300 border border-slate-700">
            {currentQuestion.category}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 capitalize">
            {currentQuestion.type.replace('-', ' ')}
          </span>
          {currentQuestion.targetSkillOrProject && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-950/30 text-violet-300 border border-violet-800/30">
              Focus: {currentQuestion.targetSkillOrProject}
            </span>
          )}
        </div>

        {/* Follow-up banner if probing previous answer */}
        {currentQuestion.type === 'follow-up' && (
          <div className="mb-4 p-3 rounded-xl bg-violet-950/40 border border-violet-700/50 text-xs text-violet-200 flex items-start space-x-2">
            <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Adaptive Follow-Up Probe: </span>
              <span>{currentQuestion.followUpContext || 'Probing deeper into technical implementation nuances.'}</span>
            </div>
          </div>
        )}

        <h3 className="text-lg sm:text-xl font-semibold text-white leading-relaxed tracking-tight">
          {currentQuestion.text}
        </h3>
      </div>

      {/* Instant Feedback Modal / Drawer if just evaluated */}
      {lastExchange && (
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-indigo-600/50 shadow-2xl mb-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">AI Evaluation & Adaptive Adjustment</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Score:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  lastExchange.evaluation.score >= 80
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : lastExchange.evaluation.score >= 60
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {lastExchange.evaluation.score}/100
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {lastExchange.evaluation.quickFeedback}
          </p>

          {/* Difficulty change notice */}
          {lastExchange.newDifficulty !== currentDifficulty && (
            <div className="mb-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
              {lastExchange.evaluation.score >= 80 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-400" />
              )}
              <span>
                Adaptive Engine dynamically updated difficulty from{' '}
                <strong className="text-white capitalize">{currentDifficulty}</strong> to{' '}
                <strong className="text-indigo-400 capitalize">{lastExchange.newDifficulty}</strong>.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Correctness</div>
              <div className="text-xs font-semibold text-white mt-0.5">{lastExchange.evaluation.technicalCorrectness}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Relevance</div>
              <div className="text-xs font-semibold text-white mt-0.5">{lastExchange.evaluation.relevance}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Depth</div>
              <div className="text-xs font-semibold text-white mt-0.5">{lastExchange.evaluation.depth}%</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Clarity</div>
              <div className="text-xs font-semibold text-white mt-0.5">{lastExchange.evaluation.clarity}%</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            {lastExchange.isComplete ? (
              <button
                type="button"
                onClick={onFinishInterview}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>Generate Final Research Report</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLastExchange(null);
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Continue to Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Answer Form */}
      {!lastExchange && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Your Response (Text or Voice)
              </label>
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{answerText.length} characters</span>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isEvaluating}
              placeholder="Type your structured answer here. Include architectural considerations, practical implementations, trade-offs, and lessons learned..."
              rows={8}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y min-h-[160px] disabled:opacity-60"
            />

            {/* Speech Recording Bar */}
            {speechSupported && (
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isRecording
                      ? 'bg-rose-950/60 border-rose-600 text-rose-300 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      <span>Recording... (Click to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Voice Input (Speech-to-Text)</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Tip: Use the STAR method (Situation, Task, Action, Result)
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Responses are evaluated against 5 academic rubric dimensions.</span>
            </div>

            <button
              type="submit"
              disabled={isEvaluating || !answerText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/25 transition-all"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Response with AI...</span>
                </>
              ) : (
                <>
                  <span>Submit Response</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
