import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const LeadContext = createContext();

export const useLeads = () => useContext(LeadContext);

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
      toast.error("Lead synchronization failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const addLead = async (leadData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/leads/score', leadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Lead ingested and scored successfully");
      fetchLeads();
      return res.data;
    } catch (err) {
      toast.error("Failed to ingest lead");
      throw err;
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/leads/${id}/priority`, { priority }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, priority } : l));
      toast.success(`Lead priority updated to ${priority}`);
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  const deleteLead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(prev => prev.filter(l => l.id !== id));
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
