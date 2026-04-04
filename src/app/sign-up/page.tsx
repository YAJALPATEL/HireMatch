'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, Eye, EyeOff, ShieldCheck, Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

const supabase = createClient();

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.fullName.trim() || !formData.password) {
      toast.error('Complete all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Registration Initiated — Verify your email');
        router.push('/sign-in');
      }
    } catch (e) {
      toast.error('Identity creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030310] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-900/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="glass-strong rounded-[32px] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-primary-500 to-transparent opacity-30 shadow-[0_4px_24px_rgba(79,70,229,0.5)]" />

          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="group mb-6">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center border border-white/10 transition-all shadow-lg">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight font-[family-name:var(--font-display)]">
              Initialize Vault
            </h1>
            <p className="text-indigo-300/60 mt-2 text-center text-sm font-medium">
              Create your secure administrative profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1">Identity Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all text-sm font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1">Identity Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all text-sm font-medium"
                  placeholder="j.doe@mainframe.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1">Master Access Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-indigo-400/50 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:opacity-90 transition-opacity" />
              <div className="relative bg-[#0a0a1a]/90 rounded-[15px] py-4 flex items-center justify-center gap-2 text-white group-hover:bg-transparent transition-all">
                {loading ? <Sparkles className="w-5 h-5 animate-spin-slow" /> : (
                  <>Create Secure Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1" /></>
                )}
              </div>
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-indigo-300/40 font-medium">
            Identity already exists?{' '}
            <Link href="/sign-in" className="text-white hover:text-primary-400 font-bold underline underline-offset-4 decoration-primary-500/30">
              Access Your Profile
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
            <Heart className="w-3.5 h-3.5 text-rose-500/80" />
            <p className="text-[10px] text-indigo-200/30 font-bold uppercase tracking-widest leading-none">
              Built for precision job mapping
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
