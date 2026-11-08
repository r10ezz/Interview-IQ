'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandingHero from '@/components/LandingHero';
import HowItWorks from '@/components/HowItWorks';
import SetupForm from '@/components/SetupForm';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import InterviewConsole from '@/components/InterviewConsole';
import CodingRound from '@/components/CodingRound';
import EvaluationDashboard from '@/components/EvaluationDashboard';
import ApiKeyModal from '@/components/ApiKeyModal';

import {
  CandidateAnalysis,
  InterviewQuestion,
  InterviewExchange,
  FinalEvaluationReport,
  InterviewSetupConfig,
  DifficultyLevel,
  CodingSubmission,
  CodingChallenge,
  InterviewRoundType,
} from '@/types/interview';
import { SAMPLE_PRESETS } from '@/lib/sample-data';
import { DEFAULT_CODING_CHALLENGES } from '@/lib/coding-challenges';

type AppStep = 'landing' | 'setup' | 'analysis' | 'interview' | 'coding' | 'evaluation';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Setup state
  const [setupConfig, setSetupConfig] = useState<InterviewSetupConfig | null>(null);
  const [setupFile, setSetupFile] = useState<File | null>(null);

  // Analysis state
  const [candidateAnalysis, setCandidateAnalysis] = useState<CandidateAnalysis | null>(null);
  const [analysisSource, setAnalysisSource] = useState<'gemini' | 'fallback'>('gemini');

  // Interview state
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('intermediate');
  const [interviewHistory, setInterviewHistory] = useState<InterviewExchange[]>([]);

  // Coding round state
  const [codingChallenges, setCodingChallenges] = useState<CodingChallenge[]>([]);
  const [codingSubmissions, setCodingSubmissions] = useState<CodingSubmission[]>([]);

  // Final evaluation state
  const [finalReport, setFinalReport] = useState<FinalEvaluationReport | null>(null);
  const [reportSource, setReportSource] = useState<'gemini' | 'fallback'>('gemini');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [isServerKeyLocked, setIsServerKeyLocked] = useState<boolean>(false);
  const [maskedServerKey, setMaskedServerKey] = useState<string | null>(null);

  // Load custom API key from localStorage and check server-side key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('interview_iq_gemini_key');
      if (stored) setApiKey(stored);
    }
    fetch('/api/validate-key')
      .then((res) => res.json())
      .then((data) => {
        if (data.lockedIn) {
          setIsServerKeyLocked(true);
          setMaskedServerKey(data.maskedKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('interview_iq_gemini_key', key);
      } else {
        localStorage.removeItem('interview_iq_gemini_key');
      }
    }
  };

  const handleResetSession = () => {
    setCurrentStep('landing');
    setSetupConfig(null);
    setSetupFile(null);
    setCandidateAnalysis(null);
    setAllQuestions([]);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(0);
    setInterviewHistory([]);
    setCodingChallenges([]);
    setCodingSubmissions([]);
    setFinalReport(null);
  };

  // 1-Click preset demo handler from landing page
  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId) || SAMPLE_PRESETS[0];
    setSetupConfig({
      resumeText: preset.resumeText,
      resumeFileName: preset.resumeFileName,
      jobDescription: preset.jobDescription,
      selectedRounds: ['foundation', 'coding', 'behavioral'],
      interviewType: preset.interviewType,
      difficulty: preset.difficulty,
      questionCount: 5,
      candidateName: preset.candidateName,
      jobTitle: preset.jobTitle,
    });
    setCurrentStep('setup');
  };

  // Step 1: Submit setup and perform candidate-JD analysis
  const handleAnalyzeSetup = async (config: InterviewSetupConfig, file?: File) => {
    setIsLoading(true);
    setLoadingMessage('Extracting PDF text and analyzing alignment...');
    setSetupConfig(config);
    if (file) setSetupFile(file);

    try {
      let res: Response;

      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', config.jobDescription);
        if (apiKey) formData.append('customApiKey', apiKey);

        res = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: config.resumeText,
            jobDescription: config.jobDescription,
            customApiKey: apiKey || undefined,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze candidate profile.');
      }

      setCandidateAnalysis(data.candidateAnalysis);
      setAnalysisSource(data.source || 'gemini');
      if (data.resumeText) {
        setSetupConfig((prev) => (prev ? { ...prev, resumeText: data.resumeText } : prev));
      }
      setCurrentStep('analysis');
    } catch (err) {
      console.error('Analysis error:', err);
      alert(err instanceof Error ? err.message : 'Analysis failed. Please check inputs.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Step 2: Start interview and generate personalized questions
  const handleStartInterview = async () => {
    if (!candidateAnalysis || !setupConfig) return;

    setIsLoading(true);
    setLoadingMessage('AI Interviewer is formulating adaptive questions...');

    try {
      const selectedRounds = setupConfig.selectedRounds || ['foundation', 'coding', 'behavioral'];

      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: setupConfig.resumeText,
          jobDescription: setupConfig.jobDescription,
          candidateAnalysis,
          selectedRounds,
          interviewType: setupConfig.interviewType,
          difficulty: setupConfig.difficulty,
          interviewLength: setupConfig.questionCount,
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start interview.');
      }

      if (data.codingChallenges && data.codingChallenges.length > 0) {
        setCodingChallenges(data.codingChallenges);
      } else if (selectedRounds.includes('coding')) {
        setCodingChallenges(DEFAULT_CODING_CHALLENGES);
      }

      setAllQuestions(data.questions || []);
      setInterviewHistory([]);

      // If user selected ONLY coding round:
      if (selectedRounds.length === 1 && selectedRounds[0] === 'coding') {
        setCurrentStep('coding');
      } else {
        setCurrentQuestion(data.initialQuestion || data.questions?.[0]);
        setCurrentQuestionIndex(0);
        setCurrentDifficulty(setupConfig.difficulty);
        setCurrentStep('interview');
      }
    } catch (err) {
      console.error('Start interview error:', err);
      alert(err instanceof Error ? err.message : 'Failed to launch interview.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Step 3: Candidate submits an answer to current question
  const handleSubmitAnswer = async (answer: string) => {
    if (!currentQuestion || !setupConfig || !candidateAnalysis) {
      throw new Error('Interview state is incomplete.');
    }

    setIsEvaluatingAnswer(true);

    try {
      const res = await fetch('/api/interview/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestion,
          candidateAnswer: answer,
          questionIndex: currentQuestionIndex,
          previousHistory: interviewHistory,
          allQuestions,
          currentDifficulty,
          candidateAnalysis,
          jobDescription: setupConfig.jobDescription,
          resumeText: setupConfig.resumeText,
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate response.');
      }

      const exchange: InterviewExchange = {
        question: currentQuestion,
        candidateAnswer: answer,
        evaluation: data.answerEvaluation,
        answeredAt: new Date().toISOString(),
      };

      const updatedHistory = [...interviewHistory, exchange];
      setInterviewHistory(updatedHistory);

      if (data.newDifficulty) {
        setCurrentDifficulty(data.newDifficulty);
      }

      // If finished or no next question
      if (data.isComplete || !data.nextQuestion) {
        return {
          evaluation: data.answerEvaluation,
          nextQuestion: null,
          isFollowUp: false,
          newDifficulty: data.newDifficulty || currentDifficulty,
          isComplete: true,
          interviewerNote: data.interviewerNote,
        };
      }

      // Update for next question
      setCurrentQuestion(data.nextQuestion);
      setCurrentQuestionIndex((prev) => prev + 1);

      return {
        evaluation: data.answerEvaluation,
        nextQuestion: data.nextQuestion,
        isFollowUp: data.isFollowUp || false,
        newDifficulty: data.newDifficulty || currentDifficulty,
        isComplete: false,
        interviewerNote: data.interviewerNote,
      };
    } catch (err) {
      console.error('Answer evaluation error:', err);
      throw err;
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  // Step 4: Live Coding Round completion
  const handleCompleteCodingRound = (subs: CodingSubmission[]) => {
    setCodingSubmissions(subs);
    handleGenerateFinalEvaluation(subs);
  };

  // Step 5: Final evaluation generation
  const handleGenerateFinalEvaluation = async (overrideSubmissions?: CodingSubmission[]) => {
    const subsToSubmit = overrideSubmissions || codingSubmissions;

    if (!candidateAnalysis || !setupConfig || (interviewHistory.length === 0 && subsToSubmit.length === 0)) {
      alert('Cannot evaluate empty interview.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Lead Evaluator synthesizing multi-rubric performance report...');

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewHistory,
          candidateAnalysis,
          jobDescription: setupConfig.jobDescription,
          codingSubmissions: subsToSubmit,
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate final report.');
      }

      setFinalReport(data.report);
      setReportSource(data.source || 'gemini');
      setCurrentStep('evaluation');
    } catch (err) {
      console.error('Final evaluation error:', err);
      alert(err instanceof Error ? err.message : 'Evaluation synthesis failed.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className={`flex flex-col ${currentStep === 'coding' ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-slate-50 text-slate-900`}>
      {/* Global Navigation Header */}
      <Navbar
        currentStep={currentStep}
        onResetSession={handleResetSession}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={isServerKeyLocked || Boolean(apiKey)}
      />

      {/* Main Content Area based on Stage */}
      <main className={`flex-1 ${currentStep === 'coding' ? 'h-[calc(100vh-4rem)] overflow-hidden p-2 sm:p-3 flex flex-col' : ''}`}>
        {currentStep === 'landing' && (
          <>
            <LandingHero
              onStart={() => setCurrentStep('setup')}
              onSelectSamplePreset={handleSelectPreset}
            />
            <HowItWorks />
          </>
        )}

        {currentStep === 'setup' && (
          <SetupForm
            initialConfig={setupConfig || undefined}
            onSubmit={handleAnalyzeSetup}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
          />
        )}

        {currentStep === 'analysis' && candidateAnalysis && (
          <AnalysisDashboard
            analysis={candidateAnalysis}
            source={analysisSource}
            onStartInterview={handleStartInterview}
            onBackToSetup={() => setCurrentStep('setup')}
            isStarting={isLoading}
          />
        )}

        {currentStep === 'interview' && currentQuestion && setupConfig && (
          <InterviewConsole
            currentQuestion={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={allQuestions.length || setupConfig.questionCount}
            currentDifficulty={currentDifficulty}
            allQuestions={allQuestions}
            onSubmitAnswer={handleSubmitAnswer}
            onProceedToCoding={
              (setupConfig.selectedRounds?.includes('coding') || codingChallenges.length > 0)
                ? () => setCurrentStep('coding')
                : undefined
            }
            onFinishInterview={() => handleGenerateFinalEvaluation()}
            isEvaluating={isEvaluatingAnswer}
            candidateName={candidateAnalysis?.candidateName || 'Candidate'}
          />
        )}

        {currentStep === 'coding' && (
          <CodingRound
            challenges={codingChallenges.length > 0 ? codingChallenges : DEFAULT_CODING_CHALLENGES}
            onCompleteCodingRound={handleCompleteCodingRound}
            candidateName={candidateAnalysis?.candidateName || 'Candidate'}
          />
        )}

        {currentStep === 'evaluation' && finalReport && candidateAnalysis && (
          <EvaluationDashboard
            report={finalReport}
            analysis={candidateAnalysis}
            onRestart={handleResetSession}
            source={reportSource}
          />
        )}
      </main>

      {/* Global Footer */}
      {currentStep !== 'coding' && <Footer />}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        serverLockedIn={isServerKeyLocked}
        maskedServerKey={maskedServerKey}
      />
    </div>
  );
}
