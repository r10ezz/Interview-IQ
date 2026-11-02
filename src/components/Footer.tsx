import React from 'react';
import { GraduationCap, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto py-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>MCA Research Project</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              &quot;Design and Evaluation of an AI-Driven Adaptive Mock Interview System Using Resume and Job Description Context&quot;
            </p>
          </div>

          <div className="flex flex-col md:items-center space-y-1">
            <div className="flex items-center space-x-4 text-xs text-slate-600">
              <span className="flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1 text-violet-600" />
                Google Gemini & Next.js 16
              </span>
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Zero Permanent Storage
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Designed for live academic demonstration and candidate preparation.
            </p>
          </div>

          <div className="md:text-right text-xs text-slate-500">
            <p>© 2026 InterviewIQ Research System.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Empowering candidates with adaptive, context-aware interview simulations.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
