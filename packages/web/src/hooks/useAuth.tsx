import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '../services/api';
import { LoginData, RegisterData } from '../lib/schemas';

interface AuthContextType {
    token: string | null;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    requestMagicLink: (email: string) => Promise<void>;
    loginWithToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(false);

    const login = async (data: LoginData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', data);
            const { access_token } = response.data;
            setToken(access_token);
            localStorage.setItem('authToken', access_token);
        } catch (error: any) {
            console.error('Login failed', error);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Connection Error: Could not connect to the API. Is the backend server running?');
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            await api.post('/auth/register', { email: data.email, password: data.password });
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('authToken');
    };

    const requestMagicLink = async (email: string) => {
        setIsLoading(true);
        try {
            await api.post('/auth/magic-link', { email });
        } catch (error: any) {
            console.error('Sending magic link failed', error);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Connection Error: Could not connect to the API. Is the backend server running?');
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithToken = (accessToken: string) => {
        setToken(accessToken);
        localStorage.setItem('authToken', accessToken);
    };

    const value = { token, isLoading, login, register, logout, requestMagicLink, loginWithToken };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
