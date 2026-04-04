'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, Eye, EyeOff, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.fullName.trim()) {
      toast.error('Complete all fields');
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    signIn(formData.email, formData.fullName);
    toast.success('Registration successful!');
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030310] flex items-center justify-center px-4 relative overflow-hidden font-[family-name:var(--font-sans)]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-900/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="glass-strong rounded-[32px] p-8 md:p-12 border border-white/10 shadow-2xl overflow-hidden relative group">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-primary-500 to-transparent opacity-30 shadow-[0_4px_24px_rgba(79,70,229,0.5)]" />

          {/* Brand Header */}
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="group mb-6">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center border border-white/10 transition-all shadow-lg">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight font-[family-name:var(--font-display)]">
              Create Account
            </h1>
            <p className="text-indigo-300/60 mt-2 text-center text-sm font-medium">
              Join thousands optimizing their career search
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all text-sm font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all text-sm font-medium"
                  placeholder="j.doe@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1">
                Secure Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all text-sm font-medium"
                  placeholder="Master key"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-2xl p-[1px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:opacity-90 transition-opacity" />
              <div className="relative bg-[#0a0a1a]/90 rounded-[15px] py-4 flex items-center justify-center gap-2 text-white group-hover:bg-transparent transition-all">
                {loading ? (
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                ) : (
                  <>
                    Initialize Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-indigo-300/40 font-medium pb-2">
            Already registered?{' '}
            <Link href="/sign-in" className="text-white hover:text-primary-400 transition-colors font-bold underline underline-offset-4 decoration-primary-500/30">
              Access your vault
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white/[0.01] border border-white/5 opacity-60">
            <Heart className="w-3.5 h-3.5 text-rose-500/60" />
            <p className="text-[10px] text-indigo-200/40 font-bold uppercase tracking-widest">
              Built for precision job mapping
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
