import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../lib/api';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'mentor';
  department?: string;
  semester?: number;
  profileImage?: string;
  phoneNumber?: string;
  collegeName?: string;
  linkedin?: string;
  github?: string;
  about?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string, role?: 'admin' | 'student', department?: string, semester?: number) => Promise<void>;
  signIn: (email: string, password: string, role: 'student' | 'mentor' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to extract error message from various error types
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Request failed';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const signUp = async (name: string, email: string, password: string, role: 'admin' | 'student' = 'student', department?: string, semester?: number) => {
    try {
      const response = await authAPI.signup({
        name,
        email,
        password,
        role,
        department,
        semester
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const signIn = async (email: string, password: string, role: 'student' | 'mentor' | 'admin') => {
    try {
      const response = await authAPI.login({ email, password, role });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateUserProfile }}>
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
