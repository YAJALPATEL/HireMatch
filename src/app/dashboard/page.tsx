'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code,
  ShieldCheck,
  AlertCircle,
  FileText,
  UploadCloud,
  FileSearch,
  Trash2,
  File,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { type ResumeData, type WorkAuth, WORK_AUTH_OPTIONS } from '@/lib/types';
import { saveResume, getResume, saveWorkAuth, getWorkAuth } from '@/lib/storage';
import { extractTextFromFile } from '@/lib/fileParser';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [workAuth, setWorkAuthState] = useState<WorkAuth>(WORK_AUTH_OPTIONS[0]);
  const [saved, setSaved] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    // Using an async IIFE to avoid creating a new effect dependency
    (async () => {
      const savedResume = await getResume(userEmail);
      if (savedResume) {
        setResume(savedResume);
      }
      const savedAuth = await getWorkAuth(userEmail);
      if (savedAuth) {
        setWorkAuthState(savedAuth);
      }
    })();
  }, [user]);

  const handleSave = () => {
    if (!resume) {
      toast.error('Please upload a resume first');
      return;
    }
    const updatedResume = {
      ...resume,
      updatedAt: new Date().toISOString(),
    };
    
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    saveResume(updatedResume, userEmail);
    saveWorkAuth(workAuth, userEmail);
    
    setSaved(true);
    toast.success('Profile saved successfully!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB allowed.');
      setIsParsing(false);
      return;
    }

    try {
      toast.loading('Deep analyzing document via AI...', { id: 'parsing' });
      const rawText = await extractTextFromFile(file);
      
      // Call our new Deep AI Extraction endpoint
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      let parsed;
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.warn("Backend Error Data:", errorData);
        // Fallback to static parsing so the user is never completely blocked
        toast.error(`AI Extractor Error: ${errorData?.details || 'Unknown API failure'}. Falling back manually.`);
        parsed = {
          fullName: 'Fallback Parse',
          summary: 'The AI endpoint failed. Please check your OpenRouter API Key.',
          skills: ['Fallback Skill 1'],
        };
      } else {
        parsed = await response.json();
      }
      
      const newResume: ResumeData = {
        fullName: parsed.fullName || user?.fullName || 'Extracted User',
        email: parsed.email || user?.emailAddresses?.[0]?.emailAddress || '',
        phone: parsed.phone || '',
        summary: parsed.summary || 'Summary auto-extracted from resume.',
        skills: parsed.skills || [],
        experience: parsed.experience || 'Experience automatically parsed.',
        education: parsed.education || 'Education automatically parsed.',
        rawText: rawText,
        updatedAt: new Date().toISOString(),
      };
      
      setResume(newResume);
      toast.success('Resume thoroughly analyzed!', { id: 'parsing' });
    } catch (err: any) {
      console.error('Extraction error:', err);
      toast.error(`Error processing file: ${err.messuccess}`, { id: 'parsing' });
    } finally {
      setIsParsing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleFileUpload(file);
    }
  };

  const startUpload = () => fileInputRef.current?.click();

  const handleClearResume = () => {
    setResume(null);
    localStorage.removeItem('hirematch_resume');
    toast.success('Resume cleared');
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob w-80 h-80 bg-primary-100 top-32 -right-16" />
        <div className="blob w-64 h-64 bg-accent-100 bottom-20 -left-16" />
      </div>

      <main className="relative pt-28 pb-12 px-4 md:px-8 lg:px-12">
        <div className="w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-white">
                Data Hub
              </h1>
              <p className="text-indigo-300/80 mt-1">
                Upload your document once. We extract and process all required context automatically.
              </p>
            </div>
            
            <button
              onClick={handleSave}
              className={`btn-primary text-base py-3 px-8 ${saved ? 'bg-green-500' : ''}`}
              disabled={saved || !resume}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Context
                </>
              )}
            </button>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: Work Auth & Upload Hub */}
            <div className="lg:col-span-4 space-y-6">
              {/* Work Authorization Card */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="card-static p-6 md:p-8"
              >
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success-500" />
                  Work Authorization Status
                </h2>

                <select
                  value={workAuth.status}
                  onChange={(e) => {
                    const selected = WORK_AUTH_OPTIONS.find(opt => opt.status === e.target.value);
                    if (selected) setWorkAuthState(selected);
                  }}
                  className="select"
                >
                  {WORK_AUTH_OPTIONS.map((opt) => (
                    <option key={opt.status} value={opt.status}>
                      {opt.label} {opt.requiresSponsorship ? '(Requires Sponsorship)' : '(No Sponsorship)'}
                    </option>
                  ))}
                </select>

                <div className="mt-4 flex items-center gap-2">
                  {workAuth.requiresSponsorship ? (
                    <div className="flex items-start gap-2 bg-indigo-950/40/50 p-3 rounded-xl border border-indigo-500/20">
                      <AlertCircle className="w-4 h-4 text-indigo-300/80 shrink-0 mt-0.5" />
                      <span className="text-sm text-indigo-200">
                        Sponsorship requirements will be aggressively matched against JD eligibility clauses.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 bg-success-50 p-3 rounded-xl border border-success-100">
                      <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-indigo-200">
                        Will be matched freely with "US citizens or authorized to work" roles.
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Upload Card */}
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="card-static p-6 md:p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    Resume Document
                  </h2>
                  {resume && (
                    <button onClick={handleClearResume} className="text-red-400 hover:text-red-600 p-2 tooltip group transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.txt" 
                  onChange={onFileChange} 
                />

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={startUpload}
                  className={`
                    border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center
                    transition-all cursor-pointer text-center min-h-[220px]
                    ${isDragging ? 'border-primary-400 bg-primary-500/5' : 'border-indigo-500/30 hover:border-slate-300 hover:bg-indigo-950/40/50'}
                    ${isParsing ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {isParsing ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-primary-500 animate-spin mb-4" />
                      <p className="font-medium text-indigo-100">Deep Analyzing...</p>
                      <p className="text-sm text-indigo-300/80 mt-1">Extracting skills & context</p>
                    </div>
                  ) : resume ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-accent-500" />
                      </div>
                      <p className="font-semibold text-white">Ready for Matchmaking</p>
                      <p className="text-sm text-indigo-300/80 mt-1">Click or drag a new file to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4 text-primary-500">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className="font-semibold text-white">Upload Data Document</p>
                      <p className="text-sm text-indigo-300/80 mt-1">Drag file here or click to browse</p>
                      <div className="flex gap-2 mt-4">
                        <span className="badge badge-slate text-[10px]">.PDF</span>
                        <span className="badge badge-accent text-[10px]">.DOCX</span>
                        <span className="badge badge-success text-[10px]">.TXT</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column: Parsed Results Panel */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {resume ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-static h-full flex flex-col"
                  >
                    <div className="p-6 md:p-8 border-b border-indigo-500/20 flex items-center gap-4 bg-indigo-950/40/50 rounded-t-[calc(var(--radius-lg)-1px)]">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-white shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{resume.fullName}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-indigo-300/80 mt-1">
                          {resume.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {resume.email}</span>}
                          {resume.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {resume.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300/80 mb-4 flex items-center gap-2">
                            <Code className="w-4 h-4 text-primary-500" /> Extracted Skills Snapshot
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {resume.skills.length > 0 ? (
                              resume.skills.map(skill => (
                                <span key={skill} className="badge badge-accent">{skill}</span>
                              ))
                            ) : (
                              <p className="text-sm text-indigo-300/80 italic">No hard skills extracted directly. AI will use fuzzy context.</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300/80 mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-300/80" /> Parsed Context Points
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2 bg-indigo-950/40/50 p-3 rounded-lg border border-indigo-500/20">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-sm text-indigo-100">Resume Length: {resume.rawText.length} characters successfully mapped to AI memory buffer.</span>
                            </div>
                            <div className="flex items-start gap-2 bg-indigo-950/40/50 p-3 rounded-lg border border-indigo-500/20">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-sm text-indigo-100">Ready for semantic JD correlation. AI will evaluate hidden traits automatically.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300/80 mb-4 flex items-center gap-2">
                           <File className="w-4 h-4 text-success-500" /> Raw Extraction Preview
                        </h3>
                        <div className="bg-indigo-950/40/50 rounded-xl p-4 border border-indigo-500/20 max-h-60 overflow-y-auto">
                          <pre className="text-xs text-indigo-300/80 whitespace-pre-wrap font-[family-name:var(--font-sans)] leading-relaxed">
                            {resume.rawText.substring(0, 1000)}
                            {resume.rawText.length > 1000 && '\n\n[... Remaining content injected directly to AI model workspace ...]'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-static h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-indigo-950/40/50 border-dashed border-2 text-center"
                  >
                    <div className="w-20 h-20 bg-indigo-950/40 rounded-full flex flex-col items-center justify-center mb-4 text-indigo-200">
                      <FileSearch className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-indigo-100 mb-2">No Document Available</h3>
                    <p className="text-indigo-300/80 max-w-sm">
                      When you upload your resume document, our advanced system will parse and extract everything required to match against job descriptions.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
