# 🚀 HireMatch AI Deployment & Setup Guide

HireMatch AI is built using cutting-edge technologies suitable for free-tier hosting on Vercel. 

## 🛠 Project Architecture
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Storage**: Highly optimized `localStorage` JSON caching (instant speed).
- **AI Intelligence**: Groq API (Incredibly fast, free tier available).
- **Authentication**: Local Mock Auth (included) or Clerk (Drop-in ready!).

## 🔑 Getting the API Keys

To use real AI and Authentication, follow these steps to retrieve your free API keys:

### 1. Clerk Authentication (Free)
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create an application.
2. Select **Email, Phone, Username** or any Social Providers (Google, GitHub) you want.
3. In the API Keys section, copy the `Publishable Key` and `Secret Key`.

### 2. Groq AI Integration (Ultra-fast, Free)
1. Navigate to the [Groq Console](https://console.groq.com/).
2. Sign in and generate a new API key.
3. Copy the `GROQ_API_KEY`.

---

## 💻 Environment Variables Setup

Create a `.env.local` file in the root folder (`y:\PROJECTS\Jd Analyse\hirematch-ai`) and add the following keys:

```ini
# Clerk Auth Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Groq API Key
GROQ_API_KEY=gsk_...

# Admin Configuration (Comma separated)
NEXT_PUBLIC_ADMIN_EMAILS=your.email@example.com
```

> **Note on Demo Mode:** Currently, the app wraps itself in a smooth Demo Auth setup using `localStorage` and a deterministic AI Fallback parsing strategy so you could instantly develop and use it even without keys. 
> * To switch back to real authentication, simply comment out `AuthProvider` from `src/app/layout.tsx` and bring back the `<ClerkProvider>`. Update `src/components/Navbar.tsx` and all pages to use `@clerk/nextjs` hooks as initially built.

---

## 🚀 Deploying to Vercel (Free)

Deploying Next.js to Vercel is straightforward:

1. Push your code to a GitHub/GitLab repository.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your GitHub repository.
4. Expand the **Environment Variables** section.
5. Paste your exact `.env.local` contents there.
6. Click **Deploy**.

In under 2 minutes, your blazing-fast AI Resume analyzer will be live worldwide! 🎉
