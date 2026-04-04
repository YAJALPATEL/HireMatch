import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
import { type ResumeData, type WorkAuth } from './types';

// Fallback LocalStorage approach
const RESUME_KEY = 'hirematch_resume';
const WORK_AUTH_KEY = 'hirematch_auth';

export async function saveResume(data: ResumeData, email?: string): Promise<boolean> {
  // 1. Try Supabase if configured and we have an email
  if (supabase && email) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          email: email, 
          full_name: data.fullName,
          resume_data: data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
        
      if (!error) return true;
      console.warn("Supabase save failed, falling back to local storage:", error.messuccess);
    } catch (e) {
      console.warn("Supabase integration error.", e);
    }
  }

  // 2. Fallback to LocalStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(RESUME_KEY, JSON.stringify(data));
    return true;
  }
  return false;
}

export async function getResume(email?: string): Promise<ResumeData | null> {
  // 1. Try Supabase
  if (supabase && email) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('resume_data')
        .eq('email', email)
        .single();
        
      if (data && data.resume_data && !error) return data.resume_data as ResumeData;
    } catch (e) {
      console.warn("Supabase get failed. Trying local storage.", e);
    }
  }

  // 2. Fallback to LocalStorage
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(RESUME_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export async function saveWorkAuth(data: WorkAuth, email?: string): Promise<boolean> {
  if (supabase && email) {
    try {
      await supabase
        .from('user_profiles')
        .upsert({ email: email, work_auth: data }, { onConflict: 'email' });
    } catch(e) {}
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(WORK_AUTH_KEY, JSON.stringify(data));
    return true;
  }
  return false;
}

export async function getWorkAuth(email?: string): Promise<WorkAuth | null> {
  if (supabase && email) {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('work_auth')
        .eq('email', email)
        .single();
      if (data && data.work_auth) return data.work_auth as WorkAuth;
    } catch(e) {}
  }

  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(WORK_AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

// === History & Caching (Kept in LocalStorage for Speed, or adapt to Supabase) ===

export function hashJD(jd: string): string {
  let hash = 0;
  for (let i = 0; i < jd.length; i++) {
    const char = jd.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

export function cacheAnalysis(hash: string, analysis: any): void {
  if (typeof window !== 'undefined') {
    const cached = getCachedAnalyses();
    cached[hash] = analysis;
    localStorage.setItem('hirematch_analyzer_cache', JSON.stringify(cached));
  }
}

export function getCachedAnalysis(hash: string): any | null {
  if (typeof window !== 'undefined') {
    const cached = getCachedAnalyses();
    return cached[hash] || null;
  }
  return null;
}

function getCachedAnalyses(): Record<string, any> {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('hirematch_analyzer_cache');
    return data ? JSON.parse(data) : {};
  }
  return {};
}

const HISTORY_KEY = 'hirematch_history';

export function saveAnalysisToHistory(analysis: any): void {
  if (typeof window !== 'undefined') {
    const history = getAnalysisHistory();
    history.unshift(analysis); // Add to top
    // Keep only last 20
    if (history.length > 20) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

export function getAnalysisHistory(): any[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  }
  return [];
}

export function deleteAnalysisFromHistory(id: string): void {
  if (typeof window !== 'undefined') {
    const history = getAnalysisHistory();
    const updated = history.filter((item: any) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }
}

export function incrementUsuccessCount(): void {
  if (typeof window !== 'undefined') {
    const metric = 'hirematch_usuccess_count';
    const current = parseInt(localStorage.getItem(metric) || '0');
    localStorage.setItem(metric, (current + 1).toString());
  }
}

