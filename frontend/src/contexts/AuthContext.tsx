"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  phone_no: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify token is still valid
          await refreshUser();
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // sends email and password to backend and gets tokens and user data
      const response = await authAPI.login({ email, password });

      // get access, refresh tokens and user data from response
      const { tokens: { access, refresh }, user: userData } = response.data;

      console.log('access response data:', access);
      console.log('refresh response data:', refresh);
      console.log('user response data:', userData);

      // set tokens and user data in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Logged in user:', userData);
      console.log("localStorage.getItem('access_token'):", localStorage.getItem('access_token'));
      console.log("localStorage.getItem('refresh_token'):", localStorage.getItem('refresh_token'));

      setUser(userData);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    // Call logout endpoint (optional, for blacklisting tokens)
    authAPI.logout().catch(() => {
      // Ignore errors on logout
    });

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}