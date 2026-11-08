'use client';

import React, { useState } from 'react';
import { X, Key, CheckCircle, Info, ExternalLink, Shield } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  serverLockedIn?: boolean;
  maskedServerKey?: string | null;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  serverLockedIn = false,
  maskedServerKey = null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Google Gemini API Key</h3>
              <p className="text-xs text-slate-500">Live AI Integration & Fallback Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 mb-0.5">Reliable Demo Mode</p>
              <p className="text-slate-700 leading-relaxed">
                If you have a Gemini API Key or have configured it in <code className="px-1 py-0.5 bg-indigo-100 rounded text-[11px] font-mono">.env.local</code>, live Gemini 2.5 Flash calls will be made automatically.
              </p>
              <p className="text-indigo-800 mt-1.5 text-[11px]">
                If left empty, InterviewIQ automatically activates the <strong>Intelligent Fallback Evaluator</strong> so your presentations are never interrupted by quota or network drops.
              </p>
            </div>
          </div>

          {serverLockedIn && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-950">Gemini API is Locked In & Active</p>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Server key detected ({maskedServerKey || 'Active in .env.local'}). Live AI evaluation is running.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              <span>Get a free Gemini API key</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>

            <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>Stored in browser memory only</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2.5">
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Clear Key
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
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
