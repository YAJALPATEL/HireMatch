'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

const supabase = createClient();

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Complete all credentials');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Access Granted — Welcome to HireMatch');
        router.push('/dashboard');
        router.refresh(); // Refresh layout to pick up new session
      }
    } catch (e) {
      toast.error('Identity verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030310] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-900/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="glass-strong rounded-[32px] p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="group mb-6">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center border border-white/10 group-hover:border-primary-500/30 transition-all shadow-lg">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight font-[family-name:var(--font-display)]">
              Vault Login
            </h1>
            <p className="text-indigo-300/60 mt-2 text-center text-sm font-medium italic">
              Synchronizing secure credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1">Identity Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all text-sm font-medium"
                  placeholder="vault@mainframe.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider">Access Token</label>
                <button type="button" className="text-[11px] font-bold text-primary-400 hover:text-primary-300">
                  Retrieve?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400/30 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-2xl p-[1px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:opacity-90" />
              <div className="relative bg-[#0a0a1a]/90 backdrop-blur-xl rounded-[15px] py-4 flex items-center justify-center gap-2 text-white group-hover:bg-transparent transition-all">
                {loading ? <Sparkles className="w-5 h-5 animate-spin-slow" /> : (
                  <>Authorize Access <ArrowRight className="w-4 h-4 group-hover:translate-x-1" /></>
                )}
              </div>
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-indigo-300/40 font-medium">
            Identity missing?{' '}
            <Link href="/sign-up" className="text-white hover:text-primary-400 font-bold underline underline-offset-4 decoration-primary-500/30">
              Initialize New Account
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/60" />
            <p className="text-[10px] text-indigo-200/40 font-bold tracking-widest uppercase italic">
              Mainframe Security Protocol: Genuine Auth Active
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
