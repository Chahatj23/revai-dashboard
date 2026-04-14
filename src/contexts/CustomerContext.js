import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState(null);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser?.activeOrgId) return [];

    const res = await axios.get(`${API_BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };

  const { 
    data: customers = [], 
    isLoading: loading, 
    error: queryError,
    refetch: refreshCustomers 
  } = useQuery({
    queryKey: ['customers', currentUser?.activeOrgId],
    queryFn: fetchCustomers,
    enabled: !!currentUser?.activeOrgId,
  });

  const addCustomer = async (customerData) => {
    setMutationError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/customers`, 
        customerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      queryClient.invalidateQueries(['customers', currentUser?.activeOrgId]);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setMutationError(errMsg);
      throw new Error(errMsg);
    }
  };

  const updateCustomer = async (id, updateData) => {
    setMutationError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/customers/${id}`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      queryClient.invalidateQueries(['customers', currentUser?.activeOrgId]);
      return res.data;
    } catch (err) {
      setMutationError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    setMutationError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries(['customers', currentUser?.activeOrgId]);
    } catch (err) {
      setMutationError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const deleteMultipleCustomers = async (ids) => {
    setMutationError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/customers/bulk-delete`, { ids }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries(['customers', currentUser?.activeOrgId]);
    } catch (err) {
      setMutationError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const importCustomers = async (customersList) => {
    setMutationError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/customers/import`, { customers: customersList }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries(['customers', currentUser?.activeOrgId]);
      return res.data;
    } catch (err) {
      setMutationError(err.response?.data?.error || err.message);
      throw err;
    }
  };


  return (
    <CustomerContext.Provider value={{ 
      customers, 
      loading, 
      error: mutationError || queryError?.message, 
      addCustomer, 
      updateCustomer, 
      deleteCustomer, 
      deleteMultipleCustomers, 
      importCustomers, 
      fetchCustomers: refreshCustomers 
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => useContext(CustomerContext);
