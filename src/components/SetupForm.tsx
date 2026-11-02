'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Trash2,
  CheckCircle,
  Cpu,
} from 'lucide-react';
import { DifficultyLevel, InterviewType, InterviewSetupConfig } from '@/types/interview';
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/sample-data';

interface SetupFormProps {
  initialConfig?: Partial<InterviewSetupConfig>;
  onSubmit: (config: InterviewSetupConfig, file?: File) => void;
  isLoading: boolean;
  loadingMessage?: string;
  apiKey?: string;
  onSaveApiKey?: (key: string) => void;
}

export default function SetupForm({
  initialConfig,
  onSubmit,
  isLoading,
  loadingMessage = 'Processing context...',
}: SetupFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>(initialConfig?.resumeText || '');
  const [resumeFileName, setResumeFileName] = useState<string>(initialConfig?.resumeFileName || '');
  const [jobDescription, setJobDescription] = useState<string>(initialConfig?.jobDescription || '');
  const [interviewType, setInterviewType] = useState<InterviewType>(initialConfig?.interviewType || 'mixed');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialConfig?.difficulty || 'intermediate');
  const [questionCount, setQuestionCount] = useState<number>(initialConfig?.questionCount || 5);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      setError('Please select a valid PDF resume file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('PDF file size exceeds 5MB limit. Please upload a smaller document.');
      return;
    }
    setSelectedFile(file);
    setResumeFileName(file.name);
    setResumeText('');
  };

  const handlePresetSelect = (preset: SamplePreset) => {
    setSelectedFile(null);
    setResumeFileName(preset.resumeFileName);
    setResumeText(preset.resumeText);
    setJobDescription(preset.jobDescription);
    setInterviewType(preset.interviewType);
    setDifficulty(preset.difficulty);
    setError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResumeFileName('');
    setResumeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile && (!resumeText || resumeText.trim().length < 30)) {
      setError('Please upload a PDF resume or click one of the demo presets below.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 30) {
      setError('Please provide a job description (at least 30 characters) to analyze contextual alignment.');
      return;
    }

    onSubmit(
      {
        resumeText,
        resumeFileName: resumeFileName || selectedFile?.name || 'Uploaded_Resume.pdf',
        jobDescription: jobDescription.trim(),
        interviewType,
        difficulty,
        questionCount,
      },
      selectedFile || undefined
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Stage 1: Context Ingestion</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Configure Your Mock Interview
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Upload your resume and paste your target job description. InterviewIQ extracts technical competencies and generates tailored, adaptive questions.
        </p>
      </div>

      {/* AI Live Engine Badge (Zero Setup) */}
      <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-white">Google Gemini AI Engine</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active & Ready</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized questioning and real-time evaluation are automatically enabled.
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Ready for interview
        </span>
      </div>

      {/* Preset Selector Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Fast-Track Viva / Academic Demo Presets</span>
          </div>
          <span className="text-[11px] text-slate-400">Click to instantly populate:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_PRESETS.map((p) => {
            const isSelected = resumeFileName === p.resumeFileName;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/50 border-indigo-600 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="font-semibold text-slate-200">{p.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">{p.jobTitle}</div>
                <div className="mt-2 text-[10px] text-indigo-400 font-medium">
                  {isSelected ? '✓ Currently Loaded' : 'Load Candidate & JD →'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Upload Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                <span>Candidate Resume (PDF)</span>
              </label>
              {resumeFileName && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-950/20'
                  : resumeFileName
                  ? 'border-emerald-700/60 bg-emerald-950/15'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {resumeFileName ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white mt-1 break-all px-2">
                    {resumeFileName}
                  </p>
                  <p className="text-[11px] text-emerald-300">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB (Ready to extract)`
                      : 'Preset resume loaded'}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 hover:underline">
                    Click to replace PDF
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Drop your PDF resume here, or <span className="text-indigo-400 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Max file size: 5MB • Formats: PDF only
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Description Column */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-violet-400" />
                <span>Target Job Description</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {jobDescription.length} characters
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job role, required skills, responsibilities, and qualifications..."
              rows={9}
              className="w-full flex-1 px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Configuration Options Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Interview Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Interview Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Interview Domain
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="mixed">Mixed (Technical + Behavioral)</option>
                <option value="technical">Technical & System Architecture</option>
                <option value="hr">HR, Behavioral & Leadership</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Contextual distribution of generated questions.
              </p>
            </div>

            {/* Starting Difficulty */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Starting Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="beginner">Beginner (Foundations & Syntax)</option>
                <option value="intermediate">Intermediate (Production Patterns)</option>
                <option value="advanced">Advanced (High Scale & Trade-offs)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Adapts in real-time based on candidate answers.
              </p>
            </div>

            {/* Length */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Interview Length
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>Quick Check (3 Questions)</option>
                <option value={5}>Standard MVP (5 Questions - Recommended)</option>
                <option value={7}>Deep Research (7 Questions)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Includes dynamic follow-up evaluations.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/25 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingMessage}</span>
              </>
            ) : (
              <>
                <span>Analyze Alignment & Generate Questions</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
