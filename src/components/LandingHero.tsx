'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Brain,
  Sliders,
  BarChart3,
  CheckCircle2,
  Play,
  Code2,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  Check,
  TrendingUp,
  Compass,
  Lock,
  ChevronRight,
  Monitor,
  Award,
  Layers,
  Sparkle
} from 'lucide-react';
import { SAMPLE_PRESETS } from '@/lib/sample-data';

interface LandingHeroProps {
  onStart: () => void;
  onSelectSamplePreset: (presetId: string) => void;
}

export default function LandingHero({
  onStart,
  onSelectSamplePreset,
}: LandingHeroProps) {
  // State for interactive code preview in the hero mockup
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'python' | 'java' | 'cpp' | 'c'>('typescript');

  // State for interactive stage tabs
  const [activeStageTab, setActiveStageTab] = useState<'resume' | 'verbal' | 'coding' | 'report'>('coding');

  const codeSnippets: Record<string, { code: string; testOutput: string }> = {
    typescript: {
      code: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp)!, i];
    map.set(nums[i], i);
  }
  return [];
}`,
      testOutput: `✓ Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0, 1] (Passed)
✓ Test Case 2: nums=[3,2,4], target=6 -> Output: [1, 2] (Passed)
Runtime: 8ms • Memory: 42.1 MB (Top 96.4%)`,
    },
    python: {
      code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, val in enumerate(nums):
            comp = target - val
            if comp in seen:
                return [seen[comp], i]
            seen[val] = i
        return []`,
      testOutput: `✓ Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0, 1] (Passed)
✓ Test Case 2: nums=[3,2,4], target=6 -> Output: [1, 2] (Passed)
Runtime: 72ms • Memory: 17.8 MB (Python 3.12)`,
    },
    java: {
      code: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[]{ map.get(comp), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      testOutput: `✓ Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0, 1] (Passed)
✓ Test Case 2: nums=[3,2,4], target=6 -> Output: [1, 2] (Passed)
Runtime: 589ms • OpenJDK 21 LTS Native Execution`,
    },
    cpp: {
      code: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); ++i) {
        int comp = target - nums[i];
        if (seen.find(comp) != seen.end()) {
            return {seen[comp], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
      testOutput: `✓ Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0, 1] (Passed)
✓ Test Case 2: nums=[3,2,4], target=6 -> Output: [1, 2] (Passed)
Runtime: 642ms • GCC 15.2 (C++17 Standalone)`,
    },
    c: {
      code: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* res = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                res[0] = i; res[1] = j;
                *returnSize = 2; return res;
            }
        }
    }
    *returnSize = 0; return NULL;
}`,
      testOutput: `✓ Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0, 1] (Passed)
✓ Test Case 2: nums=[3,2,4], target=6 -> Output: [1, 2] (Passed)
Runtime: 248ms • GCC 15.2 (C17 Malloc Pointer)`,
    },
  };

  return (
    <div className="relative overflow-hidden bg-slate-50/60 pb-16">
      {/* Background Decorative Mesh & Radial Glow */}
      <div className="absolute inset-0 bg-grid-slate-pattern pointer-events-none opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-radial-hero pointer-events-none" />

      {/* Floating subtle ambient lights */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-36 right-1/4 w-80 h-80 bg-violet-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO HEADER & VALUE PROPOSITION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-10 pb-12 lg:pt-16 lg:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 shadow-xs backdrop-blur-md mb-6 hover:border-indigo-200 transition-colors">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
            Adaptive AI Technical Interview Platform
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            Native 6-Language Sandbox & Real-Time Big-O
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Realistic Technical Mock Interviews{' '}
          <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
            Calibrated to Your Exact Target Job
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Cross-reference your resume with any job description. Practice adaptive verbal rounds that test core engineering pillars without badgering, write code in our native 6-language compiler sandbox, and get deep Big-O complexity feedback.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onStart}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <span>Start Free Mock Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectSamplePreset('fullstack-engineer')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span>1-Click Full-Stack Demo</span>
          </button>
        </div>

        {/* Trust & Guarantee Micro-Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-slate-500 font-medium">
          <span className="inline-flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
            Instant start (Zero sign-up required)
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="inline-flex items-center">
            <Cpu className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
            Native GCC 15.2 & OpenJDK 21 LTS
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="inline-flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500 mr-1.5" />
            100% Client-Side Privacy
          </span>
        </div>

        {/* ======================================================================= */}
        {/* 1-CLICK ROLE PRESETS QUICK-LAUNCH */}
        {/* ======================================================================= */}
        <div className="mt-12 max-w-4xl mx-auto text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center">
              <Zap className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
              Or Test-Drive with Verified Role Presets (1-Click)
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">Pre-filled real resume & job description</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectSamplePreset(preset.id)}
                className="group relative p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {preset.id === 'fullstack-engineer' ? 'Full Stack' : preset.id === 'ai-ml-engineer' ? 'AI / ML' : 'Frontend'}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">{preset.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {preset.name.split('—')[0].trim()}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {preset.jobTitle}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-medium">
                  <span className="flex items-center">
                    <Play className="w-3 h-3 mr-1 fill-indigo-600 text-indigo-600" />
                    Launch session
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* HERO LIVE PLATFORM MOCKUP (INTERACTIVE PREVIEW) */}
        {/* ======================================================================= */}
        <div className="mt-14 max-w-5xl mx-auto text-left">
          <div className="rounded-2xl border border-slate-300/80 bg-slate-900 shadow-2xl shadow-indigo-950/20 overflow-hidden">
            {/* Window Top Bar */}
            <div className="h-10 px-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-slate-300 hidden sm:inline">
                  interview-iq // active-session: Alex Rivera (Senior Full Stack)
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-mono">Live Adaptive Engine Active</span>
              </div>
            </div>

            {/* Mockup Body: 3-Column Preview Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              {/* Column 1: Adaptive Verbal Stream (4 cols) */}
              <div className="lg:col-span-4 p-4.5 bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80 font-mono">
                      Round 1: Foundation
                    </span>
                    <span className="text-slate-400 font-mono">Q2 of 5</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-1">
                      Pillar: Backend Architecture & Reliability
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      &quot;How do you guarantee idempotency in distributed payment microservices when network timeouts occur?&quot;
                    </p>
                  </div>

                  {/* Candidate Answer Preview */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      Candidate Response
                    </span>
                    <p className="text-[11px] text-slate-300 font-sans line-clamp-3 leading-relaxed">
                      &quot;We pass unique client-generated idempotency keys, acquire Redis distributed locks, and persist status transitions using the Transactional Outbox pattern...&quot;
                    </p>
                  </div>

                  {/* Adaptive Note */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-200 leading-snug">
                      <strong>Topic Mastery Confirmed (88/100).</strong> Concluding topic early; rotating to Caching & Production Storage.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                  <span>Topic Rotation Engine</span>
                  <span className="text-slate-400">Zero Fatigue • 3–4 Domains</span>
                </div>
              </div>

              {/* Column 2: Live Code Sandbox Preview (5 cols) */}
              <div className="lg:col-span-5 p-4.5 bg-slate-950 flex flex-col justify-between">
                <div>
                  {/* Language Selector Tabs */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
                    <div className="flex items-center space-x-1">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                      <span className="text-slate-300 font-semibold text-xs font-mono">Two Sum</span>
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      {(['typescript', 'python', 'java', 'cpp', 'c'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-2 py-0.5 rounded transition-colors uppercase font-mono ${
                            selectedLanguage === lang
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lang === 'typescript' ? 'TS' : lang === 'python' ? 'PY' : lang === 'java' ? 'JAVA' : lang === 'cpp' ? 'C++' : 'C'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Snippet Box */}
                  <pre className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                    <code>{codeSnippets[selectedLanguage].code}</code>
                  </pre>

                  {/* Compiler / Test Results Drawer Preview */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-emerald-900/40 text-[10px] font-mono text-emerald-300">
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
                      <span className="text-emerald-400 font-bold flex items-center">
                        <Terminal className="w-3 h-3 mr-1" />
                        Compilation Output & Tests
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                        ACCEPTED
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-slate-300 leading-relaxed">
                      {codeSnippets[selectedLanguage].testOutput}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                  <span>Interactive Terminal</span>
                  <span className="text-emerald-400">All Test Cases Passed</span>
                </div>
              </div>

              {/* Column 3: Evaluation & Big-O Rubric (3 cols) */}
              <div className="lg:col-span-3 p-4.5 bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-300 font-semibold font-mono flex items-center">
                      <Award className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                      Live Scorecard
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Strong Hire
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 mb-3 text-center">
                    <span className="text-3xl font-black text-white tracking-tight">92</span>
                    <span className="text-xs text-slate-400 ml-1">/ 100</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Overall Candidate Alignment</p>
                  </div>

                  {/* Rubric Breakdown Bars */}
                  <div className="space-y-2.5 text-[11px]">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Algorithmic Correctness</span>
                        <span className="text-emerald-400 font-mono">95%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[95%] h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Time Complexity (Big-O)</span>
                        <span className="text-sky-400 font-mono">O(n)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[90%] h-full bg-sky-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>System Architecture</span>
                        <span className="text-indigo-400 font-mono">88%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[88%] h-full bg-indigo-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Technical Articulation</span>
                        <span className="text-violet-400 font-mono">92%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-violet-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Target Alignment</span>
                  <span className="text-indigo-400">94% JD Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: METRICS & TECHNICAL FOUNDATION (CLEAN STATS BAR) */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">6</span>
              <h4 className="text-xs font-semibold text-slate-800 mt-1">Native Compilers</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">TypeScript, Python, Java, C++, C, JavaScript</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-3">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">5 – 12</span>
              <h4 className="text-xs font-semibold text-slate-800 mt-1">Adaptive Questions</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Dynamically calibrates on candidate answering ability</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-3">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">4</span>
              <h4 className="text-xs font-semibold text-slate-800 mt-1">Core Assessment Pillars</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Switches topics to avoid badgering and fatigue</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">100%</span>
              <h4 className="text-xs font-semibold text-slate-800 mt-1">Client-Side Privacy</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">In-memory execution with zero credential tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: BENTO GRID FEATURES (MODERN & CLEAN) */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            Platform Architecture
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built Like a Real High-Bar Tech Interview
          </p>
          <p className="mt-2.5 text-sm text-slate-600">
            Every layer is engineered to mirror the caliber of Staff and Senior engineering loops.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Bento Card 1: Bi-Directional Resume & JD Matching */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Bi-Directional Context Ingestion
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Upload your resume PDF and paste target job descriptions. The system parses projects, tools, and technical scales, mapping exact skill intersections and identifying blind spots.
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center text-xs text-indigo-700 font-semibold">
              <Check className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              <span>PDF parsing & semantic alignment</span>
            </div>
          </div>

          {/* Bento Card 2: Adaptive Topic Switching (Fatigue Free) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Adaptive Topic Rotation (5–12 Qs)
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Never get badgered with repetitive questions. If you prove mastery or demonstrate baseline signal, the engine concludes that topic immediately and shifts focus across 3–4 core engineering pillars.
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center text-xs text-violet-700 font-semibold">
              <Check className="w-3.5 h-3.5 mr-1 text-violet-600" />
              <span>Simulates realistic human interviewer</span>
            </div>
          </div>

          {/* Bento Card 3: 6-Language Compiler & Terminal */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Native 6-Language Live Compiler
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Code in TypeScript, JavaScript, Python 3.12, Java 21 LTS, C++17, or C17. Backed by isolated execution sandboxes, real compiler stderr diagnostics, and live test case verification.
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center text-xs text-sky-700 font-semibold">
              <Check className="w-3.5 h-3.5 mr-1 text-sky-600" />
              <span>Supports function, class, and stdin/stdout</span>
            </div>
          </div>

          {/* Bento Card 4: Big-O Complexity & Code Quality */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Automated Big-O Complexity Analysis
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Goes beyond basic unit tests. The evaluation engine assesses your runtime Time and Space complexity, detects memory leaks, and verifies idiom compliance for each programming language.
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center text-xs text-amber-700 font-semibold">
              <Check className="w-3.5 h-3.5 mr-1 text-amber-600" />
              <span>Time & Space complexity benchmarks</span>
            </div>
          </div>

          {/* Bento Card 5: Multi-Round Selection */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Configurable Round Sequences
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Select from Foundational Architecture, Live Algorithmic Coding, and Behavioral Leadership rounds to focus exactly on the interview stages you need practice with most.
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center text-xs text-emerald-700 font-semibold">
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Flexible practice modes</span>
            </div>
          </div>

          {/* Bento Card 6: 5-Dimension Radar Scorecard & Roadmap */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Actionable Scorecard & Study Roadmap
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Receive an executive summary, radar chart visualization, benchmark model answers, and a prioritized technical roadmap with targeted resources before your real interview day.
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center text-xs text-rose-700 font-semibold">
              <Check className="w-3.5 h-3.5 mr-1 text-rose-600" />
              <span>Printable & exportable evaluation report</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: INTERACTIVE STAGE EXPLORER (TABBED PREVIEW) */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Complete Interview Lifecycle
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Experience the Four Distinct Stages
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Click through the interactive tabs to explore how each round operates.
            </p>
          </div>

          {/* Stage Tab Buttons */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'resume', label: '1. Resume Alignment', icon: FileText },
              { id: 'verbal', label: '2. Adaptive Verbal', icon: Brain },
              { id: 'coding', label: '3. Live 6-Lang Coding', icon: Code2 },
              { id: 'report', label: '4. Rubric & Roadmap', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStageTab(tab.id as any)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeStageTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="mt-6">
            {activeStageTab === 'resume' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Automated Candidate-JD Cross Reference
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Upload your standard PDF resume. The system extracts verified technologies, project scales, and metrics, then checks them against the target job description to compute a role fit score.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Automatic client-side PDF parsing with unpdf
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Extracts verified skills, projects, and tenure
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Flags missing core requirements and bonus qualifications
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">Extracted Profile</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">94% Match</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Strengths</span>
                      <span className="text-slate-800 font-medium">TypeScript, Next.js, Distributed PostgreSQL, Redis</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                      <span className="text-[10px] text-amber-700 uppercase font-bold block">Target Alignment Focus</span>
                      <span className="text-amber-900 font-medium">Microservices Event-Driven Reliability & Outbox Pattern</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStageTab === 'verbal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Realistic Adaptive Verbal Interview
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Candidates answer between 5 and 12 questions based on dynamic performance signals. The interviewer rotates across 3–4 core technical pillars to thoroughly assess competencies without badgering.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Mastery stop: Confident candidates complete the round in 5 questions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Topic fatigue guard: Automatically pivots if baseline signal is recorded
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Real-time feedback: Scores relevance, depth, and clarity
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-indigo-400 font-bold">Interviewer Calibration</span>
                    <span className="text-[10px] text-slate-400">Pillar 2 of 4</span>
                  </div>
                  <p className="mt-3 text-slate-300 font-sans text-xs">
                    &quot;Clear grasp of Backend Storage confirmed (Score: 85/100). Shifting focus to Language Mechanics & Async Runtimes (Question 3).&quot;
                  </p>
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-emerald-300 font-sans">
                    ✓ Evaluates architectural trade-offs, not rote trivia
                  </div>
                </div>
              </div>
            )}

            {activeStageTab === 'coding' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    In-Browser 6-Language IDE & Compiler
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Switch between TypeScript, JavaScript, Python, Java, C++, and C at will. Compiles on real backend compilers with standard output and error capture.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Interactive Output Console with Test Results & Compiler Logs
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Full support for function-based, class-based, and standard I/O problems
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Automatic Big-O complexity calculation and optimization tips
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold">Terminal & Diagnostics</span>
                    <span className="text-slate-400 text-[10px]">GCC 15.2 / JDK 21</span>
                  </div>
                  <pre className="mt-2 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`$ gcc -O2 solution.c -o solution.exe
$ ./solution.exe
✓ Test Case 1: [2, 7, 11, 15] -> [0, 1] (OK)
✓ Test Case 2: [3, 2, 4] -> [1, 2] (OK)
Verdict: Accepted (12ms)`}
                  </pre>
                </div>
              </div>
            )}

            {activeStageTab === 'report' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Comprehensive Report & Actionable Roadmap
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Review your holistic hiring recommendation, 5-dimensional rubric scoring, Big-O code efficiency audit, and a tailored study plan with high-yield concepts to review.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Hiring Recommendation: Strong Hire, Hire, or Lean Hire
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Model benchmark answers for every verbal & coding question
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      Exportable and print-ready candidate scorecard
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-900">Candidate Scorecard</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Strong Hire (92/100)
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-slate-600">
                    <p className="text-[11px] leading-relaxed">
                      <strong>Executive Summary:</strong> Excellent algorithmic intuition with optimal $O(n)$ hash map solution. Demonstrated clear knowledge of distributed locks and idempotency.
                    </p>
                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-[11px]">
                      <strong>Recommended Study Focus:</strong> Review Raft consensus election timeouts and database index cardinality.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: BOTTOM CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-semibold mb-4 border border-indigo-700">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Practice Free Right Now
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Ace Your Next Technical Interview?
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Upload your resume or launch a verified 1-click sample session to experience real AI calibration.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onStart}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span>Start Custom Mock Interview</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={() => onSelectSamplePreset('fullstack-engineer')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all duration-200 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                <span>Test 1-Click Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
