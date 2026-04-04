'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    // Simulate brief delay
    await new Promise(r => setTimeout(r, 600));
    signIn(email, email.split('@')[0]);
    toast.success('Welcome back!');
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg-hero flex items-center justify-center px-4">
      {/* Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob w-96 h-96 bg-slate-200 top-20 -right-20" />
        <div className="blob w-80 h-80 bg-success-200 bottom-40 -left-20" />
        <div className="blob w-60 h-60 bg-primary-400/15 top-1/2 left-1/4" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] text-white">
              Hire<span className="gradient-text">Match</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center text-white font-[family-name:var(--font-display)] mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-indigo-300/80 text-sm mb-8">
            Sign in to analyze job descriptions
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300/80" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300/80" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300/80 hover:text-indigo-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-indigo-300/80 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up"
              className="text-primary-500 font-medium hover:text-primary-600 transition-colors"
            >
              Sign Up
            </Link>
          </p>

          <div className="mt-4 p-3 rounded-xl bg-accent-500/5 border border-accent-500/10 text-center">
            <p className="text-xs text-indigo-300/80">
              <span className="font-medium text-accent-600">Demo Mode:</span> Enter any email to sign in
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
