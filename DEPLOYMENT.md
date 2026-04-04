# 🚀 HireMatch AI Deployment & Lifetime Hosting Guide

HireMatch AI is optimized for **lifetime free hosting** using the most powerful modern cloud stack. Follow this guide to take your high-precision AI analyzer live in minutes.

---

## 🛠 Project Architecture (Enterprise Stack)
- **Frontend**: Next.js 15+ (App Router)
- **Styling**: Radiant Midnight Indigo Theme (Tailwind CSS v4)
- **Database & Real-time**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Intelligence**: [Google Gemini 2.0 Flash](https://aistudio.google.com/) (Fast, Precise, Free Tier)
- **Auth**: Secure Private Vault for Admin + Session-based User Auth

---

## 🔑 1. Get Your Free API Keys

To go live, you'll need keys for the two core engines:

### A. Supabase (Database & Auth - Free Tier)
1. Go to [supabase.com](https://supabase.com/) and create a new project.
2. In the **Project Settings > API**, copy your `Project URL` and `anon public` key.
3. Run the following SQL in your **SQL Editor** to create the user profile table:
   ```sql
   create table user_profiles (
     id uuid primary key default uuid_generate_v4(),
     email text unique not null,
     full_name text,
     resume_data jsonb,
     work_auth jsonb,
     updated_at timestamp with time zone default now()
   );
   -- Enable Realtime for the table
   alter publication supabase_realtime add table user_profiles;
   ```

### B. Gemini AI (Intelligence - Free Tier)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key.
3. Copy the `GEMINI_API_KEY`.

---

## 💻 2. Configure Environment Variables

Create a `.env.local` file (or add these to your Vercel dashboard):

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Intelligence
GEMINI_API_KEY=your-gemini-api-key

# Admin Master Auth
# Use your personal email and secret password
# URL will be yourdomain.com/yajalpatel
```

---

## 🚀 3. Deploy to Vercel (Lifetime Free)

Vercel is the easiest and most powerful way to host Next.js apps for free forever.

1. **Connect GitHub**: Go to [Vercel.com](https://vercel.com/) and click **"Add New" > "Project"**.
2. **Import Repo**: Select your `YAJALPATEL/HireMatch` repository.
3. **Set Environment Variables**: 
   - Expand the **Environment Variables** section.
   - Add all the keys from your `.env.local` (Supabase and Gemini keys).
4. **Deploy**: Click **"Deploy"**.
5. **Live!** Vercel will give you a public URL (e.g., `hirematch.vercel.app`).

### 🌟 Why this is the "Best" Way:
- **Automatic Updates**: Every time you push code to GitHub, Vercel updates the website automatically.
- **SSL Included**: Your site will be secure (`https://`) for free.
- **Global Speed**: Your dashboard and analyzer will load instantly worldwide.
- **Zero Cost**: Gemini and Supabase both have massive free tiers that won't charge you for personal or small-scale usage.

---

### 🎉 Your website is now ready for the world! 
Access your private admin vault at `your-vercel-url.com/yajalpatel` using your master credentials.
