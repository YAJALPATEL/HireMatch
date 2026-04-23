import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { rawText } = await request.json();

    if (!rawText) {
      return NextResponse.json({ error: 'Missing rawText data' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey.includes('your_')) {
      // Return a basic parsed structure if no key exists so the app doesn't break
      return NextResponse.json({
        fullName: "API Key Missing",
        email: "",
        phone: "",
        summary: "Please configure GROQ_API_KEY to use AI extraction.",
        skills: ["Add your keys", "in .env.local"],
        experience: "",
        education: ""
      }, { status: 200 });
    }

    const userPrompt = `You are an elite, forensic Resume Parsing AI. 
Your singular goal is 100% accuracy and ZERO data loss. Take as much deep-processing time as needed.

INSTRUCTIONS:
1. Scan the resume line-by-line, paragraph-by-paragraph.
2. Extract EVERY single technical tool, programming language, framework, methodology, hard skill, operating system, and soft skill into the skills array. Do not summarize or consolidate skills - list every single variation explicitly found.
3. If they list an acronym (e.g., "AWS"), extract both "AWS" and related inferred parent concepts if absolutely certain, but prioritize explicitly written text.
4. Extract the exact names of companies and dates of employment for the experience block. Ensure NO job history is skipped. 
5. Extract exact degree titles for education.

RAW RESUME TEXT TO ANALYZE:
---
${rawText}
---

Return exactly in this JSON format and absolutely nothing else:
{
  "fullName": "Name here or empty",
  "email": "Email here or empty",
  "phone": "Phone here or empty",
  "summary": "Full professional summary (minimum 3 sentences)",
  "skills": ["Extract EVERY SINGLE explicit and implicit skill. This array should contain 20 to 100+ items if present."],
  "experience": "Format as concise markdown bullet points, including companies, roles, and dates.",
  "education": "Format as concise markdown bullet points."
}`;

    let rawContent: string;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an absolute precision data-extraction machine. You only output raw valid JSON. Do not output markdown, do not make mistakes, do not hallucinate.' },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0,
        max_tokens: 4000,
      });
      rawContent = completion.choices[0].message.content || '{}';
    } catch (primaryErr) {
      console.warn('Extract: primary model failed, retrying with fallback:', primaryErr);
      const fallback = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are an absolute precision data-extraction machine. You only output raw valid JSON. Do not output markdown, do not make mistakes, do not hallucinate.' },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0,
        max_tokens: 4000,
      });
      rawContent = fallback.choices[0].message.content || '{}';
    }

    let content;
    try {
      content = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('Failed to parse AI output:', rawContent);
      return NextResponse.json({ error: 'AI returned invalid formatting', raw: rawContent }, { status: 500 });
    }

    return NextResponse.json(content);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Deep Extraction error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
