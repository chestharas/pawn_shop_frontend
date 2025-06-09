'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Auth types
interface User {
  id: number;
  phone_number: string;
  role: string;
  cus_name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone_number: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider(props: { children: React.ReactNode }) {
  console.log('AuthProvider is rendering'); // Debug log
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Hardcoded API URL for now (to avoid env variable issues)
  const API_URL = 'http://localhost:8000';

  // Simple token decode function
  const decodeToken = useCallback((token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }, []);

  // Check auth on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshTokenStored = localStorage.getItem('refresh_token');
        
        if (!accessToken || !refreshTokenStored) {
          setLoading(false);
          return;
        }

        // Decode token to get user info
        const tokenData = decodeToken(accessToken);
        if (tokenData) {
          setUser({
            id: tokenData.id,
            phone_number: tokenData.sub,
            role: tokenData.role,
            cus_name: tokenData.sub
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [decodeToken]);

  const login = async (phone_number: string, password: string) => {
    try {
      setLoading(true);
      
      // Login API call
      const response = await fetch(`${API_URL}/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.code === 200 && data.result) {
        localStorage.setItem('access_token', data.result.access_token);
        localStorage.setItem('refresh_token', data.result.refresh_token);
        
        const tokenData = decodeToken(data.result.access_token);
        setUser({
          id: tokenData.id,
          phone_number: tokenData.sub,
          role: tokenData.role,
          cus_name: tokenData.sub
        });
        
        router.push('/system');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenStored = localStorage.getItem('refresh_token');
      if (!refreshTokenStored) return false;

      const response = await fetch(`${API_URL}/refresh_token?refresh_token=${refreshTokenStored}`, {
        method: 'POST'
      });

      if (!response.ok) return false;

      const data = await response.json();
      
      if (data.code === 200 && data.result) {
        localStorage.setItem('access_token', data.result.access_token);
        
        const tokenData = decodeToken(data.result.access_token);
        setUser({
          id: tokenData.id,
          phone_number: tokenData.sub,
          role: tokenData.role,
          cus_name: tokenData.sub
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/login');
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    refreshToken,
    loading,
    isAuthenticated
  };

  // Use React.createElement to avoid JSX parsing issues
  return React.createElement(AuthContext.Provider, { value: contextValue }, props.children);
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};