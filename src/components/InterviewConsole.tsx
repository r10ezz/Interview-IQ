'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle,
  Volume2,
  VolumeX,
  AlertCircle,
  Layers,
  User,
  Bot,
  Code2,
} from 'lucide-react';
import {
  InterviewQuestion,
  AnswerEvaluation,
  DifficultyLevel,
} from '@/types/interview';

interface InterviewConsoleProps {
  currentQuestion: InterviewQuestion;
  questionIndex: number;
  totalQuestions?: number;
  currentDifficulty: DifficultyLevel;
  allQuestions?: InterviewQuestion[];
  onSubmitAnswer: (answer: string) => Promise<{
    evaluation: AnswerEvaluation;
    nextQuestion: InterviewQuestion | null;
    isFollowUp: boolean;
    newDifficulty: DifficultyLevel;
    isComplete: boolean;
    interviewerNote?: string;
  }>;
  onFinishInterview: () => void;
  onProceedToCoding?: () => void;
  isEvaluating: boolean;
  candidateName?: string;
}

export default function InterviewConsole({
  currentQuestion,
  questionIndex,
  totalQuestions = 5,
  currentDifficulty,
  allQuestions = [],
  onSubmitAnswer,
  onFinishInterview,
  onProceedToCoding,
  isEvaluating,
  candidateName = 'Candidate',
}: InterviewConsoleProps) {
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Instant evaluation review state
  const [lastExchange, setLastExchange] = useState<{
    evaluation: AnswerEvaluation;
    nextQuestion: InterviewQuestion | null;
    isFollowUp: boolean;
    newDifficulty: DifficultyLevel;
    isComplete: boolean;
    interviewerNote?: string;
  } | null>(null);

  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Auto-transition to coding round when verbal is complete
  useEffect(() => {
    if (lastExchange?.isComplete && onProceedToCoding) {
      setCountdownSeconds(4);
      const interval = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            onProceedToCoding();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdownSeconds(null);
    }
  }, [lastExchange?.isComplete, onProceedToCoding]);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const committedBaseTextRef = useRef<string>('');

  // Check TTS and STT support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        setTtsSupported(true);
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let finalPhrase = '';
            let interimPhrase = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const text = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalPhrase += text + ' ';
              } else {
                interimPhrase += text;
              }
            }

            if (finalPhrase) {
              const base = committedBaseTextRef.current.trim();
              committedBaseTextRef.current = base ? `${base} ${finalPhrase.trim()}` : finalPhrase.trim();
            }

            const currentCombined = (committedBaseTextRef.current + ' ' + interimPhrase).trim();
            setAnswerText(currentCombined);
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition error:', e.error);
            setIsRecording(false);
            if (e.error === 'not-allowed') {
              setMicError('Microphone permission blocked. Please enable microphone permissions in your browser.');
            }
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = recognition;
        } catch (err) {
          console.warn('Could not initialize SpeechRecognition:', err);
        }
      }
    }
  }, []);

  // Text-to-Speech: speak the question aloud
  const speakQuestion = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Timer logic
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

  // Reset on question change & auto-read if enabled
  useEffect(() => {
    stopSpeaking();
    setElapsedSeconds(0);
    setAnswerText('');
    committedBaseTextRef.current = '';
    setLastExchange(null);
    setTimerActive(true);
    setMicError(null);

    if (autoRead && currentQuestion?.text) {
      setTimeout(() => {
        speakQuestion(currentQuestion.text);
      }, 300);
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current && isRecording) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [currentQuestion.id]);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;
    setMicError(null);

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
      setAnswerText(committedBaseTextRef.current.trim());
    } else {
      committedBaseTextRef.current = answerText.trim();
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setMicError('Could not start microphone. Check browser permissions.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isEvaluating) return;

    stopSpeaking();
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
    }

    setTimerActive(false);
    setSubmissionError(null);
    try {
      const result = await onSubmitAnswer(answerText.trim());
      setLastExchange(result);
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setSubmissionError(err.message || 'Failed to submit response. Please try again.');
      setTimerActive(true);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const currentStageName = currentQuestion.skillStage || `Stage ${questionIndex + 1}: ${currentQuestion.targetSkillOrProject || currentQuestion.category}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Top Header: Conversational Stage Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {currentStageName}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-700">
                  Question {questionIndex + 1}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                  {questionIndex < 5 ? 'Core Signal (Min 5)' : `Adaptive Depth (Q${questionIndex + 1} of 12 max)`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Interviewer: <strong className="text-slate-800">Sarah (AI Technical Lead)</strong> with candidate <strong className="text-slate-800">{candidateName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {onProceedToCoding && (
              <button
                type="button"
                onClick={onProceedToCoding}
                className="text-xs text-violet-700 hover:text-violet-800 flex items-center space-x-1 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Jump to Coding</span>
              </button>
            )}

            <button
              type="button"
              onClick={onFinishInterview}
              className="text-xs text-slate-500 hover:text-rose-600 transition-colors"
              title="Finish interview and generate final report"
            >
              End Early
            </button>
          </div>
        </div>

        {/* Adaptive Interview Depth Indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
            <span>
              {questionIndex < 5
                ? `Core Competency Baseline (${questionIndex + 1}/5 minimum required)`
                : `Interviewer Deep Probing (${questionIndex + 1}/12 max depth)`}
            </span>
            <span className="text-indigo-600 font-semibold text-[10px] uppercase tracking-wide">
              {questionIndex < 5 ? 'Baseline Calibration' : 'Adaptive Signal Extension'}
            </span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {Array.from({ length: Math.max(5, Math.min(12, Math.max(questionIndex + 1, 5))) }).map((_, idx) => {
              const isCompleted = idx < questionIndex;
              const isCurrent = idx === questionIndex;
              const isExtended = idx >= 5;
              return (
                <div
                  key={idx}
                  title={isExtended ? `Probing Question ${idx + 1}` : `Foundational Question ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-indigo-600 ring-2 ring-indigo-200'
                      : isExtended
                      ? 'bg-amber-100 border border-dashed border-amber-300'
                      : 'bg-slate-200'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Conversational Dialogue Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 text-xs font-bold">
              AI
            </div>
            <span className="text-xs font-semibold text-slate-800">
              Sarah, Technical Interviewer
            </span>
            <span className="text-[10px] text-slate-600 uppercase px-2 py-0.5 rounded bg-slate-100 font-mono">
              {currentQuestion.category}
            </span>
          </div>

          {/* Text-to-Speech (TTS) Voice Button */}
          {ttsSupported && (
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speakQuestion(currentQuestion.text);
                }
              }}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Read question aloud"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Listen to Question</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Question Bubble */}
        <div className="relative pl-4 border-l-4 border-indigo-600 py-1">
          <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
            &ldquo;{currentQuestion.text}&rdquo;
          </p>
        </div>
      </div>

      {/* Instant Feedback Drawer after Answering */}
      {lastExchange && (
        <div className={`p-5 rounded-2xl border shadow-sm mb-6 animate-fade-in ${
          lastExchange.evaluation.score === 0
            ? 'border-rose-300 bg-rose-50/40'
            : lastExchange.evaluation.score < 50
            ? 'border-amber-300 bg-amber-50/40'
            : 'border-emerald-300 bg-emerald-50/40'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Interviewer Assessment
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Score:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  lastExchange.evaluation.score >= 75
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : lastExchange.evaluation.score >= 50
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {lastExchange.evaluation.score}/100
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-4">
            {lastExchange.evaluation.quickFeedback}
          </p>

          {lastExchange.interviewerNote && (
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start space-x-2.5">
              <Bot className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-semibold">Interviewer Calibration: </strong>
                <span>{lastExchange.interviewerNote}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1 gap-2">
            {lastExchange.isComplete ? (
              onProceedToCoding ? (
                <div className="w-full mt-2 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 text-violet-700">
                    <Sparkles className="w-5 h-5 shrink-0 text-violet-600" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        Verbal & Foundation Round Complete!
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {countdownSeconds !== null && countdownSeconds > 0
                          ? `Auto-launching Live Coding Round in ${countdownSeconds}s...`
                          : 'Ready to start live technical problem solving.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onProceedToCoding}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/25 transition-all shrink-0"
                  >
                    <span>Proceed to Live Coding Round</span>
                    <Code2 className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="w-full mt-2 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 text-emerald-700">
                    <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        Interview Session Complete!
                      </p>
                      <p className="text-[11px] text-slate-500">
                        All question rounds answered. Ready to generate lead evaluation report.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onFinishInterview}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all shrink-0"
                  >
                    <span>View Full Performance Report</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={() => setLastExchange(null)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Candidate Answer Form */}
      {!lastExchange && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Your Response</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {wordCount} words
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={answerText}
              onChange={(e) => {
                setAnswerText(e.target.value);
                committedBaseTextRef.current = e.target.value;
              }}
              disabled={isEvaluating}
              placeholder="Answer conversationally. Explain foundational concepts, mechanisms, and real-world trade-offs..."
              rows={7}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 leading-relaxed resize-y min-h-[140px] disabled:opacity-60"
            />

            {submissionError && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            {micError && (
              <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Voice Dictation Bar */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              {speechSupported ? (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isRecording
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-600" />
                      <span>Recording voice... (Click to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Speak with Microphone</span>
                    </>
                  )}
                </button>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={isEvaluating || !answerText.trim()}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Interviewer is evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
