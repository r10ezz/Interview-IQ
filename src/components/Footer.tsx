import React from 'react';
import { Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto py-6 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">InterviewIQ</span>
            <span className="text-slate-300">•</span>
            <span>Adaptive AI Technical Interview Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
            <span className="flex items-center">
              <Cpu className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Powered by Google Gemini
            </span>
            <span>•</span>
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Client-Side Privacy
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            © 2026 InterviewIQ. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
