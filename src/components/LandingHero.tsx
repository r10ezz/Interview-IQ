'use client';

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Brain,
  Sliders,
  BarChart3,
  CheckCircle2,
  Play
} from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
  onSelectSamplePreset: (presetId: string) => void;
}

export default function LandingHero({
  onStart,
  onSelectSamplePreset,
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:pt-12 lg:pb-20">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-100/50 via-violet-100/30 to-transparent blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-indigo-900">Adaptive Mock Interviews</span>
            <span className="text-indigo-300">•</span>
            <span className="text-indigo-700">Resume & JD Cross-Referenced</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center mt-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Master Tech Interviews with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
              Targeted AI Practice
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload your resume and paste your target job description. Practice role-specific <strong className="text-slate-900 font-semibold">Foundational Concepts</strong>, <strong className="text-slate-900 font-semibold">Live Coding & DSA</strong>, and <strong className="text-slate-900 font-semibold">Behavioral Scenarios</strong> with real-time feedback.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStart}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Start Free Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectSamplePreset('fullstack-engineer')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-200"
            >
              <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>1-Click Full-Stack Demo</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4 flex items-center justify-center space-x-2">
            <span>Instant start</span>
            <span>•</span>
            <span>Zero configuration required</span>
            <span>•</span>
            <span>Personalized questions</span>
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Semantic Fit Analysis</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Extracts skills and projects from your resume, compares them with the JD, and highlights gaps.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-indigo-600 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1 text-indigo-600" />
              <span>PDF parsing & skill mapping</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Multi-Round Selection</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Choose Foundation, Live Coding, or Behavioral rounds tailored specifically to your target job profile.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-violet-600 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1 text-violet-600" />
              <span>Targeted question tracks</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Live Coding & Big-O</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              In-browser code editor with sample test execution and automated time/space complexity analysis.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-sky-600 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1 text-sky-600" />
              <span>Interactive test cases</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">5-Dimension Rubric</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Assesses Correctness, Relevance, Depth, and Clarity with radar visualizations and model benchmark answers.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-emerald-600 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
              <span>Comprehensive report & roadmap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
