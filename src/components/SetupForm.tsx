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
  Code2,
  Users,
} from 'lucide-react';
import { DifficultyLevel, InterviewType, InterviewSetupConfig, InterviewRoundType } from '@/types/interview';
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
  const [selectedRounds, setSelectedRounds] = useState<InterviewRoundType[]>(
    initialConfig?.selectedRounds || ['foundation', 'coding', 'behavioral']
  );
  const [interviewType, setInterviewType] = useState<InterviewType>(initialConfig?.interviewType || 'mixed');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialConfig?.difficulty || 'intermediate');
  const [questionCount, setQuestionCount] = useState<number>(initialConfig?.questionCount || 5);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleRound = (round: InterviewRoundType) => {
    setError(null);
    setSelectedRounds((prev) => {
      if (prev.includes(round)) {
        if (prev.length === 1) {
          setError('At least one interview round must be selected.');
          return prev;
        }
        return prev.filter((r) => r !== round);
      } else {
        return [...prev, round];
      }
    });
  };

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

    if (selectedRounds.length === 0) {
      setError('Please select at least one interview round (Foundation, Coding, or Behavioral).');
      return;
    }

    onSubmit(
      {
        resumeText,
        resumeFileName: resumeFileName || selectedFile?.name || 'Uploaded_Resume.pdf',
        jobDescription: jobDescription.trim(),
        selectedRounds,
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
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Stage 1: Context Ingestion</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Configure Your Mock Interview
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
          Upload your resume and paste your target job description. InterviewIQ extracts technical competencies and generates tailored, adaptive questions.
        </p>
      </div>

      {/* AI Live Engine Badge (Zero Setup) */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-900">Google Gemini AI Engine</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active & Ready</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized questioning and real-time evaluation are automatically enabled.
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Zero configuration needed
        </span>
      </div>

      {/* Preset Selector Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Fast-Track Demo Presets</span>
          </div>
          <span className="text-[11px] text-slate-500">Click to instantly populate:</span>
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
                    ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900">{p.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">{p.jobTitle}</div>
                <div className="mt-2 text-[10px] text-indigo-600 font-semibold">
                  {isSelected ? '✓ Currently Loaded' : 'Load Candidate & JD →'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Upload Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>Candidate Resume (PDF)</span>
              </label>
              {resumeFileName && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-medium"
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
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : resumeFileName
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
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
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1 break-all px-2">
                    {resumeFileName}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB (Ready to extract)`
                      : 'Preset resume loaded'}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-2 hover:underline">
                    Click to replace PDF
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Drop your PDF resume here, or <span className="text-indigo-600 font-semibold underline">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
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
              <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-violet-600" />
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
              className="w-full flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 leading-relaxed resize-none shadow-xs"
            />
          </div>
        </div>

        {/* Multi-Select Interview Rounds */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Select Interview Rounds (Choose 1 to All)</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {selectedRounds.length} of 3 Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Foundation Round Card */}
            <div
              onClick={() => toggleRound('foundation')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRounds.includes('foundation')
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRounds.includes('foundation') ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    selectedRounds.includes('foundation')
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {selectedRounds.includes('foundation') ? '✓ Included' : '+ Add'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Foundation & Concepts</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Language runtime, async event loops, framework mechanics, and most-asked technical questions for your role.
                </p>
              </div>
            </div>

            {/* Live Coding Round Card */}
            <div
              onClick={() => toggleRound('coding')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRounds.includes('coding')
                  ? 'bg-violet-50/70 border-violet-500 shadow-xs ring-1 ring-violet-500/30'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRounds.includes('coding') ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    selectedRounds.includes('coding')
                      ? 'bg-violet-100 text-violet-700 border-violet-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {selectedRounds.includes('coding') ? '✓ Included' : '+ Add'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Live Coding & DSA</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  LeetCode / HackerRank style algorithmic challenges with interactive test cases and Big-O evaluation.
                </p>
              </div>
            </div>

            {/* Behavioral Round Card */}
            <div
              onClick={() => toggleRound('behavioral')}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedRounds.includes('behavioral')
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedRounds.includes('behavioral') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    selectedRounds.includes('behavioral')
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {selectedRounds.includes('behavioral') ? '✓ Included' : '+ Add'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Behavioral & Leadership</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  STAR method scenarios addressing your resume projects, conflict resolution, and cross-functional ownership.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Options Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Interview Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Starting Difficulty */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Starting Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
              >
                <option value="beginner">Beginner (Foundations & Syntax)</option>
                <option value="intermediate">Intermediate (Production Patterns)</option>
                <option value="advanced">Advanced (High Scale & Trade-offs)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Adapts dynamically based on candidate answers.
              </p>
            </div>

            {/* Length */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Verbal Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
              >
                <option value={3}>Concise Check (3 Questions)</option>
                <option value={5}>Standard Mock (5 Questions - Recommended)</option>
                <option value={7}>Comprehensive (7 Questions)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Evenly distributed across selected verbal rounds.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all duration-200"
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
