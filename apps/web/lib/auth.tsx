'use client';

import { createContext, useContext, ReactNode } from 'react';

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';

export interface User {
  id: string;
  email: string;
  name?: string;
  planType: PlanType;
  creditBalance: number;
  creditsPerMonth: number;
  nextCreditReset: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock user data for development
  // TODO: Replace with actual auth logic (Clerk, NextAuth, etc.)
  const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    name: 'Demo User',
    planType: 'FREE',
    creditBalance: 42,
    creditsPerMonth: 60,
    nextCreditReset: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
  };

  const value: AuthContextType = {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
