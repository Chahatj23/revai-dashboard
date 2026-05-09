import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import { useAuth } from './AuthContext';

const LeadContext = createContext();

export const useLeads = () => useContext(LeadContext);

export const LeadProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const fetchLeadsFn = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    const res = await axios.get(`${API_BASE_URL}/leads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };

  const { 
    data: leads = [], 
    isLoading: loading, 
    refetch: fetchLeads 
  } = useQuery({
    queryKey: ['leads', currentUser?.activeOrgId],
    queryFn: fetchLeadsFn,
    enabled: !!currentUser?.activeOrgId,
  });

  const addLead = async (leadData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/leads/score`, leadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Lead ingested and scored successfully");
      queryClient.invalidateQueries(['leads', currentUser?.activeOrgId]);
      return res.data;
    } catch (err) {
      toast.error("Failed to ingest lead");
      throw err;
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/leads/${id}/priority`, { priority }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries(['leads', currentUser?.activeOrgId]);
      toast.success(`Lead priority updated to ${priority}`);
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  const deleteLead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries(['leads', currentUser?.activeOrgId]);
      toast.success("Lead decommissioned");
    } catch (err) {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <LeadContext.Provider value={{ leads, loading, fetchLeads, addLead, updatePriority, deleteLead }}>
      {children}
    </LeadContext.Provider>
  );
};
