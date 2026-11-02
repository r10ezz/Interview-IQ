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
  GraduationCap,
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
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Research Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-medium backdrop-blur-sm shadow-inner">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">MCA Research Project</span>
            <span className="text-indigo-400/60">•</span>
            <span className="text-indigo-200">Adaptive AI Mock Interview Platform</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center mt-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Master Tech Interviews with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">
              Adaptive AI Context
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            InterviewIQ semantically cross-references your <strong className="text-white font-medium">PDF resume</strong> with your <strong className="text-white font-medium">target job description</strong> to conduct an interactive, difficulty-adaptive mock interview with research-grade rubric evaluation.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStart}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Start Free Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectSamplePreset('fullstack-engineer')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all duration-200"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              <span>1-Click Full-Stack Demo</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-3 flex items-center justify-center space-x-2">
            <span>No sign-up required</span>
            <span>•</span>
            <span>Zero permanent resume storage</span>
            <span>•</span>
            <span>Gemini 2.5 Flash + Fallback</span>
          </p>
        </div>

        {/* 4 Core Pillars Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Semantic Context Matching</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Extracts real technical skills, projects, and JD prerequisites to pinpoint skill matches and critical gaps.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-indigo-400 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span>Multi-page PDF parsing</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/40 transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Dual-Context Questioning</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Generates targeted questions spanning job-specific systems, your claimed resume projects, and behavioral scenarios.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-violet-400 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span>Tailored question distribution</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/40 transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Adaptive Difficulty Engine</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Dynamically scales question difficulty up or down based on your performance and issues targeted follow-up probes.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-sky-400 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span>Real-time response evaluation</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">5-Dimension Rubric & Radar</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Assesses Correctness, Relevance, Depth, Clarity, and Overall Fit with radar visualisations and model benchmark answers.
            </p>
            <div className="mt-auto pt-3 text-[11px] text-emerald-400 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span>Actionable study roadmap</span>
            </div>
          </div>
        </div>

        {/* Quick Academic Dissertation Banner */}
        <div className="mt-12 p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-indigo-950/30 border border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Research Thesis:</strong> &quot;Design and Evaluation of an AI-Driven Adaptive Mock Interview System Using Resume and Job Description Context&quot;
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onSelectSamplePreset('ai-ml-engineer')}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
            >
              Test with AI/ML Preset →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
