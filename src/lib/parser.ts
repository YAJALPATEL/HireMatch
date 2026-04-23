import type { ResumeData, ExperienceProfile, JobEntry, SeniorityLevel } from './types';

// ---------------------------------------------------------------------------
// Skill Normalization
// ---------------------------------------------------------------------------

/**
 * Comprehensive alias map: lowercase variant → canonical skill name.
 * Every recognized spelling, abbreviation, or synonym maps to one canonical
 * string so that downstream matching treats them as the same skill.
 */
export const SKILL_ALIASES: Record<string, string> = {
  // JavaScript
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'es6': 'JavaScript',
  'es2015': 'JavaScript',
  'ecmascript': 'JavaScript',
  'vanilla js': 'JavaScript',

  // TypeScript
  'ts': 'TypeScript',
  'typescript': 'TypeScript',

  // React
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'react js': 'React',

  // Node.js
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'node js': 'Node.js',

  // Python
  'python': 'Python',
  'python3': 'Python',
  'py': 'Python',

  // PostgreSQL
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'pg': 'PostgreSQL',

  // MongoDB
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',

  // CSS
  'css': 'CSS',
  'css3': 'CSS',
  'cascading style sheets': 'CSS',

  // HTML
  'html': 'HTML',
  'html5': 'HTML',

  // Next.js
  'next': 'Next.js',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',

  // Vue.js
  'vue': 'Vue.js',
  'vue.js': 'Vue.js',
  'vuejs': 'Vue.js',

  // Express
  'express': 'Express',
  'express.js': 'Express',
  'expressjs': 'Express',

  // Tailwind CSS
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',

  // Git / Version Control
  'git': 'Git',
  'github': 'Git',
  'gitlab': 'Git',
  'version control': 'Git',

  // REST API
  'rest': 'REST API',
  'rest api': 'REST API',
  'restful': 'REST API',
  'restful api': 'REST API',

  // GraphQL
  'graphql': 'GraphQL',
  'gql': 'GraphQL',

  // Docker
  'docker': 'Docker',
  'dockerfile': 'Docker',
  'containerization': 'Docker',

  // AWS
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'amazon aws': 'AWS',

  // GCP
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',

  // Azure
  'azure': 'Azure',
  'microsoft azure': 'Azure',

  // SQL
  'sql': 'SQL',
  'mysql': 'SQL',
  'structured query language': 'SQL',

  // CI/CD
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'continuous integration': 'CI/CD',
  'continuous deployment': 'CI/CD',

  // Machine Learning
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',

  // Artificial Intelligence
  'ai': 'Artificial Intelligence',
  'artificial intelligence': 'Artificial Intelligence',
};

/**
 * Normalize a single skill string to its canonical name.
 *
 * 1. Lowercases & trims the input.
 * 2. Looks up the result in SKILL_ALIASES (exact match first, then a
 *    "cleaned" variant with dots, slashes, and hyphens stripped).
 * 3. Returns the canonical name when found, otherwise title-cases the input.
 */
export function normalizeSkill(skill: string): string {
  const trimmed = skill.trim().toLowerCase();
  if (!trimmed) return '';

  // Direct lookup
  if (SKILL_ALIASES[trimmed]) {
    return SKILL_ALIASES[trimmed];
  }

  // Cleaned lookup: strip dots, slashes, and hyphens for a second pass
  const cleaned = trimmed.replace(/[.\-\/]/g, '').replace(/\s+/g, ' ');
  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }

  // Fallback: title-case each word
  return trimmed
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normalize an array of skill strings: map through `normalizeSkill`,
 * deduplicate via Set, and return a sorted array.
 */
export function normalizeSkillList(skills: string[]): string[] {
  const normalized = new Set(
    skills.map(normalizeSkill).filter(Boolean),
  );
  return [...normalized].sort((a, b) => a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// Skill Extraction
// ---------------------------------------------------------------------------

const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
  'react', 'angular', 'vue', 'next.js', 'nextjs', 'node.js', 'nodejs', 'express', 'django', 'flask',
  'spring', 'laravel', 'rails', 'fastapi', 'graphql', 'rest', 'api',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui',
  'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'jenkins', 'github actions',
  'git', 'linux', 'bash', 'powershell',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'agile', 'scrum', 'kanban', 'jira', 'confluence',
  'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
  'testing', 'jest', 'cypress', 'selenium', 'playwright',
  'microservices', 'serverless', 'lambda', 'cloud functions',
  'oauth', 'jwt', 'authentication', 'authorization',
  'webpack', 'vite', 'babel', 'eslint', 'prettier',
  'firebase', 'supabase', 'prisma', 'sequelize', 'typeorm',
  'react native', 'flutter', 'ionic', 'android', 'ios',
  'data analysis', 'data visualization', 'tableau', 'power bi',
  'blockchain', 'web3', 'solidity', 'ethereum',
  'devops', 'sre', 'monitoring', 'logging', 'observability',
  'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
  'project management', 'product management', 'stakeholder management',
];

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  
  for (const skill of COMMON_SKILLS) {
    // Use word boundary matching for single words, contains for multi-word
    if (skill.includes(' ')) {
      if (lower.includes(skill)) {
        found.push(skill);
      }
    } else {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        found.push(skill);
      }
    }
  }
  
  // Normalize & deduplicate before returning
  return normalizeSkillList(found);
}

export function parseResumeText(rawText: string): Partial<ResumeData> {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const skills = extractSkills(rawText);
  
  // Try to extract name (first non-empty line that looks like a name)
  let fullName = '';
  for (const line of lines.slice(0, 5)) {
    if (line.length < 50 && !line.includes('@') && !line.match(/^\d/)) {
      fullName = line;
      break;
    }
  }
  
  // Try to extract email
  const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';
  
  // Try to extract phone
  const phoneMatch = rawText.match(/[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/);
  const phone = phoneMatch ? phoneMatch[0] : '';
  
  return {
    fullName,
    email,
    phone,
    skills,
    rawText,
    updatedAt: new Date().toISOString(),
  };
}

export function extractVisaKeywords(text: string): string[] {
  const keywords = [
    'us citizen', 'u.s. citizen', 'united states citizen',
    'green card', 'permanent resident', 'gc holder',
    'h1b', 'h-1b', 'h1-b',
    'opt', 'stem opt',
    'ead', 'employment authorization',
    'l1', 'l-1',
    'tn', 'tn visa',
    'visa sponsor', 'sponsorship',
    'no sponsorship', 'without sponsorship',
    'must be authorized', 'legally authorized',
    'work authorization', 'authorized to work',
    'clearance required', 'security clearance',
    'us persons', 'u.s. persons',
    'itar', 'ear',
    'citizen or permanent resident',
  ];
  
  const lower = text.toLowerCase();
  return keywords.filter(kw => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// Visa / Work-Authorization Detection (rule-based fallback)
// ---------------------------------------------------------------------------

import type { VisaRequirement, WorkAuthType } from './types';

const NO_SPONSORSHIP_PATTERNS: RegExp[] = [
  /no\s+(?:visa\s+)?sponsorship/i,
  /will\s+not\s+sponsor/i,
  /cannot\s+sponsor/i,
  /sponsorship\s+not\s+available/i,
  /not\s+able\s+to\s+sponsor/i,
  /must\s+be\s+authorized\s+to\s+work/i,
  /authorized\s+to\s+work\s+in\s+the\s+u\.?s/i,
  /us\s+citizen\s+or\s+permanent\s+resident/i,
  /u\.?s\.?\s+citizen\s+or\s+permanent\s+resident/i,
  /usc\s+or\s+gc/i,
  /usc\/gc/i,
  /citizen\s+or\s+green\s+card/i,
  /no\s+visa\s+sponsorship/i,
  /work\s+authorization\s+required\s+without\s+sponsorship/i,
  /without\s+(?:visa\s+)?sponsorship/i,
  /us\s+citizen(?:s)?\s+only/i,
  /green\s+card\s+only/i,
];

const SPONSORSHIP_AVAILABLE_PATTERNS: RegExp[] = [
  /visa\s+sponsorship\s+available/i,
  /willing\s+to\s+sponsor/i,
  /will\s+sponsor/i,
  /sponsorship\s+provided/i,
  /h[- ]?1[- ]?b\s+transfer/i,
  /open\s+to\s+sponsorship/i,
  /h[- ]?1[- ]?b/i,
  /sponsorship\s+available/i,
];

const OPT_CPT_PATTERNS: RegExp[] = [
  /\bopt\b/i,
  /\bcpt\b/i,
  /stem\s+opt/i,
  /f[- ]?1\s+visa/i,
  /\bead\b/i,
  /employment\s+authorization\s+document/i,
];

const CLEARANCE_PATTERNS: { pattern: RegExp; level: string }[] = [
  { pattern: /ts\/sci/i, level: 'TS/SCI' },
  { pattern: /top\s+secret/i, level: 'Top Secret' },
  { pattern: /secret\s+clearance/i, level: 'Secret' },
  { pattern: /security\s+clearance/i, level: 'Security Clearance' },
  { pattern: /clearance\s+required/i, level: 'Security Clearance' },
  { pattern: /\bitar\b/i, level: 'ITAR' },
  { pattern: /us\s+persons?\s+(?:only|required)/i, level: 'US Persons' },
];

const ANY_AUTH_PATTERNS: RegExp[] = [
  /all\s+work\s+authorizations/i,
  /any\s+work\s+authorization/i,
  /open\s+to\s+all\s+candidates/i,
];

/**
 * Rule-based local detection of work-authorization requirements from JD text.
 * Runs BEFORE (or as fallback for) the Gemini prompt, so even if the AI
 * hallucinates, we have a deterministic safety layer.
 */
export function extractVisaRequirements(jdText: string): VisaRequirement {
  const detectedPhrases: string[] = [];
  let allowedAuths: WorkAuthType[] = [];
  let sponsorship = false;
  let requiresClearance = false;
  let clearanceLevel: string | null = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // --- Clearance detection (always runs) ---
  for (const { pattern, level } of CLEARANCE_PATTERNS) {
    const match = jdText.match(pattern);
    if (match) {
      requiresClearance = true;
      clearanceLevel = level;
      detectedPhrases.push(match[0]);
    }
  }

  // --- Explicit "Any" ---
  for (const pat of ANY_AUTH_PATTERNS) {
    const match = jdText.match(pat);
    if (match) {
      detectedPhrases.push(match[0]);
      allowedAuths = ['Any'];
      sponsorship = true;
      confidence = 'high';
      return {
        allowed_work_auths: allowedAuths,
        sponsorship_available: sponsorship,
        requires_clearance: requiresClearance,
        clearance_level: clearanceLevel,
        raw_detected_phrases: detectedPhrases,
        confidence,
      };
    }
  }

  // --- No-sponsorship detection ---
  let noSponsorshipFound = false;
  for (const pat of NO_SPONSORSHIP_PATTERNS) {
    const match = jdText.match(pat);
    if (match) {
      noSponsorshipFound = true;
      detectedPhrases.push(match[0]);
    }
  }

  // --- Sponsorship-available detection ---
  let sponsorshipFound = false;
  for (const pat of SPONSORSHIP_AVAILABLE_PATTERNS) {
    const match = jdText.match(pat);
    if (match) {
      sponsorshipFound = true;
      detectedPhrases.push(match[0]);
    }
  }

  // --- OPT/CPT detection ---
  let optCptFound = false;
  for (const pat of OPT_CPT_PATTERNS) {
    const match = jdText.match(pat);
    if (match) {
      optCptFound = true;
      detectedPhrases.push(match[0]);
    }
  }

  // --- Decision logic ---
  if (noSponsorshipFound && !sponsorshipFound) {
    allowedAuths = ['USC', 'GC'];
    sponsorship = false;
    confidence = 'high';
  } else if (sponsorshipFound) {
    allowedAuths = ['USC', 'GC', 'H1B', 'OPT', 'TN', 'E3'];
    sponsorship = true;
    confidence = 'high';
  } else if (requiresClearance) {
    // Clearance without explicit visa statement → assume USC only
    allowedAuths = ['USC'];
    sponsorship = false;
    confidence = 'medium';
  }

  // Add OPT/CPT if explicitly mentioned and not already present
  if (optCptFound) {
    if (!allowedAuths.includes('OPT')) allowedAuths.push('OPT');
    if (!allowedAuths.includes('CPT')) allowedAuths.push('CPT');
    if (!allowedAuths.includes('H4-EAD')) allowedAuths.push('H4-EAD');
    if (confidence === 'low') confidence = 'medium';
  }

  // Default: nothing found → open to all
  if (allowedAuths.length === 0) {
    allowedAuths = ['Any'];
    sponsorship = true;
    confidence = 'low';
  }

  return {
    allowed_work_auths: allowedAuths,
    sponsorship_available: sponsorship,
    requires_clearance: requiresClearance,
    clearance_level: clearanceLevel,
    raw_detected_phrases: detectedPhrases,
    confidence,
  };
}

// ---------------------------------------------------------------------------
// Resume Experience Extraction
// ---------------------------------------------------------------------------

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
  apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
  aug: 7, august: 7, sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

function parseFlexibleDate(raw: string): Date | null {
  const s = raw.trim().toLowerCase();
  // "Present", "Current", "Now" → fixed reference date (April 2026)
  if (s === 'present' || s === 'current' || s === 'now') {
    return new Date(TODAY_YEAR, TODAY_MONTH - 1, 1); // month is 0-indexed
  }

  // "Jan 2020", "January 2020"
  const monthYear = s.match(/^([a-z]+)\.?\s+(\d{4})$/);
  if (monthYear) {
    const m = MONTH_MAP[monthYear[1]];
    if (m !== undefined) return new Date(Number(monthYear[2]), m, 1);
  }

  // "06/2021", "6/2021"
  const slashDate = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashDate) return new Date(Number(slashDate[2]), Number(slashDate[1]) - 1, 1);

  // "2020" (just year)
  const justYear = s.match(/^(\d{4})$/);
  if (justYear) return new Date(Number(justYear[1]), 0, 1);

  return null;
}

function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function detectSeniority(title: string): SeniorityLevel {
  const t = title.toLowerCase();
  if (/\b(intern|internship|trainee|junior|jr\.?|associate)\b/.test(t)) return 'junior';
  if (/\b(senior|sr\.?|lead|principal|staff|architect)\b/.test(t)) return 'senior';
  if (/\b(manager|director|head\s+of|vp|vice\s+president|cto|ceo)\b/.test(t)) return 'lead';
  return 'mid';
}

// Fixed reference date used throughout (April 2026)
const TODAY_YEAR  = 2026;
const TODAY_MONTH = 4; // 1-indexed for readability, converted below

/**
 * Extract a structured experience profile from raw resume text.
 * Priority: explicit year statement > calculated from date ranges > not_found.
 */
export function extractExperienceFromResume(resumeText: string): ExperienceProfile {
  if (!resumeText) {
    return { total_years: 0, total_months: 0, detected_level: 'mid', job_entries: [], most_recent_title: 'Not detected', experience_confidence: 'low' };
  }

  // ── 1. Try explicit "X years of experience" statement ──────────────────
  const explicitPatterns = [
    /(\d+)\+?\s*years?\s+of\s+(?:professional\s+|total\s+|work\s+)?experience/i,
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:industry|work|total)\s+experience/i,
    /experience\s*[:\-]\s*(\d+)\+?\s*years?/i,
    /over\s+(\d+)\s+years?\s+(?:of\s+)?experience/i,
    /(\d+)\s*\+\s*years?\s+experience/i,
  ];
  let explicitYears: number | null = null;
  for (const pat of explicitPatterns) {
    const m = resumeText.match(pat);
    if (m) { explicitYears = Number(m[1]); break; }
  }

  // ── 2. Extract all date ranges from the resume text ────────────────────
  // Covers:  "Jan 2020 – Present", "2019 - 2022", "06/2021 - 03/2023"
  const simpleDateRange = /((?:[A-Za-z]+\.?\s+)?\d{4}|\d{1,2}\/\d{4})\s*(?:–|-|to|—)\s*((?:[A-Za-z]+\.?\s+)?\d{4}|\d{1,2}\/\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow)/g;

  interface DateInterval { start: Date; end: Date; }
  const intervals: DateInterval[] = [];
  let sMatch: RegExpExecArray | null;

  while ((sMatch = simpleDateRange.exec(resumeText)) !== null) {
    const startDate = parseFlexibleDate(sMatch[1]);
    const endDate   = parseFlexibleDate(sMatch[2]);
    if (startDate && endDate && endDate >= startDate) {
      intervals.push({ start: startDate, end: endDate });
    }
  }

  // ── 3. Deduplicate overlapping intervals to avoid double-counting ──────
  intervals.sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: DateInterval[] = [];
  for (const iv of intervals) {
    if (merged.length === 0) { merged.push({ ...iv }); continue; }
    const last = merged[merged.length - 1];
    if (iv.start <= last.end) {
      last.end = iv.end > last.end ? iv.end : last.end; // extend
    } else {
      merged.push({ ...iv });
    }
  }

  const totalMonthsFromDates = merged.reduce((sum, iv) => sum + Math.max(0, monthsBetween(iv.start, iv.end)), 0);

  // ── 4. Also try to capture job entries with titles for the timeline UI ─
  const entries: JobEntry[] = [];
  const entryPattern = /([A-Z][^\n]{3,80}?)\s*(?:\n|—|–|-|,)\s*([A-Z][^\n]{2,60}?)\s*\n?\s*(?:(\w+\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*(?:–|-|to|—)\s*(\w+\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|[Pp]resent|[Cc]urrent))/g;
  let eMatch: RegExpExecArray | null;
  while ((eMatch = entryPattern.exec(resumeText)) !== null) {
    const s = parseFlexibleDate(eMatch[3]);
    const e = parseFlexibleDate(eMatch[4]);
    if (s && e) {
      entries.push({
        title: eMatch[1].trim(),
        company: eMatch[2].trim(),
        start_date: eMatch[3].trim(),
        end_date: eMatch[4].trim(),
        duration_months: Math.max(0, monthsBetween(s, e)),
        is_relevant: true,
      });
    }
  }

  // ── 5. Decide final years figure ───────────────────────────────────────
  let totalMonths: number;
  let confidence: ExperienceProfile['experience_confidence'];

  if (explicitYears !== null) {
    totalMonths  = explicitYears * 12;
    confidence   = 'high';
  } else if (totalMonthsFromDates > 0) {
    totalMonths  = totalMonthsFromDates;
    confidence   = 'medium';
  } else {
    totalMonths  = 0;
    confidence   = 'low';
  }

  const totalYears = Math.round((totalMonths / 12) * 10) / 10;

  // ── 6. Seniority detection ─────────────────────────────────────────────
  const mostRecentTitle = entries.length > 0 ? entries[entries.length - 1].title : '';
  const detectedLevel = mostRecentTitle
    ? detectSeniority(mostRecentTitle)
    : (totalYears >= 8 ? 'senior' : totalYears >= 3 ? 'mid' : 'junior');

  return {
    total_years: totalYears,
    total_months: totalMonths,
    detected_level: detectedLevel,
    job_entries: entries,
    most_recent_title: mostRecentTitle || 'Not detected',
    experience_confidence: confidence,
  };
}

// ---------------------------------------------------------------------------
// JD Experience Requirement Extractor (local regex — pre-Groq safety layer)
// ---------------------------------------------------------------------------

export interface JDExperienceRequirement {
  required_years: number | null;
  required_years_text: string | null;
  is_strict: boolean;
  data_available: boolean;
}

/**
 * Extract the minimum required years of experience from a JD text.
 * Uses 9 regex patterns to cover common formats.
 * This runs locally as a fallback/safety layer in addition to the AI extraction.
 */
export function extractRequiredExperience(jdText: string): JDExperienceRequirement {
  const patterns: RegExp[] = [
    // "Experience Required - 10+ Years" / "Experience Required: 10 Years"
    /experience\s*(?:required|needed|minimum|level)?\s*[-:]\s*(\d+)\+?\s*years?/i,
    // "10+ Years Experience" / "10+ years of experience"
    /(\d+)\+\s*years?\s+(?:of\s+)?(?:relevant\s+|work\s+|professional\s+)?experience/i,
    // "minimum of 8 years" / "minimum 8 years"
    /minimum\s+(?:of\s+)?(\d+)\+?\s*years?/i,
    // "at least 6 years"
    /at\s+least\s+(\d+)\s*years?/i,
    // "5 to 7 years" → take minimum
    /(\d+)\s+to\s+(\d+)\s*years?/i,
    // "5-7 years" → take minimum
    /(\d+)\s*-\s*(\d+)\s*years?/i,
    // "requires 10+ years"
    /requires?\s+(\d+)\+?\s*years?/i,
    // "10 years of experience required"
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:work\s+|professional\s+)?experience\s*(?:is\s+)?required/i,
    // General "X+ years" as last resort
    /(\d+)\+\s*years?/i,
  ];

  for (const pat of patterns) {
    const m = jdText.match(pat);
    if (m) {
      // For range patterns (groups 1 and 2), take the minimum
      const years = Number(m[1]);
      return {
        required_years:      years,
        required_years_text: m[0].trim(),
        is_strict:           /\b(must|required|mandatory|minimum)\b/i.test(m[0]),
        data_available:      true,
      };
    }
  }

  return { required_years: null, required_years_text: null, is_strict: false, data_available: false };
}

