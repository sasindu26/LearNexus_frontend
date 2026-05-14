"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface Module {
  name: string;
  description: string;
  level?: string | number;
}

interface Course {
  name: string;
  description: string;
  level?: string;
  similarity?: number;
  modules: Module[];
}

interface UserData {
  name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  whatsapp_number?: string;
  parent_number?: string;
  picture?: string;
  enrolled_courses?: { name: string; description: string; total_modules: number }[];
}

interface SessionContextProps {
  cachedCourses: Course[];
  updateCourses: (courses: Course[]) => void;
  clearCache: () => void;
  user: UserData | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cachedCourses, setCachedCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from localStorage on mount, then refresh user data from server
  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem('mento_courses');
        if (saved) setCachedCourses(JSON.parse(saved));

        const savedToken = localStorage.getItem('mento_token');
        const savedUser = localStorage.getItem('mento_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Refresh from server so name/profile changes take effect without re-login
          try {
            const res = await api.get('/api/auth/profile', {
              headers: { Authorization: `Bearer ${savedToken}` }
            });
            if (res.data.status === 'success') {
              const fresh = res.data.user;
              setUser(fresh);
              localStorage.setItem('mento_user', JSON.stringify(fresh));
            }
          } catch (err: any) {
            if (err?.response?.status === 401) {
              setToken(null);
              setUser(null);
              localStorage.removeItem('mento_token');
              localStorage.removeItem('mento_user');
              localStorage.removeItem('mento_courses');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    };
    init();
  }, []);

  const updateCourses = (courses: Course[]) => {
    try {
      localStorage.setItem('mento_courses', JSON.stringify(courses));
      setCachedCourses(courses);
    } catch (error) {
      console.error('Failed to cache courses:', error);
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem('mento_courses');
      setCachedCourses([]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const login = (newToken: string, userData: UserData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('mento_token', newToken);
    localStorage.setItem('mento_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCachedCourses([]);
    localStorage.removeItem('mento_token');
    localStorage.removeItem('mento_user');
    localStorage.removeItem('mento_courses');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem('mento_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If token is invalid, logout
      if ((error as any)?.response?.status === 401) {
        logout();
      }
    }
  };

  const isLoggedIn = !!token && !!user;

  return (
    <SessionContext.Provider value={{
      cachedCourses, updateCourses, clearCache,
      user, token, isLoggedIn, login, logout, refreshProfile
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
