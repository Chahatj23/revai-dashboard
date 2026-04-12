import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const DealContext = createContext();

export const useDeals = () => useContext(DealContext);

export const DealProvider = ({ children }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeals(res.data);
    } catch (err) {
      console.error("Failed to fetch deals", err);
      toast.error("Pipeline synchronization failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const addDeal = async (dealData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/deals', dealData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Deal initialized successfully");
      fetchDeals();
      return res.data;
    } catch (err) {
      toast.error("Failed to initialize deal");
      throw err;
    }
  };

  const updateDeal = async (id, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/deals/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeals(prev => prev.map(d => d.id === id ? res.data : d));
      if (updateData.stage === 'Closed Won') {
        toast.success("Deal Closed Won! Customer record synchronized.");
      } else {
        toast.info(`Deal updated to ${updateData.stage}`);
      }
    } catch (err) {
      toast.error("Failed to update deal status");
    }
  };

  const deleteDeal = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeals(prev => prev.filter(d => d.id !== id));
      toast.success("Deal removed from pipeline");
    } catch (err) {
      toast.error("Failed to delete deal");
    }
  };

  return (
    <DealContext.Provider value={{ deals, loading, fetchDeals, addDeal, updateDeal, deleteDeal }}>
      {children}
    </DealContext.Provider>
  );
};
