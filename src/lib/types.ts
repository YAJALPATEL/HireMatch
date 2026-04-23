export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  rawText: string;
  updatedAt: string;
}

export interface WorkAuth {
  status: 'usc' | 'gc' | 'h1b' | 'opt' | 'ead' | 'l1' | 'tn' | 'other';
  label: string;
  requiresSponsorship: boolean;
}

// ── Visa / Work-Authorization Types ──────────────────────────────────────

export type WorkAuthType =
  | 'USC' | 'GC' | 'H1B' | 'OPT' | 'CPT'
  | 'H4-EAD' | 'TN' | 'E3' | 'L1' | 'Any';

export interface VisaRequirement {
  allowed_work_auths: WorkAuthType[];
  sponsorship_available: boolean;
  requires_clearance: boolean;
  clearance_level: string | null;
  raw_detected_phrases: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface VisaMatchResult {
  is_eligible: boolean;
  needs_sponsorship: boolean;
  sponsorship_will_be_provided: boolean;
  eligibility_reason: string;
  warning: string | null;
}

// ── Experience Types ─────────────────────────────────────────────────────

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal';

export interface JobEntry {
  title: string;
  company: string;
  start_date: string;
  end_date: string;           // "Present" if current
  duration_months: number;
  is_relevant: boolean;
}

export interface ExperienceProfile {
  total_years: number;
  total_months: number;
  detected_level: SeniorityLevel;
  job_entries: JobEntry[];
  most_recent_title: string;
  experience_confidence: 'high' | 'medium' | 'low';
}

export interface ExperienceRequirement {
  min_years: number;
  max_years: number | null;
  preferred_years: number;
  required_level: SeniorityLevel;
  experience_is_strict: boolean;
  relevant_domain_experience: string[];
}

export interface ExperienceMatchDetail {
  candidate_total_years: number;
  required_min_years: number;
  years_gap: number;
  meets_minimum: boolean;
  level_match: boolean;
  level_gap: string | null;
  experience_match_score: number;
  overqualified_risk: boolean;
  experience_notes: string;
}

// ── Analysis Result ──────────────────────────────────────────────────────

export interface AnalysisResult {
  // ── Identity & metadata ──────────────────────────────────────────────
  id: string;
  timestamp: string;
  jdTitle: string;
  jdCompany: string;
  jdHash: string;
  rawJD: string;

  // ── Legacy score fields (used by UI) ─────────────────────────────────
  skillMatch: number;
  roleMatch: number;
  overallMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceRequired: string;
  experienceCurrent: string;
  roleTitle: string;
  visaRequirement: string;
  eligibility: 'allowed' | 'not_allowed' | 'unclear';
  eligibilityReason: string;
  suggestions: string[];
  resumeImprovements: string[];

  // ── Extraction phase (from JD) ───────────────────────────────────────
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperienceYears: number;
  roleLevel: SeniorityLevel;
  workAuthorizationRequired: string[];
  domainKeywords: string[];

  // ── Matching phase ───────────────────────────────────────────────────
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  skillMatchScore: number;
  experienceMatch: boolean;
  experienceGapYears: number;
  roleMatchScore: number;
  overallMatchScore: number;

  // ── Feedback phase ───────────────────────────────────────────────────
  atsKeywordsToAdd: string[];
  strengths: string[];
  dealBreakers: string[];
  visaMatch: boolean;

  // ── Visa analysis ────────────────────────────────────────────────────
  visaAnalysis: VisaRequirement;
  visaMatchResult: VisaMatchResult;

  // ── Experience analysis ──────────────────────────────────────────────
  experienceProfile: ExperienceProfile;
  experienceRequirements: ExperienceRequirement;
  experienceMatchDetail: ExperienceMatchDetail;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  recentUsers: AdminUser[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  analysisCount: number;
  lastActive: string;
  createdAt: string;
}

export const WORK_AUTH_OPTIONS: WorkAuth[] = [
  { status: 'usc', label: 'US Citizen', requiresSponsorship: false },
  { status: 'gc', label: 'Green Card Holder', requiresSponsorship: false },
  { status: 'ead', label: 'EAD (Employment Authorization Document)', requiresSponsorship: false },
  { status: 'h1b', label: 'H-1B Visa', requiresSponsorship: true },
  { status: 'opt', label: 'OPT / STEM OPT', requiresSponsorship: true },
  { status: 'l1', label: 'L-1 Visa', requiresSponsorship: true },
  { status: 'tn', label: 'TN Visa', requiresSponsorship: true },
  { status: 'other', label: 'Other Work Authorization', requiresSponsorship: true },
];
