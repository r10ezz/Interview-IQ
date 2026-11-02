'use client';

import React from 'react';
import { Sparkles, GraduationCap, Key, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onOpenApiKeyModal?: () => void;
  onResetSession?: () => void;
  currentStep?: 'landing' | 'setup' | 'analysis' | 'interview' | 'evaluation';
  hasApiKey?: boolean;
}

export default function Navbar({
  onOpenApiKeyModal,
  onResetSession,
  currentStep = 'landing',
  hasApiKey = false,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={onResetSession}
          className="flex items-center space-x-3 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Interview<span className="text-indigo-400">IQ</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                <GraduationCap className="w-3 h-3 mr-1 text-indigo-400" />
                MCA Research
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Adaptive AI Mock Interview System
            </p>
          </div>
        </div>

        {/* Current State Indicator & Actions */}
        <div className="flex items-center space-x-3">
          {currentStep !== 'landing' && (
            <button
              onClick={onResetSession}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
              title="Restart session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Interview</span>
            </button>
          )}

          <button
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasApiKey ? 'Gemini Key Configured' : 'API Key / Demo Mode'}
            </span>
            <span className="sm:hidden">API</span>
          </button>
        </div>
      </div>
    </header>
  );
}
