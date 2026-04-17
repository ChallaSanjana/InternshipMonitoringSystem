import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../lib/api';
import axios from 'axios';
;
const AuthContext = createContext(undefined);
// Helper function to extract error message from various error types
function getErrorMessage(error) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'Request failed';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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
    const signUp = async (name, email, password, role = 'student', department, semester) => {
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
        }
        catch (error) {
            throw new Error(getErrorMessage(error));
        }
    };
    const signIn = async (email, password, role) => {
        try {
            const response = await authAPI.login({ email, password, role });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
        }
        catch (error) {
            throw new Error(getErrorMessage(error));
        }
    };
    const signOut = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };
    const updateUserProfile = (userData) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };
    return (<AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
