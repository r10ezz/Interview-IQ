'use client';

import React, { useState, useRef } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
  Layers,
  Terminal,
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
  const [code, setCode] = useState(challenges[0]?.starterCode || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'testcases'>('problem');
  const [lastEvaluation, setLastEvaluation] = useState<CodingEvaluation | null>(null);
  const [submissions, setSubmissions] = useState<CodingSubmission[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentChallenge = challenges[currentIndex];

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  // Enable Tab indentation inside textarea
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
    if (currentIndex + 1 < challenges.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCode(challenges[nextIdx].starterCode);
    } else {
      onCompleteCodingRound(submissions);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Round 2: Live Coding Assessment
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300">
                Challenge {currentIndex + 1} of {challenges.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Candidate: <strong className="text-slate-200">{candidateName}</strong> • Skill: {currentChallenge.skillCategory}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-950 border border-violet-800 text-violet-300">
            {currentChallenge.difficulty}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
            {currentChallenge.language}
          </span>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Challenge Description & Test Cases */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-1 flex flex-col">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('problem')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                  activeTab === 'problem'
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Problem Description
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('testcases')}
                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ml-4 ${
                  activeTab === 'testcases'
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sample Test Cases ({currentChallenge.sampleTestCases.length})
              </button>
            </div>

            {activeTab === 'problem' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[480px] pr-2">
                <h3 className="text-base font-bold text-white mb-2">{currentChallenge.title}</h3>
                <div className="whitespace-pre-wrap">{currentChallenge.description}</div>
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-3 overflow-y-auto max-h-[480px]">
                {currentChallenge.sampleTestCases.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Test Case #{idx + 1}
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Input: </span>
                      <code className="text-indigo-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">{tc.input}</code>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Expected: </span>
                      <code className="text-emerald-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">{tc.expectedOutput}</code>
                    </div>
                    {tc.explanation && (
                      <div className="text-[11px] text-slate-400 italic pt-1">{tc.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="rounded-2xl bg-[#090D16] border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-mono text-[11px]">solution.{currentChallenge.language === 'typescript' ? 'ts' : 'js'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center space-x-1"
                  title="Reset starter template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Code Input Area with line numbers */}
            <div className="relative flex min-h-[380px] max-h-[460px] overflow-hidden font-mono text-xs">
              {/* Line Numbers */}
              <div className="w-10 py-3.5 bg-slate-950 text-slate-600 select-none text-right pr-2 font-mono text-[11px] border-r border-slate-800/80 shrink-0">
                {lines.map((_, i) => (
                  <div key={i} className="leading-5">{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder="Write your solution here..."
                className="w-full flex-1 p-3.5 bg-[#090D16] text-slate-100 placeholder-slate-600 font-mono text-xs leading-5 focus:outline-none resize-none overflow-y-auto"
              />
            </div>

            {/* Editor Bottom Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">Tab</kbd> to indent • Tested for logic & Big-O complexity
              </span>

              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isSubmitting || !code.trim()}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-violet-950 shadow-md transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Solution</span>
                    <Play className="w-3 h-3 fill-white" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Evaluation Result Drawer */}
      {lastEvaluation && (
        <div className={`mt-6 p-6 rounded-2xl bg-slate-900 border-2 shadow-2xl animate-fade-in ${
          lastEvaluation.passed ? 'border-emerald-600/60' : 'border-amber-600/60'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4 gap-2">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-semibold text-white">AI Code Assessment & Big-O Analysis</h4>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400">Score:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                lastEvaluation.score >= 70
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {lastEvaluation.score}/100 ({lastEvaluation.passed ? 'Passed' : 'Needs Optimization'})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Time Complexity</div>
              <div className="text-xs font-mono font-bold text-violet-300 mt-0.5">{lastEvaluation.timeComplexity}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Space Complexity</div>
              <div className="text-xs font-mono font-bold text-violet-300 mt-0.5">{lastEvaluation.spaceComplexity}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Correctness</div>
              <div className="text-xs font-bold text-white mt-0.5">{lastEvaluation.correctnessScore}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Code Quality</div>
              <div className="text-xs font-bold text-white mt-0.5">{lastEvaluation.codeQuality}%</div>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed mb-4">
            {lastEvaluation.feedback}
          </p>

          {/* Edge Cases Breakdown */}
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
                  <span>Missed / Boundary Warnings:</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  {lastEvaluation.edgeCasesMissed.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextChallenge}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md transition-all"
            >
              <span>{currentIndex + 1 < challenges.length ? 'Next Coding Challenge' : 'Finish Assessment & View Final Report'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
