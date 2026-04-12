import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser?.activeOrgId) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) {
      console.error('Core: Customer fetch failure:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = async (customerData) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/customers', 
        customerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setError(errMsg);
      console.error('Core: Customer persistence error:', errMsg);
      throw new Error(errMsg);
    }
  };

  const updateCustomer = async (id, updateData) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/customers/${id}`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const deleteMultipleCustomers = async (ids) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/customers/bulk-delete`, { ids }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const importCustomers = async (customersList) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/customers/import`, { customers: customersList }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    }
  };


  return (
    <CustomerContext.Provider value={{ customers, loading, error, addCustomer, updateCustomer, deleteCustomer, deleteMultipleCustomers, importCustomers, fetchCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => useContext(CustomerContext);
