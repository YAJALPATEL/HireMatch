import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireMatch AI - Smart Job Description Analyzer",
  description:
    "Instantly analyze job descriptions against your resume. Get skill match percentage, role fit, eligibility check, and AI-powered suggestions to land your dream job.",
  keywords:
    "job matching, resume analyzer, JD analyzer, skill gap analysis, work authorization, ATS optimizer",
  openGraph: {
    title: "HireMatch AI - Smart JD Analyzer",
    description:
      "AI-powered job matching. See how well you fit any role in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "0.9rem",
              color: "#101026",
            },
            success: {
              iconTheme: { primary: "#36B5AC", secondary: "white" },
            },
            error: {
              iconTheme: { primary: "#FF6B56", secondary: "white" },
            },
          }}
        />
      </body>
    </html>
  );
}
