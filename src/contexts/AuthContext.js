import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AUTH_API_BASE_URL as API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const res = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { 
        ...res.data.user, 
        uid: res.data.user.userId 
      };
    } catch (err) {
      localStorage.removeItem('token');
      throw err;
    }
  };

  const { 
    data: currentUser, 
    isLoading: loading, 
    error: queryError,
    refetch: reloadUser 
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      queryClient.setQueryData(['auth', 'me'], {
        ...res.data.user,
        uid: res.data.user.userId
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Credentials invalid. Access denied.";
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
  };

  const signup = async (email, password, companyName) => {
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/signup`, { email, password, companyName });
      localStorage.setItem('token', res.data.token);
      queryClient.setQueryData(['auth', 'me'], {
        ...res.data.user,
        uid: res.data.user.userId
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Account creation failed.";
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['auth', 'me'], null);
    // Add small delay to ensure UI updates before potential redirects
    await new Promise(r => setTimeout(r, 100));
    window.location.href = '/'; // Force full refresh to clear all provider states
  };

  const switchOrganization = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/switch-org`, { orgId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('token', res.data.token);
      await reloadUser();
    } catch (err) {
      setAuthError(err.response?.data?.error || "Failed to switch organization.");
    }
  };

  const registerOrganization = async (companyName) => {
    setAuthError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/create-org`, { companyName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('token', res.data.token);
      await reloadUser();
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || "Organization registration failed.";
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        loading, 
        error: authError || queryError?.message, 
        login, 
        signup, 
        logout, 
        reloadUser,
        switchOrganization,
        registerOrganization
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
