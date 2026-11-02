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
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    if (score >= 65) return 'text-indigo-600 border-indigo-200 bg-indigo-50';
    return 'text-amber-600 border-amber-200 bg-amber-50';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Stage 2: AI Alignment Analysis</span>
            {source === 'fallback' && (
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                Offline Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Candidate & Job Fit Profile</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Semantic breakdown of extracted resume competencies versus target job prerequisites.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToSetup}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Modify Context</span>
          </button>

          <button
            onClick={onStartInterview}
            disabled={isStarting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 shadow-md shadow-indigo-600/20 transition-all duration-200"
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
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Semantic Fit Index
            </span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="my-4 flex items-baseline space-x-3">
            <div className={`text-5xl font-black ${getScoreColor(analysis.matchScore).split(' ')[0]}`}>
              {analysis.matchScore}%
            </div>
            <div className="text-xs text-slate-500 leading-tight">
              {analysis.matchScore >= 80
                ? 'Strong Role Alignment'
                : analysis.matchScore >= 65
                ? 'Moderate Alignment'
                : 'Partial Alignment (Gap Focus)'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${analysis.matchScore}%` }}
            />
          </div>
        </div>

        {/* Candidate Profile Summary */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Candidate: <strong className="text-slate-900 capitalize">{analysis.candidateName || 'Candidate'}</strong></span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {analysis.experienceSummary}
            </p>
          </div>

          {analysis.confidenceAssessment && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-indigo-900 flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{analysis.confidenceAssessment}</span>
            </div>
          )}
        </div>
      </div>

      {/* Gap Analysis Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            <CheckCircle className="w-4 h-4" />
            <span>Matching Competencies ({analysis.matchingSkills.length})</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Directly corroborated between the candidate&apos;s resume and job prerequisites.
          </p>

          <div className="flex flex-wrap gap-2">
            {analysis.matchingSkills.length > 0 ? (
              analysis.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-1"
                >
                  <span className="text-emerald-600">✓</span>
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No exact matches identified.</span>
            )}
          </div>
        </div>

        {/* Missing / Gap Skills */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Identified Skill Gaps ({analysis.missingSkills.length})</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Demanded by the job description but not explicitly substantiated in the resume.
          </p>

          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.length > 0 ? (
              analysis.missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 flex items-center space-x-1"
                >
                  <span className="text-amber-600 font-bold">!</span>
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 italic">All primary job requirements detected in resume.</span>
            )}
          </div>
        </div>
      </div>

      {/* Projects Extracted & Recommended Topics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extracted Projects */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            <span>Detected Projects ({analysis.projects.length})</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Key initiatives identified from the resume that will form the basis of project-probing questions.
          </p>

          <div className="space-y-3">
            {analysis.projects.map((proj, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-900">{proj.name}</div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {proj.techStack.map((tech, tidx) => (
                      <span
                        key={tidx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-700 shadow-xs"
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
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
              <ListFilter className="w-4 h-4 text-violet-600" />
              <span>Recommended Adaptive Focus Areas</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Topics prioritized by the AI engine to probe candidate competency and gap mitigations.
            </p>

            <ul className="space-y-2.5">
              {analysis.recommendedTopics.map((topic, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center space-x-2.5"
                >
                  <Cpu className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onStartInterview}
              disabled={isStarting}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 shadow-md shadow-indigo-600/20 transition-all"
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
