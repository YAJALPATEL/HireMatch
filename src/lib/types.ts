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

export interface AnalysisResult {
  id: string;
  timestamp: string;
  jdTitle: string;
  jdCompany: string;
  jdHash: string;
  skillMatch: number;
  roleMatch: number;
  overallMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  roleTitle: string;
  visaRequirement: string;
  eligibility: 'allowed' | 'not_allowed' | 'unclear';
  eligibilityReason: string;
  suggestions: string[];
  resumeImprovements: string[];
  rawJD: string;
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
