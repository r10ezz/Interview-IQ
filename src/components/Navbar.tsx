'use client';

import React from 'react';
import { Sparkles, Key, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onOpenApiKeyModal?: () => void;
  onResetSession?: () => void;
  currentStep?: 'landing' | 'setup' | 'analysis' | 'interview' | 'coding' | 'evaluation';
  hasApiKey?: boolean;
}

export default function Navbar({
  onOpenApiKeyModal,
  onResetSession,
  currentStep = 'landing',
  hasApiKey = false,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={onResetSession}
          className="flex items-center space-x-3 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Interview<span className="text-indigo-600">IQ</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Adaptive Technical Mock Interviews
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2.5">
          {currentStep !== 'landing' && (
            <button
              onClick={onResetSession}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
              title="Restart session"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          )}

          <button
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              hasApiKey
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasApiKey ? 'Gemini AI Active' : 'API Key Config'}
            </span>
            <span className="sm:hidden">API</span>
          </button>
        </div>
      </div>
    </header>
  );
}
