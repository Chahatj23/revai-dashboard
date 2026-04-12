import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUserStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // res.data.user now contains userId, email, activeOrgId, role, allOrganizations
      setCurrentUser({ 
          ...res.data.user, 
          uid: res.data.user.userId // Map for compatibility
      }); 
    } catch (err) {
      console.error("Session verification failed:", err);
      localStorage.removeItem('token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setCurrentUser({ 
          ...res.data.user, 
          uid: res.data.user.userId 
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Credentials invalid. Access denied.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, companyName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/signup`, { email, password, companyName });
      localStorage.setItem('token', res.data.token);
      setCurrentUser({ 
          ...res.data.user, 
          uid: res.data.user.userId 
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Account creation failed.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    // Add small delay to ensure UI updates before potential redirects
    await new Promise(r => setTimeout(r, 100));
    window.location.href = '/'; // Force full refresh to clear all provider states
  };

  const switchOrganization = async (orgId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/switch-org`, { orgId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('token', res.data.token);
      await checkUserStatus(); // Refresh user state with new org context
    } catch (err) {
      setError(err.response?.data?.error || "Failed to switch organization.");
    } finally {
      setLoading(false);
    }
  };

  const registerOrganization = async (companyName) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/create-org`, { companyName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('token', res.data.token);
      await checkUserStatus(); // Refresh user state
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || "Organization registration failed.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const reloadUser = async () => {
    await checkUserStatus();
    return currentUser;
  };

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        loading, 
        error, 
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
