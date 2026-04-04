'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface MockUser {
  id: string;
  fullName: string;
  emailAddresses: { emailAddress: string }[];
  imageUrl: string;
}

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: MockUser | null;
  signIn: (email: string, name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isLoaded: false,
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const SESSION_KEY = 'hirematch_session_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  const signIn = (email: string, name: string) => {
    const newUser: MockUser = {
      id: `user_${Date.now()}`,
      fullName: name || email.split('@')[0],
      emailAddresses: [{ emailAddress: email }],
      imageUrl: '',
    };
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    // Also clear admin session if it existed
    sessionStorage.removeItem('hirematch_admin_auth');
  };

  return (
    <AuthContext.Provider value={{
      isSignedIn: !!user,
      isLoaded,
      user,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
