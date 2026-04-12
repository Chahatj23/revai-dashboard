import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { inventoryApi } from '../services/inventoryApi';

const PromotionContext = createContext();

export const PromotionProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPromotions = useCallback(async () => {
    if (currentUser?.uid) {
      setLoading(true);
      setError(null);
      try {
        const response = await inventoryApi.getPromotions(currentUser.uid);
        setPromotions(response.data);
      } catch (err) {
        setError(err.message || "Failed to load promotions.");
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading) {
      refreshPromotions();
    }
  }, [currentUser, authLoading, refreshPromotions]);

  const addPromotion = async (promoData) => {
    if (!currentUser?.uid) throw new Error("User not authenticated.");
    const res = await inventoryApi.addPromotion({ ...promoData, userId: currentUser.uid });
    await refreshPromotions();
    return res.data;
  };

  return (
    <PromotionContext.Provider value={{ 
      promotions, 
      addPromotion, 
      loading: loading || authLoading, 
      error, 
      refreshPromotions 
    }}>
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotions = () => useContext(PromotionContext);
