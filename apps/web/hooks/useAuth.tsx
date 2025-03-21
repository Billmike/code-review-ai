// apps/web/hooks/useAuth.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define user type
interface User {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  githubId: string;
}

// Define Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Mock user data for demo purposes
const MOCK_USER: User = {
  id: 1,
  username: 'jsmith',
  displayName: 'John Smith',
  email: 'john.smith@example.com',
  avatarUrl: 'https://ui-avatars.com/api/?name=John+Smith',
  githubId: '12345',
};

// Create provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // In a real app, you would validate the token with your backend
          // For demo purposes, we'll just set the mock user
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Set mock user data
          setUser(MOCK_USER);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (token: string) => {
    try {
      // Store token
      localStorage.setItem('token', token);
      
      // In a real app, you would fetch user data from your backend
      // For demo purposes, we'll just set the mock user
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set user and authentication state
      setUser(MOCK_USER);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error logging in:', error);
      localStorage.removeItem('token');
    }
  };

  // Logout function
  const logout = () => {
    // Clear token
    localStorage.removeItem('token');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Provide context value
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};