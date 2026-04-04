import type { ResumeData } from './types';

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
  
  return [...new Set(found)];
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
