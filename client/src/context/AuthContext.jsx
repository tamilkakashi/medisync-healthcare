import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const checkLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
        } catch (error) {
            setUser(null);
            if (error.response && (error.response.status === 403 || error.response.status === 401)) {
                localStorage.removeItem('token');
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data.user);
            toast.success('Welcome back, ' + data.user.name);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const register = async (formData) => {
        try {
            const { data } = await api.post('/auth/register', formData);
            toast.success(data.message || 'Registration successful!');
            if (formData.role === 'patient' || formData.role === 'admin') {
                // Auto-approved roles can login right away
                navigate('/login');
            } else {
                // Roles needing approval
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            setUser(null);
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, checkLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
