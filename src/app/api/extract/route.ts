import { NextRequest, NextResponse } from 'next/server';

const GEMINI_REST_URL = (key: string) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

export async function POST(request: NextRequest) {
  try {
    const { rawText } = await request.json();

    if (!rawText) {
      return NextResponse.json({ error: 'Missing rawText data' }, { status: 400 });
    }

    // Looking for a Native Gemini Key (commonly AIza...) or an old fallback
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey.includes('your_')) {
      // Return a basic parsed structure if no key exists so the app doesn't break
      return NextResponse.json({
        fullName: "API Key Missing",
        email: "",
        phone: "",
        summary: "Please configure OPENROUTER_API_KEY to use AI extraction.",
        skills: ["Add your keys", "in .env.local"],
        experience: "",
        education: ""
      }, { status: 200 });
    }

    const prompt = `You are an elite, forensic Resume Parsing AI. 
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

    const response = await fetch(GEMINI_REST_URL(apiKey), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: 'You are an absolute precision data-extraction machine. You only output raw valid JSON. Do not output markdown, do not make mistakes, do not hallucinate.' }]
        },
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.0,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Extraction API error:', errorText);
      return NextResponse.json({ error: 'Extraction API error', details: errorText }, { status: 500 });
    }

    const data = await response.json();
    let rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Strip markdown JSON block if the AI returns it despite instructions
    rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let content;
    try {
      content = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('Failed to parse AI output:', rawContent);
      return NextResponse.json({ error: 'AI returned invalid formatting', raw: rawContent }, { status: 500 });
    }
    
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Deep Extraction error:', error);
    return NextResponse.json({ error: error.messuccess || 'Internal server error', stack: error.stack }, { status: 500 });
  }
}
