'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExperienceMatchDetail, ExperienceRequirement, ExperienceProfile } from '@/lib/types';

// ── Types ──────────────────────────────────────────────────────────────────

interface ExperienceCardData {
  experienceMatchDetail?: ExperienceMatchDetail | null;
  experienceRequirements?: ExperienceRequirement | null;
  experienceProfile?: ExperienceProfile | null;
}

interface ExperienceCardProps {
  data: ExperienceCardData | null;
  isLoading?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 75) return '#3b82f6';
  if (score >= 60) return '#eab308';
  if (score >= 35) return '#f97316';
  return '#ef4444';
}

// ── Count-up hook ──────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return count;
}

// ── Sub-components ─────────────────────────────────────────────────────────

/** Score badge with live color */
function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const color = getScoreColor(score);
  const animated = useCountUp(score);
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold border"
      style={{
        backgroundColor: `${color}22`,
        color,
        borderColor: `${color}55`,
      }}
    >
      {animated}% {label && <span className="opacity-70 font-normal">{label}</span>}
    </span>
  );
}

/** Progress bar — candidate years vs required years */
function YearsProgressBar({
  candidate,
  required,
}: {
  candidate: number;
  required: number;
}) {
  const max   = Math.max(candidate, required, 1);
  const candW = Math.min((candidate / max) * 100, 100);
  const reqW  = Math.min((required  / max) * 100, 100);

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-[10px] text-indigo-300/70 mb-0.5">
        <span>0 yr</span>
        <span>{max} yr</span>
      </div>
      {/* Required bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-slate-400/40"
          initial={{ width: 0 }}
          animate={{ width: `${reqW}%` }}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
        />
        <div
          className="absolute inset-y-0 left-0 flex items-center"
          style={{ width: `${reqW}%` }}
        >
          <div className="ml-auto w-1 h-1 bg-slate-400 rounded-full" />
        </div>
      </div>
      {/* Candidate bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: candidate >= required ? '#22c55e' : '#ef4444' }}
          initial={{ width: 0 }}
          animate={{ width: `${candW}%` }}
          transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-[10px] mt-0.5">
        <span className="text-slate-400/80">▲ Required: {required} yr</span>
        <span style={{ color: candidate >= required ? '#22c55e' : '#ef4444' }}>
          ▲ You: {candidate} yr
        </span>
      </div>
    </div>
  );
}

// ── State 1 — Full data available ──────────────────────────────────────────

function State1Full({ em, req, profile }: {
  em: ExperienceMatchDetail;
  req: ExperienceRequirement;
  profile: ExperienceProfile | null | undefined;
}) {
  const score     = em.experience_match_score;
  const gap       = em.years_gap;
  const candidate = em.candidate_total_years;
  const required  = em.required_min_years;
  const overqual  = em.overqualified_risk;
  const levelMatch = em.level_match;

  let gapNode: React.ReactNode;
  if (overqual) {
    gapNode = (
      <span className="text-blue-400">↑ You may be overqualified</span>
    );
  } else if (gap <= 0) {
    gapNode = <span className="text-green-400">✓ Meets requirement</span>;
  } else if (gap <= 2) {
    gapNode = <span className="text-yellow-400">⚠ {gap} year{gap === 1 ? '' : 's'} below requirement</span>;
  } else {
    gapNode = <span className="text-red-400">✗ {gap} years below requirement</span>;
  }

  return (
    <div className="flex flex-col justify-between h-full space-y-3">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white text-sm">Experience Match</h3>
        <ScoreBadge score={score} />
      </div>

      {/* Years row */}
      <div className="text-xs text-indigo-200 leading-relaxed">
        <span className="text-white font-medium">Your experience:</span>{' '}
        <span className="font-semibold text-white">{candidate} yr</span>{' '}
        <span className="text-indigo-400">·</span>{' '}
        <span className="text-white font-medium">Required:</span>{' '}
        <span className="font-semibold text-white">{required}+ yr</span>
      </div>

      {/* Gap indicator */}
      <div className="text-xs font-semibold">{gapNode}</div>

      {/* Progress bar */}
      <YearsProgressBar candidate={candidate} required={required} />

      {/* Seniority row */}
      <div className="text-xs text-indigo-200 flex items-center gap-1 pt-1 border-t border-white/5">
        <span className="text-white/70">Your level:</span>
        <span className={`capitalize font-semibold ${levelMatch ? 'text-green-400' : 'text-orange-400'}`}>
          {profile?.detected_level ?? em.candidate_total_years >= 8 ? 'senior' : em.candidate_total_years >= 3 ? 'mid' : 'junior'}
        </span>
        <span className="text-indigo-400 mx-0.5">·</span>
        <span className="text-white/70">Role:</span>
        <span className={`capitalize font-semibold ${levelMatch ? 'text-green-400' : 'text-orange-400'}`}>
          {req.required_level ?? 'mid'}
        </span>
        {!levelMatch && (
          <span className="text-orange-400 text-[10px] ml-1">(mismatch)</span>
        )}
      </div>

      {/* Experience notes */}
      {em.experience_notes && (
        <p className="text-[10px] text-indigo-400/80 italic leading-tight">{em.experience_notes}</p>
      )}
    </div>
  );
}

// ── State 2 — No JD experience requirement ─────────────────────────────────

function State2NoJD() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.97, 1.03, 0.97] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-4xl"
      >
        ⏱️
      </motion.div>
      <div>
        <p className="font-bold text-slate-300 text-sm">Not Specified</p>
        <p className="text-xs text-slate-400/80 mt-1 leading-snug max-w-[180px]">
          This role didn&apos;t mention an experience requirement
        </p>
      </div>
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-400/10 text-slate-400 border border-slate-500/30 font-medium tracking-wide">
        —
      </span>
      <p className="text-[10px] italic text-slate-500 mt-auto">No experience barrier detected</p>
    </div>
  );
}

// ── State 3 — No resume experience data ───────────────────────────────────

function State3NoResume() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.97, 1.03, 0.97] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-3xl"
      >
        📄
      </motion.div>
      <div>
        <p className="font-bold text-orange-300 text-sm">Couldn&apos;t Detect</p>
        <p className="text-xs text-orange-300/70 mt-1 leading-snug max-w-[190px]">
          Add clear date ranges to your resume for accurate matching
        </p>
      </div>
      <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
        ?
      </span>
    </div>
  );
}

// ── State 4 — No data at all ───────────────────────────────────────────────

function State4NoData() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center opacity-60">
      <div className="text-3xl grayscale">⏱️</div>
      <div>
        <p className="font-bold text-slate-400 text-sm">No Experience Data</p>
        <p className="text-xs text-slate-500 mt-1 leading-snug max-w-[180px]">
          Neither the JD nor resume provided experience information
        </p>
      </div>
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-600/30 text-slate-500 border border-slate-600/30 font-medium">
        N/A
      </span>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function ExperienceSkeleton() {
  return (
    <div className="flex flex-col justify-between h-full space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
      </div>
      <div className="h-3 w-48 bg-white/10 rounded" />
      <div className="h-3 w-28 bg-white/10 rounded" />
      <div className="h-2 bg-white/5 rounded-full" />
      <div className="h-2 bg-white/5 rounded-full" />
      <div className="h-3 w-40 bg-white/10 rounded" />
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────────

export default function ExperienceCard({ data, isLoading = false }: ExperienceCardProps) {
  const em      = data?.experienceMatchDetail ?? null;
  const req     = data?.experienceRequirements ?? null;
  const profile = data?.experienceProfile ?? null;

  // Determine which state to render
  const hasJDData       = em !== null && (em.required_min_years > 0 || (em as unknown as { jd_experience_mentioned?: boolean }).jd_experience_mentioned !== false);
  const hasCandidateData = em !== null && em.candidate_total_years > 0;

  // Read jd_experience_mentioned from the raw object if available
  const jdMentioned =
    (em as unknown as { jd_experience_mentioned?: boolean | null })?.jd_experience_mentioned;
  const reqYears =
    (em as unknown as { required_years?: number | null })?.required_years
    ?? em?.required_min_years ?? null;
  const candYears =
    (em as unknown as { candidate_years?: number | null })?.candidate_years
    ?? em?.candidate_total_years ?? null;

  type CardState = 'loading' | 'state1' | 'state2' | 'state3' | 'state4';

  let state: CardState = 'state4';
  if (isLoading) {
    state = 'loading';
  } else if (em === null || (reqYears === null && candYears === null)) {
    state = 'state4';
  } else if (jdMentioned === false || reqYears === null) {
    state = 'state2';
  } else if (candYears === null || em.candidate_total_years === 0) {
    state = 'state3';
  } else {
    state = 'state1';
  }

  // Card wrapper style varies per state
  const wrapperStyle: React.CSSProperties = {
    minHeight: 220,
  };

  let borderClass = 'border border-white/10';
  let bgClass = 'card-static';

  if (state === 'state2') {
    bgClass = 'rounded-xl p-5';
    borderClass = 'border border-slate-500/30';
    wrapperStyle.backgroundColor = 'rgba(148, 163, 184, 0.08)';
    wrapperStyle.backdropFilter  = 'blur(12px)';
  } else if (state === 'state3') {
    bgClass = 'rounded-xl p-5';
    borderClass = 'border border-dashed border-orange-500/50';
    wrapperStyle.backgroundColor = 'rgba(249, 115, 22, 0.05)';
    wrapperStyle.backdropFilter  = 'blur(12px)';
  } else if (state === 'state4') {
    bgClass = 'rounded-xl p-5 opacity-60';
    borderClass = 'border border-slate-600/30';
    wrapperStyle.backgroundColor = 'rgba(51, 65, 85, 0.2)';
    wrapperStyle.backdropFilter  = 'blur(12px)';
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className={`${bgClass} ${borderClass} p-5`}
        style={wrapperStyle}
      >
        <AnimatePresence mode="wait">
          {state === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <ExperienceSkeleton />
            </motion.div>
          )}
          {state === 'state1' && em && req && (
            <motion.div key="state1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <State1Full em={em} req={req} profile={profile} />
            </motion.div>
          )}
          {state === 'state2' && (
            <motion.div key="state2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <State2NoJD />
            </motion.div>
          )}
          {state === 'state3' && (
            <motion.div key="state3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <State3NoResume />
            </motion.div>
          )}
          {state === 'state4' && (
            <motion.div key="state4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <State4NoData />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tip card — only shown in State 3 */}
      <AnimatePresence>
        {state === 'state3' && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl px-4 py-3 border border-orange-500/20 text-orange-300/80 text-xs leading-relaxed"
            style={{ backgroundColor: 'rgba(249, 115, 22, 0.07)' }}
          >
            💡 <span className="font-semibold">Tip:</span> Include employment dates in{' '}
            <span className="font-mono text-orange-300 bg-orange-400/10 px-1 rounded">Month Year</span>{' '}
            format (e.g. <span className="font-mono text-orange-300 bg-orange-400/10 px-1 rounded">Jan 2022 - Present</span>){' '}
            for better ATS parsing and accurate experience matching.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
