'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { type User } from '@supabase/supabase-js';

const supabase = createClient();

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: any | null; // Compatibility with existing "MockUser" pattern
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isLoaded: false,
  user: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // 1. Check active session on mount
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      updateUserState(session?.user ?? null);
      setIsLoaded(true);
    };

    checkUser();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateUserState = (supabaseUser: User | null) => {
    if (supabaseUser) {
      // Map Supabase User to the app's internal "MockUser" shape for zero-break compatibility
      setUser({
        id: supabaseUser.id,
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        emailAddresses: [{ emailAddress: supabaseUser.email || '' }],
        imageUrl: supabaseUser.user_metadata?.avatar_url || '',
      });
    } else {
      setUser(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('hirematch_admin_auth');
  };

  return (
    <AuthContext.Provider value={{
      isSignedIn: !!user,
      isLoaded,
      user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
