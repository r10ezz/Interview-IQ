'use client';

import React from 'react';
import { UploadCloud, Search, MessageSquareCode, Award } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Context Ingestion',
      icon: UploadCloud,
      color: 'from-blue-500 to-indigo-500',
      description:
        'Upload your PDF resume and paste your target job description. The system extracts structured experience, projects, skills, and core role prerequisites.',
    },
    {
      step: '02',
      title: 'Semantic Alignment',
      icon: Search,
      color: 'from-indigo-500 to-violet-500',
      description:
        'Gemini performs bi-directional matching to highlight matching strengths, identify skill gaps, and compute an initial candidate-role alignment score.',
    },
    {
      step: '03',
      title: 'Adaptive Mock Interview',
      icon: MessageSquareCode,
      color: 'from-violet-500 to-purple-500',
      description:
        'Participate in an interactive interview. Each response is graded in real-time, prompting dynamic difficulty shifts and contextual follow-up questions.',
    },
    {
      step: '04',
      title: 'Multi-Rubric Evaluation',
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      description:
        'Receive a comprehensive performance evaluation featuring radar competency charts, question-level critiques, model answers, and a prioritized study roadmap.',
    },
  ];

  return (
    <section className="py-16 border-t border-slate-800/80 bg-[#0B0F19]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Evaluation Methodology
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How InterviewIQ Evaluates You
          </p>
          <p className="mt-3 text-sm text-slate-400">
            A 4-stage adaptive pipeline designed according to modern academic research standards in AI assessment.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
