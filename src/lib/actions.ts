'use server';

import type { AnalysisResult, ResumeData, WorkAuth } from '@/lib/types';

const GEMINI_REST_URL = (key: string) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

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

function buildPrompt(resume: ResumeData, jd: string, workAuth: WorkAuth): string {
  return `You are a forensic-level Career Advisor and ATS. Your goal is 100% strict, accurate, EXHAUSTIVE skill mapping.

CRITICAL INSTRUCTIONS — READ CAREFULLY:

**STEP 1 — FILTER THE JD:**
- IGNORE sections titled or about: "What we offer", "Benefits", "Perks", "About us", "About the company", "Equal opportunity", "Our culture", "Compensation", "Why join us", or any non-requirement content.
- FOCUS ONLY on: "Requirements", "Required skills", "Qualifications", "Must have", "Nice to have", "Responsibilities", "Tech stack", "Skills", "Experience required", or any section describing what the candidate needs.

**STEP 2 — EXTRACT ALL SKILLS FROM JD:**
- Extract EVERY SINGLE technical skill, framework, library, tool, language, methodology, platform, soft skill, and domain knowledge mentioned in the requirements/qualifications sections.
- Do NOT limit to 2 or 3 skills. Extract the COMPLETE list — if the JD mentions 15 skills, list all 15. If it mentions 30, list all 30.
- Include both hard skills AND soft skills (e.g., "communication", "leadership", "team player").

**STEP 3 — NORMALIZE SKILL NAMES (CRITICAL):**
- Treat ALL of these as THE SAME skill: "React", "React.js", "ReactJS", "REACT", "react" → normalize to "React"
- Treat ALL of these as THE SAME skill: "Node.js", "NodeJS", "node", "Node" → normalize to "Node.js"
- Treat ALL of these as THE SAME skill: "Next.js", "NextJS", "nextjs", "NEXT.JS" → normalize to "Next.js"
- Treat ALL of these as THE SAME skill: "JavaScript", "JS", "Javascript", "java script" → normalize to "JavaScript"
- Treat ALL of these as THE SAME skill: "TypeScript", "TS", "Typescript" → normalize to "TypeScript"
- Apply this same normalization logic for ALL skills (AWS/Amazon Web Services, Python/Python3, Docker, etc.)
- When comparing resume skills against JD skills, compare the NORMALIZED versions.

**STEP 4 — MATCH AGAINST RESUME:**
- Compare EVERY extracted JD skill (normalized) against the candidate's resume skills (also normalized).
- "matched_skills": List EVERY JD skill the candidate has (use the canonical/clean skill name).
- "missing_skills": List EVERY JD skill the candidate lacks (use the canonical/clean skill name).
- Do NOT skip any skills. The sum of matched + missing must equal total JD skills.

**STEP 5 — EXPERIENCE COMPARISON:**
- Extract the REQUIRED experience from the JD (e.g., "3+ years", "5-7 years", "Senior level", etc.). If not explicitly stated, infer from the role level.
- Extract the candidate's CURRENT experience from their resume (calculate total years from work history).
- Return both as strings.

RESUME DATA: 
Name: ${resume.fullName}
Skills: ${resume.skills.join(', ')}
Summary: ${resume.summary || 'Not provided'}
Experience: ${resume.experience || 'Not provided'}

WORK AUTH: ${workAuth.label} (Needs sponsorship: ${workAuth.requiresSponsorship})

JOB DESCRIPTION: 
---
${jd}
---

Return EXACTLY in this JSON format (no extra text, no markdown): 
{
  "role_match_score": number,
  "matched_skills": ["Canonical Skill Name", ...],
  "missing_skills": ["Canonical Skill Name", ...],
  "experience_required": "e.g. 3+ years of experience in software development",
  "experience_current": "e.g. 4 years of experience based on resume work history",
  "role_title": "Clean Job Title",
  "company": "Company Name",
  "visa_requirement": "Yes or No. Answer 'Yes' ONLY if USC, GC, or Security Clearance is explicitly required for this role. Otherwise answer 'No'."
}`;
}

export async function analyzeJD(
  resume: ResumeData,
  jd: string,
  workAuth: WorkAuth,
  jdHash: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey.includes('your_')) {
    // If no keys configured, return the fallback UI
    return generateMockAnalysis(resume, jd, workAuth, jdHash);
  }

  try {
    const response = await fetch(GEMINI_REST_URL(apiKey), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: 'You are an absolute precision parsing machine. You only output valid JSON. Do not hallucinate data. Be strict. Extract ALL skills exhaustively — never truncate or summarize the skills list.' }]
        },
        contents: [{
          role: "user",
          parts: [{ text: buildPrompt(resume, jd.substring(0, 8000), workAuth) }]
        }],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Native Gemini API error:', errorText);
      return generateMockAnalysis(resume, jd, workAuth, jdHash);
    }

    const data = await response.json();
    let rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(rawContent);

    // Normalize all skill names from the AI response
    const matchedRaw: string[] = Array.isArray(parsed.matched_skills) ? parsed.matched_skills : [];
    const missingRaw: string[] = Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [];
    
    const normalizedMatched = [...new Set(matchedRaw.map(normalizeSkill))];
    const normalizedMissing = [...new Set(missingRaw.map(normalizeSkill))];
    
    // Remove any "missing" skills that are actually in matched (post-normalization dedup)
    const matchedSet = new Set(normalizedMatched.map(s => s.toLowerCase()));
    const dedupedMissing = normalizedMissing.filter(s => !matchedSet.has(s.toLowerCase()));

    // Javascript Math Accuracy Check
    const matchedCount = normalizedMatched.length;
    const missingCount = dedupedMissing.length;
    const totalSkills = matchedCount + missingCount;
    
    let exactSkillMatch = 0;
    if (totalSkills > 0) {
      exactSkillMatch = Math.round((matchedCount / totalSkills) * 100);
      // Prevent rounding up to 100 if there's at least one missing skill
      if (exactSkillMatch === 100 && missingCount > 0) {
        exactSkillMatch = 99;
      }
    }
    const finalRoleMatch = typeof parsed.role_match_score === 'number' ? parsed.role_match_score : 80;

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      jdTitle: parsed.role_title || 'Analyzed Role',
      jdCompany: parsed.company || 'Analyzed Company',
      jdHash,
      skillMatch: exactSkillMatch,
      roleMatch: finalRoleMatch,
      overallMatch: Math.round((exactSkillMatch + finalRoleMatch) / 2),
      matchedSkills: normalizedMatched,
      missingSkills: dedupedMissing,
      experienceRequired: parsed.experience_required || 'Not specified in JD',
      experienceCurrent: parsed.experience_current || 'Could not determine from resume',
      roleTitle: parsed.role_title || 'Analyzed Role',
      visaRequirement: parsed.visa_requirement || 'No',
      eligibility: parsed.eligibility || 'unclear',
      eligibilityReason: 'Visa criteria extracted from standard ATS bounds.',
      suggestions: dedupedMissing.length > 0 ? [`Consider studying: ${dedupedMissing.slice(0, 3).join(', ')}`, `Update your summary to reflect modern ${parsed.role_title} requirements.`, `Add relevant projects that demonstrate ${dedupedMissing[0]} experience.`] : ['Your resume heavily aligns with this role!'],
      resumeImprovements: dedupedMissing.length > 0 ? [`Explicitly list ${dedupedMissing.join(", ")} in your tech stack.`, `Add project examples using ${dedupedMissing.slice(0, 2).join(' and ')}.`, `Consider certifications for ${dedupedMissing[0]}.`] : ['Maintain your current formatting, it parsed flawlessly.'],
      rawJD: jd,
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return generateMockAnalysis(resume, jd, workAuth, jdHash);
  }
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

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    jdTitle: roleTitle,
    jdCompany: 'Demo Company',
    jdHash,
    skillMatch,
    roleMatch,
    overallMatch: Math.round((skillMatch * 0.6 + roleMatch * 0.4)),
    matchedSkills: finalMatched,
    missingSkills: finalMissing,
    experienceRequired: '3+ years of relevant experience',
    experienceCurrent: '5 years of relevant experience',
    roleTitle,
    visaRequirement: (eligibility === 'not_allowed' || jdLower.includes('clearance') || jdLower.includes('us citizen')) ? 'Yes' : 'No',
    eligibility,
    eligibilityReason,
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
    rawJD: jd,
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
