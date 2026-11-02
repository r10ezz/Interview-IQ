'use client';

import React, { useState } from 'react';
import { X, Key, CheckCircle, Info, ExternalLink, Shield } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}: ApiKeyModalProps) {
  const [inputVal, setInputVal] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputVal.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveApiKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Google Gemini API Key</h3>
              <p className="text-xs text-slate-400">Live AI Integration & Demo Fallback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white mb-0.5">Reliable Academic Demo Mode</p>
              <p className="text-indigo-200/90 leading-relaxed">
                If you have a Gemini API Key or set <code className="px-1 py-0.5 bg-indigo-900/60 rounded text-[11px]">GEMINI_API_KEY</code> in <code className="px-1 py-0.5 bg-indigo-900/60 rounded text-[11px]">.env.local</code>, live Gemini 2.5 Flash calls will be made.
              </p>
              <p className="text-indigo-300 mt-1.5 text-[11px]">
                If left empty, InterviewIQ automatically activates the <strong>Intelligent Fallback Evaluator</strong> so your academic presentation will never be interrupted by API limits or network drops!
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-400 hover:text-indigo-300 underline"
            >
              <span>Get a free Gemini API key</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>

            <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Stored in browser memory only</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2.5">
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                Clear Key
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
