import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { inventoryApi } from '../services/inventoryApi';

const PromotionContext = createContext();

export const PromotionProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState(null);

  const fetchPromotionsFn = async () => {
    if (!currentUser?.uid) return [];
    const response = await inventoryApi.getPromotions(currentUser.uid);
    return response.data;
  };

  const { 
    data: promotions = [], 
    isLoading: queryLoading, 
    error: queryError,
    refetch: refreshPromotions 
  } = useQuery({
    queryKey: ['promotions', currentUser?.uid],
    queryFn: fetchPromotionsFn,
    enabled: !!currentUser?.uid && !authLoading,
  });

  const addPromotion = async (promoData) => {
    setMutationError(null);
    try {
      if (!currentUser?.uid) throw new Error("User not authenticated.");
      const res = await inventoryApi.addPromotion({ ...promoData, userId: currentUser.uid });
      queryClient.invalidateQueries(['promotions', currentUser?.uid]);
      return res.data;
    } catch (err) {
      setMutationError(err.message || "Failed to add promotion.");
      throw err;
    }
  };

  return (
    <PromotionContext.Provider value={{ 
      promotions, 
      addPromotion, 
      loading: queryLoading || authLoading, 
      error: mutationError || queryError?.message, 
      refreshPromotions 
    }}>
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotions = () => useContext(PromotionContext);
