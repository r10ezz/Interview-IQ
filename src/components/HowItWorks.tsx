'use client';

import React from 'react';
import { UploadCloud, Search, MessageSquareCode, Award } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Context Ingestion',
      icon: UploadCloud,
      color: 'from-blue-600 to-indigo-600',
      description:
        'Upload your PDF resume and paste the target job description. The system extracts skills, projects, and role prerequisites.',
    },
    {
      step: '02',
      title: 'Alignment Analysis',
      icon: Search,
      color: 'from-indigo-600 to-violet-600',
      description:
        'Bi-directional matching identifies verified strengths, flags skill gaps, and computes an overall role-fit score.',
    },
    {
      step: '03',
      title: 'Interactive Interview',
      icon: MessageSquareCode,
      color: 'from-violet-600 to-purple-600',
      description:
        'Practice Foundation questions, live coding with automated test cases, and behavioral scenarios with instant evaluation.',
    },
    {
      step: '04',
      title: 'Rubric & Roadmap',
      icon: Award,
      color: 'from-purple-600 to-pink-600',
      description:
        'Review your radar chart, question breakdowns, code efficiency metrics, and a prioritized study roadmap.',
    },
  ];

  return (
    <section className="py-14 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Workflow Overview
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How InterviewIQ Works
          </p>
          <p className="mt-2 text-sm text-slate-500">
            From resume parsing and job description matching to live practice and rubric analytics.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xl font-black text-slate-300 group-hover:text-slate-400 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
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
