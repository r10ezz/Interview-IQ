'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Printer,
  Sparkles,
  BarChart2,
  ListOrdered,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { FinalEvaluationReport, CandidateAnalysis } from '@/types/interview';

interface EvaluationDashboardProps {
  report: FinalEvaluationReport;
  analysis: CandidateAnalysis;
  onRestart: () => void;
  source: 'gemini' | 'fallback';
}

export default function EvaluationDashboard({
  report,
  analysis,
  onRestart,
  source,
}: EvaluationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'roadmap'>('overview');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    '0': true, // first question expanded by default
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleQuestionExpand = (key: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Recharts Radar Data (5 dimensions)
  const radarData = [
    { subject: 'Correctness', score: report.technicalCorrectness, fullMark: 100 },
    { subject: 'Relevance', score: report.answerRelevance, fullMark: 100 },
    { subject: 'Depth', score: report.technicalDepth, fullMark: 100 },
    { subject: 'Clarity', score: report.communicationClarity, fullMark: 100 },
    { subject: 'Overall', score: report.overallScore, fullMark: 100 },
  ];

  // Recharts Question Progression Data
  const trajectoryData = report.questionBreakdown.map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: q.score,
    category: q.category,
  }));

  const getHiringBadge = (rec: FinalEvaluationReport['hiringRecommendation']) => {
    switch (rec) {
      case 'Strong Hire':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600';
      case 'Hire':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-600';
      case 'Borderline / Needs Follow-up':
        return 'bg-amber-950/80 text-amber-300 border-amber-600';
      default:
        return 'bg-rose-950/80 text-rose-300 border-rose-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-medium mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>MCA Research Evaluation Report</span>
            {source === 'fallback' && (
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 font-semibold">
                Offline Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-3">
            <span>Performance & Competency Assessment</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Candidate: <strong className="text-white">{analysis.candidateName}</strong> • Completed in ~{report.totalTimeMinutes} minutes
          </p>
        </div>

        <div className="flex items-center space-x-3 no-print">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print Report</span>
          </button>

          <button
            onClick={onRestart}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Interview</span>
          </button>
        </div>
      </div>

      {/* Main Score & Recommendation Banner */}
      <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Big Score */}
          <div className="flex items-center space-x-5">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600/10 border-2 border-indigo-500/40 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-4xl font-black text-white">{report.overallScore}</span>
              <span className="text-[10px] uppercase font-semibold text-indigo-400">out of 100</span>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Overall Performance Score
              </div>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getHiringBadge(
                    report.hiringRecommendation
                  )}`}
                >
                  {report.hiringRecommendation}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Evaluated across {report.questionBreakdown.length} questions
              </p>
            </div>
          </div>

          {/* Narrative Summary */}
          <div className="md:col-span-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <p className="font-medium text-white mb-1 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Lead Evaluator Verdict</span>
            </p>
            <p>{report.performanceSummary}</p>
          </div>
        </div>

        {/* 4 Dimension Metrics Mini Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400">Technical Correctness</div>
            <div className="text-lg font-bold text-white mt-1">{report.technicalCorrectness}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400">Answer Relevance</div>
            <div className="text-lg font-bold text-white mt-1">{report.answerRelevance}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400">Technical Depth</div>
            <div className="text-lg font-bold text-white mt-1">{report.technicalDepth}%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-400">Communication Clarity</div>
            <div className="text-lg font-bold text-white mt-1">{report.communicationClarity}%</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-8 flex items-center space-x-2 border-b border-slate-800 no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analytics & Synthesis</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'questions'
              ? 'border-indigo-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Question-by-Question Deep Dive ({report.questionBreakdown.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'roadmap'
              ? 'border-indigo-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Targeted Study Roadmap ({report.recommendedTopics.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview & Recharts Analytics */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8 animate-fade-in">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competency Radar Chart */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  5-Dimension Competency Radar
                </span>
                <span className="text-[11px] text-indigo-400">Normalized 0-100</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Research rubric mapping of technical correctness, relevance, depth, clarity, and overall fit.
              </p>

              <div className="w-full h-64 flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                      <Radar
                        name="Candidate"
                        dataKey="score"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">Loading radar visualisation...</div>
                )}
              </div>
            </div>

            {/* Question Score Trajectory Chart */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Question Performance Trajectory
                </span>
                <span className="text-[11px] text-violet-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Performance Arc
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Score progression across consecutive questions and adaptive difficulty shifts.
              </p>

              <div className="w-full h-64 flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#f8fafc',
                        }}
                      />
                      <Bar dataKey="score" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">Loading trajectory chart...</div>
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-3">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span>Areas for Development</span>
              </div>
              <ul className="space-y-3">
                {report.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200">
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skill Matrix Assessment */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Competency Alignment Matrix
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {report.skillAssessment.map((item, idx) => {
                const isStrong = item.status === 'strong';
                const isModerate = item.status === 'moderate';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white">{item.skill}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          isStrong
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : isModerate
                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {item.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Question-by-Question Deep Dive */}
      {activeTab === 'questions' && (
        <div className="mt-8 space-y-4 animate-fade-in">
          {report.questionBreakdown.map((item, idx) => {
            const isExpanded = expandedQuestions[idx.toString()];
            return (
              <div
                key={item.questionId || idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleQuestionExpand(idx.toString())}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-3.5 pr-4">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      Q{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-400">{item.category}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400 capitalize">{item.difficulty}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                        {item.questionText}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.score >= 80
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : item.score >= 60
                          ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {item.score}/100
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                    {/* Full Question Text */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200">
                      <strong className="text-indigo-300">Full Question: </strong>
                      {item.questionText}
                    </div>

                    {/* Candidate's Answer */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                      <div className="text-xs font-semibold text-slate-300 mb-2">
                        Candidate Answer:
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                        &quot;{item.candidateAnswer}&quot;
                      </p>
                    </div>

                    {/* Rubric Breakdown Grid */}
                    {item.rubricScores && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400">Correctness</span>
                          <div className="text-xs font-semibold text-white mt-0.5">
                            {item.rubricScores.correctness}%
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400">Relevance</span>
                          <div className="text-xs font-semibold text-white mt-0.5">
                            {item.rubricScores.relevance}%
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400">Depth</span>
                          <div className="text-xs font-semibold text-white mt-0.5">
                            {item.rubricScores.depth}%
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400">Clarity</span>
                          <div className="text-xs font-semibold text-white mt-0.5">
                            {item.rubricScores.clarity}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Critique */}
                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-200 leading-relaxed">
                      <strong className="text-white block mb-1">Evaluator Critique:</strong>
                      {item.critique}
                    </div>

                    {/* Benchmark Ideal Answer */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs text-emerald-200/90 leading-relaxed">
                      <strong className="text-emerald-400 block mb-1">Benchmark Ideal Model Answer:</strong>
                      {item.idealAnswer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Actionable Study Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200">
            Based on the detected skill gaps between your resume and the target job description, as well as your performance in the adaptive interview, here is your personalized preparation roadmap.
          </div>

          <div className="space-y-4">
            {report.recommendedTopics.map((topic, idx) => {
              const isHigh = topic.priority === 'high';
              const isMed = topic.priority === 'medium';
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-white">{topic.topic}</h4>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : isMed
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {topic.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{topic.reason}</p>
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400">
                      <strong className="text-indigo-400">Preparation Action: </strong>
                      {topic.recommendedFocus}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
