'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import {
  Sparkles,
  LayoutDashboard,
  FileSearch,
  Menu,
  X,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyzer', label: 'JD Analyzer', icon: FileSearch },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPath = pathname === '/yajalpatel';
  const router = useRouter();
  const { isSignedIn, user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="glass-strong rounded-2xl w-full mx-auto">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow border border-white/10 group-hover:border-primary-500/30">
                <img 
                  src="/logo.png" 
                  alt="HireMatch Logo" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-display)] text-white tracking-tight">
                Hire<span className="gradient-text">Match</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {!isAdminPath && isSignedIn &&
                navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-primary-400'
                          : 'text-indigo-300/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-primary-500/8 border border-primary-500/15 rounded-xl"
                          transition={{
                            type: 'spring',
                            bounce: 0.2,
                            duration: 0.5,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {!isSignedIn ? (
                <>
                  <Link
                    href="/sign-in"
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold border border-white/20">
                      {isAdminPath ? 'A' : (user?.fullName?.[0]?.toUpperCase() || 'U')}
                    </div>
                    <span className="text-sm font-bold text-white max-w-[120px] truncate">
                      {isAdminPath ? 'Super Admin' : (user?.fullName || 'User')}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-indigo-300/80 hover:text-white"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/30 px-4 pb-4"
            >
              {!isAdminPath && isSignedIn ? (
                <>
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mt-1 ${
                          isActive
                            ? 'text-primary-400 bg-primary-500/8'
                            : 'text-indigo-300/80 hover:bg-white/5'
                        }`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/sign-in"
                    className="btn-secondary text-sm py-2 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="btn-primary text-sm py-2 text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
