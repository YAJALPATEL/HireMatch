'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FileSearch,
  Shield,
  Zap,
  Target,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Brain,
  Globe,
  LayoutDashboard,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  }),
};

const features = [
  {
    icon: Target,
    title: 'Skill Match Analysis',
    description: 'See exactly which skills you match and which ones you need to develop.',
    color: 'primary',
  },
  {
    icon: BarChart3,
    title: 'Role Fit Score',
    description: 'Get a comprehensive percentage match for how well you fit the role.',
    color: 'accent',
  },
  {
    icon: Shield,
    title: 'Eligibility Check',
    description: 'Instantly know if your work authorization meets the job requirements.',
    color: 'success',
  },
  {
    icon: Brain,
    title: 'AI Suggestions',
    description: 'Receive personalized recommendations to improve your application.',
    color: 'slate',
  },
];

const steps = [
  { num: '01', title: 'Upload Your Resume', desc: 'Paste or type your resume details once. We store it locally for instant reuse.' },
  { num: '02', title: 'Set Work Authorization', desc: 'Select your US work authorization status for accurate eligibility checks.' },
  { num: '03', title: 'Paste Any Job Description', desc: 'Copy-paste any JD and get instant AI-powered analysis in under 3 seconds.' },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  return (
    <div className="min-h-screen gradient-bg-hero">
      <Navbar />

      {/* Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob w-96 h-96 bg-primary-500/20 top-20 -right-20" />
        <div className="blob w-80 h-80 bg-accent-500/10 bottom-40 -left-20" />
        <div className="blob w-72 h-72 bg-primary-600/10 top-1/2 left-1/3" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="w-full max-w-full 2xl:max-w-[1600px] mx-auto px-4 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-indigo-200">
              AI-Powered Job Matching — Free Forever
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-display)] leading-tight mb-6"
          >
            Know Your{' '}
            <span className="gradient-text">Match</span>
            <br />
            Before You Apply
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-indigo-300/80 w-full max-w-full 2xl:max-w-[1600px] mx-auto px-4 lg:px-12 mb-10 leading-relaxed"
          >
            Paste any job description and instantly see your skill match, role fit,
            work authorization eligibility, and AI-powered improvement suggestions.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="btn-primary text-base py-3 px-8 group">
                  Go to Dashboard
                  <LayoutDashboard className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-2" />
                </Link>
                <Link href="/analyzer" className="btn-secondary text-base py-3 px-8">
                  Run New Analysis
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-up" className="btn-primary text-base py-3 px-8 group">
                  Start Analyzing Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/sign-in" className="btn-secondary text-base py-3 px-8">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            {[
              { label: 'Analyses Run', value: '10K+' },
              { label: 'Avg Match Time', value: '<3s' },
              { label: 'Free Forever', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text-warm">{stat.value}</div>
                <div className="text-sm text-indigo-300/80 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="relative py-16 px-4">
        <div className="w-full max-w-full 2xl:max-w-[1600px] mx-auto px-4 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#030310] rounded-3xl p-8 md:p-12 border border-indigo-500/20 shadow-2xl shadow-primary-500/10 relative overflow-hidden"
          >
            {/* Inner Dark Graphical Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-accent-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left - Input */}
              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-indigo-300/80 uppercase tracking-wider mb-4">
                  Paste Job Description
                </h3>
                <div className="bg-[#09091A] rounded-xl p-5 border border-indigo-500/20/80 text-sm text-indigo-300/80 leading-relaxed h-48 overflow-hidden shadow-inner">
                  <p className="font-medium text-indigo-100 mb-2">Senior Frontend Engineer at TechCorp</p>
                  <p>We are looking for a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and Next.js. Must have strong experience with...</p>
                  <p className="mt-2 text-indigo-300/80 font-mono text-xs">Required: React, TypeScript, Next.js, GraphQL, AWS, CI/CD, Agile...</p>
                </div>
              </div>

              {/* Right - Output */}
              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-indigo-300/80 uppercase tracking-wider mb-4">
                  Instant Analysis
                </h3>
                <div className="space-y-4">
                  {/* Skill Match */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-indigo-200">Skill Match</span>
                      <span className="font-bold text-primary-400">82%</span>
                    </div>
                    <div className="progress-bar !bg-indigo-950/40">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '82%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                        className="progress-fill progress-fill-primary"
                      />
                    </div>
                  </div>
                  {/* Role Match */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-indigo-200">Role Fit</span>
                      <span className="font-bold text-accent-400">74%</span>
                    </div>
                    <div className="progress-bar !bg-indigo-950/40">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '74%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7, duration: 1.2, ease: 'easeOut' }}
                        className="progress-fill progress-fill-accent"
                      />
                    </div>
                  </div>
                  {/* Eligibility */}
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-5 h-5 text-success-400" />
                    <span className="text-sm font-medium text-indigo-200">Eligible — No sponsorship required</span>
                  </div>
                  {/* Missing Skills */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge badge-red">GraphQL</span>
                    <span className="badge badge-red">AWS</span>
                    <span className="badge badge-accent">CI/CD ✓</span>
                    <span className="badge badge-accent">React ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 px-4">
        <div className="w-full max-w-full 2xl:max-w-[1600px] mx-auto px-4 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Land the Job</span>
            </h2>
            <p className="text-indigo-300/80 max-w-xl mx-auto">
              Powerful AI analysis in seconds, completely free.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="card p-6"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color === 'primary'
                      ? 'bg-primary-500/10'
                      : feature.color === 'accent'
                        ? 'bg-accent-500/10'
                        : feature.color === 'success'
                          ? 'bg-success-400/20'
                          : 'bg-slate-300/20'
                    }`}
                >
                  <feature.icon
                    className={`w-6 h-6 ${feature.color === 'primary'
                        ? 'text-primary-500'
                        : feature.color === 'accent'
                          ? 'text-accent-500'
                          : feature.color === 'success'
                            ? 'text-success-500'
                            : 'text-indigo-300/80'
                      }`}
                  />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-indigo-300/80 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="w-full max-w-full 2xl:max-w-[1600px] mx-auto px-4 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-4">
              Three Steps to{' '}
              <span className="gradient-text-warm">Your Match</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-strong rounded-2xl p-6 md:p-8 flex items-start gap-6"
              >
                <div className="text-3xl font-bold gradient-text-warm shrink-0 w-14">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-indigo-300/80 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Theme CTA & Footer (30% Dark Rule) */}
      <div className="bg-[#030310] relative text-white border-t border-indigo-500/20 overflow-hidden">
        {/* Ambient Dark Graphics */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* CTA */}
        <section className="relative py-24 px-4 z-10">
          <div className="w-full max-w-full 2xl:max-w-[1600px] mx-auto px-4 lg:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#09091A]/80 backdrop-blur-3xl border border-indigo-500/20 shadow-2xl shadow-primary-500/5 rounded-3xl p-12 relative overflow-hidden"
            >
              <Globe className="w-12 h-12 text-accent-500 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-4 text-white">
                Ready to Find Your{' '}
                <span className="gradient-text">Perfect Match</span>?
              </h2>
              <p className="text-indigo-300/80 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                Join thousands of job seekers using HireMatch AI matching to land better roles, securely and freely.
              </p>
              <Link href="/sign-up" className="btn-primary text-lg py-4 px-10 group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started — It&apos;s Free
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-10 px-4 border-t border-indigo-500/20/80 z-10 bg-[#030310]/50">
          <div className="w-full max-w-full 2xl:max-w-[1600px] mx-auto px-4 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-indigo-100 tracking-tight">
                HireMatch AI
              </span>
            </div>
            <p className="text-sm text-indigo-300/80 font-medium">
              © {new Date().getFullYear()} HireMatch AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
