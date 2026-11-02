'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FolderGit2,
  ListFilter,
  ArrowRight,
  RotateCcw,
  User,
  Lightbulb,
  Cpu,
  Target,
} from 'lucide-react';
import { CandidateAnalysis } from '@/types/interview';

interface AnalysisDashboardProps {
  analysis: CandidateAnalysis;
  source: 'gemini' | 'fallback';
  onStartInterview: () => void;
  onBackToSetup: () => void;
  isStarting: boolean;
}

export default function AnalysisDashboard({
  analysis,
  source,
  onStartInterview,
  onBackToSetup,
  isStarting,
}: AnalysisDashboardProps) {
  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
    if (score >= 65) return 'text-indigo-400 border-indigo-500/40 bg-indigo-950/20';
    return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Stage 2: AI Alignment Analysis</span>
            {source === 'fallback' && (
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 font-semibold">
                Offline Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-3">
            <span>Candidate & Job Fit Profile</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Semantic breakdown of extracted resume competencies versus target job prerequisites.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToSetup}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Modify Context</span>
          </button>

          <button
            onClick={onStartInterview}
            disabled={isStarting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 shadow-lg shadow-indigo-600/30 transition-all duration-200"
          >
            {isStarting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Adaptive Questions...</span>
              </>
            ) : (
              <>
                <span>Begin Adaptive Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Stats Header */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match Score Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Semantic Fit Index
            </span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="my-4 flex items-baseline space-x-3">
            <div className={`text-5xl font-black ${getScoreColor(analysis.matchScore).split(' ')[0]}`}>
              {analysis.matchScore}%
            </div>
            <div className="text-xs text-slate-400 leading-tight">
              {analysis.matchScore >= 80
                ? 'Strong Role Alignment'
                : analysis.matchScore >= 65
                ? 'Moderate Alignment'
                : 'Partial Alignment (Gap Focus)'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${analysis.matchScore}%` }}
            />
          </div>
        </div>

        {/* Candidate Profile Summary */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Candidate: <strong className="text-white capitalize">{analysis.candidateName || 'Candidate'}</strong></span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {analysis.experienceSummary}
            </p>
          </div>

          {analysis.confidenceAssessment && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-indigo-300/90 flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>{analysis.confidenceAssessment}</span>
            </div>
          )}
        </div>
      </div>

      {/* Gap Analysis Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            <CheckCircle className="w-4 h-4" />
            <span>Matching Competencies ({analysis.matchingSkills.length})</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Directly corroborated between the candidate&apos;s resume and job prerequisites.
          </p>

          <div className="flex flex-wrap gap-2">
            {analysis.matchingSkills.length > 0 ? (
              analysis.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-center space-x-1"
                >
                  <span>✓</span>
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No exact matches identified.</span>
            )}
          </div>
        </div>

        {/* Missing / Gap Skills */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Identified Skill Gaps ({analysis.missingSkills.length})</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Demanded by the job description but not explicitly substantiated in the resume.
          </p>

          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.length > 0 ? (
              analysis.missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-950/30 border border-amber-800/50 text-amber-300 flex items-center space-x-1"
                >
                  <span>!</span>
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-400 italic">All primary job requirements detected in resume.</span>
            )}
          </div>
        </div>
      </div>

      {/* Projects Extracted & Recommended Topics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extracted Projects */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Detected Projects ({analysis.projects.length})</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Key initiatives identified from the resume that will form the basis of project-probing questions.
          </p>

          <div className="space-y-3">
            {analysis.projects.map((proj, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs font-semibold text-white">{proj.name}</div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">{proj.description}</div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {proj.techStack.map((tech, tidx) => (
                      <span
                        key={tidx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Interview Topics */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              <ListFilter className="w-4 h-4 text-violet-400" />
              <span>Recommended Adaptive Focus Areas</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Topics prioritized by the AI engine to probe candidate competency and gap mitigations.
            </p>

            <ul className="space-y-2.5">
              {analysis.recommendedTopics.map((topic, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 flex items-center space-x-2.5"
                >
                  <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onStartInterview}
              disabled={isStarting}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 shadow-xl shadow-indigo-600/25 transition-all"
            >
              <span>Launch Adaptive Interview Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
