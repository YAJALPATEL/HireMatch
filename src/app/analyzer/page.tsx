'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FileSearch,
  Sparkles,
  Target,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Lightbulb,
  ArrowRight,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { type AnalysisResult, type ResumeData, type WorkAuth } from '@/lib/types';
import {
  getResume,
  getWorkAuth,
  hashJD,
  getCachedAnalysis,
  cacheAnalysis,
  saveAnalysisToHistory,
  getAnalysisHistory,
  deleteAnalysisFromHistory,
  incrementUsuccessCount,
} from '@/lib/storage';
import { analyzeJD, trackAnalysis } from '@/lib/actions';

function SkeletonLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Title skeleton */}
      <div className="skeleton h-8 w-64 mb-2" />
      <div className="skeleton h-5 w-48" />
      
      {/* Progress bars skeleton */}
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card-static p-5">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-10 w-20 mb-3" />
            <div className="skeleton h-3 w-full" />
          </div>
        ))}
      </div>
      
      {/* Skills skeleton */}
      <div className="card-static p-6">
        <div className="skeleton h-5 w-32 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
      
      {/* Suggestions skeleton */}
      <div className="card-static p-6">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CircularProgress({ value, color, label }: { value: number; color: string; label: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-slate-100"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-white"
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <span className="text-sm font-medium text-indigo-300/80 mt-2">{label}</span>
    </div>
  );
}

export default function AnalyzerPage() {
  const { user } = useAuth();
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const [resume, setResumeState] = useState<ResumeData | null>(null);
  const [workAuth, setWorkAuthState] = useState<WorkAuth | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    (async () => {
      const savedResume = await getResume(userEmail);
      setResumeState(savedResume);
      
      const savedAuth = await getWorkAuth(userEmail);
      setWorkAuthState(savedAuth);
      
      setHistory(getAnalysisHistory());
    })();
  }, [user]);

  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim()) {
      toast.error('Please paste a job description');
      return;
    }
    if (!resume || !resume.rawText) {
      toast.error('Please set up your resume in the Dashboard first');
      return;
    }
    if (!workAuth) {
      toast.error('Please set your work authorization in the Dashboard');
      return;
    }

    const hash = hashJD(jdText);

    // Check cache first
    const cached = getCachedAnalysis(hash);
    if (cached) {
      setResult(cached);
      toast.success('Loaded from cache!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const analysis = await analyzeJD(resume, jdText, workAuth, hash);

      setResult(analysis);
      cacheAnalysis(hash, analysis);
      saveAnalysisToHistory(analysis);
      incrementUsuccessCount();
      setHistory(getAnalysisHistory());

      if (user) {
        trackAnalysis(user.id, user.emailAddresses?.[0]?.emailAddress || '');
      }

      toast.success('Analysis complete!');
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [jdText, resume, workAuth, user]);

  const handleJDChange = (value: string) => {
    setJdText(value);
    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const copyResults = () => {
    if (!result) return;
    const text = `HireMatch AI Analysis
━━━━━━━━━━━━━━━━━━━━
Role: ${result.roleTitle} at ${result.jdCompany}
Skill Match: ${result.skillMatch}%
Role Match: ${result.roleMatch}%
Overall: ${result.overallMatch}%
Eligibility: ${result.eligibility.toUpperCase()} - ${result.eligibilityReason}

Matched Skills: ${result.matchedSkills.join(', ')}
Missing Skills: ${result.missingSkills.join(', ')}

Suggestions:
${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Resume Improvements:
${result.resumeImprovements.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    toast.success('Results copied to clipboard!');
  };

  const exportPDF = async () => {
    if (!result) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(255, 107, 86);
      doc.text('HireMatch AI Analysis', 20, 25);

      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(new Date(result.timestamp).toLocaleString(), 20, 33);

      // Role info
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(`Role: ${result.roleTitle}`, 20, 48);
      doc.text(`Company: ${result.jdCompany}`, 20, 56);

      // Scores
      doc.setFontSize(12);
      doc.text(`Skill Match: ${result.skillMatch}%`, 20, 72);
      doc.text(`Role Match: ${result.roleMatch}%`, 20, 80);
      doc.text(`Overall Match: ${result.overallMatch}%`, 20, 88);

      // Eligibility
      doc.setFontSize(14);
      doc.text('Eligibility', 20, 104);
      doc.setFontSize(11);
      const eligColor = result.eligibility === 'allowed' ? [34, 197, 94] :
        result.eligibility === 'not_allowed' ? [239, 68, 68] : [245, 158, 11];
      doc.setTextColor(eligColor[0], eligColor[1], eligColor[2]);
      doc.text(`Status: ${result.eligibility.toUpperCase()}`, 20, 112);
      doc.setTextColor(100, 116, 139);
      doc.text(result.eligibilityReason, 20, 120, { maxWidth: 170 });

      // Skills
      let yPos = 138;
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Matched Skills', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(result.matchedSkills.join(', '), 20, yPos, { maxWidth: 170 });

      yPos += 16;
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Missing Skills', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(239, 68, 68);
      doc.text(result.missingSkills.join(', '), 20, yPos, { maxWidth: 170 });

      // Suggestions
      yPos += 16;
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Suggestions', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      result.suggestions.forEach((s, i) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${i + 1}. ${s}`, 20, yPos, { maxWidth: 170 });
        yPos += 8;
      });

      // Resume Improvements
      yPos += 8;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Resume Improvements', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      result.resumeImprovements.forEach((s, i) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${i + 1}. ${s}`, 20, yPos, { maxWidth: 170 });
        yPos += 8;
      });

      doc.save(`HireMatch_Analysis_${result.roleTitle.replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF exported!');
    } catch {
      toast.error('PDF export failed');
    }
  };

  const deleteFromHistory = (id: string) => {
    deleteAnalysisFromHistory(id);
    setHistory(getAnalysisHistory());
    toast.success('Removed from history');
  };

  const loadFromHistory = (analysis: AnalysisResult) => {
    setResult(analysis);
    setJdText(analysis.rawJD);
    setShowHistory(false);
    toast.success('Loaded past analysis');
  };

  const hasProfile = resume && resume.rawText && workAuth;

  const getEligibilityIcon = (eligibility: string) => {
    switch (eligibility) {
      case 'allowed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'not_allowed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getEligibilityColor = (eligibility: string): string => {
    switch (eligibility) {
      case 'allowed': return 'text-green-600 bg-green-50 border-green-100';
      case 'not_allowed': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 75) return '#36B5AC';
    if (score >= 50) return '#FFB06C';
    return '#FF6B56';
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob w-80 h-80 bg-slate-200 top-32 -right-16" />
        <div className="blob w-64 h-64 bg-success-200 bottom-20 -left-16" />
      </div>

      <main className="relative pt-28 pb-12 px-4 md:px-8 lg:px-12">
        <div className="w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-white">
                JD Analyzer
              </h1>
              <p className="text-indigo-300/80 mt-1">
                Paste a job description to see your match instantly.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-secondary text-sm py-2"
              >
                <Clock className="w-4 h-4" />
                History ({history.length})
              </button>
            </div>
          </motion.div>

          {/* No profile warning */}
          {!hasProfile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-indigo-950/40/60 border border-indigo-500/30/50 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-indigo-300/80 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Complete your profile first
                </p>
                <p className="text-sm text-indigo-300/80 mt-0.5">
                  You need to add your resume and work authorization before analyzing JDs.
                </p>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 mt-2 hover:text-primary-600">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="card-static p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Past Analyses</h3>
                  {history.length === 0 ? (
                    <p className="text-sm text-indigo-300/80 italic">No analyses yet. Paste a JD below to get started!</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40/50 hover:bg-slate-900 transition-colors group"
                        >
                          <button
                            onClick={() => loadFromHistory(item)}
                            className="flex-1 text-left"
                          >
                            <div className="font-medium text-sm text-indigo-100">
                              {item.jdTitle} at {item.jdCompany}
                            </div>
                            <div className="text-xs text-indigo-300/80 mt-0.5">
                              {new Date(item.timestamp).toLocaleDateString()} · Overall: {item.overallMatch}%
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFromHistory(item.id);
                            }}
                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* JD Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-static p-6 md:p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-accent-500" />
                Job Description
              </h2>
              {result && (
                <button
                  onClick={() => {
                    setJdText('');
                    setResult(null);
                  }}
                  className="text-sm text-indigo-300/80 hover:text-indigo-200 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={jdText}
              onChange={(e) => handleJDChange(e.target.value)}
              placeholder="Paste the full job description here...&#10;&#10;Example: We are looking for a Senior Software Engineer with experience in React, TypeScript, and AWS..."
              className="textarea min-h-[200px] mb-4"
              disabled={loading}
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                onClick={handleAnalyze}
                disabled={loading || !jdText.trim() || !hasProfile}
                className="btn-primary text-base py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Match
                  </>
                )}
              </button>

              {result && (
                <div className="flex gap-2">
                  <button onClick={copyResults} className="btn-secondary text-sm py-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button onClick={exportPDF} className="btn-secondary text-sm py-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="card-static p-6 md:p-8">
              <SkeletonLoader />
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                {/* Title */}
                <div className="card-static p-6 md:p-8 mb-6">
                  <h2 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
                    {result.roleTitle}
                  </h2>
                  <p className="text-indigo-300/80 mt-1">{result.jdCompany}</p>
                </div>

                {/* Score Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="card-static p-6 flex flex-col items-center"
                  >
                    <CircularProgress
                      value={result.skillMatch}
                      color={getScoreColor(result.skillMatch)}
                      label="Skill Match"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card-static p-6 flex flex-col items-center"
                  >
                    <CircularProgress
                      value={result.roleMatch}
                      color={getScoreColor(result.roleMatch)}
                      label="Role Fit"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card-static p-6 flex flex-col items-center"
                  >
                    <CircularProgress
                      value={result.overallMatch}
                      color={getScoreColor(result.overallMatch)}
                      label="Overall Match"
                    />
                  </motion.div>
                </div>

                {/* Eligibility */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`rounded-xl p-5 mb-6 border ${getEligibilityColor(result.eligibility)}`}
                >
                  <div className="flex items-start gap-3">
                    {getEligibilityIcon(result.eligibility)}
                    <div>
                      <h3 className="font-semibold">
                        Eligibility: {result.eligibility === 'allowed' ? 'Allowed' :
                          result.eligibility === 'not_allowed' ? 'Not Allowed' : 'Unclear'}
                      </h3>
                      <p className="text-sm mt-1 opacity-80">{result.eligibilityReason}</p>
                      {result.visaRequirement !== 'Not specified' && (
                        <p className="text-xs mt-2 opacity-60">
                          JD Requirement: {result.visaRequirement}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid md:grid-cols-2 gap-4 mb-6"
                >
                  {/* Matched Skills */}
                  <div className="card-static p-6">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-500" />
                      Matched Skills ({result.matchedSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill) => (
                        <span key={skill} className="badge badge-accent">{skill}</span>
                      ))}
                      {result.matchedSkills.length === 0 && (
                        <p className="text-sm text-indigo-300/80 italic">No matching skills found</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="card-static p-6">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-primary-500" />
                      Missing Skills ({result.missingSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill) => (
                        <span key={skill} className="badge badge-red">{skill}</span>
                      ))}
                      {result.missingSkills.length === 0 && (
                        <p className="text-sm text-indigo-300/80 italic">No gaps found — great match!</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="card-static p-6 mb-4"
                >
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="w-full flex items-center justify-between"
                  >
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-300/80" />
                      Application Suggestions ({result.suggestions.length})
                    </h3>
                    {showSuggestions ? <ChevronUp className="w-5 h-5 text-indigo-300/80" /> : <ChevronDown className="w-5 h-5 text-indigo-300/80" />}
                  </button>
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        {result.suggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-950/40/30">
                            <span className="text-xs font-bold text-indigo-300/80 bg-indigo-950/40 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-indigo-200 leading-relaxed">{suggestion}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Resume Improvements */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card-static p-6"
                >
                  <button
                    onClick={() => setShowImprovements(!showImprovements)}
                    className="w-full flex items-center justify-between"
                  >
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary-500" />
                      Resume Improvements ({result.resumeImprovements.length})
                    </h3>
                    {showImprovements ? <ChevronUp className="w-5 h-5 text-indigo-300/80" /> : <ChevronDown className="w-5 h-5 text-indigo-300/80" />}
                  </button>
                  <AnimatePresence>
                    {showImprovements && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        {result.resumeImprovements.map((improvement, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary-500/5">
                            <span className="text-xs font-bold text-primary-500 bg-primary-500/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-indigo-200 leading-relaxed">{improvement}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
