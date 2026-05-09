import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { inventoryApi } from '../services/inventoryApi';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState(null);

  const fetchSalesFn = async () => {
    if (!currentUser?.activeOrgId) return [];
    const response = await inventoryApi.getSaleOrders();
    return response.data;
  };

  const fetchPurchasesFn = async () => {
    if (!currentUser?.activeOrgId) return [];
    const response = await inventoryApi.getPurchaseOrders();
    return response.data;
  };

  const { 
    data: sales = [], 
    isLoading: salesLoading, 
    error: salesError,
    refetch: refreshSales 
  } = useQuery({
    queryKey: ['orders', 'sales', currentUser?.activeOrgId],
    queryFn: fetchSalesFn,
    enabled: !!currentUser?.activeOrgId && !authLoading,
  });

  const { 
    data: purchases = [], 
    isLoading: purchasesLoading, 
    error: purchasesError,
    refetch: refreshPurchases 
  } = useQuery({
    queryKey: ['orders', 'purchases', currentUser?.activeOrgId],
    queryFn: fetchPurchasesFn,
    enabled: !!currentUser?.activeOrgId && !authLoading,
  });

  const refreshOrders = async () => {
    await Promise.all([refreshSales(), refreshPurchases()]);
  };

  const addSaleOrder = async (orderData) => {
    setMutationError(null);
    try {
      const res = await inventoryApi.addSaleOrder(orderData);
      queryClient.invalidateQueries(['orders', 'sales', currentUser?.activeOrgId]);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Sale order creation failed.";
      setMutationError(msg);
      throw new Error(msg);
    }
  };

  const addPurchaseOrder = async (orderData) => {
    setMutationError(null);
    try {
      const res = await inventoryApi.addPurchaseOrder(orderData);
      queryClient.invalidateQueries(['orders', 'purchases', currentUser?.activeOrgId]);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Purchase order creation failed.";
      setMutationError(msg);
      throw new Error(msg);
    }
  };

  const updateSaleOrder = async (id, data) => {
    setMutationError(null);
    try {
      await inventoryApi.updateSaleOrder(id, data);
      queryClient.invalidateQueries(['orders', 'sales', currentUser?.activeOrgId]);
    } catch(err) {
      setMutationError("Update failed.");
      throw new Error("Update failed.");
    }
  };

  const deleteSaleOrders = async (ids) => {
    setMutationError(null);
    try {
      await inventoryApi.bulkDeleteSaleOrders(ids);
      queryClient.invalidateQueries(['orders', 'sales', currentUser?.activeOrgId]);
    } catch(err) {
      setMutationError("Delete failed.");
      throw new Error("Delete failed.");
    }
  };

  const updatePurchaseOrder = async (id, data) => {
    setMutationError(null);
    try {
      await inventoryApi.updatePurchaseOrder(id, data);
      queryClient.invalidateQueries(['orders', 'purchases', currentUser?.activeOrgId]);
    } catch(err) {
      setMutationError("Update failed.");
      throw new Error("Update failed.");
    }
  };

  const deletePurchaseOrders = async (ids) => {
    setMutationError(null);
    try {
      await inventoryApi.bulkDeletePurchaseOrders(ids);
      queryClient.invalidateQueries(['orders', 'purchases', currentUser?.activeOrgId]);
    } catch(err) {
      setMutationError("Delete failed.");
      throw new Error("Delete failed.");
    }
  };


  return (
    <OrderContext.Provider value={{ 
      sales, 
      purchases, 
      addSaleOrder, 
      addPurchaseOrder,
      updateSaleOrder,
      deleteSaleOrders,
      updatePurchaseOrder,
      deletePurchaseOrders,
      loading: salesLoading || purchasesLoading || authLoading, 
      error: mutationError || salesError?.message || purchasesError?.message, 
      refreshOrders 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
