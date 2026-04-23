'use server';

import type { AnalysisResult, ResumeData, WorkAuth, VisaRequirement, VisaMatchResult, WorkAuthType, ExperienceProfile, ExperienceRequirement, ExperienceMatchDetail, SeniorityLevel } from '@/lib/types';
import { normalizeSkillList, extractVisaRequirements, extractExperienceFromResume } from '@/lib/parser';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/** Comprehensive skill alias map — normalizes variants to a single canonical name */
const SKILL_ALIASES: Record<string, string[]> = {
  'React': ['react', 'react.js', 'reactjs', 'react js'],
  'Next.js': ['next.js', 'nextjs', 'next js', 'next'],
  'Node.js': ['node.js', 'nodejs', 'node js', 'node'],
  'Vue.js': ['vue', 'vue.js', 'vuejs', 'vue js'],
  'Angular': ['angular', 'angularjs', 'angular.js', 'angular js'],
  'JavaScript': ['javascript', 'js', 'java script', 'ecmascript', 'es6', 'es2015'],
  'TypeScript': ['typescript', 'ts', 'type script'],
  'Python': ['python', 'python3', 'py'],
  'Java': ['java'],
  'C++': ['c++', 'cpp', 'c plus plus'],
  'C#': ['c#', 'csharp', 'c sharp', 'c-sharp'],
  'Ruby': ['ruby'],
  'Go': ['go', 'golang'],
  'Rust': ['rust'],
  'Swift': ['swift'],
  'Kotlin': ['kotlin'],
  'PHP': ['php'],
  'SQL': ['sql', 'structured query language'],
  'NoSQL': ['nosql', 'no-sql'],
  'MongoDB': ['mongodb', 'mongo'],
  'PostgreSQL': ['postgresql', 'postgres', 'pg'],
  'MySQL': ['mysql', 'my sql'],
  'Redis': ['redis'],
  'Elasticsearch': ['elasticsearch', 'elastic search', 'elastic'],
  'AWS': ['aws', 'amazon web services'],
  'Azure': ['azure', 'microsoft azure'],
  'GCP': ['gcp', 'google cloud', 'google cloud platform'],
  'Docker': ['docker'],
  'Kubernetes': ['kubernetes', 'k8s'],
  'Terraform': ['terraform'],
  'CI/CD': ['ci/cd', 'cicd', 'ci cd', 'continuous integration', 'continuous deployment', 'continuous delivery'],
  'Jenkins': ['jenkins'],
  'GitHub Actions': ['github actions'],
  'Git': ['git'],
  'Linux': ['linux'],
  'HTML': ['html', 'html5'],
  'CSS': ['css', 'css3'],
  'Sass': ['sass', 'scss'],
  'Tailwind CSS': ['tailwind', 'tailwindcss', 'tailwind css'],
  'Bootstrap': ['bootstrap'],
  'Material UI': ['material ui', 'material-ui', 'mui'],
  'Express': ['express', 'express.js', 'expressjs'],
  'Django': ['django'],
  'Flask': ['flask'],
  'Spring': ['spring', 'spring boot', 'springboot'],
  'FastAPI': ['fastapi', 'fast api'],
  'GraphQL': ['graphql', 'graph ql'],
  'REST API': ['rest', 'rest api', 'restful', 'restful api'],
  'Machine Learning': ['machine learning', 'ml'],
  'Deep Learning': ['deep learning', 'dl'],
  'NLP': ['nlp', 'natural language processing'],
  'TensorFlow': ['tensorflow', 'tf'],
  'PyTorch': ['pytorch', 'torch'],
  'Pandas': ['pandas'],
  'NumPy': ['numpy'],
  'Agile': ['agile'],
  'Scrum': ['scrum'],
  'Jira': ['jira'],
  'Figma': ['figma'],
  'Jest': ['jest'],
  'Cypress': ['cypress'],
  'Selenium': ['selenium'],
  'Playwright': ['playwright'],
  'Firebase': ['firebase'],
  'Supabase': ['supabase'],
  'Prisma': ['prisma'],
  'React Native': ['react native'],
  'Flutter': ['flutter'],
  'Webpack': ['webpack'],
  'Vite': ['vite'],
  'Redux': ['redux', 'redux toolkit', 'rtk'],
  'RxJS': ['rxjs'],
  'Microservices': ['microservices', 'micro services'],
  'Serverless': ['serverless'],
  'Lambda': ['lambda', 'aws lambda'],
  'OAuth': ['oauth', 'oauth2', 'oauth 2.0'],
  'JWT': ['jwt', 'json web token'],
  'DevOps': ['devops', 'dev ops'],
  'Tableau': ['tableau'],
  'Power BI': ['power bi', 'powerbi'],
  'Blockchain': ['blockchain'],
  'Web3': ['web3', 'web 3'],
  'Solidity': ['solidity'],
  'Three.js': ['three.js', 'threejs'],
  'D3.js': ['d3', 'd3.js', 'd3js'],
  'Socket.io': ['socket.io', 'socketio', 'websocket', 'websockets'],
  'RabbitMQ': ['rabbitmq', 'rabbit mq'],
  'Kafka': ['kafka', 'apache kafka'],
  'Nginx': ['nginx'],
  'Apache': ['apache'],
  'Ansible': ['ansible'],
  'Puppet': ['puppet'],
  'Chef': ['chef'],
  'Datadog': ['datadog'],
  'Grafana': ['grafana'],
  'Prometheus': ['prometheus'],
  'New Relic': ['new relic', 'newrelic'],
  'Splunk': ['splunk'],
  'Snowflake': ['snowflake'],
  'Apache Spark': ['spark', 'apache spark', 'pyspark'],
  'Hadoop': ['hadoop'],
  'Airflow': ['airflow', 'apache airflow'],
  'dbt': ['dbt'],
  'Looker': ['looker'],
  'Segment': ['segment'],
  'Mixpanel': ['mixpanel'],
  'Amplitude': ['amplitude'],
  'Storybook': ['storybook'],
  'Zustand': ['zustand'],
  'MobX': ['mobx'],
  'SWR': ['swr'],
  'React Query': ['react query', 'tanstack query'],
  'Styled Components': ['styled components', 'styled-components'],
  'Emotion': ['emotion'],
  'Framer Motion': ['framer motion', 'framer-motion'],
  'GSAP': ['gsap', 'greensock'],
  'Unity': ['unity'],
  'Unreal Engine': ['unreal', 'unreal engine'],
  'R': ['r programming', 'r language'],
  'Scala': ['scala'],
  'Haskell': ['haskell'],
  'Perl': ['perl'],
  'Bash': ['bash', 'shell scripting', 'shell'],
  'PowerShell': ['powershell'],
  '.NET': ['.net', 'dotnet', 'asp.net', 'asp net'],
  'MATLAB': ['matlab'],
  'SAS': ['sas'],
  'Salesforce': ['salesforce', 'sfdc'],
  'SAP': ['sap'],
  'ServiceNow': ['servicenow', 'service now'],
};

/**
 * Normalize a skill string to its canonical name using the alias map.
 * Returns the canonical form if found, otherwise returns the input trimmed.
 */
function normalizeSkill(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.includes(lower) || canonical.toLowerCase() === lower) {
      return canonical;
    }
  }
  // Title-case fallback for unknown skills
  return raw.trim();
}
const PASS1_SYSTEM = `You are a forensic job description analyst. Your only job is to 
extract every single requirement from a job description with 
perfect accuracy. You must find EVERY skill, tool, technology, 
certification, domain knowledge, and soft skill — even if mentioned 
only once, even if buried in responsibilities section, even if 
implied by context.

EXTRACTION RULES:
- Read the ENTIRE JD text three times before extracting
- Extract skills from ALL sections: title, requirements, 
  responsibilities, nice-to-have, about section, benefits
- Separate proprietary tools from general skills
- Identify skills implied by context:
  * 'Lead a team' implies leadership skills
  * 'Work with stakeholders' implies stakeholder communication
  * 'Microservices' implies distributed systems knowledge
  * 'CI/CD' implies DevOps knowledge
- Categorize every skill into one of:
  HARD_REQUIRED, SOFT_REQUIRED, HARD_PREFERRED, 
  SOFT_PREFERRED, IMPLICIT, CERTIFICATION
- For each skill, note WHERE in the JD it was found:
  title / requirements / responsibilities / preferred / other`;

const PASS1_USER = (jdText: string) => `Extract ALL requirements from this JD with perfect accuracy.

JD TEXT:
${jdText}

Return ONLY this JSON:
{
  "jd_skills": {
    "hard_required": [{
      "skill": "string",
      "original_text": "string",
      "section_found": "string",
      "is_proprietary": false,
      "is_certification": false
    }],
    "soft_required": [{ "skill": "", "original_text": "", "section_found": "" }],
    "hard_preferred": [{ "skill": "", "original_text": "", "section_found": "" }],
    "soft_preferred": [{ "skill": "", "original_text": "", "section_found": "" }],
    "implicit_requirements": [{ "skill": "", "inferred_from": "" }],
    "certifications_required": [{ "cert": "", "is_mandatory": false }],
    "domain_knowledge": ["string"],
    "tools_and_platforms": ["string"],
    "programming_languages": ["string"],
    "frameworks_and_libraries": ["string"],
    "cloud_platforms": ["string"],
    "methodologies": ["string"],
    "total_skills_found": 0
  },
  "experience_requirements": {
    "required_years": null,
    "required_years_raw_text": null,
    "seniority_level": "string",
    "is_strict": false
  },
  "visa_requirements": {
    "raw_text": null,
    "allowed_visas": ["string"],
    "sponsorship_available": false,
    "requires_clearance": false
  },
  "role_info": {
    "title": "string",
    "department": null,
    "industry": null,
    "team_size": null,
    "work_model": "string"
  }
}`;

const PASS2_SYSTEM = `You are a forensic resume analyst. Extract every single skill, 
technology, tool, methodology, domain knowledge, and experience 
from a resume with perfect accuracy.

EXTRACTION RULES:
- Read the ENTIRE resume text three times before extracting
- Extract skills from ALL sections: skills list, work experience 
  bullet points, project descriptions, education, certifications
- Identify skills DEMONSTRATED in experience (stronger signal) 
  vs skills just LISTED in skills section (weaker signal)
- Normalize all skill variants to canonical names:
  * JS = JavaScript, TS = TypeScript, React.js = React
  * Node = Node.js, Postgres = PostgreSQL, K8s = Kubernetes
  * GH Actions = GitHub Actions, TF = TensorFlow or Terraform
    (use context to distinguish)
- Detect years of experience PER SKILL where possible:
  * If React appears in job from 2020-2023, that is 3 years React
- Calculate total career years from date ranges
  (Today = April 2026, 'Present'/'Current' = April 2026)`;

const PASS2_USER = (resumeText: string) => `Extract ALL skills and experience from this resume.

RESUME TEXT:
${resumeText}

Return ONLY this JSON:
{
  "candidate_skills": {
    "all_skills": ["string"],
    "skills_with_context": [{
      "skill": "string",
      "original_text": "string",
      "demonstrated_in_work": false,
      "listed_only": false,
      "years_of_experience": null,
      "proficiency_signal": "unknown"
    }],
    "programming_languages": ["string"],
    "frameworks": ["string"],
    "tools": ["string"],
    "cloud": ["string"],
    "databases": ["string"],
    "methodologies": ["string"],
    "soft_skills": ["string"],
    "certifications": ["string"],
    "domains_worked_in": ["string"]
  },
  "candidate_experience": {
    "total_years": null,
    "total_months": null,
    "calculation_method": "string",
    "job_entries": [{
      "title": "string",
      "company": "string",
      "start": "string",
      "end": "string",
      "duration_months": 0,
      "skills_used": ["string"]
    }],
    "most_recent_title": "string",
    "seniority_level": "string",
    "data_confidence": "low"
  },
  "candidate_profile": {
    "work_authorization_mentioned": null,
    "education_level": null,
    "primary_domain": "string"
  }
}`;

const PASS3_SYSTEM = `You are a strict ATS matching engine. You receive pre-extracted 
skills from a JD and a resume. Your job is ONLY to match them 
with perfect accuracy.

MATCHING RULES — FOLLOW EXACTLY:
1. A skill is MATCHED only if it exists in candidate_skills.all_skills
   OR candidate_skills.skills_with_context
2. Accept these as matches (synonyms):
   - JavaScript/JS/ES6/ECMAScript → JavaScript
   - TypeScript/TS → TypeScript
   - React/React.js/ReactJS → React
   - Node/Node.js/NodeJS → Node.js
   - Postgres/PostgreSQL → PostgreSQL
   - Mongo/MongoDB → MongoDB
   - K8s/Kubernetes → Kubernetes
   - TF (in ML context) → TensorFlow
   - GCP/Google Cloud → GCP
   - REST/RESTful/REST API → REST API
3. DO NOT accept weak matches:
   - Knowing Python does NOT mean knowing Scala
   - Knowing React does NOT mean knowing Angular
   - Knowing AWS does NOT mean knowing Salesforce
   - Knowing Docker does NOT mean knowing Kubernetes (list separately)
4. Proprietary tool rule: if JD requires a named proprietary 
   platform (Guidewire, Salesforce, SAP, Workday, ServiceNow etc) 
   and it is NOT in resume → this is a HARD MISS, never a partial match
5. Score calculation:
   required_matched = count of hard_required skills found in resume
   required_total = total hard_required skills
   preferred_matched = count of hard_preferred found
   preferred_total = total hard_preferred
   
   skill_match_score = 
     (required_matched / required_total × 100 × 0.70) + 
     (preferred_matched / preferred_total × 100 × 0.30)
   
   IF any proprietary tool is in hard_required AND not matched:
     skill_match_score = min(skill_match_score, 35)
     add to deal_breakers`;

const PASS3_USER = (pass1Result: any, pass2Result: any, workAuth: string) => `Match these pre-extracted JD requirements against this resume profile.

JD EXTRACTION RESULT:
${JSON.stringify(pass1Result)}

RESUME EXTRACTION RESULT:
${JSON.stringify(pass2Result)}

CANDIDATE WORK AUTH: ${workAuth}

Return ONLY this JSON:
{
  "skill_matching": {
    "matched_required": [{
      "skill": "string",
      "matched_as": "string",
      "match_type": "exact",
      "confidence": "high"
    }],
    "missing_required": [{
      "skill": "string",
      "is_proprietary": false,
      "is_learnable": false,
      "alternative_in_resume": null
    }],
    "matched_preferred": [{ "skill": "", "matched_as": "", "match_type": "exact" }],
    "missing_preferred": [{ "skill": "" }],
    "matched_implicit": [{ "skill": "" }],
    "missing_certifications": [{ "cert": "", "is_mandatory": false }]
  },
  "scores": {
    "skill_match_score": 0,
    "role_match_score": 0,
    "experience_match_score": 0,
    "visa_match_score": 0,
    "overall_match_score": 0,
    "score_breakdown": {
      "required_skills_ratio": "string",
      "preferred_skills_ratio": "string",
      "experience_ratio": "string",
      "proprietary_tool_penalty": false
    }
  },
  "experience_match": {
    "candidate_years": null,
    "required_years": null,
    "required_years_text": null,
    "years_gap": null,
    "meets_minimum": null,
    "experience_match_score": 0,
    "seniority_match": false,
    "overqualified_risk": false,
    "experience_notes": "string",
    "jd_experience_mentioned": false,
    "candidate_data_available": false
  },
  "visa_match": {
    "visa_raw_text": null,
    "allowed_visas": ["string"],
    "sponsorship_available": false,
    "candidate_auth": "string",
    "is_eligible": false,
    "visa_match_score": 0,
    "visa_notes": "string",
    "visa_required": false
  },
  "deal_breakers": ["string"],
  "strengths": ["string"],
  "ats_keywords_to_add": ["string"],
  "resume_improvements": ["string"],
  "application_recommendation": "Significant Gap",
  "recommendation_reason": "string"
}`;

async function callGroqStrict(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt },
  ];
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.0,
      max_tokens: maxTokens,
    });
    return completion.choices[0].message.content || '{}';
  } catch (primaryErr) {
    console.warn('Groq primary model failed, retrying with fallback:', primaryErr);
    const fallback = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.0,
      max_tokens: maxTokens,
    });
    return fallback.choices[0].message.content || '{}';
  }
}

export async function extractJDSkills(jdText: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_')) return null;
  const raw = await callGroqStrict(PASS1_SYSTEM, PASS1_USER(jdText), 3000);
  return JSON.parse(raw);
}

export async function extractResumeSkills(resumeText: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_')) return null;
  const raw = await callGroqStrict(PASS2_SYSTEM, PASS2_USER(resumeText), 3000);
  return JSON.parse(raw);
}

export async function matchSkills(
  pass1: any,
  pass2: any,
  workAuth: WorkAuth,
  resume: ResumeData,
  jd: string,
  jdHash: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_') || !pass1 || !pass2) {
    return generateMockAnalysis(resume, jd, workAuth, jdHash);
  }

  const raw = await callGroqStrict(PASS3_SYSTEM, PASS3_USER(pass1, pass2, workAuth.label), 4000);
  const pass3 = JSON.parse(raw);

  // Safely extract from Pass 1
  const jdEx = pass1.jd_skills || {};
  const jdExp = pass1.experience_requirements || {};
  const jdVisa = pass1.visa_requirements || {};
  const roleInfo = pass1.role_info || {};

  // Safely extract from Pass 2
  const resExp = pass2.candidate_experience || {};
  
  // Safely extract from Pass 3
  const match = pass3.skill_matching || {};
  const scores = pass3.scores || {};
  const expMatch = pass3.experience_match || {};
  const visaMatch = pass3.visa_match || {};

  const safeArr = (v: any) => Array.isArray(v) ? v : [];
  
  const matchedReq = safeArr(match.matched_required).map((s: any) => s.skill);
  const missingReq = safeArr(match.missing_required).map((s: any) => s.skill);
  const matchedPref = safeArr(match.matched_preferred).map((s: any) => s.skill);
  const missingPref = safeArr(match.missing_preferred).map((s: any) => s.skill);
  
  const allMatched = [...new Set([...matchedReq, ...matchedPref])];
  const allMissing = [...new Set([...missingReq, ...missingPref])];

  const skillMatchScore = scores.skill_match_score || 0;
  const roleMatchScore = scores.role_match_score || 0;
  const experienceMatchScore = expMatch.experience_match_score || 0;
  const overallMatchScore = scores.overall_match_score || 0;

  const finalVisa: VisaRequirement = {
    allowed_work_auths: safeArr(jdVisa.allowed_visas),
    sponsorship_available: jdVisa.sponsorship_available || false,
    requires_clearance: jdVisa.requires_clearance || false,
    clearance_level: null,
    raw_detected_phrases: jdVisa.raw_text ? [jdVisa.raw_text] : [],
    confidence: 'high'
  };

  const visaMatchResult: VisaMatchResult = {
    is_eligible: visaMatch.is_eligible || false,
    needs_sponsorship: workAuth.requiresSponsorship,
    sponsorship_will_be_provided: visaMatch.sponsorship_available || false,
    eligibility_reason: visaMatch.visa_notes || '',
    warning: null
  };

  const localExpProfile = extractExperienceFromResume(resume.rawText || resume.experience);
  const candidateTotalYears = expMatch.candidate_years ?? resExp.total_years ?? localExpProfile.total_years;
  const requiredMinYears = expMatch.required_years ?? jdExp.required_years ?? 0;

  const aiExpMatch = {
    candidate_total_years: candidateTotalYears,
    required_min_years: requiredMinYears,
    years_gap: expMatch.years_gap ?? (requiredMinYears - candidateTotalYears),
    meets_minimum: expMatch.meets_minimum ?? (candidateTotalYears >= requiredMinYears),
    level_match: expMatch.seniority_match ?? false,
    level_gap: null,
    experience_match_score: experienceMatchScore,
    overqualified_risk: expMatch.overqualified_risk ?? false,
    experience_notes: expMatch.experience_notes || '',
    jd_experience_mentioned: expMatch.jd_experience_mentioned ?? false,
    required_years: expMatch.required_years ?? null,
    candidate_years: expMatch.candidate_years ?? null
  } as unknown as ExperienceMatchDetail;

  const aiExpReq: ExperienceRequirement = {
    min_years: jdExp.required_years ?? 0,
    max_years: null,
    preferred_years: 0,
    required_level: jdExp.seniority_level || 'mid',
    experience_is_strict: jdExp.is_strict || false,
    relevant_domain_experience: safeArr(jdEx.domain_knowledge)
  };

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    jdTitle: roleInfo.title || 'Analyzed Role',
    jdCompany: roleInfo.company || 'Analyzed Company',
    jdHash,
    rawJD: jd,

    skillMatch: skillMatchScore,
    roleMatch: roleMatchScore,
    overallMatch: overallMatchScore,
    matchedSkills: allMatched,
    missingSkills: allMissing,
    experienceRequired: expMatch.required_years_text || jdExp.required_years_raw_text || 'Not specified',
    experienceCurrent: `${candidateTotalYears} years`,
    roleTitle: roleInfo.title || 'Analyzed Role',
    visaRequirement: !finalVisa.sponsorship_available || finalVisa.requires_clearance ? 'Yes' : 'No',
    eligibility: visaMatchResult.is_eligible ? 'allowed' : 'not_allowed',
    eligibilityReason: visaMatchResult.eligibility_reason,
    suggestions: safeArr(pass3.resume_improvements).length > 0 ? safeArr(pass3.resume_improvements) : ['Tailor your summary for this role.'],
    resumeImprovements: safeArr(pass3.resume_improvements).length > 0 ? safeArr(pass3.resume_improvements) : ['Maintain your current formatting.'],

    requiredSkills: safeArr(jdEx.hard_required).map((s:any) => s.skill),
    preferredSkills: safeArr(jdEx.hard_preferred).map((s:any) => s.skill),
    requiredExperienceYears: requiredMinYears,
    roleLevel: (['junior','mid','senior','lead','principal'].includes(jdExp.seniority_level) ? jdExp.seniority_level : 'mid') as SeniorityLevel,
    workAuthorizationRequired: safeArr(jdVisa.allowed_visas),
    domainKeywords: safeArr(jdEx.domain_knowledge),

    matchedRequiredSkills: matchedReq,
    missingRequiredSkills: missingReq,
    matchedPreferredSkills: matchedPref,
    missingPreferredSkills: missingPref,
    skillMatchScore: skillMatchScore,
    experienceMatch: aiExpMatch.meets_minimum,
    experienceGapYears: aiExpMatch.years_gap,
    roleMatchScore: roleMatchScore,
    overallMatchScore: overallMatchScore,

    atsKeywordsToAdd: safeArr(pass3.ats_keywords_to_add),
    strengths: safeArr(pass3.strengths),
    dealBreakers: safeArr(pass3.deal_breakers),
    visaMatch: visaMatchResult.is_eligible,

    visaAnalysis: finalVisa,
    visaMatchResult,
    
    experienceProfile: localExpProfile,
    experienceRequirements: aiExpReq,
    experienceMatchDetail: aiExpMatch
  };
}

// ---------------------------------------------------------------------------
// Visa Match Checker
// ---------------------------------------------------------------------------

/** Map the WorkAuth.status string to a WorkAuthType for comparison */
function candidateStatusToWorkAuthType(status: WorkAuth['status']): WorkAuthType {
  const map: Record<WorkAuth['status'], WorkAuthType> = {
    usc: 'USC', gc: 'GC', h1b: 'H1B', opt: 'OPT',
    ead: 'H4-EAD', l1: 'L1', tn: 'TN', other: 'Any',
  };
  return map[status] ?? 'Any';
}

/**
 * Deterministic check: can a candidate with `candidateAuth` apply for a job
 * whose visa requirements are `jobVisa`?
 */
function checkVisaMatch(
  candidateAuth: WorkAuth,
  jobVisa: VisaRequirement,
): VisaMatchResult {
  const candidateType = candidateStatusToWorkAuthType(candidateAuth.status);
  const needsSponsorship = candidateAuth.requiresSponsorship;

  // If job allows "Any", everyone is eligible
  if (jobVisa.allowed_work_auths.includes('Any')) {
    return {
      is_eligible: true,
      needs_sponsorship: needsSponsorship,
      sponsorship_will_be_provided: jobVisa.sponsorship_available,
      eligibility_reason: `This role is open to all work authorizations. You hold ${candidateAuth.label}. ✓`,
      warning: jobVisa.requires_clearance
        ? `Security clearance (${jobVisa.clearance_level}) required — verify your eligibility.`
        : null,
    };
  }

  // USC is eligible for everything
  if (candidateType === 'USC') {
    return {
      is_eligible: true,
      needs_sponsorship: false,
      sponsorship_will_be_provided: false,
      eligibility_reason: `You are a US Citizen — eligible for all roles including clearance positions. ✓`,
      warning: null,
    };
  }

  // GC: eligible for all except USC-only clearance jobs
  if (candidateType === 'GC') {
    const uscOnly = jobVisa.allowed_work_auths.length === 1 && jobVisa.allowed_work_auths[0] === 'USC';
    if (uscOnly) {
      return {
        is_eligible: false,
        needs_sponsorship: false,
        sponsorship_will_be_provided: false,
        eligibility_reason: `This role requires US Citizenship only. Green Card does not qualify. ✗`,
        warning: null,
      };
    }
    const eligible = jobVisa.allowed_work_auths.includes('GC') || jobVisa.allowed_work_auths.includes('USC');
    return {
      is_eligible: eligible,
      needs_sponsorship: false,
      sponsorship_will_be_provided: false,
      eligibility_reason: eligible
        ? `You hold a Green Card — eligible for this role. ✓`
        : `This role does not accept Green Card holders. ✗`,
      warning: jobVisa.requires_clearance
        ? `Security clearance (${jobVisa.clearance_level}) required — GC holders may face restrictions.`
        : null,
    };
  }

  // H1B, OPT, CPT, L1, TN, etc. — need sponsorship check
  const directMatch = jobVisa.allowed_work_auths.includes(candidateType);
  const eligible = directMatch && (jobVisa.sponsorship_available || !needsSponsorship);

  return {
    is_eligible: eligible,
    needs_sponsorship: needsSponsorship,
    sponsorship_will_be_provided: eligible && jobVisa.sponsorship_available,
    eligibility_reason: eligible
      ? `Your ${candidateAuth.label} status is accepted and ${jobVisa.sponsorship_available ? 'sponsorship is available' : 'no sponsorship needed'}. ✓`
      : !directMatch
        ? `This role does not accept ${candidateAuth.label} holders. ✗`
        : `This role does not provide visa sponsorship. ✗`,
    warning: jobVisa.requires_clearance
      ? `Security clearance (${jobVisa.clearance_level}) required — non-citizens typically cannot obtain clearance.`
      : null,
  };
}


function generateMockAnalysis(
  resume: ResumeData,
  jd: string,
  workAuth: WorkAuth,
  jdHash: string
): AnalysisResult {
  const resumeSkillsLower = resume.skills.map(s => s.toLowerCase());
  const jdLower = jd.toLowerCase();
  
  // Simple keyword matching for mock
  const commonTechSkills = [
    'javascript', 'typescript', 'python', 'react', 'node.js', 'sql', 'aws',
    'docker', 'git', 'html', 'css', 'java', 'kubernetes', 'graphql',
    'mongodb', 'postgresql', 'redis', 'terraform', 'ci/cd', 'agile',
    'next.js', 'vue', 'angular', 'express', 'django', 'flask',
  ];
  
  const jdSkills = commonTechSkills.filter(s => jdLower.includes(s));
  
  // Decide the final arrays before calculating the math so they match perfectly
  let finalMatched = jdSkills.filter(s => resumeSkillsLower.includes(s));
  let finalMissing = jdSkills.filter(s => !resumeSkillsLower.includes(s));
  
  if (finalMatched.length === 0 && finalMissing.length === 0) {
    finalMatched = ['javascript', 'react', 'problem solving'];
    finalMissing = ['kubernetes', 'terraform'];
  }
  
  const skillMatch = (finalMatched.length + finalMissing.length) > 0 
    ? Math.floor((finalMatched.length / (finalMatched.length + finalMissing.length)) * 100) 
    : 65;
  const roleMatch = Math.round(Math.random() * 25 + 55);
  
  // Determine visa eligibility
  let eligibility: 'allowed' | 'not_allowed' | 'unclear' = 'unclear';
  let eligibilityReason = 'The posting does not specify work authorization requirements.';
  
  if (jdLower.includes('us citizen') || jdLower.includes('clearance') || jdLower.includes('itar')) {
    if (workAuth.status === 'usc') {
      eligibility = 'allowed';
      eligibilityReason = 'You are a US Citizen, meeting the requirement.';
    } else {
      eligibility = 'not_allowed';
      eligibilityReason = 'This position requires US Citizenship which does not match your status.';
    }
  } else if (jdLower.includes('no sponsorship') || jdLower.includes('without sponsorship')) {
    if (!workAuth.requiresSponsorship) {
      eligibility = 'allowed';
      eligibilityReason = 'You do not require visa sponsorship, meeting the requirement.';
    } else {
      eligibility = 'not_allowed';
      eligibilityReason = 'This position does not offer visa sponsorship.';
    }
  } else if (jdLower.includes('authorized to work')) {
    eligibility = workAuth.requiresSponsorship ? 'unclear' : 'allowed';
    eligibilityReason = workAuth.requiresSponsorship
      ? 'Position requires authorization to work. Your status may need verification.'
      : 'You are authorized to work in the US.';
  }

  // Extract role title
  const titlePatterns = [
    /(?:seeking|hiring|looking for)\s+(?:a\s+)?(.+?)(?:\s+to|\s+who|\.|,)/i,
    /^(.+?)\s+(?:at|@|-)/m,
    /position:\s*(.+)/i,
    /title:\s*(.+)/i,
    /role:\s*(.+)/i,
  ];
  
  let roleTitle = 'Software Engineer';
  for (const pattern of titlePatterns) {
    const match = jd.match(pattern);
    if (match) {
      roleTitle = match[1].trim().substring(0, 60);
      break;
    }
  }

  // Experience for mock
  const localExpProfile = extractExperienceFromResume(resume.rawText || resume.experience);
  const mockExpMatch: ExperienceMatchDetail = {
    candidate_total_years: localExpProfile.total_years,
    required_min_years: 3,
    years_gap: localExpProfile.total_years - 3,
    meets_minimum: localExpProfile.total_years >= 3,
    level_match: true,
    level_gap: null,
    experience_match_score: localExpProfile.total_years >= 3 ? 100 : 50,
    overqualified_risk: false,
    experience_notes: "Mock experience evaluation based on raw text."
  };

  // Use the rule-based visa detection for mock too
  const mockVisa = extractVisaRequirements(jd);
  const mockVisaMatch = checkVisaMatch(workAuth, mockVisa);

  const overallMatch = Math.round(
    skillMatch * 0.50 + 
    roleMatch * 0.20 + 
    mockExpMatch.experience_match_score * 0.20 + 
    (mockVisaMatch.is_eligible ? 100 : 0) * 0.10
  );

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    jdTitle: roleTitle,
    jdCompany: 'Demo Company',
    jdHash,
    rawJD: jd,

    // Legacy
    skillMatch,
    roleMatch,
    overallMatch,
    matchedSkills: finalMatched,
    missingSkills: finalMissing,
    experienceRequired: '3+ years of relevant experience',
    experienceCurrent: '5 years of relevant experience',
    roleTitle,
    visaRequirement: !mockVisa.sponsorship_available || mockVisa.requires_clearance ? 'Yes' : 'No',
    eligibility: mockVisaMatch.is_eligible ? 'allowed' : 'not_allowed',
    eligibilityReason: mockVisaMatch.eligibility_reason,
    suggestions: [
      'Tailor your resume summary to highlight relevant experience for this role',
      'Add quantifiable achievements that demonstrate impact',
      'Include keywords from the job description in your skills section',
      'Prepare specific examples for behavioral interview questions',
      'Research the company culture and recent news for interview prep',
    ],
    resumeImprovements: [
      'Add a professional summary section tailored to this role',
      'Quantify your achievements with numbers and metrics',
      'Include any relevant certifications or continuous learning',
      'Highlight leadership or mentoring experience',
      'Add relevant side projects or open-source contributions',
    ],

    // Extraction phase
    requiredSkills: finalMatched.concat(finalMissing),
    preferredSkills: [],
    requiredExperienceYears: 3,
    roleLevel: 'mid',
    workAuthorizationRequired: mockVisa.allowed_work_auths as string[],
    domainKeywords: [],

    // Matching phase
    matchedRequiredSkills: finalMatched,
    missingRequiredSkills: finalMissing,
    matchedPreferredSkills: [],
    missingPreferredSkills: [],
    skillMatchScore: skillMatch,
    experienceMatch: true,
    experienceGapYears: -2,
    roleMatchScore: roleMatch,
    overallMatchScore: overallMatch,

    // Feedback phase
    atsKeywordsToAdd: finalMissing.slice(0, 5),
    strengths: ['Strong alignment with core tech stack', 'Relevant experience level'],
    dealBreakers: mockVisaMatch.warning ? [mockVisaMatch.warning] : [],
    visaMatch: mockVisaMatch.is_eligible,

    // Visa analysis
    visaAnalysis: mockVisa,
    visaMatchResult: mockVisaMatch,

    // Experience analysis
    experienceProfile: localExpProfile,
    experienceRequirements: {
      min_years: 3,
      max_years: null,
      preferred_years: 5,
      required_level: 'mid',
      experience_is_strict: false,
      relevant_domain_experience: []
    },
    experienceMatchDetail: mockExpMatch,
  };
}

export async function trackAnalysis(
  userEmail: string, 
  jdTitle: string, 
  jdCompany: string, 
  matchScore: number
): Promise<void> {
  const { createClient } = await import('@/utils/supabase/server');
  const { cookies } = await import('next/headers');
  const supabase = await createClient(await cookies());
  
  try {
    // 1. Log the analysis record
    await supabase.from('analysis_logs').insert({
      user_email: userEmail,
      jd_title: jdTitle,
      jd_company: jdCompany,
      match_score: matchScore,
      created_at: new Date().toISOString()
    });

    // 2. Update user profile last active time
    await supabase
      .from('user_profiles')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail);
      
  } catch (e) {
    console.log(`Global tracking error: ${userEmail}`);
  }
}
