'use client';

import React from 'react';
import {
  UploadCloud,
  Search,
  MessageSquareCode,
  Award,
  ArrowRight,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  FileCheck2
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Context Ingestion & Parsing',
      subtitle: 'Upload PDF & Target Job Description',
      icon: UploadCloud,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Client-side PDF Extraction',
      description:
        'Upload your standard PDF resume and paste the target job description. The engine extracts verified projects, skills, and tenure without storing your personal data.',
      highlights: ['Local unpdf parsing', 'Zero data retention', 'Role prerequisite mapping'],
    },
    {
      step: '02',
      title: 'Alignment & Skill Gap Analysis',
      subtitle: 'Bi-Directional Role Matching',
      icon: Search,
      color: 'from-indigo-600 to-violet-600',
      badge: 'Gemini AI Semantic Engine',
      description:
        'Cross-references your demonstrated experience against the job requirements. Pinpoints verified strengths, identifies architectural gaps, and calculates match confidence.',
      highlights: ['Strengths identification', 'Missing prerequisites', 'Target interview calibration'],
    },
    {
      step: '03',
      title: 'Multi-Round Adaptive Practice',
      subtitle: 'Verbal Foundations & Live 6-Lang IDE',
      icon: MessageSquareCode,
      color: 'from-violet-600 to-sky-600',
      badge: 'Native Compilers & Topic Rotation',
      description:
        'Answer 5–12 adaptive verbal questions across 3–4 core pillars. Then solve role-specific DSA problems in TypeScript, Python, Java, C++, or C with real compilation.',
      highlights: ['Anti-badgering topic rotation', 'GCC 15.2 & JDK 21 LTS', 'Interactive terminal output'],
    },
    {
      step: '04',
      title: 'Holistic Scorecard & Roadmap',
      subtitle: 'Executive Rubric & Big-O Complexity',
      icon: Award,
      color: 'from-sky-600 to-emerald-600',
      badge: '5-Dimension Assessment',
      description:
        'Receive a definitive hiring recommendation (Strong Hire, Hire, Lean Hire), radar chart visualizations, Big-O algorithmic audits, and a prioritized study roadmap.',
      highlights: ['Big-O algorithmic analysis', 'Model benchmark answers', 'Printable candidate report'],
    },
  ];

  return (
    <section className="relative py-16 lg:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Structured Interview Flow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            How InterviewIQ Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            From initial resume parsing to live multi-language coding and comprehensive rubric evaluation.
          </p>
        </div>

        {/* 4 Connected Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-indigo-300 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 group-hover:text-indigo-400 transition-colors font-mono">
                      {item.step}
                    </span>
                  </div>

                  {/* Micro badge */}
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 mb-2">
                    {item.badge}
                  </span>

                  {/* Title & Subtitle */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mb-2.5">
                    {item.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Key Bullet Highlights */}
                <div className="mt-5 pt-3.5 border-t border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-center text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
