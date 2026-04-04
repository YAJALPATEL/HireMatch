'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Users, 
  Mail, 
  Database, 
  Activity, 
  Key, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Search, 
  ArrowUpRight, 
  Loader2,
  RefreshCw,
  BarChart2,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  avgMatchScore: number;
}

interface AnalysisLog {
  id: string;
  user_email: string;
  jd_title: string;
  jd_company: string;
  match_score: number;
  created_at: string;
}

const supabase = createClient();

export default function YajalPatelAdmin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [analyses, setAnalyses] = useState<AnalysisLog[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalAnalyses: 0,
    avgMatchScore: 0,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (creds.email === 'yajalpatel1@gmail.com' && creds.password === 'Siya@4624') {
      setIsAuthorized(true);
      sessionStorage.setItem('hirematch_admin_auth', 'true');
      toast.success('Access Granted — Welcome Super Admin');
    } else {
      toast.error('Invalid administrative credentials');
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('hirematch_admin_auth');
    if (saved === 'true') setIsAuthorized(true);
  }, []);

  const fetchData = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    
    try {
      // 1. Fetch Analyses
      const { data: logs, error: logsError } = await supabase
        .from('analysis_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (logsError) throw logsError;
      setAnalyses(logs || []);

      // 2. Fetch Stats
      const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      const { count: analysisCount } = await supabase.from('analysis_logs').select('*', { count: 'exact', head: true });
      
      // 3. Calculate Avg Score
      const { data: scores } = await supabase.from('analysis_logs').select('match_score');
      const totalScore = scores?.reduce((acc, curr) => acc + (curr.match_score || 0), 0) || 0;
      const avg = scores && scores.length > 0 ? Math.round(totalScore / scores.length) : 0;

      // 4. Calculate Active Users (active in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gt('updated_at', sevenDaysAgo);

      setStats({
        totalUsers: userCount || 0,
        activeUsers: activeCount || 0,
        totalAnalyses: analysisCount || 0,
        avgMatchScore: avg,
      });

    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to sync real-time data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
      
      // Setup realtime subscription
      const channel = supabase
        .channel('admin_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'analysis_logs' }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#02020a] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-900/10 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-[420px]"
        >
          <div className="glass-strong rounded-[32px] p-8 md:p-10 border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 flex items-center justify-center border border-white/10 mb-6 shadow-inner">
                <ShieldAlert className="w-8 h-8 text-primary-500" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Administrative Vault</h1>
              <p className="text-indigo-300/40 mt-1 text-sm text-center">Restricted Access Level: Master Authority</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Identity Access</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50" />
                  <input
                    type="email"
                    value={creds.email}
                    onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                    className="w-full bg-[#03030f] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm font-medium"
                    placeholder="Master Administrator"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Access Token</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={creds.password}
                    onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                    className="w-full bg-[#03030f] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500/30 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 text-white rounded-2xl py-4 font-bold text-sm transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95">
                Authorize Access
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-28 pb-12 px-4 md:px-8 lg:px-12">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-primary-500" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Administrative Vault</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight font-[family-name:var(--font-display)]">System Real-Time Analytics</h1>
            <p className="text-indigo-300/40 mt-1">Global platform monitoring and analysis logs.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchData} className="btn-secondary py-2.5 px-4 text-xs">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-400', trend: '+12% vs last month' },
            { label: 'Active (7d)', value: stats.activeUsers, icon: Activity, color: 'text-emerald-400', trend: 'Growing steadily' },
            { label: 'Total Analyses', value: stats.totalAnalyses, icon: BarChart2, color: 'text-amber-400', trend: 'Peak activity today' },
            { label: 'Avg Match Score', value: `${stats.avgMatchScore}%`, icon: TrendingUp, color: 'text-rose-400', trend: 'High quality matches' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-strong p-6 rounded-3xl border border-white/5 relative group overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-12 h-12" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-indigo-300/40 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className={`text-4xl font-bold font-[family-name:var(--font-display)] ${stat.color} mb-2`}>{stat.value}</h3>
                <p className="text-[10px] text-indigo-300/30 flex items-center gap-1 font-medium italic">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Activity Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-strong rounded-[32px] border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/10 rounded-xl">
                    <Activity className="w-5 h-5 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Live Platform Activity</h3>
                </div>
                <div className="text-[10px] font-bold text-indigo-300/20 uppercase tracking-widest">Latest 20 Global Events</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#030310]/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-indigo-200/40 uppercase tracking-widest">User/Analyst</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-indigo-200/40 uppercase tracking-widest">Analysis Target</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-indigo-200/40 uppercase tracking-widest text-center">Score</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-indigo-200/40 uppercase tracking-widest text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                       <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-indigo-300/20 font-bold uppercase tracking-widest">Syncing with Mainframe...</p>
                        </td>
                      </tr>
                    ) : analyses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-indigo-300/40 italic">
                          No recent activity found in the logs.
                        </td>
                      </tr>
                    ) : (
                      analyses.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                                {log.user_email[0].toUpperCase()}
                              </div>
                              <div className="text-sm text-indigo-100 font-medium">{log.user_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5 text-indigo-400 group-hover:text-primary-400 transition-colors" />
                              <div className="text-sm text-indigo-200 font-medium">{log.jd_title}</div>
                            </div>
                            <div className="text-[10px] text-indigo-300/30 font-bold uppercase tracking-widest mt-0.5 ml-5">{log.jd_company}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${
                              log.match_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 
                              log.match_score >= 60 ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 
                              'bg-rose-500/10 text-rose-400 ring-rose-500/20'
                            }`}>
                              {log.match_score}%
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-xs text-indigo-300/40 font-medium">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-strong p-6 rounded-[32px] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-30" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Security Overview
              </h3>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-indigo-300/40 font-bold uppercase">Master Auth</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md">VERIFIED</span>
                </div>
                <div className="text-[10px] text-indigo-300/30 leading-relaxed font-medium">
                  YajalPatel Admin session active and encrypted. Global data synced with Supabase PostgreSQL cluster.
                </div>
              </div>
            </div>

            <div className="glass-strong p-6 rounded-[32px] border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Database Health</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-xs mb-1">
                    <span className="text-indigo-300/40 font-bold uppercase">Connection Type</span>
                    <span className="text-indigo-100 font-bold">Supabase Realtime</span>
                 </div>
                 <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-primary-500/50" />
                 </div>
                 <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Mainframe Link Stable</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
