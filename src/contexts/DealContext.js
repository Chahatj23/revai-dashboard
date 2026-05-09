import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import { useAuth } from './AuthContext';

const DealContext = createContext();

export const useDeals = () => useContext(DealContext);

export const DealProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const fetchDealsFn = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    const res = await axios.get(`${API_BASE_URL}/deals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };

  const { 
    data: deals = [], 
    isLoading: loading, 
    refetch: fetchDeals 
  } = useQuery({
    queryKey: ['deals', currentUser?.activeOrgId],
    queryFn: fetchDealsFn,
    enabled: !!currentUser?.activeOrgId,
  });

  const addDeal = async (dealData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/deals`, dealData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Deal initialized successfully");
      queryClient.invalidateQueries(['deals', currentUser?.activeOrgId]);
      return res.data;
    } catch (err) {
      toast.error("Failed to initialize deal");
      throw err;
    }
  };

  const updateDeal = async (id, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/deals/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries(['deals', currentUser?.activeOrgId]);
      // If deal is closed won, it affects customers too
      if (updateData.stage === 'Closed Won') {
        queryClient.invalidateQueries(['customers', currentUser?.activeOrgId]);
        toast.success("Deal Closed Won! Customer record synchronized.");
      } else {
        toast.info(`Deal updated to ${updateData.stage}`);
      }
      return res.data;
    } catch (err) {
      toast.error("Failed to update deal status");
    }
  };

  const deleteDeal = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries(['deals', currentUser?.activeOrgId]);
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
