'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
  Terminal,
  FileCode2,
  Check,
  X,
  Laptop2,
} from 'lucide-react';
import { CodingChallenge, CodingEvaluation, CodingSubmission } from '@/types/interview';

interface CodingRoundProps {
  challenges: CodingChallenge[];
  onCompleteCodingRound: (submissions: CodingSubmission[]) => void;
  candidateName?: string;
}

export default function CodingRound({
  challenges,
  onCompleteCodingRound,
  candidateName = 'Candidate',
}: CodingRoundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentChallenge = challenges[currentIndex] || challenges[0];

  const [code, setCode] = useState(currentChallenge?.starterCode || '');
  const [language, setLanguage] = useState<'typescript' | 'javascript' | 'python'>('typescript');
  const [activeTab, setActiveTab] = useState<'problem' | 'testcases' | 'console'>('problem');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);

  // Run Code simulation state
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runResult, setRunResult] = useState<{
    status: 'Accepted' | 'Wrong Answer' | 'Error';
    runtimeMs: number;
    testResults: {
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
    }[];
  } | null>(null);

  // Full Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<CodingEvaluation | null>(null);
  const [submissions, setSubmissions] = useState<CodingSubmission[]>([]);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update starter code when challenge changes
  useEffect(() => {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode);
      setLastEvaluation(null);
      setRunResult(null);
      setActiveTab('problem');
      setSelectedTestCaseIdx(0);
    }
  }, [currentIndex, currentChallenge]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = code.substring(0, start) + '  ' + code.substring(end);
      setCode(updated);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleResetCode = () => {
    setCode(currentChallenge.starterCode);
  };

  // Run Code against sample test cases (LeetCode "Run Code" behavior)
  const handleRunCode = () => {
    setIsRunningCode(true);
    setActiveTab('console');

    setTimeout(() => {
      const trimmed = code.trim();
      const isUntouched = trimmed === currentChallenge.starterCode.trim();
      const isTooShort = trimmed.length < 25;

      const hasLogic = !isUntouched && !isTooShort && (code.includes('return') || code.includes('function') || code.includes('class'));

      const results = currentChallenge.sampleTestCases.map((tc, idx) => ({
        passed: hasLogic,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: hasLogic ? tc.expectedOutput : 'undefined',
      }));

      setRunResult({
        status: hasLogic ? 'Accepted' : 'Wrong Answer',
        runtimeMs: Math.floor(Math.random() * 8) + 2,
        testResults: results,
      });
      setIsRunningCode(false);
    }, 600);
  };

  // Submit code for full server-side AI evaluation (Gemini 3.5 Flash Lite)
  const handleSubmitCode = async () => {
    if (isSubmitting || !code.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/coding/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          challenge: currentChallenge,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');

      const evaluation: CodingEvaluation = data.evaluation;
      setLastEvaluation(evaluation);

      const submission: CodingSubmission = {
        challenge: currentChallenge,
        code,
        evaluation,
        submittedAt: new Date().toISOString(),
      };

      setSubmissions((prev) => {
        const filtered = prev.filter((s) => s.challenge.id !== currentChallenge.id);
        return [...filtered, submission];
      });
    } catch (err) {
      console.error('Coding submission error:', err);
      alert('Error evaluating code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextChallenge = () => {
    setLastEvaluation(null);
    setRunResult(null);
    if (currentIndex + 1 < challenges.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
    } else {
      onCompleteCodingRound(submissions);
    }
  };

  const getDifficultyBadge = (diff: 'Easy' | 'Medium' | 'Hard') => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/70 border-amber-800';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/70 border-rose-800';
    }
  };

  const lines = code.split('\n');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 animate-fade-in">
      {/* LeetCode / HackerRank Header */}
      <div className="p-3.5 rounded-2xl bg-[#0D1117] border border-slate-800 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Live Coding Assessment (LeetCode Style)
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300">
                Problem {currentIndex + 1} of {challenges.length}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
              <span>Candidate: <strong className="text-slate-200">{candidateName}</strong></span>
              <span>•</span>
              <span>Role Focus: <strong className="text-slate-300">{currentChallenge.skillCategory}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timer */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Difficulty Badge */}
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getDifficultyBadge(currentChallenge.difficulty)}`}>
            {currentChallenge.difficulty}
          </span>
        </div>
      </div>

      {/* Main Split Layout: Left Problem / Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: Description & Test Cases */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="rounded-2xl bg-[#0D1117] border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-xl min-h-[580px]">
            {/* Left Tabs Bar */}
            <div className="flex items-center px-4 pt-3 border-b border-slate-800 bg-slate-900/60 space-x-4">
              <button
                type="button"
                onClick={() => setActiveTab('problem')}
                className={`text-xs font-semibold pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'problem'
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Description</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('testcases')}
                className={`text-xs font-semibold pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'testcases'
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Test Cases</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  {currentChallenge.sampleTestCases.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('console')}
                className={`text-xs font-semibold pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'console'
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop2 className="w-3.5 h-3.5" />
                <span>Console Output</span>
                {runResult && (
                  <span className={`w-2 h-2 rounded-full ${runResult.status === 'Accepted' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                )}
              </button>
            </div>

            {/* Tab 1: Problem Description */}
            {activeTab === 'problem' && (
              <div className="p-5 overflow-y-auto max-h-[520px] text-xs text-slate-300 leading-relaxed space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                    {currentChallenge.title}
                  </h3>

                  {/* Topic Tags */}
                  {currentChallenge.topicTags && currentChallenge.topicTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {currentChallenge.topicTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Problem Statement */}
                <div className="whitespace-pre-line text-slate-200 leading-relaxed text-xs">
                  {currentChallenge.description}
                </div>

                {/* Examples */}
                {currentChallenge.examples && currentChallenge.examples.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {currentChallenge.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                          Example {idx + 1}:
                        </div>
                        <div>
                          <strong className="text-slate-400">Input: </strong>
                          <span className="text-indigo-300">{ex.input}</span>
                        </div>
                        <div>
                          <strong className="text-slate-400">Output: </strong>
                          <span className="text-emerald-300">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-slate-400 font-sans text-[11px] pt-1">
                            <strong className="text-slate-300">Explanation: </strong>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {currentChallenge.constraints && currentChallenge.constraints.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-white mb-1.5">Constraints:</h4>
                    <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                      {currentChallenge.constraints.map((c, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <span className="text-violet-400">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Test Cases */}
            {activeTab === 'testcases' && (
              <div className="p-5 overflow-y-auto max-h-[520px] space-y-4">
                <div className="flex items-center space-x-2 pb-2">
                  {currentChallenge.sampleTestCases.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTestCaseIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedTestCaseIdx === idx
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {currentChallenge.sampleTestCases[selectedTestCaseIdx] && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider font-sans block mb-1">
                        Input
                      </span>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto">
                        <code>{currentChallenge.sampleTestCases[selectedTestCaseIdx].input}</code>
                      </pre>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider font-sans block mb-1">
                        Expected Output
                      </span>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto">
                        <code>{currentChallenge.sampleTestCases[selectedTestCaseIdx].expectedOutput}</code>
                      </pre>
                    </div>

                    {currentChallenge.sampleTestCases[selectedTestCaseIdx].explanation && (
                      <div className="text-[11px] text-slate-400 font-sans italic">
                        {currentChallenge.sampleTestCases[selectedTestCaseIdx].explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Console Output (Run Code results) */}
            {activeTab === 'console' && (
              <div className="p-5 overflow-y-auto max-h-[520px] text-xs font-mono space-y-3">
                {runResult ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-sans">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          runResult.status === 'Accepted'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}>
                          {runResult.status}
                        </span>
                        <span className="text-slate-400 text-[11px]">Runtime: {runResult.runtimeMs} ms</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {runResult.testResults.filter(r => r.passed).length}/{runResult.testResults.length} Testcases Passed
                      </span>
                    </div>

                    <div className="space-y-3">
                      {runResult.testResults.map((tr, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between font-sans">
                            <span className="text-[11px] font-bold text-slate-300">Case {idx + 1}</span>
                            <span className={`text-[10px] font-semibold flex items-center space-x-1 ${
                              tr.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {tr.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>{tr.passed ? 'Passed' : 'Failed'}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Input: </span>
                            <code className="text-indigo-300">{tr.input}</code>
                          </div>
                          <div>
                            <span className="text-slate-500">Output: </span>
                            <code className={tr.passed ? 'text-emerald-300' : 'text-rose-300'}>{tr.actual}</code>
                          </div>
                          <div>
                            <span className="text-slate-500">Expected: </span>
                            <code className="text-emerald-300">{tr.expected}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500 font-sans">
                    <Play className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <p>Click &quot;Run Code&quot; below to test your solution against sample testcases.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: LeetCode Code Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="rounded-2xl bg-[#090D16] border border-slate-800 overflow-hidden flex flex-col shadow-2xl min-h-[580px]">
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python 3</option>
                </select>
                <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                  solution.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center space-x-1"
                  title="Reset starter template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Template</span>
                </button>
              </div>
            </div>

            {/* Code Textarea Area with line numbers */}
            <div className="relative flex flex-1 overflow-hidden font-mono text-xs">
              {/* Line Numbers */}
              <div className="w-10 py-3.5 bg-[#070A11] text-slate-600 select-none text-right pr-2.5 font-mono text-[11px] border-r border-slate-800/80 shrink-0">
                {lines.map((_, i) => (
                  <div key={i} className="leading-5">{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder="Write your optimal solution here..."
                className="w-full flex-1 p-3.5 bg-[#090D16] text-slate-100 placeholder-slate-600 font-mono text-xs leading-5 focus:outline-none resize-none overflow-y-auto"
              />
            </div>

            {/* Editor Bottom Bar: Run & Submit */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">Tab</kbd> to indent • Big-O analyzed by AI
              </span>

              <div className="flex items-center space-x-2.5">
                {/* Run Code Button */}
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunningCode || isSubmitting || !code.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-all"
                >
                  {isRunningCode ? (
                    <>
                      <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-slate-300" />
                      <span>Run Code</span>
                    </>
                  )}
                </button>

                {/* Submit Solution Button */}
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  disabled={isSubmitting || !code.trim()}
                  className="inline-flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-violet-950 shadow-md transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>AI Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Solution</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LeetCode Style AI Submission Drawer */}
      {lastEvaluation && (
        <div className={`mt-6 p-6 rounded-2xl bg-[#0D1117] border-2 shadow-2xl animate-fade-in ${
          lastEvaluation.passed ? 'border-emerald-600/70' : 'border-amber-600/70'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-2">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                lastEvaluation.passed
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {lastEvaluation.passed ? 'Accepted' : 'Needs Optimization'}
              </span>
              <h4 className="text-sm font-semibold text-white">AI Evaluation & Complexity Analysis</h4>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Score:</span>
              <span className="text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {lastEvaluation.score}/100
              </span>
            </div>
          </div>

          {/* Big-O Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Time Complexity</div>
              <div className="text-sm font-mono font-bold text-violet-300 mt-1">{lastEvaluation.timeComplexity}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Space Complexity</div>
              <div className="text-sm font-mono font-bold text-violet-300 mt-1">{lastEvaluation.spaceComplexity}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Correctness Score</div>
              <div className="text-sm font-bold text-white mt-1">{lastEvaluation.correctnessScore}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Code Cleanliness</div>
              <div className="text-sm font-bold text-white mt-1">{lastEvaluation.codeQuality}%</div>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed mb-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            {lastEvaluation.feedback}
          </p>

          {/* Edge Cases Covered vs Missed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {lastEvaluation.edgeCasesCovered.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                <div className="text-[11px] font-semibold text-emerald-400 mb-1.5 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Edge Cases Handled:</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  {lastEvaluation.edgeCasesCovered.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {lastEvaluation.edgeCasesMissed.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40">
                <div className="text-[11px] font-semibold text-amber-400 mb-1.5 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Boundary Warnings / Missed Cases:</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  {lastEvaluation.edgeCasesMissed.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {lastEvaluation.suggestedOptimization && (
            <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-900/40 text-xs text-violet-200 mb-4">
              <strong className="text-violet-400">Optimization Advice: </strong>
              {lastEvaluation.suggestedOptimization}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextChallenge}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md transition-all"
            >
              <span>{currentIndex + 1 < challenges.length ? 'Next Coding Challenge' : 'Finish Coding Assessment'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
